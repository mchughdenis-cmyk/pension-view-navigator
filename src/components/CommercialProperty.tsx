import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, StatCard } from "@/components/ui/page-primitives";
import { formatGBP } from "@/lib/pensionCalculations";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Building2, AlertCircle } from "lucide-react";

interface Property { id: string; address: string; property_type: string; valuation: number; valuation_date: string; vat_registered: boolean; status: string; }
interface Lease { id: string; property_id: string; tenant_name: string; rent_pa: number; frequency: string; start_date: string; end_date: string; next_review: string; deposit: number; status: string; }
interface RentRow { id: string; lease_id: string; due_date: string; amount_due: number; amount_received: number; received_date: string | null; status: string; }
interface Expense { id: string; property_id: string; expense_date: string; category: string; vendor: string; amount: number; vat: number; status: string; notes: string; }
interface Insurance { id: string; property_id: string; provider: string; policy_ref: string; premium: number; renewal_date: string; status: string; }

const monthKey = (d: string) => d.slice(0, 7);
const monthLabel = (k: string) => new Date(k + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" });

export default function CommercialProperty() {
  const [props, setProps] = useState<Property[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [rent, setRent] = useState<RentRow[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [ins, setIns] = useState<Insurance[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("commercial_properties").select("*").order("address"),
      supabase.from("property_leases").select("*"),
      supabase.from("property_rent_ledger").select("*").order("due_date"),
      supabase.from("property_expenses").select("*").order("expense_date"),
      supabase.from("property_insurance").select("*"),
    ]).then(([p, l, r, e, i]) => {
      setProps((p.data as Property[]) || []);
      setLeases((l.data as Lease[]) || []);
      setRent((r.data as RentRow[]) || []);
      setExpenses((e.data as Expense[]) || []);
      setIns((i.data as Insurance[]) || []);
    });
  }, []);

  const leaseProp = (lease_id: string) => leases.find(l => l.id === lease_id)?.property_id;
  const propAddr = (id?: string) => props.find(p => p.id === id)?.address || "—";

  const filtered = useMemo(() => {
    if (!active) return { props, leases, rent, expenses, ins };
    return {
      props: props.filter(p => p.id === active),
      leases: leases.filter(l => l.property_id === active),
      rent: rent.filter(r => leaseProp(r.lease_id) === active),
      expenses: expenses.filter(e => e.property_id === active),
      ins: ins.filter(i => i.property_id === active),
    };
  }, [active, props, leases, rent, expenses, ins]);

  const totalValue = filtered.props.reduce((s, p) => s + Number(p.valuation), 0);
  const annualRent = filtered.leases.reduce((s, l) => s + Number(l.rent_pa), 0);
  const yearRentReceived = filtered.rent.reduce((s, r) => s + Number(r.amount_received), 0);
  const yearRentDue = filtered.rent.reduce((s, r) => s + Number(r.amount_due), 0);
  const arrears = yearRentDue - yearRentReceived;
  const yearExpenses = filtered.expenses.reduce((s, e) => s + Number(e.amount) + Number(e.vat), 0);
  const yearInsurance = filtered.ins.reduce((s, i) => s + Number(i.premium), 0);
  const netCashflow = yearRentReceived - yearExpenses - yearInsurance;
  const yieldPct = totalValue > 0 ? (annualRent / totalValue) * 100 : 0;
  const netYieldPct = totalValue > 0 ? (netCashflow / totalValue) * 100 : 0;

  // Monthly cashflow chart data
  const cashflow = useMemo(() => {
    const map = new Map<string, { month: string; rent: number; expenses: number; net: number }>();
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date("2026-11-01");
      d.setMonth(d.getMonth() + i);
      return d.toISOString().slice(0, 7);
    });
    months.forEach(m => map.set(m, { month: monthLabel(m), rent: 0, expenses: 0, net: 0 }));
    filtered.rent.forEach(r => {
      const m = monthKey(r.due_date);
      const row = map.get(m); if (row) row.rent += Number(r.amount_received);
    });
    filtered.expenses.forEach(e => {
      const m = monthKey(e.expense_date);
      const row = map.get(m); if (row) row.expenses += Number(e.amount) + Number(e.vat);
    });
    return Array.from(map.values()).map(r => ({ ...r, net: r.rent - r.expenses }));
  }, [filtered]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader title="Commercial Property" description="Pension-owned freehold portfolio with rent, expenses and net cashflow over the last 12 months." />

      {active && (
        <div className="flex items-center gap-2 text-sm">
          <Button variant="ghost" size="sm" onClick={() => setActive(null)}>← All properties</Button>
          <span className="text-muted-foreground truncate">Filtered to {propAddr(active)}</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Properties" value={filtered.props.length} />
        <StatCard label="Total valuation" value={formatGBP(totalValue)} sub={`Gross yield ${yieldPct.toFixed(2)}%`} />
        <StatCard label="Rent received (12m)" value={formatGBP(yearRentReceived)} sub={arrears > 0 ? `Arrears ${formatGBP(arrears)}` : "Fully collected"} />
        <StatCard label="Net cashflow (12m)" value={formatGBP(netCashflow)} sub={`Net yield ${netYieldPct.toFixed(2)}%`} />
      </div>

      <Card>
        <CardHeader><CardTitle>Monthly money movement</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cashflow}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={v => `£${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatGBP(v)} />
              <Legend />
              <Bar dataKey="rent" name="Rent received" fill="hsl(var(--primary))" />
              <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--destructive))" />
              <Bar dataKey="net" name="Net" fill="hsl(var(--secondary))" />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
            <div><p className="text-muted-foreground text-xs">Rent due</p><p className="font-semibold">{formatGBP(yearRentDue)}</p></div>
            <div><p className="text-muted-foreground text-xs">Expenses (incl. VAT)</p><p className="font-semibold text-destructive">{formatGBP(yearExpenses)}</p></div>
            <div><p className="text-muted-foreground text-xs">Insurance premiums</p><p className="font-semibold text-destructive">{formatGBP(yearInsurance)}</p></div>
            <div><p className="text-muted-foreground text-xs">Net to scheme</p><p className={`font-semibold ${netCashflow >= 0 ? "text-green-600" : "text-destructive"}`}>{formatGBP(netCashflow)}</p></div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="properties">
        <TabsList>
          <TabsTrigger value="properties">Properties ({filtered.props.length})</TabsTrigger>
          <TabsTrigger value="leases">Leases ({filtered.leases.length})</TabsTrigger>
          <TabsTrigger value="rent">Rent ledger ({filtered.rent.length})</TabsTrigger>
          <TabsTrigger value="expenses">Expenses ({filtered.expenses.length})</TabsTrigger>
          <TabsTrigger value="insurance">Insurance ({filtered.ins.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.props.map(p => {
              const propLeases = leases.filter(l => l.property_id === p.id);
              const propRent = rent.filter(r => propLeases.some(l => l.id === r.lease_id));
              const received = propRent.reduce((s, r) => s + Number(r.amount_received), 0);
              const propExp = expenses.filter(e => e.property_id === p.id).reduce((s, e) => s + Number(e.amount) + Number(e.vat), 0);
              const propIns = ins.filter(i => i.property_id === p.id).reduce((s, i) => s + Number(i.premium), 0);
              const net = received - propExp - propIns;
              return (
                <Card key={p.id} className="cursor-pointer hover:border-primary transition" onClick={() => setActive(p.id)}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4" />{p.address}</CardTitle>
                        <p className="text-xs text-muted-foreground capitalize mt-1">{p.property_type.replace("_", " ")} · Valued {p.valuation_date}{p.vat_registered ? " · VAT-registered" : ""}</p>
                      </div>
                      <Badge>{p.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div><p className="text-muted-foreground text-xs">Valuation</p><p className="font-semibold">{formatGBP(Number(p.valuation))}</p></div>
                      <div><p className="text-muted-foreground text-xs">Rent received</p><p className="font-semibold text-green-600">{formatGBP(received)}</p></div>
                      <div><p className="text-muted-foreground text-xs">Costs</p><p className="font-semibold text-destructive">{formatGBP(propExp + propIns)}</p></div>
                      <div className="col-span-3"><p className="text-muted-foreground text-xs">Net cashflow (12m)</p><p className={`font-semibold ${net >= 0 ? "text-green-600" : "text-destructive"}`}>{formatGBP(net)}</p></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="leases">
          <Card><CardContent className="pt-6"><Table>
            <TableHeader><TableRow><TableHead>Property</TableHead><TableHead>Tenant</TableHead><TableHead className="text-right">Rent p.a.</TableHead><TableHead>Frequency</TableHead><TableHead>Term</TableHead><TableHead>Next review</TableHead><TableHead className="text-right">Deposit</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{filtered.leases.map(l => (
              <TableRow key={l.id} className="cursor-pointer" onClick={() => setActive(l.property_id)}>
                <TableCell className="text-xs max-w-[200px] truncate">{propAddr(l.property_id)}</TableCell>
                <TableCell className="font-medium">{l.tenant_name}</TableCell>
                <TableCell className="text-right">{formatGBP(Number(l.rent_pa))}</TableCell>
                <TableCell className="capitalize">{l.frequency}</TableCell>
                <TableCell className="text-xs">{l.start_date} → {l.end_date}</TableCell>
                <TableCell>{l.next_review}</TableCell>
                <TableCell className="text-right">{formatGBP(Number(l.deposit))}</TableCell>
                <TableCell><Badge>{l.status}</Badge></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table></CardContent></Card>
        </TabsContent>

        <TabsContent value="rent">
          <Card><CardContent className="pt-6"><Table>
            <TableHeader><TableRow><TableHead>Due</TableHead><TableHead>Tenant / Property</TableHead><TableHead className="text-right">Due</TableHead><TableHead className="text-right">Received</TableHead><TableHead>Received on</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{filtered.rent.map(r => {
              const lease = leases.find(x => x.id === r.lease_id);
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.due_date}</TableCell>
                  <TableCell className="text-sm">{lease?.tenant_name} <span className="text-muted-foreground">· {propAddr(lease?.property_id)}</span></TableCell>
                  <TableCell className="text-right">{formatGBP(Number(r.amount_due))}</TableCell>
                  <TableCell className="text-right font-semibold">{formatGBP(Number(r.amount_received))}</TableCell>
                  <TableCell className="font-mono text-xs">{r.received_date || "—"}</TableCell>
                  <TableCell><Badge variant={r.status === "received" ? "default" : "destructive"}>{r.status === "arrears" && <AlertCircle className="w-3 h-3 mr-1" />}{r.status}</Badge></TableCell>
                </TableRow>
              );
            })}</TableBody>
          </Table></CardContent></Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card><CardContent className="pt-6"><Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Property</TableHead><TableHead>Category</TableHead><TableHead>Vendor</TableHead><TableHead className="text-right">Net</TableHead><TableHead className="text-right">VAT</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{filtered.expenses.map(e => (
              <TableRow key={e.id} className="cursor-pointer" onClick={() => setActive(e.property_id)}>
                <TableCell className="font-mono text-xs">{e.expense_date}</TableCell>
                <TableCell className="text-xs max-w-[200px] truncate">{propAddr(e.property_id)}</TableCell>
                <TableCell className="capitalize">{e.category.replace("_", " ")}</TableCell>
                <TableCell className="text-sm">{e.vendor}</TableCell>
                <TableCell className="text-right">{formatGBP(Number(e.amount))}</TableCell>
                <TableCell className="text-right text-muted-foreground">{Number(e.vat) ? formatGBP(Number(e.vat)) : "—"}</TableCell>
                <TableCell className="text-right font-semibold">{formatGBP(Number(e.amount) + Number(e.vat))}</TableCell>
                <TableCell><Badge variant={e.status === "paid" ? "default" : "secondary"}>{e.status}</Badge></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table></CardContent></Card>
        </TabsContent>

        <TabsContent value="insurance">
          <Card><CardContent className="pt-6"><Table>
            <TableHeader><TableRow><TableHead>Property</TableHead><TableHead>Provider</TableHead><TableHead>Policy</TableHead><TableHead className="text-right">Premium</TableHead><TableHead>Renewal</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{filtered.ins.map(i => (
              <TableRow key={i.id}>
                <TableCell className="text-xs max-w-[200px] truncate">{propAddr(i.property_id)}</TableCell>
                <TableCell>{i.provider}</TableCell>
                <TableCell className="font-mono text-xs">{i.policy_ref}</TableCell>
                <TableCell className="text-right">{formatGBP(Number(i.premium))}</TableCell>
                <TableCell>{i.renewal_date}</TableCell>
                <TableCell><Badge>{i.status}</Badge></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
