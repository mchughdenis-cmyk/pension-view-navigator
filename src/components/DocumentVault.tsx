import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/nav/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AsyncState } from "@/components/ui/async-state";
import { Upload, Download, Trash2, FileText } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Doc {
  id: string;
  client_id: string;
  document_type: string;
  filename: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  notes: string | null;
  created_at: string;
}

const TYPES = ["general", "kyc", "statement", "illustration", "suitability", "correspondence"];
const BUCKET = "client-documents";

export default function DocumentVault() {
  const { user, role } = useRole();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("general");
  const [notes, setNotes] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    let q = supabase.from("client_documents").select("*").order("created_at", { ascending: false });
    if (role === "client") q = q.eq("client_id", user.id);
    const { data, error } = await q;
    if (error) setError(error.message);
    else setDocs((data ?? []) as Doc[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [role]);

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        contentType: file.type, upsert: false,
      });
      if (upErr) throw upErr;
      const { error: insErr } = await supabase.from("client_documents").insert({
        client_id: user.id,
        document_type: docType,
        filename: file.name,
        storage_path: path,
        mime_type: file.type,
        size_bytes: file.size,
        notes: notes || null,
      } as any);
      if (insErr) throw insErr;
      await supabase.from("activity_log").insert({
        action: "document_uploaded", entity_type: "client_documents",
        description: `Uploaded ${file.name} (${docType})`,
        performed_by: user.name,
        new_values: { filename: file.name, document_type: docType, size_bytes: file.size },
      } as any);
      toast({ title: "Uploaded", description: file.name });
      setNotes("");
      if (fileRef.current) fileRef.current.value = "";
      await load();
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const onDownload = async (d: Doc) => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(d.storage_path, 60);
    if (error) {
      toast({ title: "Download failed", description: error.message, variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const onDelete = async (d: Doc) => {
    if (!confirm(`Delete ${d.filename}?`)) return;
    const { error: sErr } = await supabase.storage.from(BUCKET).remove([d.storage_path]);
    if (sErr) { toast({ title: "Storage error", description: sErr.message, variant: "destructive" }); return; }
    const { error: dErr } = await supabase.from("client_documents").delete().eq("id", d.id);
    if (dErr) { toast({ title: "Delete failed", description: dErr.message, variant: "destructive" }); return; }
    toast({ title: "Deleted", description: d.filename });
    setDocs(prev => prev.filter(x => x.id !== d.id));
  };

  const fmtSize = (b: number | null) => !b ? "—" : b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(2)} MB`;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Document vault"
        description="Securely upload, store and retrieve client documents."
      />

      <Card>
        <CardHeader><CardTitle className="text-base">Upload document</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="text-xs text-muted-foreground">Type</label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground">Notes (optional)</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reference, period, recipient…" />
          </div>
          <div className="flex items-end">
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }}
            />
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading…" : "Choose file"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documents ({docs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <AsyncState
            loading={loading}
            error={error}
            isEmpty={!loading && !error && docs.length === 0}
            onRetry={load}
            emptyTitle="No documents yet"
            emptyDescription="Upload a document above to get started."
          >
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {docs.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {d.filename}
                      </TableCell>
                      <TableCell><Badge variant="outline">{d.document_type}</Badge></TableCell>
                      <TableCell className="text-xs">{fmtSize(d.size_bytes)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(d.created_at), "dd MMM yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{d.notes ?? "—"}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => onDownload(d)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onDelete(d)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </AsyncState>
        </CardContent>
      </Card>
    </div>
  );
}
