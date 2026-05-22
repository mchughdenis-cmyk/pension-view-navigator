// PWA.5 — Mobile quick action chips
import { useNavigate } from "react-router-dom";
import { Plus, Sparkles, Target, Search, Gift } from "lucide-react";
import { haptic } from "@/utils/haptic";

interface Chip {
  icon: any;
  label: string;
  sub: string;
  go: string;
  contextual?: boolean;
}

export default function MobileQuickActions({ projectedIncome = 24000 }: { projectedIncome?: number }) {
  const navigate = useNavigate();
  const chips: Chip[] = [
    { icon: Plus, label: "+ Contribute", sub: "Add to your pension", go: "/instant-deposit" },
    { icon: Sparkles, label: "Ask AI", sub: "Get instant answers", go: "/assistant" },
    { icon: Target, label: "My Plan", sub: `£${Math.round(projectedIncome / 1000)}k income projected`, go: "/projection" },
    { icon: Search, label: "Find Pensions", sub: "Consolidate old pots", go: "/transfer" },
    { icon: Gift, label: "💰 Claim Match", sub: "Unclaimed employer money", go: "/employer-match", contextual: true },
  ];

  return (
    <div className="md:hidden -mx-4 overflow-x-auto px-4 py-3">
      <div className="flex gap-3 snap-x snap-mandatory">
        {chips.map((c) => (
          <button
            key={c.label}
            onClick={() => { haptic.light(); navigate(c.go); }}
            className="snap-start min-w-[150px] h-16 rounded-2xl bg-card border border-primary/40 px-3 flex flex-col items-start justify-center shadow-sm active:scale-95 transition"
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <c.icon className="h-4 w-4 text-primary" />
              {c.label}
            </div>
            <div className="text-[11px] text-muted-foreground">{c.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
