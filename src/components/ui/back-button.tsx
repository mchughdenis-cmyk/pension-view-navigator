import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export function BackButton({ to = "/dashboard", label = "Back to Dashboard", className }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <Button 
      variant="ghost" 
      onClick={() => navigate(to)}
      className={`flex items-center gap-2 mb-4 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}