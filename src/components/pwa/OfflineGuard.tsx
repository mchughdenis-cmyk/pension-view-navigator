// PWA.4 — Wrap actions that require network
import { ReactNode } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export default function OfflineGuard({ children }: { children: ReactNode }) {
  const status = useNetworkStatus();
  if (status === "online") return <>{children}</>;
  return (
    <div
      className="relative inline-block"
      onClickCapture={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toast.error("This requires an internet connection.");
      }}
    >
      <div className="opacity-50 pointer-events-none">{children}</div>
      <span className="absolute -top-1 -right-1 rounded-full bg-muted p-1">
        <Lock className="h-3 w-3" />
      </span>
    </div>
  );
}
