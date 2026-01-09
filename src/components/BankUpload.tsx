import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  FileUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Eye,
  Trash2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface BankEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  clientRef: string;
  clientName: string;
  status: "matched" | "unmatched" | "pending" | "error";
  errorMessage?: string;
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

// Mock client reference mapping
const clientRefMapping: Record<string, string> = {
  "JS001": "John Smith",
  "EW002": "Emma Wilson",
  "DT003": "David Thompson",
  "LA004": "Lisa Anderson",
  "MJ005": "Michael Johnson",
  "SC006": "Sarah Connor",
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function BankUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: "1",
      name: "bank_statement_jan_2024.csv",
      uploadDate: "2024-01-15",
      totalEntries: 45,
      matchedEntries: 42,
      unmatchedEntries: 3,
      status: "complete"
    },
    {
      id: "2",
      name: "bank_statement_dec_2023.csv",
      uploadDate: "2024-01-10",
      totalEntries: 38,
      matchedEntries: 38,
      unmatchedEntries: 0,
      status: "complete"
    }
  ]);

  const [parsedEntries, setParsedEntries] = useState<BankEntry[]>([
    {
      id: "1",
      date: "2024-01-15",
      reference: "TRF-001234",
      description: "Pension Contribution",
      amount: 500,
      type: "credit",
      clientRef: "JS001",
      clientName: "John Smith",
      status: "matched"
    },
    {
      id: "2",
      date: "2024-01-15",
      reference: "TRF-001235",
      description: "Regular Monthly Contribution",
      amount: 1000,
      type: "credit",
      clientRef: "EW002",
      clientName: "Emma Wilson",
      status: "matched"
    },
    {
      id: "3",
      date: "2024-01-14",
      reference: "TRF-001236",
      description: "Transfer In",
      amount: 25000,
      type: "credit",
      clientRef: "UNKNOWN",
      clientName: "",
      status: "unmatched",
      errorMessage: "Client reference not found in system"
    },
    {
      id: "4",
      date: "2024-01-14",
      reference: "DD-005678",
      description: "Monthly Drawdown Payment",
      amount: 2500,
      type: "debit",
      clientRef: "DT003",
      clientName: "David Thompson",
      status: "matched"
    },
    {
      id: "5",
      date: "2024-01-13",
      reference: "TRF-001237",
      description: "Lump Sum Contribution",
      amount: 5000,
      type: "credit",
      clientRef: "LA004",
      clientName: "Lisa Anderson",
      status: "pending"
    }
  ]);

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file processing
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        totalEntries: 0,
        matchedEntries: 0,
        unmatchedEntries: 0,
        status: "processing"
      };
      
      setUploadedFiles(prev => [newFile, ...prev]);
      
      // Simulate processing delay
      setTimeout(() => {
        setUploadedFiles(prev => prev.map(f => 
          f.id === newFile.id 
            ? { ...f, totalEntries: 25, matchedEntries: 22, unmatchedEntries: 3, status: "complete" as const }
            : f
        ));
        toast.success(`File "${file.name}" processed successfully. 25 entries found, 22 matched.`);
      }, 2000);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      // Handle the dropped file similarly
      toast.info(`Processing ${file.name}...`);
    }
  };

  const filteredEntries = parsedEntries.filter(entry => 
    filterStatus === "all" || entry.status === filterStatus
  );

  const getStatusBadge = (status: BankEntry["status"]) => {
    switch (status) {
      case "matched":
        return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle2 className="w-3 h-3 mr-1" />Matched</Badge>;
      case "unmatched":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Unmatched</Badge>;
      case "pending":
        return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Pending</Badge>;
      case "error":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
    }
  };

  const handleApplyAll = () => {
    const matchedCount = parsedEntries.filter(e => e.status === "matched").length;
    toast.success(`Applied ${matchedCount} matched entries to client accounts`);
  };

  const handleManualMatch = (entryId: string, clientRef: string) => {
    setParsedEntries(prev => prev.map(entry => {
      if (entry.id === entryId && clientRefMapping[clientRef]) {
        return {
          ...entry,
          clientRef,
          clientName: clientRefMapping[clientRef],
          status: "matched",
          errorMessage: undefined
        };
      }
      return entry;
    }));
    toast.success("Entry manually matched to client");
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Bank Statement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <FileUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Drop your bank statement file here</p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports CSV, XLSX, and MT940 formats
            </p>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Select File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.mt940"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Recently Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Recent Uploads</h4>
              <div className="space-y-2">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">Uploaded: {file.uploadDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p><span className="text-success">{file.matchedEntries}</span> / {file.totalEntries} matched</p>
                        {file.unmatchedEntries > 0 && (
                          <p className="text-destructive text-xs">{file.unmatchedEntries} unmatched</p>
                        )}
                      </div>
                      <Badge variant={file.status === "complete" ? "default" : file.status === "processing" ? "secondary" : "destructive"}>
                        {file.status}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => setSelectedFile(file.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parsed Entries Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Bank Entries</CardTitle>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entries</SelectItem>
                  <SelectItem value="matched">Matched</SelectItem>
                  <SelectItem value="unmatched">Unmatched</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleApplyAll}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Apply All Matched
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map(entry => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell className="font-mono text-sm">{entry.reference}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>
                    <Badge variant={entry.type === "credit" ? "default" : "secondary"}>
                      {entry.type}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${entry.type === "credit" ? "text-success" : "text-destructive"}`}>
                    {entry.type === "credit" ? "+" : "-"}{formatCurrency(entry.amount)}
                  </TableCell>
                  <TableCell>
                    {entry.status === "unmatched" ? (
                      <Select onValueChange={(value) => handleManualMatch(entry.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(clientRefMapping).map(([ref, name]) => (
                            <SelectItem key={ref} value={ref}>{name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div>
                        <p className="font-medium">{entry.clientName}</p>
                        <p className="text-xs text-muted-foreground">{entry.clientRef}</p>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(entry.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredEntries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No entries found matching the selected filter
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{parsedEntries.length}</p>
              <p className="text-sm text-muted-foreground">Total Entries</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{parsedEntries.filter(e => e.status === "matched").length}</p>
              <p className="text-sm text-muted-foreground">Matched</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">{parsedEntries.filter(e => e.status === "unmatched").length}</p>
              <p className="text-sm text-muted-foreground">Unmatched</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{parsedEntries.filter(e => e.status === "pending").length}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
