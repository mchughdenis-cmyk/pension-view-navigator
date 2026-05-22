// PWA.5 — Compact mobile glance hero with widget cards
import { useEffect, useState } from "react";
import { setAppBadge } from "@/utils/pwaCompat";
import { useNavigate } from "react-router-dom";

interface Props {
  firstName?: string;
  totalWealth?: number;
  dayChange?: number;
  healthScore?: number;
  retirementAge?: number;
  currentAge?: number;
  incomeGap?: number;
  aaRemaining?: number;
  unreadCount?: number;
}

export default function MobileGlanceHero({
  firstName = "there",
  totalWealth = 245680,
  dayChange = 0.42,
  healthScore = 78,
  retirementAge = 67,
  currentAge = 35,
  incomeGap = 4200,
  aaRemaining = 18000,
  unreadCount = 2,
}: Props) {
  const [counter, setCounter] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const start = Date.now();
    const dur = 800;
    const step = () => {
      const t = Math.min(1, (Date.now() - start) / dur);
      setCounter(Math.round(totalWealth * (0.4 + 0.6 * t)));
      if (t < 1) requestAnimationFrame(step);
    };
    step();
  }, [totalWealth]);

  useEffect(() => { setAppBadge(unreadCount); }, [unreadCount]);

  const yearsLeft = Math.max(0, retirementAge - currentAge);
  const countdownColour = yearsLeft > 20 ? "text-emerald-500" : yearsLeft > 10 ? "text-amber-500" : "text-red-500";

  return (
    <div className="md:hidden space-y-3">
      <div className="rounded-2xl bg-[#0c2340] text-white p-4 flex items-center justify-between h-[140px]">
        <div>
          <div className="text-xs opacity-70">Hi {firstName}</div>
          <div className="text-2xl font-bold tabular-nums">£{counter.toLocaleString()}</div>
          <div className={`text-xs ${dayChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {dayChange >= 0 ? "▲" : "▼"} {Math.abs(dayChange).toFixed(2)}% today
          </div>
        </div>
        <div className="relative h-[60px] w-[60px]">
          <svg viewBox="0 0 36 36" className="h-full w-full">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
              strokeDasharray={`${healthScore},100`} strokeLinecap="round" transform="rotate(-90 18 18)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">{healthScore}</div>
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-3 snap-x snap-mandatory">
          <div onClick={() => navigate("/projection")} className="snap-start min-w-[160px] h-[100px] rounded-xl bg-card border p-3 shadow-sm">
            <div className={`text-2xl font-bold ${countdownColour}`}>{yearsLeft}</div>
            <div className="text-xs text-muted-foreground">years until age {retirementAge}</div>
          </div>
          <div onClick={() => navigate("/projection")} className="snap-start min-w-[160px] h-[100px] rounded-xl bg-card border p-3 shadow-sm">
            <div className="text-2xl font-bold">{incomeGap > 0 ? `£${Math.round(incomeGap / 12)}/mo` : "On track"}</div>
            <div className="text-xs text-muted-foreground">{incomeGap > 0 ? "income gap" : "projected surplus"}</div>
          </div>
          <div onClick={() => navigate("/contributions")} className="snap-start min-w-[160px] h-[100px] rounded-xl bg-card border p-3 shadow-sm">
            <div className="text-2xl font-bold">£{aaRemaining.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">AA remaining</div>
          </div>
        </div>
      </div>
    </div>
  );
}
