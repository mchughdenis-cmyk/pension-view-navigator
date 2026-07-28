import { useActiveClient } from "@/hooks/useActiveClient";
import { Button } from "@/components/ui/button";
import { User, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Persistent "active client" chip in the header. Click to jump to the client
 * hub; click X to unpin. Populated from anywhere via useActiveClient().pin.
 */
export function ActiveClientChip() {
  const { active, clear } = useActiveClient();
  const navigate = useNavigate();
  if (!active) return null;
  return (
    <div className="hidden md:inline-flex items-center gap-1 rounded-full border bg-accent/40 pl-2 pr-1 py-0.5 text-xs">
      <User className="h-3 w-3 text-muted-foreground" />
      <button
        className="max-w-[160px] truncate font-medium hover:underline"
        onClick={() => navigate(`/client/${active.id}`)}
        title={active.name}
      >
        {active.name}
      </button>
      {active.nino && <span className="text-muted-foreground">· {active.nino}</span>}
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5"
        onClick={clear}
        title="Unpin client"
        aria-label="Unpin client"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
