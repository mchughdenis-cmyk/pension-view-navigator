import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileHeader } from "@/components/ui/mobile-header";
import { SidebarNavLayout, type NavGroup } from "@/components/ui/sidebar-nav";
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  FileText, 
  Search,
  Download,
  Eye,
  Edit,
  Bell,
  BarChart3,
  UserCheck,
  Calendar,
  Clock,
  UserPlus,
  Upload,
  Receipt,
  Building2,
  Shield,
  PiggyBank,
  Banknote,
  TrendingDown,
  ClipboardList,
  Activity,
  FileBarChart,
  Scale,
  Gavel,
  Link2,
  Package,
  ArrowRightLeft,
  LayoutDashboard,
  Briefcase,
  Settings2,
  LineChart,
  Cog,
  KeyRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import BankUpload from "./BankUpload";
import PooledAccount from "./PooledAccount";
import IntegrationsHub from "./IntegrationsHub";
import InvestmentProducts from "./InvestmentProducts";
import OrigoTransfers from "./OrigoTransfers";
import TransactionLedger from "./admin/TransactionLedger";
import FeeEngine from "./admin/FeeEngine";
import TradeOrderManagement from "./admin/TradeOrderManagement";
import PortfolioRebalancing from "./admin/PortfolioRebalancing";
import RegulatoryReporting from "./admin/RegulatoryReporting";
import CustodyReconciliation from "./admin/CustodyReconciliation";
import AdviserCharging from "./admin/AdviserCharging";
import DocumentGeneration from "./admin/DocumentGeneration";
import AuditTrail from "./admin/AuditTrail";
import WorkflowEngine from "./admin/WorkflowEngine";
import SchemeDashboard from "./admin/SchemeDashboard";
import BulkOperations from "./admin/BulkOperations";
import UserManagement from "./admin/UserManagement";
import SystemConfiguration from "./admin/SystemConfiguration";
import { ClientDialog, ConfirmDialog, type ClientFormData } from "./admin/AdminDialogs";
import { downloadCSV } from "@/lib/adminExportUtils";

// Grouped navigation structure
const navGroups = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    items: [
      { value: "scheme", label: "Scheme Overview", icon: BarChart3 },
      { value: "activity", label: "Activity", icon: Activity },
      { value: "alerts", label: "Alerts", icon: Bell },
    ],
  },
  {
    label: "Client Management",
    icon: Users,
    items: [
      { value: "clients", label: "Clients", icon: Users },
    ],
  },
  {
    label: "Operations",
    icon: Briefcase,
    items: [
      { value: "transactions", label: "Transactions", icon: ClipboardList },
      { value: "trading", label: "Trading", icon: TrendingUp },
      { value: "rebalancing", label: "Rebalancing", icon: Activity },
      { value: "custody", label: "Custody & Reconciliation", icon: Shield },
    ],
  },
  {
    label: "Fees & Billing",
    icon: Receipt,
    items: [
      { value: "fees", label: "Platform Fees", icon: Receipt },
      { value: "adviser-fees", label: "Adviser Fees", icon: UserCheck },
    ],
  },
  {
    label: "Administration",
    icon: Settings2,
    items: [
      { value: "documents", label: "Documents", icon: FileText },
      { value: "workflows", label: "Workflows", icon: Activity },
      { value: "bulk-ops", label: "Bulk Operations", icon: Package },
      { value: "audit", label: "Audit Trail", icon: Clock },
      { value: "users", label: "User Management", icon: KeyRound },
      { value: "system-config", label: "System Config", icon: Cog },
    ],
  },
  {
    label: "Integrations & Products",
    icon: Link2,
    items: [
      { value: "integrations", label: "Integrations", icon: Link2 },
      { value: "products", label: "Products", icon: Package },
      { value: "origo", label: "Origo Transfers", icon: ArrowRightLeft },
      { value: "bankupload", label: "Bank Upload", icon: Upload },
      { value: "pooledaccount", label: "Pooled Account", icon: Building2 },
    ],
  },
  {
    label: "Reporting & Compliance",
    icon: LineChart,
    items: [
      { value: "reports", label: "Reports", icon: FileBarChart },
      { value: "compliance", label: "Compliance", icon: Scale },
      { value: "regulatory", label: "Regulatory", icon: Gavel },
    ],
  },
];

// Mock data for admin dashboard
const adminData = {
  summary: {
    totalClients: 1247,
    totalAUM: 42750000,
    pendingActions: 18,
    overdueReviews: 5,
    clientsInDrawdown: 187,
    clientsInAccumulation: 1060,
    clientsWithRegularIncome: 134
  },
  clients: [
    { id: 1, name: "John Smith", email: "john.smith@email.com", totalValue: 485750, lastLogin: "2024-01-15", status: "active", riskProfile: "balanced", advisor: "Sarah Johnson", pendingActions: 2, allowanceUsage: 67 },
    { id: 2, name: "Emma Wilson", email: "emma.wilson@email.com", totalValue: 325000, lastLogin: "2024-01-14", status: "active", riskProfile: "conservative", advisor: "Michael Brown", pendingActions: 0, allowanceUsage: 45 },
    { id: 3, name: "David Thompson", email: "david.thompson@email.com", totalValue: 750000, lastLogin: "2024-01-10", status: "review_required", riskProfile: "aggressive", advisor: "Sarah Johnson", pendingActions: 3, allowanceUsage: 89 },
    { id: 4, name: "Lisa Anderson", email: "lisa.anderson@email.com", totalValue: 195000, lastLogin: "2024-01-08", status: "onboarding", riskProfile: "balanced", advisor: "Michael Brown", pendingActions: 1, allowanceUsage: 23 },
  ],
  recentActivity: [
    { type: "contribution", client: "John Smith", amount: 5000, timestamp: "2024-01-15 14:30", status: "processed" },
    { type: "transfer_in", client: "Emma Wilson", amount: 25000, timestamp: "2024-01-15 11:15", status: "pending" },
    { type: "drawdown", client: "David Thompson", amount: 3000, timestamp: "2024-01-15 09:45", status: "approved" },
    { type: "risk_review", client: "Lisa Anderson", amount: 0, timestamp: "2024-01-14 16:20", status: "overdue" },
  ],
  alerts: [
    { id: 1, type: "allowance_exceeded", client: "David Thompson", message: "Client approaching annual allowance limit", priority: "high", timestamp: "2024-01-15" },
    { id: 2, type: "review_due", client: "Lisa Anderson", message: "Annual review overdue by 15 days", priority: "medium", timestamp: "2024-01-14" },
    { id: 3, type: "document_required", client: "Emma Wilson", message: "Transfer documentation pending", priority: "low", timestamp: "2024-01-13" },
  ]
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'default';
    case 'review_required': return 'destructive';
    case 'onboarding': return 'secondary';
    case 'pending': return 'secondary';
    case 'processed': return 'default';
    case 'approved': return 'default';
    case 'overdue': return 'destructive';
    default: return 'default';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'destructive';
    case 'medium': return 'secondary';
    case 'low': return 'outline';
    default: return 'default';
  }
};

export default function PensionAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("scheme");
  const [clients, setClients] = useState(adminData.clients);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<(typeof adminData.clients[0]) | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState('all');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleAddClient = (data: ClientFormData) => {
    const newId = Math.max(...clients.map(c => c.id)) + 1;
    setClients(prev => [...prev, { id: newId, name: data.name, email: data.email, totalValue: 0, lastLogin: 'Never', status: data.status, riskProfile: data.riskProfile, advisor: data.advisor, pendingActions: 0, allowanceUsage: 0 }]);
    toast.success(`Client "${data.name}" added successfully`);
  };

  const handleEditClient = (data: ClientFormData) => {
    if (!editingClient) return;
    setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, name: data.name, email: data.email, advisor: data.advisor, riskProfile: data.riskProfile, status: data.status } : c));
    toast.success(`Client "${data.name}" updated`);
    setEditingClient(null);
  };

  const handleExportReport = () => {
    downloadCSV('admin-report',
      ['Name', 'Email', 'Portfolio Value', 'Status', 'Adviser', 'Allowance Usage'],
      clients.map(c => [c.name, c.email, c.totalValue, c.status, c.advisor, `${c.allowanceUsage}%`])
    );
    toast.success('Admin report exported as CSV');
  };

  const filteredClients = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.email.toLowerCase().includes(clientSearch.toLowerCase());
    const matchStatus = clientStatusFilter === 'all' || c.status === clientStatusFilter;
    return matchSearch && matchStatus;
  });

  const headerActions = (
    <>
      <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="w-full sm:w-auto justify-start">
        <Users className="w-4 h-4 mr-2" />
        Dashboard
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportReport} className="w-full sm:w-auto justify-start">
        <Download className="w-4 h-4 mr-2" />
        Export Report
      </Button>
      <Button variant="outline" size="sm" onClick={() => navigate('/onboarding')} className="w-full sm:w-auto justify-start">
        <UserPlus className="w-4 h-4 mr-2" />
        Client Onboarding
      </Button>
      <Button size="sm" className="bg-primary hover:bg-primary/90 w-full sm:w-auto justify-start" onClick={() => setClientDialogOpen(true)}>
        <UserCheck className="w-4 h-4 mr-2" />
        Add Client
      </Button>
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "scheme": return <SchemeDashboard />;
      case "clients": return (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Client Portfolio Management</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search clients..." className="pl-10 w-64" value={clientSearch} onChange={e => setClientSearch(e.target.value)} />
                </div>
                <Select value={clientStatusFilter} onValueChange={setClientStatusFilter}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="review_required">Review Required</SelectItem>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={() => setClientDialogOpen(true)}><UserPlus className="w-4 h-4 mr-2" /> Add Client</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate(`/client-admin/${client.id}`)}>
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-6 gap-4 items-center">
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                    <div className="text-center"><p className="font-semibold">{formatCurrency(client.totalValue)}</p><p className="text-xs text-muted-foreground">Portfolio Value</p></div>
                    <div className="text-center hidden sm:block"><Badge variant={getStatusColor(client.status)}>{client.status.replace('_', ' ')}</Badge></div>
                    <div className="text-center hidden sm:block"><p className="text-sm">{client.advisor}</p><p className="text-xs text-muted-foreground">Advisor</p></div>
                    <div className="text-center hidden sm:block"><p className="text-sm">{client.allowanceUsage}%</p><p className="text-xs text-muted-foreground">Allowance Used</p></div>
                    <div className="text-center hidden sm:block">{client.pendingActions > 0 && <Badge variant="secondary">{client.pendingActions} pending</Badge>}</div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/client-admin/${client.id}`); }}><Eye className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setEditingClient(client); }}><Edit className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
      case "transactions": return <TransactionLedger />;
      case "trading": return <TradeOrderManagement />;
      case "rebalancing": return <PortfolioRebalancing />;
      case "custody": return <CustodyReconciliation />;
      case "fees": return <FeeEngine />;
      case "adviser-fees": return <AdviserCharging />;
      case "documents": return <DocumentGeneration />;
      case "workflows": return <WorkflowEngine />;
      case "bulk-ops": return <BulkOperations />;
      case "audit": return <AuditTrail />;
      case "users": return <UserManagement />;
      case "system-config": return <SystemConfiguration />;
      case "activity": return (
        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {adminData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border-l-4 border-primary bg-accent/20 rounded-r-lg">
                  <div className="flex items-center gap-3">
                    {activity.type === 'contribution' && <DollarSign className="h-5 w-5 text-success" />}
                    {activity.type === 'transfer_in' && <TrendingUp className="h-5 w-5 text-primary" />}
                    {activity.type === 'drawdown' && <DollarSign className="h-5 w-5 text-warning" />}
                    {activity.type === 'risk_review' && <FileText className="h-5 w-5 text-muted-foreground" />}
                    <div>
                      <p className="font-medium">{activity.client}</p>
                      <p className="text-sm text-muted-foreground">{activity.type.replace('_', ' ').toUpperCase()}{activity.amount > 0 && ` - ${formatCurrency(activity.amount)}`}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getStatusColor(activity.status)}>{activity.status}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
      case "integrations": return <IntegrationsHub />;
      case "products": return <InvestmentProducts />;
      case "origo": return <OrigoTransfers />;
      case "bankupload": return <BankUpload />;
      case "pooledaccount": return <PooledAccount />;
      case "alerts": return (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Alerts & Notifications</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {adminData.alerts.map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${alert.priority === 'high' ? 'text-destructive' : alert.priority === 'medium' ? 'text-warning' : 'text-muted-foreground'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{alert.client}</p>
                        <Badge variant={getPriorityColor(alert.priority)} className="text-xs">{alert.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="ml-4">Resolve</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
      case "reports": return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Portfolio Analytics</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start"><FileText className="w-4 h-4 mr-2" /> Monthly Portfolio Summary</Button>
              <Button variant="outline" className="w-full justify-start"><FileText className="w-4 h-4 mr-2" /> Asset Allocation Report</Button>
              <Button variant="outline" className="w-full justify-start"><FileText className="w-4 h-4 mr-2" /> Performance Analytics</Button>
              <Button variant="outline" className="w-full justify-start"><FileText className="w-4 h-4 mr-2" /> Risk Assessment Summary</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Regulatory Reports</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start"><FileText className="w-4 h-4 mr-2" /> Annual Allowance Report</Button>
              <Button variant="outline" className="w-full justify-start"><FileText className="w-4 h-4 mr-2" /> Contribution Summary</Button>
              <Button variant="outline" className="w-full justify-start"><FileText className="w-4 h-4 mr-2" /> Transfer Documentation</Button>
              <Button variant="outline" className="w-full justify-start"><Receipt className="w-4 h-4 mr-2" /> Tax Relief Report</Button>
              <Button variant="outline" className="w-full justify-start"><FileText className="w-4 h-4 mr-2" /> Compliance Audit Trail</Button>
            </CardContent>
          </Card>
        </div>
      );
      case "compliance": return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Compliance Monitoring</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg"><p className="font-medium text-success">Annual Allowance Monitoring</p><p className="text-sm text-muted-foreground">All clients within limits</p></div>
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg"><p className="font-medium text-warning">Know Your Customer (KYC)</p><p className="text-sm text-muted-foreground">3 reviews pending</p></div>
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg"><p className="font-medium text-success">Anti-Money Laundering</p><p className="text-sm text-muted-foreground">All checks complete</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Audit Trail</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex justify-between py-2 border-b"><span>Last full audit</span><span className="font-medium">December 2023</span></div>
                <div className="flex justify-between py-2 border-b"><span>Compliance score</span><span className="font-medium text-success">98.5%</span></div>
                <div className="flex justify-between py-2 border-b"><span>Outstanding issues</span><span className="font-medium">2</span></div>
                <div className="flex justify-between py-2"><span>Next review</span><span className="font-medium">March 2024</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
      case "regulatory": return <RegulatoryReporting />;
      default: return <SchemeDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader
        title="Pension Administration"
        subtitle="Manage client portfolios and administrative tasks"
        actions={headerActions}
      />

      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground hidden sm:block" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold text-primary">{adminData.summary.totalClients.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">Active accounts</p>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">AUM</CardTitle>
              <TrendingUp className="h-4 w-4 text-success hidden sm:block" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold text-success">{formatCurrency(adminData.summary.totalAUM)}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">Total portfolio value</p>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Drawdown</CardTitle>
              <TrendingDown className="h-4 w-4 text-warning hidden sm:block" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold text-warning">{adminData.summary.clientsInDrawdown}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">Taking withdrawals</p>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Accumulation</CardTitle>
              <PiggyBank className="h-4 w-4 text-primary hidden sm:block" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold text-primary">{adminData.summary.clientsInAccumulation}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">Building wealth</p>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Regular Income</CardTitle>
              <Banknote className="h-4 w-4 text-success hidden sm:block" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold text-success">{adminData.summary.clientsWithRegularIncome}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">Monthly payments</p>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-warning hidden sm:block" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold text-warning">{adminData.summary.pendingActions}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">Require attention</p>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive hidden sm:block" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold text-destructive">{adminData.summary.overdueReviews}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">Need immediate action</p>
            </CardContent>
          </Card>
        </div>

        <SidebarNavLayout groups={navGroups} activeTab={activeTab} onTabChange={handleTabChange}>
          {renderContent()}
        </SidebarNavLayout>
      </div>

      <ClientDialog open={clientDialogOpen} onClose={() => setClientDialogOpen(false)} onSave={handleAddClient} mode="add" />
      <ClientDialog open={!!editingClient} onClose={() => setEditingClient(null)} onSave={handleEditClient} mode="edit" initial={editingClient ? { name: editingClient.name, email: editingClient.email, advisor: editingClient.advisor, riskProfile: editingClient.riskProfile, status: editingClient.status } : undefined} />
    </div>
  );
}
