import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export function FloatingBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on root/home page
  if (location.pathname === "/") return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate(-1 as any)}
      className="fixed top-4 left-4 z-50 flex items-center gap-2 shadow-md bg-background/90 backdrop-blur-sm"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}
