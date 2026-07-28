import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/**
 * "What's next" workflow chaining. Each route can suggest 1-3 logical next
 * steps so admins move through end-to-end processes without hunting the sidebar.
 */
const CHAINS: Record<string, { label: string; to: string; hint?: string }[]> = {
  "/admin/bank-statement-upload": [
    { label: "Reconcile bank feed", to: "/admin/bank-reconciliation" },
    { label: "Allocate unallocated cash", to: "/admin/unallocated-cash" },
  ],
  "/admin/bank-reconciliation": [
    { label: "CASS 7/8 review", to: "/admin/cass-review" },
    { label: "Unallocated cash queue", to: "/admin/unallocated-cash" },
  ],
  "/payroll-processing": [
    { label: "Contribution processing", to: "/contribution-processing" },
    { label: "Direct debit collections", to: "/admin/direct-debit-collections" },
  ],
  "/contribution-processing": [
    { label: "AA / MPAA cap screening", to: "/admin/aa-mpaa-screening" },
    { label: "Contribution chasing", to: "/admin/contribution-chasing" },
  ],
  "/admin/transfers-in": [
    { label: "Bank statement upload", to: "/admin/bank-statement-upload" },
    { label: "Contribution processing", to: "/contribution-processing" },
  ],
  "/onboarding": [
    { label: "Onboarding progress tracker", to: "/onboarding-progress" },
    { label: "Set up direct debit", to: "/admin/direct-debit-collections" },
  ],
  "/drawdown": [
    { label: "Death claim register", to: "/admin/death-claims" },
    { label: "PAYE / RTI submission", to: "/admin/paye-rti" },
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
