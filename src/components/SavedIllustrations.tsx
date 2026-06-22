import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Trash2, Download, Search, Mail } from "lucide-react";
import { generateSummaryPdf } from "@/lib/compliantIllustration";

interface SavedIllustration {
  id: string;
  member_email: string;
  member_name: string | null;
  scenario_name: string;
  inputs: any;
  summary: any;
  notes: string | null;
  created_at: string;
}

export default function SavedIllustrations() {
  const [rows, setRows] = useState<SavedIllustration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("saved_illustrations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Could not load saved illustrations", { description: error.message });
    } else {
      setRows((data as SavedIllustration[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    const { error } = await (supabase as any).from("saved_illustrations").delete().eq("id", id);
    if (error) return toast.error("Delete failed", { description: error.message });
    toast.success("Illustration removed");
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    return !q ||
      r.member_email.toLowerCase().includes(q) ||
      (r.member_name ?? "").toLowerCase().includes(q) ||
      r.scenario_name.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Saved Illustrations</h1>
          <p className="text-muted-foreground">Pension illustrations saved against member email addresses</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, scenario..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Library ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No saved illustrations yet. Open the Pension Illustration tool, configure a scenario, and use "Save to adviser portal" on the Summary tab.
            </p>
          ) : (
            <div className="space-y-3">
              {filtered.map(r => (
                <div key={r.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{r.scenario_name}</span>
                      <Badge variant="outline" className="text-xs">{r.member_name || "—"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Mail className="w-3.5 h-3.5" /> {r.member_email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pot £{Number(r.inputs?.potValue ?? 0).toLocaleString()} · Retirement {r.inputs?.retirementAge} · Growth {r.inputs?.annualGrowth}% · saved {new Date(r.created_at).toLocaleDateString("en-GB")}
                    </p>
                    {r.notes && <p className="text-xs italic text-muted-foreground mt-1">"{r.notes}"</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      try {
                        generateSummaryPdf(r.inputs);
                        toast.success("PDF generated");
                      } catch (e) {
                        toast.error("PDF failed", { description: String((e as Error).message) });
                      }
                    }}>
                      <Download className="w-4 h-4 mr-1" /> PDF
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(r.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
