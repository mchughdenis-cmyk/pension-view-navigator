import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, ShieldCheck, Send, XCircle, FileDown, FileSpreadsheet, Download, FolderArchive } from "lucide-react";
import { generateBacsPain001Xml } from "@/lib/bacsXml";
import { generatePaymentBatchReportXml, paymentBatchReportFilename } from "@/lib/paymentBatchReport";
import { storePaymentFile, downloadText, downloadStoredPaymentFile } from "@/lib/paymentFileStore";
import { downloadCSV } from "@/lib/adminExportUtils";
import { paymentInstructionSchema } from "@/lib/validation";

type Payment = {
  id: string;
  direction: string;
  purpose: string;
  amount: number;
  currency: string;
  beneficiary_name: string | null;
  beneficiary_reference: string | null;
  payment_method: string | null;
  status: string;
  requested_date: string | null;
  created_by: string | null;
  created_at: string;
  beneficiary_sort_code?: string | null;
  beneficiary_account?: string | null;
};

const statusColour: Record<string, string> = {
  draft: "secondary",
  pending_approval: "warning",
  approved: "default",
  rejected: "destructive",
  released: "default",
  settled: "default",
  reconciled: "default",
  failed: "destructive",
  cancelled: "secondary",
};

export default function PaymentsHub() {
  const [rows, setRows] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    purpose: "benefit_payment",
    amount: "",
    beneficiary_name: "",
    beneficiary_sort_code: "",
    beneficiary_account: "",
    beneficiary_reference: "",
    payment_method: "faster_payments",
    requested_date: new Date().toISOString().slice(0, 10),
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [files, setFiles] = useState<PaymentFile[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("payment_instructions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setRows((data as Payment[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  // Auto-open new-payment dialog via ?new=1 (command palette action)
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setOpen(true);
      searchParams.delete("new");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const createPayment = async () => {
    const parsed = paymentInstructionSchema.safeParse({
      ...form,
      amount: Number(form.amount || 0),
    });
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" • ");
      return toast({ title: "Validation failed", description: msg, variant: "destructive" });
    }
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("payment_instructions").insert({
      direction: "outbound",
      purpose: parsed.data.purpose,
      amount: parsed.data.amount,
      beneficiary_name: parsed.data.beneficiary_name,
      beneficiary_sort_code: parsed.data.beneficiary_sort_code,
      beneficiary_account: parsed.data.beneficiary_account,
      beneficiary_reference: parsed.data.beneficiary_reference,
      payment_method: parsed.data.payment_method,
      requested_date: parsed.data.requested_date,
      status: "pending_approval",
      created_by: u.user?.id ?? null,
    });
    if (error) return toast({ title: "Create failed", description: error.message, variant: "destructive" });
    toast({ title: "Payment queued for approval" });
    setOpen(false);
    load();
  };

  const bulkApprove = async () => {
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (!uid) return toast({ title: "Sign in required", variant: "destructive" });
    const all = Array.from(selected).filter((id) => rows.find((r) => r.id === id)?.status === "pending_approval");
    const ownBlocked = all.filter((id) => rows.find((r) => r.id === id)?.created_by === uid);
    const ids = all.filter((id) => rows.find((r) => r.id === id)?.created_by !== uid);
    if (ids.length === 0) {
      return toast({
        title: "Four-eyes lock",
        description: ownBlocked.length > 0 ? "You cannot approve payments you created." : "Nothing to approve.",
        variant: "destructive",
      });
    }
    const approvals = ids.map((id) => ({ payment_id: id, approver_id: uid, decision: "approved" as const }));
    const { error: ae } = await supabase.from("payment_approvals").insert(approvals);
    if (ae) return toast({ title: "Approval failed", description: ae.message, variant: "destructive" });
    await supabase.from("payment_instructions").update({ status: "approved", approved_by: uid }).in("id", ids);
    toast({
      title: `${ids.length} payment(s) approved`,
      description: ownBlocked.length > 0 ? `${ownBlocked.length} skipped (four-eyes lock).` : undefined,
    });
    setSelected(new Set());
    load();
  };

  const exportCsv = () => {
    downloadCSV(
      "payments",
      ["Beneficiary", "Sort code", "Account", "Reference", "Purpose", "Method", "Amount (£)", "Status", "Requested"],
      filteredRows(rows, tab).map((r) => [
        r.beneficiary_name ?? "",
        r.beneficiary_sort_code ?? "",
        r.beneficiary_account ?? "",
        r.beneficiary_reference ?? "",
        r.purpose,
        r.payment_method ?? "",
        Number(r.amount).toFixed(2),
        r.status,
        r.requested_date ?? "",
      ]),
    );
  };

  const approve = async (id: string) => {
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (!uid) return toast({ title: "Sign in required", variant: "destructive" });
    const { error: ae } = await supabase.from("payment_approvals").insert({
      payment_id: id, approver_id: uid, decision: "approved",
    });
    if (ae) return toast({ title: "Approval failed", description: ae.message, variant: "destructive" });
    await supabase.from("payment_instructions").update({ status: "approved", approved_by: uid }).eq("id", id);
    toast({ title: "Approved" });
    load();
  };

  const release = async (id: string) => {
    await supabase.from("payment_instructions").update({ status: "released", released_at: new Date().toISOString() }).eq("id", id);
    toast({ title: "Released to Bacs/FPS gateway" });
    load();
  };

  const cancel = async (id: string) => {
    await supabase.from("payment_instructions").update({ status: "cancelled" }).eq("id", id);
    load();
  };

  const filteredRows = (rs: Payment[], t: string) =>
    t === "pending" ? rs.filter(r => r.status === "pending_approval") :
    t === "approved" ? rs.filter(r => ["approved", "released"].includes(r.status)) :
    t === "settled" ? rs.filter(r => ["settled", "reconciled"].includes(r.status)) :
    rs;
  const filtered = useMemo(() => filteredRows(rows, tab), [rows, tab]);

  const totalPending = rows.filter(r => r.status === "pending_approval").reduce((s, r) => s + Number(r.amount), 0);
  const totalReleased = rows.filter(r => r.status === "released").reduce((s, r) => s + Number(r.amount), 0);

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Payments Hub</h1>
          <p className="text-sm text-muted-foreground">Outbound instructions with four-eyes approval, batching and settlement.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={createPaymentFile} disabled={generating}>
            <FileDown className="h-4 w-4 mr-2" />{generating ? "Creating…" : "Create bank payment file"}
          </Button>
          <Button variant="outline" onClick={exportCsv}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />Export CSV
          </Button>
          <Button variant="outline" onClick={bulkApprove} disabled={selected.size === 0}>
            <ShieldCheck className="h-4 w-4 mr-2" />Approve selected ({selected.size})
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New payment</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New outbound payment</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Purpose</Label>
                  <Select value={form.purpose} onValueChange={v => setForm({ ...form, purpose: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["benefit_payment","ufpls","pcls","drawdown","investment_buy","transfer_out","adviser_fee","hmrc","refund","other"].map(p =>
                        <SelectItem key={p} value={p}>{p.replace(/_/g," ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount (£)</Label>
                  <Input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Beneficiary name</Label>
                <Input value={form.beneficiary_name} onChange={e => setForm({ ...form, beneficiary_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Sort code</Label>
                  <Input value={form.beneficiary_sort_code} onChange={e => setForm({ ...form, beneficiary_sort_code: e.target.value })} placeholder="20-00-00" />
                </div>
                <div>
                  <Label>Account no.</Label>
                  <Input value={form.beneficiary_account} onChange={e => setForm({ ...form, beneficiary_account: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Reference</Label>
                <Input value={form.beneficiary_reference} onChange={e => setForm({ ...form, beneficiary_reference: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Method</Label>
                  <Select value={form.payment_method} onValueChange={v => setForm({ ...form, payment_method: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["bacs","chaps","faster_payments","internal_transfer","cheque"].map(p =>
                        <SelectItem key={p} value={p}>{p.replace(/_/g," ").toUpperCase()}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Requested date</Label>
                  <Input type="date" value={form.requested_date} onChange={e => setForm({ ...form, requested_date: e.target.value })} />
                </div>
              </div>
              <Button onClick={createPayment} disabled={!form.amount}>Queue for approval</Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Pending approval</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">£{totalPending.toLocaleString()}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Released today</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">£{totalReleased.toLocaleString()}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Failed / rejected</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{rows.filter(r => ["failed","rejected"].includes(r.status)).length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Total instructions</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{rows.length}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending approval</TabsTrigger>
              <TabsTrigger value="approved">Approved / released</TabsTrigger>
              <TabsTrigger value="settled">Settled</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <Checkbox
                      checked={filtered.length > 0 && filtered.every((r) => selected.has(r.id))}
                      onCheckedChange={(c) => {
                        const next = new Set(selected);
                        if (c) filtered.forEach((r) => next.add(r.id));
                        else filtered.forEach((r) => next.delete(r.id));
                        setSelected(next);
                      }}
                    />
                  </TableHead>
                  <TableHead>Beneficiary</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(r.id)}
                        onCheckedChange={(c) => {
                          const next = new Set(selected);
                          if (c) next.add(r.id); else next.delete(r.id);
                          setSelected(next);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{r.beneficiary_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{r.beneficiary_reference}</div>
                    </TableCell>
                    <TableCell className="capitalize">{r.purpose.replace(/_/g," ")}</TableCell>
                    <TableCell className="uppercase text-xs">{r.payment_method}</TableCell>
                    <TableCell className="text-right tabular-nums">£{Number(r.amount).toLocaleString()}</TableCell>
                    <TableCell>{r.requested_date}</TableCell>
                    <TableCell><Badge variant={statusColour[r.status] as any}>{r.status.replace(/_/g," ")}</Badge></TableCell>
                    <TableCell className="text-right space-x-1">
                      {r.status === "pending_approval" && (
                        r.created_by && r.created_by === currentUserId ? (
                          <Button size="sm" variant="outline" disabled title="Four-eyes lock: you created this payment">
                            <ShieldCheck className="h-3.5 w-3.5 mr-1" />Locked
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => approve(r.id)}>
                            <ShieldCheck className="h-3.5 w-3.5 mr-1" />Approve
                          </Button>
                        )
                      )}
                      {r.status === "approved" && (
                        <Button size="sm" onClick={() => release(r.id)}>
                          <Send className="h-3.5 w-3.5 mr-1" />Release
                        </Button>
                      )}
                      {!["settled","reconciled","cancelled"].includes(r.status) && (
                        <Button size="sm" variant="ghost" onClick={() => cancel(r.id)}>
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">No payments in this view.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
          <p className="text-xs text-muted-foreground mt-4">Four-eyes control: the payment creator cannot approve their own instruction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
