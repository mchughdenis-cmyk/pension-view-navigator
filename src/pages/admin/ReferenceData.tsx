import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type Rate = { id: string; tax_year: string; rate_key: string; rate_value: number; unit: string | null; notes: string | null };

export default function ReferenceData() {
  const [rows, setRows] = useState<Rate[]>([]);
  const [q, setQ] = useState("");

  const load = async () => {
    const { data } = await supabase.from("reference_rates").select("*").order("tax_year", { ascending: false }).order("rate_key");
    setRows((data as Rate[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, val: number) => {
    const { error } = await supabase.from("reference_rates").update({ rate_value: val }).eq("id", id);
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    toast({ title: "Updated" });
    load();
  };

  const filtered = rows.filter(r => !q || r.rate_key.includes(q) || r.tax_year.includes(q));

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Reference Data</h1>
        <p className="text-sm text-muted-foreground">HMRC allowances, tax bands and platform rates — versioned by tax year so tax-year changes are config, not code.</p>
      </header>
      <Card>
        <CardHeader><Input placeholder="Search key or tax year…" value={q} onChange={e => setQ(e.target.value)} className="max-w-sm" /></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Tax year</TableHead><TableHead>Key</TableHead>
              <TableHead className="text-right">Value</TableHead><TableHead>Unit</TableHead><TableHead>Notes</TableHead>
              <TableHead className="text-right">Save</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map(r => (
                <RateRow key={r.id} r={r} onSave={update} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function RateRow({ r, onSave }: { r: Rate; onSave: (id: string, v: number) => void }) {
  const [val, setVal] = useState(String(r.rate_value));
  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{r.tax_year}</TableCell>
      <TableCell className="font-mono text-xs">{r.rate_key}</TableCell>
      <TableCell className="text-right"><Input type="number" step="0.0001" value={val} onChange={e => setVal(e.target.value)} className="w-32 ml-auto text-right" /></TableCell>
      <TableCell className="text-xs">{r.unit}</TableCell>
      <TableCell className="text-xs text-muted-foreground">{r.notes}</TableCell>
      <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => onSave(r.id, Number(val))}>Save</Button></TableCell>
    </TableRow>
  );
}
