// PWA.4 — Tier 2 offline banner + Tier 3 fallback
import { useNetworkStatus, getDashboardSnapshot } from "@/hooks/useNetworkStatus";
import { useState } from "react";
import { WifiOff, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

function timeAgo(iso?: string) {
  if (!iso) return "moments ago";
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function OfflineBanner() {
  const status = useNetworkStatus();
  const [dismissed, setDismissed] = useState(false);

  if (status === "online" || dismissed) return null;

  if (status === "offline-uncached") {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-[#0c2340] p-6 text-center text-white">
        <WifiOff className="h-12 w-12 text-primary-foreground/80" />
        <h1 className="text-2xl font-bold">You're offline</h1>
        <p className="max-w-sm text-sm opacity-80">
          Connect to the internet to access your pension dashboard.
        </p>
        {localStorage.getItem("lastHealthScore") && (
          <p className="text-sm opacity-70">
            Last recorded retirement readiness score:{" "}
            <strong>{localStorage.getItem("lastHealthScore")}</strong>
          </p>
        )}
        <Button onClick={() => window.location.reload()} variant="secondary">
          <RefreshCw className="mr-2 h-4 w-4" /> Try again
        </Button>
      </div>
    );
  }

  const snap = getDashboardSnapshot();
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 px-4 py-2 text-sm text-amber-950 shadow-md">
      <div className="container mx-auto flex items-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span className="flex-1">
          You're offline. Showing data from <strong>{timeAgo(snap?.cachedAt)}</strong>. Some
          features are unavailable.
        </span>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
