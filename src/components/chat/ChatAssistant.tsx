import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useChatAssistant, ChatMsg } from "@/hooks/useChatAssistant";
import { Sparkles, Send, Square, RotateCcw, Bot, User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "How much can I pay into my pension this year?",
  "What's the difference between PCLS and UFPLS?",
  "Will withdrawing trigger MPAA?",
  "How do I link my bank account?",
];

interface Props {
  /** Compact mode for the floating widget. */
  compact?: boolean;
  /** Hide the header (used when embedded in a parent card). */
  embedded?: boolean;
  className?: string;
}

export function ChatAssistant({ compact, embedded, className }: Props) {
  const { messages, send, stop, reset, streaming } = useChatAssistant();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const v = input;
    setInput("");
    void send(v);
  };

  const empty = messages.length === 0;

  return (
    <Card className={cn("flex flex-col overflow-hidden", className)}>
      {!embedded && (
        <div className="px-4 py-3 border-b flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">Navigator</div>
              <div className="text-[11px] text-muted-foreground">UK pension assistant · 2026/27</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">AI · guidance only</Badge>
            {messages.length > 0 && (
              <Button size="sm" variant="ghost" onClick={reset} title="New chat">
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div ref={scrollRef} className={cn("flex-1 overflow-y-auto px-4 py-4 space-y-4", compact ? "min-h-[320px]" : "min-h-[420px]")}>
        {empty && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Hi 👋 I can answer questions about your pension, UK 2026/27 tax rules, and how to use this app.
              I provide guidance, not regulated financial advice.
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => { setInput(""); void send(s); }}
                  className="text-xs px-3 py-1.5 rounded-full border bg-background hover:bg-muted transition text-left"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Quick links: <Link to="/instant-deposit" className="underline">Add money</Link> ·{" "}
              <Link to="/illustration" className="underline">Illustration</Link> ·{" "}
              <Link to="/transactions" className="underline">Transactions</Link> ·{" "}
              <Link to="/onboarding-progress" className="underline">Onboarding</Link>
            </div>
          </div>
        )}

        {messages.map((m, i) => <Bubble key={i} msg={m} streaming={streaming && i === messages.length - 1 && m.role === "assistant"} />)}
      </div>

      <form onSubmit={submit} className="border-t p-3 flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about pensions, tax, or how to do something…"
          disabled={streaming}
          className="flex-1"
        />
        {streaming ? (
          <Button type="button" variant="outline" onClick={stop}>
            <Square className="w-4 h-4 mr-1" />Stop
          </Button>
        ) : (
          <Button type="submit" disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        )}
      </form>
    </Card>
  );
}

function Bubble({ msg, streaming }: { msg: ChatMsg; streaming?: boolean }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
        isUser ? "bg-muted" : "bg-primary/15",
      )}>
        {isUser ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-primary" />}
      </div>
      <div className={cn(
        "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted",
      )}>
        {msg.content ? (
          <div className={cn(
            "prose prose-sm max-w-none dark:prose-invert",
            "prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-headings:my-2",
            isUser && "prose-invert",
          )}>
            <ReactMarkdown>{msg.content}</ReactMarkdown>
            {streaming && <span className="inline-block w-1.5 h-4 align-middle bg-current opacity-60 animate-pulse ml-0.5" />}
          </div>
        ) : (
          <span className="inline-flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: "0.15s" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: "0.3s" }} />
          </span>
        )}
      </div>
    </div>
  );
}
