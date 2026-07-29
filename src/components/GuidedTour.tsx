import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, ChevronLeft, ChevronRight, Presentation } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface Step {
  route: string;
  title: string;
  body: string;
}

const TOUR: Step[] = [
  { route: "/dashboard", title: "Client dashboard", body: "Holistic view of pot, allowances, and projections — the day-one home for every client." },
  { route: "/assistant", title: "Ask Navigator", body: "Conversational AI grounded in the client's own data and UK 2026/27 tax rules." },
  { route: "/projection", title: "Monte Carlo projection", body: "10,000-scenario stochastic modelling with cone-of-outcomes visualisation." },
  { route: "/drawdown", title: "Drawdown planner", body: "PCLS, UFPLS and flexi-access modelling with tax and IHT impact." },
  { route: "/passport", title: "Pension passport", body: "A single-page summary for transfers, KYC, and beneficiaries." },
  { route: "/cockpit", title: "Operations cockpit", body: "SLA tracker, exceptions and bulk operations for the back office." },
  { route: "/hmrc", title: "HMRC & compliance", body: "Event reporting, LSA tracking and full audit trail." },
];

const TOUR_KEY = "airgead.tour.completed";

export function GuidedTour() {
  const [active, setActive] = useState(false);
  const [presentation, setPresentation] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const seen = localStorage.getItem(TOUR_KEY);
    if (!seen && location.pathname === "/dashboard") {
      setTimeout(() => setActive(true), 800);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!active) return;
    const target = TOUR[step].route;
    if (location.pathname !== target) navigate(target);
  }, [step, active]); // eslint-disable-line

  useEffect(() => {
    if (!presentation) return;
    const id = setInterval(() => {
      setStep((s) => (s + 1) % TOUR.length);
    }, 6000);
    return () => clearInterval(id);
  }, [presentation]);

  const close = () => {
    setActive(false);
    setPresentation(false);
    localStorage.setItem(TOUR_KEY, "1");
  };

  // Hide on public/marketing/auth/tour pages — the standalone /tour page covers that audience.
  const onPublic = location.pathname.startsWith("/site")
    || location.pathname.startsWith("/auth")
    || location.pathname.startsWith("/tour")
    || location.pathname === "/";
  if (onPublic) return null;

  if (!active) {
    return (
    <button
        onClick={() => { setActive(true); setStep(0); }}
        className="h-10 px-4 rounded-full bg-primary text-primary-foreground shadow-lg text-xs font-medium flex items-center gap-2 hover:scale-105 transition-transform"
      >
        <Presentation className="h-3.5 w-3.5" /> Take the tour
      </button>
    );
  }

  const s = TOUR[step];

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] animate-in slide-in-from-bottom-4">
      <Card className="p-5 shadow-2xl border-primary/20">
        <div className="flex items-start justify-between mb-3">
          <Badge variant="outline">{step + 1} / {TOUR.length}</Badge>
          <button onClick={close} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{s.body}</p>
        <div className="flex items-center justify-between gap-2">
          <Button size="sm" variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={presentation ? "default" : "ghost"}
            onClick={() => setPresentation(!presentation)}
            className="gap-1.5 text-xs"
          >
            <Presentation className="h-3.5 w-3.5" />
            {presentation ? "Stop auto" : "Auto-play"}
          </Button>
          {step < TOUR.length - 1 ? (
            <Button size="sm" onClick={() => setStep(step + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={close}>Finish</Button>
          )}
        </div>
      </Card>
    </div>
  );
}
