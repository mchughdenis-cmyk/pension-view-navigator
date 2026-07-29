import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/**
 * "What's next" workflow chaining. Each route can suggest 1-3 logical next
 * steps so admins move through end-to-end processes without hunting the sidebar.
 */
const CHAINS: Record<string, { label: string; to: string; hint?: string }[]> = {
  "/bank-upload": [
    { label: "CASS 7/8 reconciliation", to: "/cass" },
    { label: "Allocate unallocated cash", to: "/unallocated-cash" },
  ],
  "/cass": [
    { label: "CASS 7 daily recon", to: "/admin/cass7-daily-recon" },
    { label: "Unallocated cash queue", to: "/unallocated-cash" },
  ],
  "/payroll-processing": [
    { label: "Contribution processing", to: "/contributions" },
    { label: "Direct debit collections", to: "/direct-debit-collections" },
  ],
  "/contributions": [
    { label: "Contribution chasing", to: "/contribution-chaser" },
    { label: "PAYE / RTI", to: "/paye" },
  ],
  "/transfer": [
    { label: "Bank statement upload", to: "/bank-upload" },
    { label: "Contribution processing", to: "/contributions" },
  ],
  "/onboarding": [
    { label: "Onboarding progress tracker", to: "/onboarding-progress" },
    { label: "Set up direct debit", to: "/direct-debit-collections" },
  ],
  "/drawdown": [
    { label: "Death claim register", to: "/death-claims" },
    { label: "PAYE / RTI submission", to: "/paye" },
  ],
};

export function WhatsNextBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const next = CHAINS[pathname];
  if (!next?.length) return null;
  return (
    <div className="flex items-center gap-2 border-t bg-muted/30 px-4 py-2 text-xs">
      <span className="text-muted-foreground font-medium">What's next:</span>
      {next.map((n) => (
        <Button
          key={n.to}
          size="sm"
          variant="ghost"
          className="h-7 gap-1 text-xs"
          onClick={() => navigate(n.to)}
        >
          {n.label}
          <ArrowRight className="h-3 w-3" />
        </Button>
      ))}
    </div>
  );
}
