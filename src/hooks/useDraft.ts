import { useEffect, useRef, useState } from "react";

/**
 * Persist a piece of form state to localStorage so users can pause and resume.
 * - Debounced writes (400ms) to avoid thrashing
 * - Returns { saved, savedAt, clear, hadDraft } so callers can render a Resume banner
 */
export function useDraft<T>(key: string, value: T, options?: { debounceMs?: number; skip?: boolean }) {
  const [savedAt, setSavedAt] = useState<number | null>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw)?.__ts ?? null) : null;
    } catch { return null; }
  });
  const [hadDraft] = useState(() => !!localStorage.getItem(key));
  const timer = useRef<number | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (options?.skip) return;
    // Skip the very first render so we don't overwrite an existing draft before the user touches anything
    if (first.current) { first.current = false; return; }
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      try {
        const ts = Date.now();
        localStorage.setItem(key, JSON.stringify({ __ts: ts, value }));
        setSavedAt(ts);
      } catch { /* quota / private mode — ignore */ }
    }, options?.debounceMs ?? 400);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [key, value, options?.skip, options?.debounceMs]);

  const clear = () => {
    localStorage.removeItem(key);
    setSavedAt(null);
  };

  return { savedAt, clear, hadDraft };
}

export function loadDraft<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return (parsed?.value ?? null) as T | null;
  } catch { return null; }
}

export function formatSavedAt(ts: number | null): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  if (diff < 5_000) return "Saved just now";
  if (diff < 60_000) return `Saved ${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `Saved ${Math.floor(diff / 60_000)}m ago`;
  return `Saved ${new Date(ts).toLocaleString()}`;
}
