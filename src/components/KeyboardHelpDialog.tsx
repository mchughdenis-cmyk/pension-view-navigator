import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Shortcut { keys: string; label: string; }
const SHORTCUTS: { group: string; items: Shortcut[] }[] = [
  {
    group: "Global",
    items: [
      { keys: "⌘ / Ctrl + K", label: "Open command palette" },
      { keys: "?", label: "Show this cheatsheet" },
      { keys: "Esc", label: "Close dialogs / palette" },
    ],
  },
  {
    group: "Jump to (g then …)",
    items: [
      { keys: "g p", label: "Payroll processing" },
      { keys: "g b", label: "Bank statement upload" },
      { keys: "g c", label: "Case inbox" },
      { keys: "g d", label: "Dashboard" },
      { keys: "g o", label: "Operator console" },
      { keys: "g q", label: "Member queries" },
    ],
  },
  {
    group: "Queues",
    items: [
      { keys: "a", label: "Approve selected" },
      { keys: "n", label: "New case / record" },
      { keys: "j / k", label: "Next / previous row" },
    ],
  },
];

export function KeyboardHelpDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const editable = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (editable) return;
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Press <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">?</kbd> anywhere to open this list.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {SHORTCUTS.map((s) => (
            <div key={s.group}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{s.group}</p>
              <ul className="space-y-1.5">
                {s.items.map((i) => (
                  <li key={i.keys} className="flex items-center justify-between text-sm">
                    <span>{i.label}</span>
                    <kbd className="rounded border bg-muted px-2 py-0.5 text-[11px] font-mono">{i.keys}</kbd>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
