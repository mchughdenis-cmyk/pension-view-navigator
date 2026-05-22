// PWA.2 — Pull-to-refresh for mobile screens
import { ReactNode, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { haptic } from "@/utils/haptic";

interface Props { onRefresh: () => Promise<unknown> | void; children: ReactNode }

export default function PullToRefresh({ onRefresh, children }: Props) {
  const startY = useRef<number | null>(null);
  const [pull, setPull] = useState(0);
  const [loading, setLoading] = useState(false);

  const onStart = (e: React.TouchEvent) => {
    if (window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
  };
  const onMove = (e: React.TouchEvent) => {
    if (startY.current == null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0 && window.scrollY === 0) {
      setPull(Math.min(dy, 120));
    }
  };
  const onEnd = async () => {
    if (pull > 80 && !loading) {
      haptic.medium();
      setLoading(true);
      try { await onRefresh(); } finally { setLoading(false); }
    }
    startY.current = null;
    setPull(0);
  };

  return (
    <div onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}>
      <div
        style={{ height: pull, opacity: pull > 20 ? 1 : 0 }}
        className="flex items-center justify-center overflow-hidden transition-opacity"
      >
        <RefreshCw
          className={`h-5 w-5 text-primary ${loading ? "animate-spin" : ""}`}
          style={{ transform: `rotate(${pull * 3}deg)` }}
        />
      </div>
      {children}
    </div>
  );
}
