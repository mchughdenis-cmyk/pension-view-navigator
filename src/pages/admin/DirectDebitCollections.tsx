import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownToLine, CalendarClock, ShieldCheck, AlertTriangle, PlayCircle, FileSignature } from "lucide-react";
import { toast } from "sonner";

type Status = "scheduled" | "submitted" | "collected" | "failed" | "represented";

interface DDItem {
  id: string;
  mandate_ref: string;
  payer: string;
  scheme: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "annual";
  collection_date: string;
  bacs_stage: "0" | "1" | "2" | "3";
  status: Status;
  reason?: string;
}

const gbp = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

const seed: DDItem[] = [
  { id: "1", mandate_ref: "DDM-1001", payer: "Acme Ltd (Employer)", scheme: "Acme Group SIPP", amount: 12450, frequency: "monthly", collection_date: "2026-07-10", bacs_stage: "1", status: "scheduled" },
  { id: "2", mandate_ref: "DDM-1002", payer: "Beacon Trading Ltd", scheme: "Beacon SSAS", amount: 3200, frequency: "monthly", collection_date: "2026-07-10", bacs_stage: "1", status: "scheduled" },
  { id: "3", mandate_ref: "DDM-0987", payer: "J Smith (Personal)", scheme: "Personal SIPP", amount: 500, frequency: "monthly", collection_date: "2026-07-08", bacs_stage: "3", status: "collected" },
  { id: "4", mandate_ref: "DDM-0954", payer: "K Patel (Personal)", scheme: "Personal SIPP", amount: 250, frequency: "monthly", collection_date: "2026-07-05", bacs_stage: "3", status: "failed", reason: "ARUDD 0 — refer to payer" },
  { id: "5", mandate_ref: "DDM-0921", payer: "Delta Contractors", scheme: "Delta Group SIPP", amount: 8900, frequency: "monthly", collection_date: "2026-07-05", bacs_stage: "3", status: "failed", reason: "ARUDD 3 — payer deceased" },
  { id: "6", mandate_ref: "DDM-0900", payer: "Evergreen Ltd", scheme: "Evergreen SIPP", amount: 1750, frequency: "monthly", collection_date: "2026-07-03", bacs_stage: "3", status: "represented" },
];

const statusTone: Record<Status, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  submitted: "bg-amber-100 text-amber-700",
  collected: "bg-emerald-100 text-emerald-700",
  failed: "bg-rose-100 text-rose-700",
  represented: "bg-violet-100 text-violet-700",
};

export default function DirectDebitCollections() {
  const [items, setItems] = useState<DDItem[]>(seed);
  const [tab, setTab] = useState("scheduled");

  const totals = useMemo(() => ({
    scheduled: items.filter(i => i.status === "scheduled").reduce((s, i) => s + i.amount, 0),
    collected: items.filter(i => i.status === "collected").reduce((s, i) => s + i.amount, 0),
    failed: items.filter(i => i.status === "failed").reduce((s, i) => s + i.amount, 0),
  }), [items]);

  const filtered = items.filter(i => (tab === "all" ? true : i.status === tab));

  const submitBacs = () => {
    setItems(prev => prev.map(i => i.status === "scheduled" ? { ...i, status: "submitted", bacs_stage: "2" } : i));
    toast.success("Bacs collection file submitted (mock) — awaiting stage-3 settlement");
  };
  const represent = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: "represented", reason: undefined } : i));
    toast.success("Failed collection scheduled for re-presentation");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <ArrowDownToLine className="w-6 h-6 text-primary" />
            Direct debit collections
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Book-of-business Bacs collection run. Submit scheduled mandates, monitor ARUDD/ADDACS failures, and re-present exceptions under the Direct Debit Guarantee.
          </p>
        </div>
        <Button onClick={submitBacs} className="gap-2">
          <PlayCircle className="w-4 h-4" /> Submit today’s Bacs file
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardDescription>Scheduled today</CardDescription><CardTitle className="text-xl">{gbp(totals.scheduled)}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Collected (settled)</CardDescription><CardTitle className="text-xl text-emerald-700">{gbp(totals.collected)}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Failed / exception</CardDescription><CardTitle className="text-xl text-rose-700">{gbp(totals.failed)}</CardTitle></CardHeader></Card>
      </div>

      {totals.failed > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>Failed collections require action</AlertTitle>
          <AlertDescription>
            ARUDD / ADDACS returns from Bacs must be reviewed and either re-presented, cancelled, or referred to the payer within 3 working days.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarClock className="w-5 h-5" /> Collection queue</CardTitle>
          <CardDescription>Bacs 3-day cycle: <strong>Day 1</strong> submit → <strong>Day 2</strong> processed → <strong>Day 3</strong> settle / return.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="submitted">Submitted</TabsTrigger>
              <TabsTrigger value="collected">Collected</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
              <TabsTrigger value="represented">Re-presented</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value={tab} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mandate</TableHead>
                    <TableHead>Payer / scheme</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Collection date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Bacs stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(i => (
                    <TableRow key={i.id}>
                      <TableCell className="font-mono text-xs">{i.mandate_ref}</TableCell>
                      <TableCell>
                        <div className="font-medium">{i.payer}</div>
                        <div className="text-xs text-muted-foreground">{i.scheme}</div>
                      </TableCell>
                      <TableCell className="capitalize">{i.frequency}</TableCell>
                      <TableCell>{i.collection_date}</TableCell>
                      <TableCell className="text-right">{gbp(i.amount)}</TableCell>
                      <TableCell><Badge variant="outline">Stage {i.bacs_stage}</Badge></TableCell>
                      <TableCell>
                        <Badge className={statusTone[i.status]}>{i.status}</Badge>
                        {i.reason && <div className="text-xs text-rose-600 mt-1">{i.reason}</div>}
                      </TableCell>
                      <TableCell className="text-right">
                        {i.status === "failed" && (
                          <Button size="sm" variant="outline" onClick={() => represent(i.id)}>Re-present</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">No items in this bucket.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Controls</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Four-eyes approval required before submitting the Bacs file.</p>
            <p>ARUDD / ADDACS returns imported daily from GoCardless / Bacs bureau.</p>
            <p>Indemnity claims logged against the Direct Debit Guarantee register.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileSignature className="w-5 h-5" /> Related</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <a className="text-primary hover:underline block" href="/contributions">Contribution schedules →</a>
            <a className="text-primary hover:underline block" href="/contribution-chaser">Overdue contribution chaser →</a>
            <a className="text-primary hover:underline block" href="/unallocated-cash">Unallocated cash / suspense →</a>
            <a className="text-primary hover:underline block" href="/cass">CASS 7/8 reconciliation →</a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
