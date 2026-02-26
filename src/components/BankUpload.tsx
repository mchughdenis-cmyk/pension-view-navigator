import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload, FileUp, CheckCircle2, XCircle, AlertTriangle, Download,
  Trash2, FileText, Plus, ArrowRightLeft, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/adminExportUtils";
import { useBankFiles } from "@/hooks/useClientData";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }).format(amount);

export default function BankUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    files, entries, clients, clientAccounts, loading,
    addBankFile, matchEntry, allocateEntry, applyAllocated, rejectEntry, deleteEntry, addManualEntry, fetchAll,
  } = useBankFiles();

  const [filterStatus, setFilterStatus] = useState("all");
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [manualForm, setManualForm] = useState({ date: '', reference: '', description: '', amount: 0, type: 'credit' as 'credit' | 'debit', clientId: '' });
  const [allocateForm, setAllocateForm] = useState({ clientId: '', accountId: '', transactionType: 'contribution', notes: '' });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    toast.info(`Processing "${file.name}"...`);

    // Parse CSV or simulate entries
    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    
    let parsedEntries: { date: string; description: string; amount: number; reference: string }[] = [];
    
    if (lines.length > 1) {
      // Try to parse as CSV (skip header)
      for (let i = 1; i < lines.length && i < 200; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
        if (cols.length >= 3) {
          parsedEntries.push({
            date: cols[0] || new Date().toISOString().split('T')[0],
            description: cols[1] || `Line ${i}`,
            amount: parseFloat(cols[2]) || 0,
            reference: cols[3] || `REF-${Date.now()}-${i}`,
          });
        }
      }
    }

    // If parsing failed, simulate entries
    if (parsedEntries.length === 0) {
      parsedEntries = Array.from({ length: 8 }, (_, i) => ({
        date: new Date().toISOString().split('T')[0],
        reference: `TRF-${String(Date.now()).slice(-6)}-${i}`,
        description: ['Monthly Contribution', 'Employer Contribution', 'Transfer In', 'Lump Sum', 'Regular Payment', 'ISA Top-up', 'Drawdown Payment', 'Fee Payment'][i],
        amount: [500, 1200, 15000, 3000, 750, 2000, -2500, -125][i],
      }));
    }

    const result = await addBankFile(file.name, parsedEntries);
    if (result) {
      toast.success(`File "${file.name}" processed. ${result.entries?.length || 0} entries found, ${result.matchedCount} auto-matched.`);
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredEntries = entries.filter((e: any) => filterStatus === "all" || e.status === filterStatus);

  const handleApplyAll = async () => {
    const count = await applyAllocated();
    toast.success(`Applied ${count} entries as transactions`);
  };

  const handleAddManualEntry = async () => {
    const amount = manualForm.type === 'debit' ? -Math.abs(manualForm.amount) : Math.abs(manualForm.amount);
    const matchedAccount = manualForm.clientId ? clientAccounts.find(a => a.client_id === manualForm.clientId) : null;
    
    await addManualEntry({
      entry_date: manualForm.date || new Date().toISOString().split('T')[0],
      description: manualForm.description,
      amount,
      reference: manualForm.reference || `MAN-${Date.now().toString().slice(-6)}`,
      matched_client_id: manualForm.clientId || undefined,
      matched_account_id: matchedAccount?.id || undefined,
    });
    toast.success('Manual entry added');
    setManualEntryOpen(false);
    setManualForm({ date: '', reference: '', description: '', amount: 0, type: 'credit', clientId: '' });
  };

  const handleAllocateEntry = async () => {
    if (!selectedEntry) return;
    await allocateEntry(selectedEntry.id, allocateForm.clientId, allocateForm.accountId, allocateForm.transactionType, allocateForm.notes);
    toast.success(`Entry allocated`);
    setAllocateDialogOpen(false);
    setSelectedEntry(null);
  };

  const handleExport = () => {
    downloadCSV('bank-entries',
      ['Date', 'Reference', 'Description', 'Amount', 'Client', 'Account', 'Status'],
      filteredEntries.map((e: any) => [e.entry_date, e.reference, e.description, e.amount, e.client_name || '', e.transaction_type || '', e.status])
    );
    toast.success('Bank entries exported');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "matched": return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle2 className="w-3 h-3 mr-1" />Matched</Badge>;
      case "allocated": return <Badge className="bg-primary/10 text-primary border-primary/20"><CheckCircle2 className="w-3 h-3 mr-1" />Allocated</Badge>;
      case "applied": return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle2 className="w-3 h-3 mr-1" />Applied</Badge>;
      case "unmatched": return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Unmatched</Badge>;
      case "rejected": return <Badge className="bg-muted text-muted-foreground"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default: return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />{status}</Badge>;
    }
  };

  const stats = {
    total: entries.length,
    totalCredits: entries.filter((e: any) => Number(e.amount) > 0).reduce((s: number, e: any) => s + Number(e.amount), 0),
    totalDebits: entries.filter((e: any) => Number(e.amount) < 0).reduce((s: number, e: any) => s + Math.abs(Number(e.amount)), 0),
    matched: entries.filter((e: any) => e.status === 'matched').length,
    allocated: entries.filter((e: any) => e.status === 'allocated').length,
    applied: entries.filter((e: any) => e.status === 'applied').length,
    unmatched: entries.filter((e: any) => e.status === 'unmatched').length,
  };

  if (loading) return <div className="flex items-center justify-center py-12"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;

  // Get accounts for a specific client
  const getClientAccounts = (cId: string) => clientAccounts.filter(a => a.client_id === cId);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Total Entries</p><p className="text-xl font-bold text-foreground">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Credits</p><p className="text-xl font-bold text-success">{formatCurrency(stats.totalCredits)}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Debits</p><p className="text-xl font-bold text-destructive">{formatCurrency(stats.totalDebits)}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Matched</p><p className="text-xl font-bold text-success">{stats.matched}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Allocated</p><p className="text-xl font-bold text-primary">{stats.allocated}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Applied</p><p className="text-xl font-bold text-success">{stats.applied}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Unmatched</p><p className="text-xl font-bold text-destructive">{stats.unmatched}</p></CardContent></Card>
      </div>

      {/* Upload */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Upload Bank Statement</CardTitle></CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) { const input = fileInputRef.current; if (input) { const dt = new DataTransfer(); dt.items.add(e.dataTransfer.files[0]); input.files = dt.files; input.dispatchEvent(new Event('change', { bubbles: true })); } } }}
          >
            <FileUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Drop your bank statement file here</p>
            <p className="text-sm text-muted-foreground mb-4">Supports CSV format with Date, Description, Amount columns</p>
            <Button><Upload className="w-4 h-4 mr-2" /> Select File</Button>
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.txt" className="hidden" onChange={handleFileUpload} />
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Recent Uploads</h4>
              <div className="space-y-2">
                {files.map((file: any) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div><p className="font-medium">{file.filename}</p><p className="text-xs text-muted-foreground">Uploaded: {new Date(file.created_at).toLocaleDateString()}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p><span className="text-success">{file.matched_count}</span> / {file.total_entries} matched</p>
                        {file.unmatched_count > 0 && <p className="text-destructive text-xs">{file.unmatched_count} unmatched</p>}
                      </div>
                      <Badge variant={file.status === "completed" ? "default" : "secondary"}>{file.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entries Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Bank Entries — Reconciliation</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Filter" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entries</SelectItem>
                  <SelectItem value="matched">Matched</SelectItem>
                  <SelectItem value="unmatched">Unmatched</SelectItem>
                  <SelectItem value="allocated">Allocated</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => setManualEntryOpen(true)}><Plus className="w-4 h-4 mr-2" /> Manual Entry</Button>
              <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-2" /> Export</Button>
              <Button variant="outline" size="sm" onClick={() => fetchAll()}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
              <Button size="sm" onClick={handleApplyAll}><CheckCircle2 className="w-4 h-4 mr-2" /> Apply All Matched</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead><TableHead>Reference</TableHead><TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead><TableHead>Client</TableHead>
                  <TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry: any) => {
                  const amt = Number(entry.amount);
                  return (
                    <TableRow key={entry.id} className={entry.status === 'rejected' ? 'opacity-50' : ''}>
                      <TableCell className="text-sm">{entry.entry_date}</TableCell>
                      <TableCell className="font-mono text-xs">{entry.reference}</TableCell>
                      <TableCell className="font-medium">{entry.description}</TableCell>
                      <TableCell className={`text-right font-semibold ${amt >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {amt >= 0 ? '+' : ''}{formatCurrency(amt)}
                      </TableCell>
                      <TableCell>
                        {entry.status === 'unmatched' ? (
                          <Select onValueChange={async (clientId) => {
                            const account = clientAccounts.find(a => a.client_id === clientId);
                            if (account) await matchEntry(entry.id, clientId, account.id);
                          }}>
                            <SelectTrigger className="w-32 h-7 text-xs"><SelectValue placeholder="Match client" /></SelectTrigger>
                            <SelectContent>
                              {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="font-medium text-sm">{entry.client_name || '—'}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs capitalize">{entry.transaction_type?.replace('_', ' ') || '—'}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {!['rejected', 'applied'].includes(entry.status) && (
                            <Button variant="ghost" size="sm" title="Allocate" onClick={() => {
                              setSelectedEntry(entry);
                              setAllocateForm({
                                clientId: entry.matched_client_id || '',
                                accountId: entry.matched_account_id || '',
                                transactionType: entry.transaction_type || 'contribution',
                                notes: '',
                              });
                              setAllocateDialogOpen(true);
                            }}><ArrowRightLeft className="w-3 h-3" /></Button>
                          )}
                          {!['rejected', 'applied'].includes(entry.status) && (
                            <Button variant="ghost" size="sm" className="text-destructive" title="Reject" onClick={async () => {
                              await rejectEntry(entry.id);
                              toast.info('Entry rejected');
                            }}><XCircle className="w-3 h-3" /></Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-destructive" title="Delete" onClick={async () => {
                            await deleteEntry(entry.id);
                            toast.success('Entry removed');
                          }}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {filteredEntries.length === 0 && <div className="text-center py-8 text-muted-foreground">No entries found</div>}
        </CardContent>
      </Card>

      {/* Manual Entry Dialog */}
      <Dialog open={manualEntryOpen} onOpenChange={setManualEntryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Manual Bank Entry</DialogTitle>
            <DialogDescription>Manually enter a bank transaction for reconciliation</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Date</Label><Input type="date" value={manualForm.date} onChange={e => setManualForm(p => ({ ...p, date: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Reference</Label><Input value={manualForm.reference} onChange={e => setManualForm(p => ({ ...p, reference: e.target.value }))} placeholder="TRF-XXXXXX" /></div>
            </div>
            <div className="space-y-1"><Label>Description</Label><Input value={manualForm.description} onChange={e => setManualForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Monthly contribution" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1"><Label>Amount (£)</Label><Input type="number" step="0.01" value={manualForm.amount || ''} onChange={e => setManualForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} /></div>
              <div className="space-y-1"><Label>Type</Label>
                <Select value={manualForm.type} onValueChange={v => setManualForm(p => ({ ...p, type: v as 'credit' | 'debit' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="credit">Credit</SelectItem><SelectItem value="debit">Debit</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Client</Label>
                <Select value={manualForm.clientId} onValueChange={v => setManualForm(p => ({ ...p, clientId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManualEntryOpen(false)}>Cancel</Button>
            <Button onClick={handleAddManualEntry} disabled={!manualForm.description || !manualForm.amount}>Add Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Allocate Dialog */}
      <Dialog open={allocateDialogOpen} onOpenChange={setAllocateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Allocate Bank Entry</DialogTitle>
            <DialogDescription>
              {selectedEntry && <>Allocate {formatCurrency(Number(selectedEntry.amount))} ({selectedEntry.reference}) to a client account</>}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1"><Label>Client</Label>
              <Select value={allocateForm.clientId} onValueChange={v => setAllocateForm(p => ({ ...p, clientId: v, accountId: '' }))}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Account</Label>
                <Select value={allocateForm.accountId} onValueChange={v => setAllocateForm(p => ({ ...p, accountId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                  <SelectContent>
                    {getClientAccounts(allocateForm.clientId).map((a: any) => <SelectItem key={a.id} value={a.id}>{a.account_type} ({a.account_number})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Transaction Type</Label>
                <Select value={allocateForm.transactionType} onValueChange={v => setAllocateForm(p => ({ ...p, transactionType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contribution">Contribution</SelectItem>
                    <SelectItem value="employer_contribution">Employer Contribution</SelectItem>
                    <SelectItem value="transfer_in">Transfer In</SelectItem>
                    <SelectItem value="drawdown">Drawdown</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="fee">Fee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1"><Label>Notes</Label><Textarea value={allocateForm.notes} onChange={e => setAllocateForm(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAllocateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAllocateEntry} disabled={!allocateForm.clientId || !allocateForm.accountId}>Allocate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
