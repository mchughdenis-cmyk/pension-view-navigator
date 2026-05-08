import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export type ChatMsg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`;

export function useChatAssistant(initial: ChatMsg[] = []) {
  const [messages, setMessages] = useState<ChatMsg[]>(initial);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setStreaming(false);
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const userMsg: ChatMsg = { role: "user", content: trimmed };
    const history = [...messages, userMsg];
    setMessages(prev => [...prev, userMsg, { role: "assistant", content: "" }]);
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    let acc = "";
    const appendDelta = (d: string) => {
      acc += d;
      setMessages(prev => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "assistant") next[next.length - 1] = { ...last, content: acc };
        return next;
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: history }),
        signal: ctrl.signal,
      });

      if (resp.status === 429) { toast.error("Too many requests — try again shortly."); throw new Error("rate"); }
      if (resp.status === 402) { toast.error("AI credits exhausted. Top up in Settings → Workspace → Usage."); throw new Error("credits"); }
      if (!resp.ok || !resp.body) { toast.error("AI assistant unavailable."); throw new Error("unavailable"); }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;

      while (!done) {
        const r = await reader.read();
        if (r.done) break;
        buffer += decoder.decode(r.value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(payload);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) appendDelta(delta);
          } catch {
            // partial JSON across chunks — restore and wait for more bytes
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Flush remaining buffered SSE lines
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (!raw.startsWith("data: ")) continue;
          const payload = raw.slice(6).trim();
          if (payload === "[DONE]") continue;
          try {
            const parsed = JSON.parse(payload);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) appendDelta(delta);
          } catch {/* ignore */}
        }
      }

      if (!acc) {
        // Replace empty assistant placeholder with a graceful message
        setMessages(prev => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant" && !last.content)
            next[next.length - 1] = { ...last, content: "Sorry, I didn't get a response. Please try again." };
          return next;
        });
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") console.error("chat error", e);
      // Drop the empty placeholder if it remained empty
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && !last.content) return prev.slice(0, -1);
        return prev;
      });
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [messages, streaming]);

  return { messages, send, stop, reset, streaming };
}
