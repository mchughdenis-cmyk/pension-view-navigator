import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/nav/PageHeader";
import { Jargon } from "@/components/ui/jargon";
import {
  Heart, HeartCrack, Briefcase, PackageX, Baby, Landmark, Stethoscope, Sunrise,
  AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type EventKey =
  | "marriage" | "divorce" | "new_job" | "redundancy"
  | "child" | "inheritance" | "illness" | "retirement";

interface EventDef {
  key: EventKey;
  icon: typeof Heart;
  title: string;
  subtitle: string;
  questions: { id: string; label: string; type: "text" | "number" | "yesno" }[];
  checklist: { label: string; urgent?: boolean }[];
  warning?: string;
}

const EVENTS: EventDef[] = [
  {
    key: "marriage", icon: Heart, title: "Marriage or Civil Partnership",
    subtitle: "Update beneficiaries and plan together",
    questions: [
      { id: "partnerPension", label: "Does your partner have a pension?", type: "yesno" },
      { id: "addBeneficiary", label: "Add partner as beneficiary?", type: "yesno" },
    ],
    checklist: [
      { label: "Update nomination of beneficiary" },
      { label: "Review State Pension implications (NI credits)" },
      { label: "Consider joint retirement planning" },
      { label: "Update name on accounts if changed" },
    ],
  },
  {
    key: "divorce", icon: HeartCrack, title: "Divorce or Separation",
    subtitle: "Pension sharing orders and CETV",
    questions: [
      { id: "order", label: "Is a financial order in place?", type: "yesno" },
      { id: "cetv", label: "CETV requested?", type: "yesno" },
    ],
    checklist: [
      { label: "URGENT: Update expression of wishes immediately", urgent: true },
      { label: "Request Cash Equivalent Transfer Value (CETV)" },
      { label: "Seek PODE-qualified expert advice" },
      { label: "Notify pension administrator of any sharing order" },
    ],
    warning: "If a pension sharing order exists, you must notify the scheme administrator now. Delays can affect implementation.",
  },
  {
    key: "new_job", icon: Briefcase, title: "New Job",
    subtitle: "Compare employer pensions, consider consolidating",
    questions: [
      { id: "scheme", label: "Does the new employer offer a pension?", type: "yesno" },
      { id: "match", label: "Employer contribution percentage", type: "number" },
    ],
    checklist: [
      { label: "Confirm auto-enrolment in new scheme" },
      { label: "Compare old vs new scheme charges" },
      { label: "Decide whether to transfer old pension" },
      { label: "Update salary for accurate projections" },
    ],
  },
  {
    key: "redundancy", icon: PackageX, title: "Redundancy",
    subtitle: "Protect your pension during a career gap",
    questions: [
      { id: "payment", label: "Redundancy payment amount (£)", type: "number" },
      { id: "gap", label: "Expected contribution gap (months)", type: "number" },
    ],
    checklist: [
      { label: "Check if redundancy pay can be made as pension contribution (within Annual Allowance)" },
      { label: "Model contribution gap in projections" },
      { label: "Review drawdown eligibility (age 55+, rising to 57 in 2028)" },
    ],
  },
  {
    key: "child", icon: Baby, title: "Having a Child",
    subtitle: "Protect against career break impact",
    questions: [
      { id: "break", label: "Planning a career break?", type: "yesno" },
      { id: "months", label: "If yes, how many months?", type: "number" },
    ],
    checklist: [
      { label: "Check NI credits during parental leave" },
      { label: "Model contribution gap" },
      { label: "Update beneficiaries" },
    ],
  },
  {
    key: "inheritance", icon: Landmark, title: "Inheritance",
    subtitle: "Maximise tax-efficient investing",
    questions: [
      { id: "amount", label: "Approximate amount (£)", type: "number" },
      { id: "invest", label: "Plan to invest?", type: "yesno" },
    ],
    checklist: [
      { label: "Check Annual Allowance headroom before pension contribution" },
      { label: "Compare pension vs ISA allocation" },
      { label: "Seek IFA advice for amounts over £50,000" },
    ],
  },
  {
    key: "illness", icon: Stethoscope, title: "Serious Illness",
    subtitle: "Early access and enhanced annuity options",
    questions: [
      { id: "capacity", label: "Affects work capacity?", type: "yesno" },
    ],
    checklist: [
      { label: "URGENT: Update expression of wishes", urgent: true },
      { label: "Check ill-health early retirement criteria" },
      { label: "Enhanced annuity eligibility check" },
    ],
    warning: "Severe ill-health may unlock early access to pension benefits regardless of NMPA. Speak to your scheme administrator.",
  },
  {
    key: "retirement", icon: Sunrise, title: "Approaching Retirement",
    subtitle: "Final planning: drawdown vs annuity",
    questions: [
      { id: "years", label: "Years to retirement", type: "number" },
      { id: "wise", label: "Pension Wise booked?", type: "yesno" },
    ],
    checklist: [
      { label: "Book free Pension Wise guidance via MoneyHelper" },
      { label: "Run drawdown vs annuity comparison" },
      { label: "Decide PCLS amount" },
      { label: "Review State Pension claim date" },
    ],
  },
];

export default function LifeEventsEngine() {
  const [selected, setSelected] = useState<EventDef | null>(null);
  const [step, setStep] = useState(1);
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setSelected(null); setStep(1); setEventDate(new Date().toISOString().slice(0, 10));
    setAnswers({}); setCompleted({}); setNotes("");
  };

  const save = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await supabase.from("activity_log").insert({
        action: `Life event recorded: ${selected.title}`,
        entity_type: "life_event",
        metadata: { event_key: selected.key, event_date: eventDate, answers, completed, notes },
      });
      toast.success("Event recorded", { description: "Recommendations saved to your activity log." });
      reset();
    } catch (e: any) {
      toast.error("Could not save event", { description: e?.message ?? "Try again." });
    } finally { setBusy(false); }
  };

  if (!selected) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Life events"
          description="Life changes affect your pension. Record an event and we'll guide you through the implications and the most urgent actions."
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {EVENTS.map((e) => {
            const Icon = e.icon;
            return (
              <Card key={e.key} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelected(e)}>
                <CardContent className="p-5 space-y-2">
                  <div className="h-10 w-10 rounded-md bg-primary/10 grid place-items-center text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-sm">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.subtitle}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  const Icon = selected.icon;
  const totalSteps = 4;

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={selected.title}
        description={`Step ${step} of ${totalSteps} · ${selected.subtitle}`}
      />

      {selected.warning && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>{selected.warning}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-primary/10 grid place-items-center text-primary"><Icon className="h-5 w-5" /></div>
            <CardTitle className="text-base">
              {step === 1 && "Confirm event"}
              {step === 2 && "A few questions"}
              {step === 3 && "Recommended actions"}
              {step === 4 && "Guidance & projection impact"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="space-y-3">
              <Label htmlFor="ev-date">When did this happen (or will it)?</Label>
              <Input id="ev-date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {selected.questions.map((q) => (
                <div key={q.id} className="space-y-2">
                  <Label htmlFor={q.id}>{q.label}</Label>
                  {q.type === "yesno" ? (
                    <div className="flex gap-2">
                      {["Yes", "No", "Not sure"].map((opt) => (
                        <Button
                          key={opt}
                          variant={answers[q.id] === opt ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                        >{opt}</Button>
                      ))}
                    </div>
                  ) : (
                    <Input id={q.id} type={q.type} value={answers[q.id] ?? ""}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
                  )}
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Tick each action as you complete it. Items marked urgent should be actioned first.</p>
              {selected.checklist.map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-md border bg-card">
                  <Checkbox
                    id={`chk-${i}`}
                    checked={!!completed[String(i)]}
                    onCheckedChange={(v) => setCompleted({ ...completed, [String(i)]: !!v })}
                  />
                  <div className="flex-1">
                    <Label htmlFor={`chk-${i}`} className="cursor-pointer">{c.label}</Label>
                    {c.urgent && <Badge variant="destructive" className="ml-2">Urgent</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-primary/5 border-l-4 border-primary">
                <p className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <Sparkles className="h-4 w-4 text-primary" /> What this means for your pension
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selected.key === "marriage" && <>Marriage changes who inherits your pension. Update your nomination immediately — without it, trustees decide. Consider joint planning for tax efficiency and review <Jargon term="LSA" /> usage across both partners.</>}
                  {selected.key === "divorce" && <>Pensions are often the largest financial asset in a divorce. Request your <Jargon term="CETV" /> and seek PODE-qualified advice. Update your expression of wishes today — your ex remains beneficiary until you act.</>}
                  {selected.key === "new_job" && <>A new employer scheme typically offers matched contributions — claiming the full match can add 30%+ to your retirement income. Compare charges before transferring an old pension.</>}
                  {selected.key === "redundancy" && <>Up to £30,000 of redundancy pay is tax-free. Above that, paying excess into your pension (within your <Jargon term="Annual Allowance" />) can reclaim higher-rate tax. Model the contribution gap carefully.</>}
                  {selected.key === "child" && <>Child Benefit registration triggers NI credits, protecting your State Pension during a career break. Even short pauses compound — a 12-month break in your 30s can cost £15,000+ at retirement.</>}
                  {selected.key === "inheritance" && <>Pensions sit outside your estate for IHT (usually). Compare the IHT-efficiency of contributing to a pension versus investing via an ISA, balanced against your <Jargon term="Annual Allowance" /> headroom.</>}
                  {selected.key === "illness" && <>Serious illness can unlock early pension access (typically under 55) and enhanced annuity rates of 20-40% above standard. Update your expression of wishes immediately.</>}
                  {selected.key === "retirement" && <>Book your free Pension Wise session before any decisions — it's a statutory entitlement at age 50+. Compare <Jargon term="Flexi-Access Drawdown" /> against <Jargon term="Annuity" /> and decide your <Jargon term="PCLS" /> strategy.</>}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Personal notes (optional)</Label>
                <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any context for your adviser or future self…" />
              </div>
              <p className="text-xs text-muted-foreground">
                We'll create follow-up reminders at 30, 90, and 365 days.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => (step === 1 ? reset() : setStep(step - 1))}>
          <ArrowLeft className="h-4 w-4" /> {step === 1 ? "Back to events" : "Back"}
        </Button>
        {step < totalSteps ? (
          <Button onClick={() => setStep(step + 1)}>Continue <ArrowRight className="h-4 w-4" /></Button>
        ) : (
          <Button onClick={save} disabled={busy}>
            <CheckCircle2 className="h-4 w-4" /> {busy ? "Saving…" : "Record event"}
          </Button>
        )}
      </div>
    </div>
  );
}
