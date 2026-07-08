import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { PoundSterling, Plus } from "lucide-react";
import { toast } from "sonner";

interface Quote { id: string; quote_date: string; fund_value: number | null; pcls_amount: number | null; annuity_gross: number | null; drawdown_income: number | null; ufpls_amount: number | null; wake_up_stage: string | null; status: string; }
interface Wake { id: string; age_trigger: number; due_date: string; status: string; pension_wise_offered: boolean; }
const gbp = (n: number | null) => n == null ? "—" : new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);

export default function RetirementQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [wakes, setWakes] = useState<Wake[]>([]);
  const [open, setOpen] = useState(false);
  const [fund, setFund] = useState("");

  const load = async () => {
    const [q, w] = await Promise.all([
      supabase.from("retirement_quotes").select("*").order("quote_date", { ascending: false }),
      supabase.from("wake_up_events").select("*").order("due_date"),
    ]);
    setQuotes((q.data as Quote[]) || []);
    setWakes((w.data as Wake[]) || []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    const fv = Number(fund);
    if (!fv) return toast.error("Fund value required");
    const pcls = fv * 0.25;
    const remain = fv - pcls;
    const annuity = remain * 0.055;   // rough 5.5% gross annuity rate
    const drawdown = remain * 0.04;   // 4% safe withdrawal
    const { error } = await supabase.from("retirement_quotes").insert({
      fund_value: fv, pcls_amount: pcls, annuity_gross: annuity, drawdown_income: drawdown, ufpls_amount: fv, status: "quoted",
    });
    if (error) return toast.error(error.message);
    toast.success("Retirement pack generated"); setOpen(false); setFund(""); load();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><PoundSterling className="w-6 h-6 text-primary" /> Retirement quotes &amp; wake-up packs</h1>
          <p className="text-sm text-muted-foreground mt-1">Options pack: annuity, drawdown, UFPLS, small pots. Wake-up packs triggered at ages 50 / 55 / 60 / 65 with Pension Wise stronger nudge.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> New quote</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Retirement options quote</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Fund value (£)</Label><Input type="number" value={fund} onChange={e => setFund(e.target.value)} /></div>
              <p className="text-xs text-muted-foreground">Auto-calculates 25% PCLS, indicative annuity @ 5.5%, and 4% drawdown income.</p>
            </div>
            <DialogFooter><Button onClick={create}>Generate</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Card>
        <CardHeader><CardTitle>Wake-up pack queue</CardTitle><CardDescription>Statutory age-triggered issuance.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Age trigger</TableHead><TableHead>Due</TableHead><TableHead>Pension Wise</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {wakes.map(w => (
                <TableRow key={w.id}>
                  <TableCell>Age {w.age_trigger}</TableCell>
                  <TableCell>{w.due_date}</TableCell>
                  <TableCell>{w.pension_wise_offered ? "Offered" : "—"}</TableCell>
                  <TableCell><Badge>{w.status}</Badge></TableCell>
                </TableRow>
              ))}
              {wakes.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-4">No wake-up events queued.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Retirement quotes ({quotes.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead className="text-right">Fund</TableHead><TableHead className="text-right">25% PCLS</TableHead><TableHead className="text-right">Annuity (gross pa)</TableHead><TableHead className="text-right">Drawdown (pa)</TableHead><TableHead className="text-right">UFPLS</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {quotes.map(q => (
                <TableRow key={q.id}>
                  <TableCell>{q.quote_date}</TableCell>
                  <TableCell className="text-right">{gbp(q.fund_value)}</TableCell>
                  <TableCell className="text-right">{gbp(q.pcls_amount)}</TableCell>
                  <TableCell className="text-right">{gbp(q.annuity_gross)}</TableCell>
                  <TableCell className="text-right">{gbp(q.drawdown_income)}</TableCell>
                  <TableCell className="text-right">{gbp(q.ufpls_amount)}</TableCell>
                  <TableCell><Badge>{q.status}</Badge></TableCell>
                </TableRow>
              ))}
              {quotes.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No retirement quotes yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
