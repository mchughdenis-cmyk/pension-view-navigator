import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Download, FolderArchive, RefreshCw, Send } from "lucide-react";
import { downloadStoredPaymentFile } from "@/lib/paymentFileStore";

type PaymentFile = {
  id: string;
  file_name: string;
  file_kind: string;
  storage_path: string;
  batch_reference: string | null;
  payment_count: number;
  total_amount: number;
  currency: string | null;
  status: string;
  created_at: string;
};

const kindLabel = (k: string) =>
  k === "bacs_pain001" ? "Bacs pain.001" : k === "payment_batch_report" ? "PaymentBatchReport" : k;

export default function PaymentFiles() {
  const [files, setFiles] = useState<PaymentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("payment_files")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast({ title: "Could not load payment files", description: error.message, variant: "destructive" });
    setFiles((data as PaymentFile[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return files
      .filter(f => tab === "all" || f.file_kind === tab)
      .filter(f =>
        !term ||
        f.file_name.toLowerCase().includes(term) ||
        (f.batch_reference ?? "").toLowerCase().includes(term),
      );
  }, [files, tab, q]);

  const download = async (f: PaymentFile) => {
    try {
      await downloadStoredPaymentFile(f.storage_path, f.file_name);
    } catch (e) {
      toast({ title: "Download failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  const totalValue = filtered.reduce((s, f) => s + Number(f.total_amount || 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderArchive className="h-5 w-5" />Payment file store
          </h1>
          <p className="text-sm text-muted-foreground">
            Secure archive of every bank file generated — ISO 20022 pain.001 Bacs files and matching PaymentBatchReport XML.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load}>
            <RefreshCw className="h-4 w-4 mr-2" />Refresh
          </Button>
          <Button asChild>
            <Link to="/admin/payments"><Send className="h-4 w-4 mr-2" />Create a new file</Link>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Files</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{filtered.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Batch value</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">£{totalValue.toLocaleString()}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Latest batch</CardTitle></CardHeader>
          <CardContent><div className="text-sm font-medium break-all">{filtered[0]?.batch_reference ?? "—"}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="bacs_pain001">Bacs pain.001</TabsTrigger>
              <TabsTrigger value="payment_batch_report">PaymentBatchReport</TabsTrigger>
            </TabsList>
          </Tabs>
          <Input placeholder="Search by file name or batch reference…" value={q} onChange={e => setQ(e.target.value)} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead className="text-right">Payments</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(f => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium break-all">{f.file_name}</TableCell>
                      <TableCell className="text-xs">{kindLabel(f.file_kind)}</TableCell>
                      <TableCell className="text-xs">{f.batch_reference ?? "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">{f.payment_count}</TableCell>
                      <TableCell className="text-right tabular-nums">£{Number(f.total_amount).toLocaleString()}</TableCell>
                      <TableCell><Badge variant="secondary">{f.status}</Badge></TableCell>
                      <TableCell className="text-xs">{new Date(f.created_at).toLocaleString("en-GB")}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => download(f)}>
                          <Download className="h-3.5 w-3.5 mr-1" />Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                        No payment files yet — approve payments in the Payments Hub, then choose “Create bank payment file”.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
