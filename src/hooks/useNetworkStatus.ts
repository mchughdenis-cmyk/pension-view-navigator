// PWA.4 — Three-tier offline detection
import { useEffect, useState } from "react";

export type NetworkStatus = "online" | "offline-cached" | "offline-uncached";

const CACHE_NAME = "airgead-dashboard-v1";

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(
    typeof navigator !== "undefined" && navigator.onLine ? "online" : "offline-uncached",
  );

  useEffect(() => {
    const handleOnline = () => setStatus("online");
    const handleOffline = async () => {
      let cached = false;
      try {
        if ("caches" in window) cached = await caches.has(CACHE_NAME);
      } catch {
        cached = !!localStorage.getItem("airgead.dashboard.snapshot");
      }
      // Treat presence of a snapshot in localStorage as cached too (demo fallback)
      cached = cached || !!localStorage.getItem("airgead.dashboard.snapshot");
      setStatus(cached ? "offline-cached" : "offline-uncached");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    if (!navigator.onLine) handleOffline();
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return status;
}

export const cacheDashboardSnapshot = (data: Record<string, any>) => {
  try {
    const snapshot = { ...data, cachedAt: new Date().toISOString() };
    localStorage.setItem("airgead.dashboard.snapshot", JSON.stringify(snapshot));
    if (typeof data.healthScore === "number") {
      localStorage.setItem("lastHealthScore", String(data.healthScore));
    }
  } catch {
    /* quota */
  }
};

export const getDashboardSnapshot = () => {
  try {
    const raw = localStorage.getItem("airgead.dashboard.snapshot");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
