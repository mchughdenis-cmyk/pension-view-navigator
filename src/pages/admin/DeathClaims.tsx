import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Heart, Plus, Users2 } from "lucide-react";
import { toast } from "sonner";

interface Client { id: string; first_name: string; last_name: string; }
interface Claim { id: string; client_id: string; date_of_death: string; notified_date: string; cause_of_death: string | null; pre_75: boolean; status: string; total_pot_value: number; notes: string | null; }
interface Payment { id: string; death_claim_id: string; beneficiary_name: string; payment_type: string; gross_amount: number; tax_amount: number; net_amount: number; status: string; paid_date: string | null; }
interface Beneficiary { id: string; name: string; relationship: string; allocation_pct: number; }

const statusTone: Record<string, string> = {
  notified: "bg-amber-100 text-amber-700",
  verifying: "bg-blue-100 text-blue-700",
  calculating: "bg-indigo-100 text-indigo-700",
  paid: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-100 text-slate-700",
};

const fmt = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n || 0);

export default function DeathClaims() {
  const [clients, setClients] = useState<Client[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selected, setSelected] = useState<Claim | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [benes, setBenes] = useState<Beneficiary[]>([]);
  const [openClaim, setOpenClaim] = useState(false);
  const [openPay, setOpenPay] = useState(false);

  const [claimForm, setClaimForm] = useState({ client_id: "", date_of_death: "", cause_of_death: "", pre_75: true, total_pot_value: 0, notes: "" });
  const [payForm, setPayForm] = useState({ beneficiary_id: "", beneficiary_name: "", payment_type: "lump_sum", gross_amount: 0, tax_amount: 0, notes: "" });

  const loadClaims = async () => {
    const { data } = await supabase.from("death_claims").select("*").order("notified_date", { ascending: false });
    setClaims((data as Claim[]) || []);
  };
  useEffect(() => {
    supabase.from("clients").select("id, first_name, last_name").order("last_name").then(({ data }) => setClients((data as Client[]) || []));
    loadClaims();
  }, []);

  useEffect(() => {
    if (!selected) { setPayments([]); setBenes([]); return; }
    supabase.from("death_benefit_payments").select("*").eq("death_claim_id", selected.id).order("created_at").then(({ data }) => setPayments((data as Payment[]) || []));
    supabase.from("beneficiaries").select("id, name, relationship, allocation_pct").eq("client_id", selected.client_id).then(({ data }) => setBenes((data as Beneficiary[]) || []));
  }, [selected]);

  const clientName = (id: string) => {
    const c = clients.find(x => x.id === id);
    return c ? `${c.first_name} ${c.last_name}` : "—";
  };

  const createClaim = async () => {
    if (!claimForm.client_id || !claimForm.date_of_death) return toast.error("Client and date of death required");
    const { error } = await supabase.from("death_claims").insert({ ...claimForm, status: "notified" });
    if (error) return toast.error(error.message);
    toast.success("Death claim opened");
    setOpenClaim(false);
    setClaimForm({ client_id: "", date_of_death: "", cause_of_death: "", pre_75: true, total_pot_value: 0, notes: "" });
    loadClaims();
  };

  const advance = async (next: string) => {
    if (!selected) return;
    const { error } = await supabase.from("death_claims").update({ status: next }).eq("id", selected.id);
    if (error) return toast.error(error.message);
    toast.success(`Status → ${next}`);
    loadClaims();
    setSelected({ ...selected, status: next });
  };

  const createPayment = async () => {
    if (!selected) return;
    if (!payForm.beneficiary_name || payForm.gross_amount <= 0) return toast.error("Beneficiary and amount required");
    const taxable = selected.pre_75 ? 0 : payForm.gross_amount;
    const tax = payForm.tax_amount || (selected.pre_75 ? 0 : taxable * 0.4);
    const net = payForm.gross_amount - tax;
    const { error } = await supabase.from("death_benefit_payments").insert({
      death_claim_id: selected.id,
      client_id: selected.client_id,
      beneficiary_id: payForm.beneficiary_id || null,
      beneficiary_name: payForm.beneficiary_name,
      payment_type: payForm.payment_type,
      gross_amount: payForm.gross_amount,
      tax_amount: tax,
      net_amount: net,
      status: "pending",
      notes: payForm.notes || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Payment scheduled");
    setOpenPay(false);
    setPayForm({ beneficiary_id: "", beneficiary_name: "", payment_type: "lump_sum", gross_amount: 0, tax_amount: 0, notes: "" });
    supabase.from("death_benefit_payments").select("*").eq("death_claim_id", selected.id).then(({ data }) => setPayments((data as Payment[]) || []));
  };

  const markPaid = async (p: Payment) => {
    const { error } = await supabase.from("death_benefit_payments").update({ status: "paid", paid_date: new Date().toISOString().slice(0, 10) }).eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Payment marked as paid");
    supabase.from("death_benefit_payments").select("*").eq("death_claim_id", selected!.id).then(({ data }) => setPayments((data as Payment[]) || []));
  };

  const totalPaid = payments.filter(p => p.status === "paid").reduce((s, p) => s + Number(p.gross_amount), 0);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Heart className="w-6 h-6 text-primary" /> Death claims / bereavement</h1>
          <p className="text-sm text-muted-foreground mt-1">Register notifications, verify documents, calculate LSDBA and pay beneficiaries. Tax-free pre-75; taxable at recipient's marginal rate post-75.</p>
        </div>
        <Dialog open={openClaim} onOpenChange={setOpenClaim}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> New claim</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Open a death claim</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Member</Label>
                <Select value={claimForm.client_id} onValueChange={v => setClaimForm({ ...claimForm, client_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                  <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Date of death</Label><Input type="date" value={claimForm.date_of_death} onChange={e => setClaimForm({ ...claimForm, date_of_death: e.target.value })} /></div>
                <div><Label>Total pot value (£)</Label><Input type="number" value={claimForm.total_pot_value} onChange={e => setClaimForm({ ...claimForm, total_pot_value: Number(e.target.value) })} /></div>
              </div>
              <div><Label>Cause of death</Label><Input value={claimForm.cause_of_death} onChange={e => setClaimForm({ ...claimForm, cause_of_death: e.target.value })} /></div>
              <div className="flex items-center justify-between"><Label>Pre-75 (tax-free)</Label><Switch checked={claimForm.pre_75} onCheckedChange={v => setClaimForm({ ...claimForm, pre_75: v })} /></div>
              <div><Label>Notes</Label><Textarea value={claimForm.notes} onChange={e => setClaimForm({ ...claimForm, notes: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={createClaim}>Open claim</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardDescription>Open claims</CardDescription><CardTitle className="text-2xl">{claims.filter(c => c.status !== "closed").length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Awaiting verification</CardDescription><CardTitle className="text-2xl text-amber-700">{claims.filter(c => c.status === "notified" || c.status === "verifying").length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Total pot in flight</CardDescription><CardTitle className="text-2xl">{fmt(claims.filter(c => c.status !== "closed").reduce((s, c) => s + Number(c.total_pot_value), 0))}</CardTitle></CardHeader></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Claims register</CardTitle><CardDescription>Select a claim to view beneficiaries and record payments.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Notified</TableHead><TableHead>Member</TableHead><TableHead>Date of death</TableHead><TableHead>Pre-75</TableHead><TableHead>Pot</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {claims.map(c => (
                <TableRow key={c.id} className={`cursor-pointer ${selected?.id === c.id ? "bg-muted/50" : ""}`} onClick={() => setSelected(c)}>
                  <TableCell>{c.notified_date}</TableCell>
                  <TableCell>{clientName(c.client_id)}</TableCell>
                  <TableCell>{c.date_of_death}</TableCell>
                  <TableCell>{c.pre_75 ? <Badge className="bg-emerald-100 text-emerald-700">Pre-75</Badge> : <Badge className="bg-amber-100 text-amber-700">Post-75</Badge>}</TableCell>
                  <TableCell>{fmt(c.total_pot_value)}</TableCell>
                  <TableCell><Badge className={statusTone[c.status] || ""}>{c.status}</Badge></TableCell>
                </TableRow>
              ))}
              {claims.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No claims recorded.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Users2 className="w-4 h-4" /> Nominated beneficiaries</CardTitle>
                <CardDescription>{clientName(selected.client_id)} · Expression of Wish</CardDescription>
              </div>
              <div className="flex gap-2">
                {selected.status === "notified" && <Button size="sm" variant="outline" onClick={() => advance("verifying")}>Verifying</Button>}
                {selected.status === "verifying" && <Button size="sm" variant="outline" onClick={() => advance("calculating")}>Calculating</Button>}
                {selected.status === "calculating" && <Button size="sm" variant="outline" onClick={() => advance("paid")}>Mark paid</Button>}
                {selected.status === "paid" && <Button size="sm" variant="outline" onClick={() => advance("closed")}>Close claim</Button>}
              </div>
            </CardHeader>
            <CardContent>
              {benes.length === 0 ? <p className="text-sm text-muted-foreground">No beneficiaries nominated — trustees will exercise discretion.</p> : (
                <div className="space-y-2">
                  {benes.map(b => (
                    <div key={b.id} className="flex justify-between border rounded p-2 text-sm">
                      <span>{b.name} <span className="text-muted-foreground">({b.relationship})</span></span>
                      <Badge variant="secondary">{b.allocation_pct}%</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Payments</CardTitle>
                <CardDescription>Paid to date: {fmt(totalPaid)} of {fmt(selected.total_pot_value)}</CardDescription>
              </div>
              <Dialog open={openPay} onOpenChange={setOpenPay}>
                <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="w-3 h-3" /> Add payment</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Record payment</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label>Beneficiary</Label>
                      <Select value={payForm.beneficiary_id} onValueChange={v => {
                        const b = benes.find(x => x.id === v);
                        setPayForm({ ...payForm, beneficiary_id: v, beneficiary_name: b?.name || "" });
                      }}>
                        <SelectTrigger><SelectValue placeholder={benes.length ? "Select nominee" : "Enter manually"} /></SelectTrigger>
                        <SelectContent>{benes.map(b => <SelectItem key={b.id} value={b.id}>{b.name} ({b.allocation_pct}%)</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    {!payForm.beneficiary_id && <div><Label>Beneficiary name</Label><Input value={payForm.beneficiary_name} onChange={e => setPayForm({ ...payForm, beneficiary_name: e.target.value })} /></div>}
                    <div><Label>Type</Label>
                      <Select value={payForm.payment_type} onValueChange={v => setPayForm({ ...payForm, payment_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lump_sum">Lump sum</SelectItem>
                          <SelectItem value="dependants_drawdown">Dependant's drawdown</SelectItem>
                          <SelectItem value="annuity">Annuity purchase</SelectItem>
                          <SelectItem value="charity">Charity lump sum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Gross (£)</Label><Input type="number" value={payForm.gross_amount} onChange={e => setPayForm({ ...payForm, gross_amount: Number(e.target.value) })} /></div>
                      <div><Label>Tax (£) — override</Label><Input type="number" value={payForm.tax_amount} onChange={e => setPayForm({ ...payForm, tax_amount: Number(e.target.value) })} /></div>
                    </div>
                    <p className="text-xs text-muted-foreground">{selected.pre_75 ? "Pre-75 death: tax-free within LSDBA." : "Post-75: taxable at recipient's marginal rate (default 40% preview)."}</p>
                    <div><Label>Notes</Label><Textarea value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} /></div>
                  </div>
                  <DialogFooter><Button onClick={createPayment}>Schedule payment</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? <p className="text-sm text-muted-foreground">No payments yet.</p> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Beneficiary</TableHead><TableHead>Type</TableHead><TableHead>Gross</TableHead><TableHead>Net</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {payments.map(p => (
                      <TableRow key={p.id}>
                        <TableCell>{p.beneficiary_name}</TableCell>
                        <TableCell><Badge variant="outline">{p.payment_type}</Badge></TableCell>
                        <TableCell>{fmt(p.gross_amount)}</TableCell>
                        <TableCell>{fmt(p.net_amount)}</TableCell>
                        <TableCell><Badge className={p.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>{p.status}</Badge></TableCell>
                        <TableCell>{p.status !== "paid" && <Button size="sm" variant="outline" onClick={() => markPaid(p)}>Pay</Button>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
