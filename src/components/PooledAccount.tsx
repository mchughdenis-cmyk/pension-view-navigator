import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Building2,
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  RefreshCw,
  Calendar,
} from "lucide-react";

interface PooledTransaction {
  id: string;
  date: string;
  reference: string;
  description: string;
  clientRef: string;
  clientName: string;
  type: "inflow" | "outflow";
  category: "contribution" | "transfer_in" | "drawdown" | "transfer_out" | "fee" | "interest";
  amount: number;
  runningBalance: number;
  status: "cleared" | "pending" | "reconciled";
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Mock pooled account data
const pooledAccountData = {
  accountName: "Pension Scheme Pooled Account",
  accountNumber: "****4521",
  sortCode: "**-**-89",
  bank: "National Westminster Bank",
  currentBalance: 8547250.75,
  pendingCredits: 125000,
  pendingDebits: 45000,
  lastReconciled: "2024-01-15 09:30",
};

const transactions: PooledTransaction[] = [
  {
    id: "1",
    date: "2024-01-15",
    reference: "TRF-001234",
    description: "Monthly Contribution",
    clientRef: "JS001",
    clientName: "John Smith",
    type: "inflow",
    category: "contribution",
    amount: 500,
    runningBalance: 8547250.75,
    status: "cleared"
  },
  {
    id: "2",
    date: "2024-01-15",
    reference: "TRF-001235",
    description: "Regular Contribution",
    clientRef: "EW002",
    clientName: "Emma Wilson",
    type: "inflow",
    category: "contribution",
    amount: 1000,
    runningBalance: 8546750.75,
    status: "cleared"
  },
  {
    id: "3",
    date: "2024-01-15",
    reference: "TRF-IN-8821",
    description: "Transfer from Previous Provider",
    clientRef: "MJ005",
    clientName: "Michael Johnson",
    type: "inflow",
    category: "transfer_in",
    amount: 85000,
    runningBalance: 8545750.75,
    status: "pending"
  },
  {
    id: "4",
    date: "2024-01-14",
    reference: "DD-005678",
    description: "Monthly Drawdown Payment",
    clientRef: "DT003",
    clientName: "David Thompson",
    type: "outflow",
    category: "drawdown",
    amount: 2500,
    runningBalance: 8460750.75,
    status: "cleared"
  },
  {
    id: "5",
    date: "2024-01-14",
    reference: "DD-005679",
    description: "Regular Income Payment",
    clientRef: "SC006",
    clientName: "Sarah Connor",
    type: "outflow",
    category: "drawdown",
    amount: 1800,
    runningBalance: 8463250.75,
    status: "cleared"
  },
  {
    id: "6",
    date: "2024-01-13",
    reference: "FEE-JAN24",
    description: "Monthly Platform Fee",
    clientRef: "SCHEME",
    clientName: "Scheme Fee",
    type: "outflow",
    category: "fee",
    amount: 1250,
    runningBalance: 8465050.75,
    status: "reconciled"
  },
  {
    id: "7",
    date: "2024-01-13",
    reference: "TRF-001237",
    description: "Lump Sum Contribution",
    clientRef: "LA004",
    clientName: "Lisa Anderson",
    type: "inflow",
    category: "contribution",
    amount: 5000,
    runningBalance: 8466300.75,
    status: "cleared"
  },
  {
    id: "8",
    date: "2024-01-12",
    reference: "INT-JAN24",
    description: "Interest Credit",
    clientRef: "SCHEME",
    clientName: "Bank Interest",
    type: "inflow",
    category: "interest",
    amount: 350.75,
    runningBalance: 8461300.75,
    status: "reconciled"
  },
  {
    id: "9",
    date: "2024-01-12",
    reference: "TRF-OUT-4412",
    description: "Transfer to New Provider",
    clientRef: "RB007",
    clientName: "Robert Brown",
    type: "outflow",
    category: "transfer_out",
    amount: 125000,
    runningBalance: 8460950.00,
    status: "cleared"
  },
  {
    id: "10",
    date: "2024-01-11",
    reference: "TRF-001230",
    description: "Employer Contribution",
    clientRef: "JS001",
    clientName: "John Smith",
    type: "inflow",
    category: "contribution",
    amount: 750,
    runningBalance: 8585950.00,
    status: "reconciled"
  }
];

export default function PooledAccount() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("7days");

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = 
      txn.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || txn.type === filterType;
    const matchesCategory = filterCategory === "all" || txn.category === filterCategory;
    const matchesStatus = filterStatus === "all" || txn.status === filterStatus;
    
    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  const totalInflows = transactions
    .filter(t => t.type === "inflow")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalOutflows = transactions
    .filter(t => t.type === "outflow")
    .reduce((sum, t) => sum + t.amount, 0);

  const getCategoryBadge = (category: PooledTransaction["category"]) => {
    const styles: Record<string, string> = {
      contribution: "bg-success/10 text-success border-success/20",
      transfer_in: "bg-primary/10 text-primary border-primary/20",
      drawdown: "bg-warning/10 text-warning border-warning/20",
      transfer_out: "bg-destructive/10 text-destructive border-destructive/20",
      fee: "bg-muted text-muted-foreground",
      interest: "bg-success/10 text-success border-success/20"
    };
    return <Badge className={styles[category]}>{category.replace('_', ' ')}</Badge>;
  };

  const getStatusBadge = (status: PooledTransaction["status"]) => {
    switch (status) {
      case "cleared":
        return <Badge variant="default">Cleared</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "reconciled":
        return <Badge className="bg-success/10 text-success border-success/20">Reconciled</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {pooledAccountData.accountName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Account Number</p>
                <p className="font-semibold">{pooledAccountData.accountNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sort Code</p>
                <p className="font-semibold">{pooledAccountData.sortCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bank</p>
                <p className="font-semibold">{pooledAccountData.bank}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Reconciled</p>
                <p className="font-semibold">{pooledAccountData.lastReconciled}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Balance
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Statement
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{formatCurrency(pooledAccountData.currentBalance)}</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending Credits</span>
                <span className="text-success">+{formatCurrency(pooledAccountData.pendingCredits)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending Debits</span>
                <span className="text-destructive">-{formatCurrency(pooledAccountData.pendingDebits)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Available Balance</span>
                <span>{formatCurrency(pooledAccountData.currentBalance + pooledAccountData.pendingCredits - pooledAccountData.pendingDebits)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <ArrowDownLeft className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Inflows</p>
                <p className="text-xl font-bold text-success">{formatCurrency(totalInflows)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Outflows</p>
                <p className="text-xl font-bold text-destructive">{formatCurrency(totalOutflows)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Movement</p>
                <p className={`text-xl font-bold ${totalInflows - totalOutflows >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(totalInflows - totalOutflows)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-xl font-bold">{transactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search transactions..." 
                  className="pl-10 w-48"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="year">This year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="inflow">Inflows</SelectItem>
                  <SelectItem value="outflow">Outflows</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="contribution">Contributions</SelectItem>
                  <SelectItem value="transfer_in">Transfers In</SelectItem>
                  <SelectItem value="drawdown">Drawdowns</SelectItem>
                  <SelectItem value="transfer_out">Transfers Out</SelectItem>
                  <SelectItem value="fee">Fees</SelectItem>
                  <SelectItem value="interest">Interest</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="cleared">Cleared</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reconciled">Reconciled</SelectItem>
                </SelectContent>
              </Select>
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
                <TableHead>Client</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map(txn => (
                <TableRow key={txn.id}>
                  <TableCell>{txn.date}</TableCell>
                  <TableCell className="font-mono text-sm">{txn.reference}</TableCell>
                  <TableCell>{txn.description}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{txn.clientName}</p>
                      <p className="text-xs text-muted-foreground">{txn.clientRef}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(txn.category)}</TableCell>
                  <TableCell className={`text-right font-semibold ${txn.type === "inflow" ? "text-success" : "text-destructive"}`}>
                    {txn.type === "inflow" ? "+" : "-"}{formatCurrency(txn.amount)}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(txn.runningBalance)}</TableCell>
                  <TableCell>{getStatusBadge(txn.status)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found matching your filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
