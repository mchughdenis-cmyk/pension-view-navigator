import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Full-screen routes (no AppShell sidebar) where a floating back button is helpful.
const FULLSCREEN_PATHS = ["/m", "/mobile", "/demo", "/overview"];

export function FloatingBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Only show on full-screen routes — AppShell pages already provide nav via sidebar/header.
  if (!FULLSCREEN_PATHS.some((p) => location.pathname === p || location.pathname.startsWith(p + "/"))) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate(-1 as any)}
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 shadow-md bg-background/90 backdrop-blur-sm"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}
