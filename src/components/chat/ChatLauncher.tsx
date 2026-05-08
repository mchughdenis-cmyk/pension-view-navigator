import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatAssistant } from "./ChatAssistant";
import { useRole } from "@/contexts/RoleContext";
import { cn } from "@/lib/utils";

const HIDDEN_PATHS = ["/auth", "/login"];

/** Floating chat launcher — visible to clients on every page. */
export function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const { role } = useRole();
  const { pathname } = useLocation();

  // Close when navigating
  useEffect(() => { setOpen(false); }, [pathname]);
  // Esc to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  if (role !== "client") return null;
  if (HIDDEN_PATHS.some(p => pathname.startsWith(p))) return null;
  if (pathname === "/assistant") return null; // already on full-page chat

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 md:bg-transparent bg-black/30" onClick={() => setOpen(false)} />
      )}

      <div className={cn(
        "fixed z-50 transition-all",
        "bottom-4 right-4",
        open
          ? "w-[min(420px,calc(100vw-2rem))] h-[min(640px,calc(100vh-2rem))]"
          : "w-auto h-auto",
      )}>
        {open ? (
          <div className="w-full h-full flex flex-col shadow-2xl rounded-lg overflow-hidden border bg-background animate-in fade-in slide-in-from-bottom-4">
            <div className="px-4 py-3 border-b flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold leading-tight">Navigator</div>
                  <div className="text-[11px] text-muted-foreground">UK pension assistant</div>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)} aria-label="Close">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <ChatAssistant embedded compact className="flex-1 border-0 rounded-none shadow-none" />
          </div>
        ) : (
          <Button
            onClick={() => setOpen(true)}
            size="lg"
            className="h-14 rounded-full shadow-lg gap-2 pl-4 pr-5"
            aria-label="Open AI assistant"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Ask Navigator</span>
          </Button>
        )}
      </div>
    </>
  );
}
