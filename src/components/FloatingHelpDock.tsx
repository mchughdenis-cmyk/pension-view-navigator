import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ContactUsPrompt } from "@/components/ContactUsPrompt";
import { GuidedTour } from "@/components/GuidedTour";
import { Minimize2, MessageSquare } from "lucide-react";

const DOCK_KEY = "airgead.help-dock.expanded";

export function FloatingHelpDock() {
  const [expanded, setExpanded] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem(DOCK_KEY);
    // Default to minimized so the help buttons never cover page content
    return saved === "1";
  });

  useEffect(() => {
    localStorage.setItem(DOCK_KEY, expanded ? "1" : "0");
  }, [expanded]);

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Expand help dock"
      >
        <MessageSquare className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setExpanded(false)}
        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur shadow-sm border"
        aria-label="Minimize help dock"
      >
        <Minimize2 className="h-4 w-4" />
      </Button>
      <GuidedTour />
      <ContactUsPrompt />
    </div>
  );
}
