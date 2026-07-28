import { useEffect, useState, useCallback } from "react";

export type ActiveClient = { id: string; name: string; nino?: string | null } | null;

const KEY = "airgead:activeClient";

function read(): ActiveClient {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Persistent "active client" pinned across the app.
 * Any component can setActive() to pin a member; header + queues show it.
 * Broadcasts via a window event so all consumers stay in sync.
 */
export function useActiveClient() {
  const [active, setActive] = useState<ActiveClient>(() => read());

  useEffect(() => {
    const sync = () => setActive(read());
    window.addEventListener("airgead:activeClient", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("airgead:activeClient", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const pin = useCallback((c: ActiveClient) => {
    if (c) localStorage.setItem(KEY, JSON.stringify(c));
    else localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("airgead:activeClient"));
    setActive(c);
  }, []);

  const clear = useCallback(() => pin(null), [pin]);

  return { active, pin, clear };
}
