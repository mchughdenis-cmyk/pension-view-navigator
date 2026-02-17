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
  Upload, FileUp, CheckCircle2, XCircle, AlertTriangle, Download, Eye,
  Trash2, FileText, Plus, Edit, RefreshCw, ArrowRightLeft, DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/adminExportUtils";

interface BankEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  clientRef: string;
  clientName: string;
  status: "matched" | "unmatched" | "pending" | "allocated" | "rejected";
  account: string;
  transactionType: string;
  notes: string;
}

interface UploadedFile {
  id: string;
  name: string;
  uploadDate: string;
  totalEntries: number;
  matchedEntries: number;
  unmatchedEntries: number;
  status: "processing" | "complete" | "error";
}

const clientRefMapping: Record<string, string> = {
  "JS001": "John Smith",
  "EW002": "Emma Wilson",
  "DT003": "David Thompson",
  "LA004": "Lisa Anderson",
  "MJ005": "Michael Johnson",
  "SC006": "Sarah Connor",
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }).format(amount);

export default function BankUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    { id: "1", name: "bank_statement_jan_2024.csv", uploadDate: "2024-01-15", totalEntries: 45, matchedEntries: 42, unmatchedEntries: 3, status: "complete" },
    { id: "2", name: "bank_statement_dec_2023.csv", uploadDate: "2024-01-10", totalEntries: 38, matchedEntries: 38, unmatchedEntries: 0, status: "complete" },
  ]);

  const [entries, setEntries] = useState<BankEntry[]>([
    { id: "1", date: "2024-01-15", reference: "TRF-001234", description: "Pension Contribution", amount: 500, type: "credit", clientRef: "JS001", clientName: "John Smith", status: "matched", account: "SIPP", transactionType: "contribution", notes: "" },
    { id: "2", date: "2024-01-15", reference: "TRF-001235", description: "Regular Monthly Contribution", amount: 1000, type: "credit", clientRef: "EW002", clientName: "Emma Wilson", status: "matched", account: "SIPP", transactionType: "contribution", notes: "" },
    { id: "3", date: "2024-01-14", reference: "TRF-001236", description: "Transfer In", amount: 25000, type: "credit", clientRef: "UNKNOWN", clientName: "", status: "unmatched", account: "", transactionType: "", notes: "Client reference not found in system" },
    { id: "4", date: "2024-01-14", reference: "DD-005678", description: "Monthly Drawdown Payment", amount: 2500, type: "debit", clientRef: "DT003", clientName: "David Thompson", status: "matched", account: "SIPP", transactionType: "drawdown", notes: "" },
    { id: "5", date: "2024-01-13", reference: "TRF-001237", description: "Lump Sum Contribution", amount: 5000, type: "credit", clientRef: "LA004", clientName: "Lisa Anderson", status: "pending", account: "SIPP", transactionType: "contribution", notes: "" },
    { id: "6", date: "2024-01-12", reference: "TRF-001238", description: "ISA Subscription", amount: 2000, type: "credit", clientRef: "JS001", clientName: "John Smith", status: "pending", account: "ISA", transactionType: "contribution", notes: "" },
    { id: "7", date: "2024-01-11", reference: "TRF-001239", description: "Employer Contribution", amount: 3500, type: "credit", clientRef: "MJ005", clientName: "Michael Johnson", status: "matched", account: "SIPP", transactionType: "employer_contribution", notes: "" },
  ]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [editEntryOpen, setEditEntryOpen] = useState(false);
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<BankEntry | null>(null);
  const [manualForm, setManualForm] = useState({ date: '', reference: '', description: '', amount: 0, type: 'credit' as 'credit' | 'debit', clientRef: '' });
  const [allocateForm, setAllocateForm] = useState({ clientRef: '', account: 'SIPP', transactionType: 'contribution', notes: '' });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newFile: UploadedFile = { id: Date.now().toString(), name: file.name, uploadDate: new Date().toISOString().split('T')[0], totalEntries: 0, matchedEntries: 0, unmatchedEntries: 0, status: "processing" };
      setUploadedFiles(prev => [newFile, ...prev]);

      // Simulate parsing and creating entries
      setTimeout(() => {
        const simulatedEntries: BankEntry[] = Array.from({ length: 8 }, (_, i) => ({
          id: `new-${Date.now()}-${i}`,
          date: new Date().toISOString().split('T')[0],
          reference: `TRF-${String(Date.now()).slice(-6)}-${i}`,
          description: ['Monthly Contribution', 'Employer Contribution', 'Transfer In', 'Lump Sum', 'Regular Payment', 'ISA Top-up', 'Drawdown Payment', 'Fee Payment'][i],
          amount: [500, 1200, 15000, 3000, 750, 2000, 2500, 125][i],
          type: (i === 6 || i === 7 ? 'debit' : 'credit') as 'credit' | 'debit',
          clientRef: i < 5 ? Object.keys(clientRefMapping)[i] : 'UNKNOWN',
          clientName: i < 5 ? Object.values(clientRefMapping)[i] : '',
          status: (i < 5 ? 'matched' : i === 7 ? 'pending' : 'unmatched') as BankEntry['status'],
          account: i < 5 ? 'SIPP' : '',
          transactionType: i < 5 ? 'contribution' : '',
          notes: i >= 5 && i < 7 ? 'Client reference not found' : '',
        }));

        setEntries(prev => [...simulatedEntries, ...prev]);
        setUploadedFiles(prev => prev.map(f =>
          f.id === newFile.id ? { ...f, totalEntries: 8, matchedEntries: 5, unmatchedEntries: 3, status: "complete" as const } : f
        ));
        toast.success(`File "${file.name}" processed. 8 entries found, 5 auto-matched.`);
      }, 2000);
    }
  };

  const filteredEntries = entries.filter(e => filterStatus === "all" || e.status === filterStatus);

  const handleManualMatch = (entryId: string, clientRef: string) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === entryId && clientRefMapping[clientRef]) {
        return { ...entry, clientRef, clientName: clientRefMapping[clientRef], status: "matched" as const, notes: '' };
      }
      return entry;
    }));
    toast.success("Entry matched to client");
  };

  const handleAllocateEntry = () => {
    if (!selectedEntry) return;
    setEntries(prev => prev.map(e => e.id === selectedEntry.id ? {
      ...e,
      clientRef: allocateForm.clientRef,
      clientName: clientRefMapping[allocateForm.clientRef] || allocateForm.clientRef,
      account: allocateForm.account,
      transactionType: allocateForm.transactionType,
      status: 'allocated' as const,
      notes: allocateForm.notes,
    } : e));
    toast.success(`Entry allocated to ${clientRefMapping[allocateForm.clientRef] || allocateForm.clientRef} → ${allocateForm.account}`);
    setAllocateDialogOpen(false);
    setSelectedEntry(null);
  };

  const handleApplyAll = () => {
    const matchedCount = entries.filter(e => e.status === "matched" || e.status === "allocated").length;
    setEntries(prev => prev.map(e => (e.status === 'matched' || e.status === 'allocated') ? { ...e, status: 'allocated' as const } : e));
    toast.success(`Applied ${matchedCount} entries to client accounts as transactions`);
  };

  const handleRejectEntry = (id: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'rejected' as const } : e));
    toast.info('Entry rejected');
  };

  const handleAddManualEntry = () => {
    const newEntry: BankEntry = {
      id: `manual-${Date.now()}`,
      date: manualForm.date || new Date().toISOString().split('T')[0],
      reference: manualForm.reference || `MAN-${Date.now().toString().slice(-6)}`,
      description: manualForm.description,
      amount: manualForm.amount,
      type: manualForm.type,
      clientRef: manualForm.clientRef,
      clientName: clientRefMapping[manualForm.clientRef] || '',
      status: manualForm.clientRef && clientRefMapping[manualForm.clientRef] ? 'matched' : 'unmatched',
      account: '',
      transactionType: '',
      notes: 'Manually entered',
    };
    setEntries(prev => [newEntry, ...prev]);
    toast.success('Manual entry added');
    setManualEntryOpen(false);
    setManualForm({ date: '', reference: '', description: '', amount: 0, type: 'credit', clientRef: '' });
  };

  const handleExport = () => {
    downloadCSV('bank-entries',
      ['Date', 'Reference', 'Description', 'Type', 'Amount', 'Client', 'Account', 'Txn Type', 'Status', 'Notes'],
      filteredEntries.map(e => [e.date, e.reference, e.description, e.type, e.amount, e.clientName || e.clientRef, e.account, e.transactionType, e.status, e.notes])
    );
    toast.success('Bank entries exported');
  };

  const getStatusBadge = (status: BankEntry["status"]) => {
    switch (status) {
      case "matched": return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle2 className="w-3 h-3 mr-1" />Matched</Badge>;
      case "allocated": return <Badge className="bg-primary/10 text-primary border-primary/20"><CheckCircle2 className="w-3 h-3 mr-1" />Allocated</Badge>;
      case "unmatched": return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Unmatched</Badge>;
      case "pending": return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Pending</Badge>;
      case "rejected": return <Badge className="bg-muted text-muted-foreground"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    }
  };

  const summaryStats = {
    total: entries.length,
    totalCredits: entries.filter(e => e.type === 'credit').reduce((s, e) => s + e.amount, 0),
    totalDebits: entries.filter(e => e.type === 'debit').reduce((s, e) => s + e.amount, 0),
    matched: entries.filter(e => e.status === 'matched').length,
    allocated: entries.filter(e => e.status === 'allocated').length,
    unmatched: entries.filter(e => e.status === 'unmatched').length,
    pending: entries.filter(e => e.status === 'pending').length,
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Total Entries</p><p className="text-xl font-bold text-foreground">{summaryStats.total}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Total Credits</p><p className="text-xl font-bold text-success">{formatCurrency(summaryStats.totalCredits)}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Total Debits</p><p className="text-xl font-bold text-destructive">{formatCurrency(summaryStats.totalDebits)}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Matched</p><p className="text-xl font-bold text-success">{summaryStats.matched}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Allocated</p><p className="text-xl font-bold text-primary">{summaryStats.allocated}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Unmatched</p><p className="text-xl font-bold text-destructive">{summaryStats.unmatched}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Pending</p><p className="text-xl font-bold text-warning">{summaryStats.pending}</p></CardContent></Card>
      </div>

      {/* Upload */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Upload Bank Statement</CardTitle></CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); toast.info(`Processing ${e.dataTransfer.files[0]?.name}...`) }}
          >
            <FileUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Drop your bank statement file here</p>
            <p className="text-sm text-muted-foreground mb-4">Supports CSV, XLSX, MT940, and BAI2 formats</p>
            <Button><Upload className="w-4 h-4 mr-2" /> Select File</Button>
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.mt940,.bai2" className="hidden" onChange={handleFileUpload} />
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Recent Uploads</h4>
              <div className="space-y-2">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div><p className="font-medium">{file.name}</p><p className="text-xs text-muted-foreground">Uploaded: {file.uploadDate}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p><span className="text-success">{file.matchedEntries}</span> / {file.totalEntries} matched</p>
                        {file.unmatchedEntries > 0 && <p className="text-destructive text-xs">{file.unmatchedEntries} unmatched</p>}
                      </div>
                      <Badge variant={file.status === "complete" ? "default" : file.status === "processing" ? "secondary" : "destructive"}>{file.status}</Badge>
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="allocated">Allocated</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => setManualEntryOpen(true)}><Plus className="w-4 h-4 mr-2" /> Manual Entry</Button>
              <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-2" /> Export</Button>
              <Button size="sm" onClick={handleApplyAll}><CheckCircle2 className="w-4 h-4 mr-2" /> Apply All Matched</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Txn Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map(entry => (
                  <TableRow key={entry.id} className={entry.status === 'rejected' ? 'opacity-50' : ''}>
                    <TableCell className="text-sm">{entry.date}</TableCell>
                    <TableCell className="font-mono text-xs">{entry.reference}</TableCell>
                    <TableCell className="font-medium">{entry.description}</TableCell>
                    <TableCell><Badge variant={entry.type === "credit" ? "default" : "secondary"}>{entry.type}</Badge></TableCell>
                    <TableCell className={`text-right font-semibold ${entry.type === "credit" ? "text-success" : "text-destructive"}`}>
                      {entry.type === "credit" ? "+" : "-"}{formatCurrency(entry.amount)}
                    </TableCell>
                    <TableCell>
                      {entry.status === "unmatched" ? (
                        <Select onValueChange={(value) => handleManualMatch(entry.id, value)}>
                          <SelectTrigger className="w-32 h-7 text-xs"><SelectValue placeholder="Select client" /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(clientRefMapping).map(([ref, name]) => (
                              <SelectItem key={ref} value={ref}>{name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div><p className="font-medium text-sm">{entry.clientName}</p><p className="text-xs text-muted-foreground">{entry.clientRef}</p></div>
                      )}
                    </TableCell>
                    <TableCell>{entry.account ? <Badge variant="outline">{entry.account}</Badge> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                    <TableCell>{entry.transactionType ? <span className="text-xs capitalize">{entry.transactionType.replace('_', ' ')}</span> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                    <TableCell>{getStatusBadge(entry.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {(entry.status === 'unmatched' || entry.status === 'pending' || entry.status === 'matched') && (
                          <Button variant="ghost" size="sm" title="Allocate" onClick={() => {
                            setSelectedEntry(entry);
                            setAllocateForm({ clientRef: entry.clientRef !== 'UNKNOWN' ? entry.clientRef : '', account: entry.account || 'SIPP', transactionType: entry.transactionType || 'contribution', notes: entry.notes });
                            setAllocateDialogOpen(true);
                          }}><ArrowRightLeft className="w-3 h-3" /></Button>
                        )}
                        {entry.status !== 'rejected' && entry.status !== 'allocated' && (
                          <Button variant="ghost" size="sm" className="text-destructive" title="Reject" onClick={() => handleRejectEntry(entry.id)}><XCircle className="w-3 h-3" /></Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-destructive" title="Delete" onClick={() => {
                          setEntries(prev => prev.filter(e => e.id !== entry.id));
                          toast.success('Entry removed');
                        }}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredEntries.length === 0 && <div className="text-center py-8 text-muted-foreground">No entries found matching the selected filter</div>}
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
                  <SelectContent>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="debit">Debit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Client</Label>
                <Select value={manualForm.clientRef} onValueChange={v => setManualForm(p => ({ ...p, clientRef: v }))}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(clientRefMapping).map(([ref, name]) => (
                      <SelectItem key={ref} value={ref}>{name}</SelectItem>
                    ))}
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
              {selectedEntry && <>Allocate {formatCurrency(selectedEntry.amount)} ({selectedEntry.reference}) to a client account</>}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1"><Label>Client</Label>
              <Select value={allocateForm.clientRef} onValueChange={v => setAllocateForm(p => ({ ...p, clientRef: v }))}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(clientRefMapping).map(([ref, name]) => (
                    <SelectItem key={ref} value={ref}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Account</Label>
                <Select value={allocateForm.account} onValueChange={v => setAllocateForm(p => ({ ...p, account: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIPP">SIPP</SelectItem>
                    <SelectItem value="ISA">ISA</SelectItem>
                    <SelectItem value="GIA">GIA</SelectItem>
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
                    <SelectItem value="tax_relief">Tax Relief</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1"><Label>Notes</Label><Textarea value={allocateForm.notes} onChange={e => setAllocateForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Optional notes about this allocation" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAllocateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAllocateEntry} disabled={!allocateForm.clientRef}>Allocate Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
