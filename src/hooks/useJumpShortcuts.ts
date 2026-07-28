import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Vim-style `g <letter>` jump shortcuts. Press g, then a target key within 1s.
 */
const MAP: Record<string, string> = {
  p: "/payroll-processing",
  b: "/bank-upload",
  c: "/cases",
  d: "/dashboard",
  o: "/admin/console",
  q: "/member-queries",
  a: "/admin",
  s: "/sla-tracker",
};

export function useJumpShortcuts() {
  const navigate = useNavigate();
  useEffect(() => {
    let pending = false;
    let timer: number | null = null;
    const clear = () => { pending = false; if (timer) { clearTimeout(timer); timer = null; } };

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const editable = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (editable || e.metaKey || e.ctrlKey || e.altKey) return;

      if (pending) {
        const dest = MAP[e.key.toLowerCase()];
        clear();
        if (dest) { e.preventDefault(); navigate(dest); }
        return;
      }
      if (e.key === "g") {
        pending = true;
        timer = window.setTimeout(clear, 1000);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navigate]);
}
