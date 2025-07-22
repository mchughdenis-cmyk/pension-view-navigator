import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  FileText, 
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Bell,
  BarChart3,
  UserCheck,
  Calendar,
  Clock
} from "lucide-react";

// Mock data for admin dashboard
const adminData = {
  summary: {
    totalClients: 1247,
    totalAUM: 42750000,
    pendingActions: 18,
    overdueReviews: 5
  },
  clients: [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      totalValue: 485750,
      lastLogin: "2024-01-15",
      status: "active",
      riskProfile: "balanced",
      advisor: "Sarah Johnson",
      pendingActions: 2,
      allowanceUsage: 67
    },
    {
      id: 2,
      name: "Emma Wilson",
      email: "emma.wilson@email.com", 
      totalValue: 325000,
      lastLogin: "2024-01-14",
      status: "active",
      riskProfile: "conservative",
      advisor: "Michael Brown",
      pendingActions: 0,
      allowanceUsage: 45
    },
    {
      id: 3,
      name: "David Thompson",
      email: "david.thompson@email.com",
      totalValue: 750000,
      lastLogin: "2024-01-10",
      status: "review_required",
      riskProfile: "aggressive",
      advisor: "Sarah Johnson",
      pendingActions: 3,
      allowanceUsage: 89
    },
    {
      id: 4,
      name: "Lisa Anderson",
      email: "lisa.anderson@email.com",
      totalValue: 195000,
      lastLogin: "2024-01-08",
      status: "onboarding",
      riskProfile: "balanced",
      advisor: "Michael Brown",
      pendingActions: 1,
      allowanceUsage: 23
    }
  ],
  recentActivity: [
    {
      type: "contribution",
      client: "John Smith",
      amount: 5000,
      timestamp: "2024-01-15 14:30",
      status: "processed"
    },
    {
      type: "transfer_in",
      client: "Emma Wilson", 
      amount: 25000,
      timestamp: "2024-01-15 11:15",
      status: "pending"
    },
    {
      type: "drawdown",
      client: "David Thompson",
      amount: 3000,
      timestamp: "2024-01-15 09:45",
      status: "approved"
    },
    {
      type: "risk_review",
      client: "Lisa Anderson",
      amount: 0,
      timestamp: "2024-01-14 16:20",
      status: "overdue"
    }
  ],
  alerts: [
    {
      id: 1,
      type: "allowance_exceeded",
      client: "David Thompson",
      message: "Client approaching annual allowance limit",
      priority: "high",
      timestamp: "2024-01-15"
    },
    {
      id: 2,
      type: "review_due",
      client: "Lisa Anderson",
      message: "Annual review overdue by 15 days",
      priority: "medium",
      timestamp: "2024-01-14"
    },
    {
      id: 3,
      type: "document_required",
      client: "Emma Wilson",
      message: "Transfer documentation pending",
      priority: "low",
      timestamp: "2024-01-13"
    }
  ]
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

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
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pension Administration</h1>
            <p className="text-muted-foreground mt-1">Manage client portfolios and administrative tasks</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              <UserCheck className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{adminData.summary.totalClients.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Active accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assets Under Management</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(adminData.summary.totalAUM)}
              </div>
              <p className="text-xs text-muted-foreground">Total portfolio value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{adminData.summary.pendingActions}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Reviews</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{adminData.summary.overdueReviews}</div>
              <p className="text-xs text-muted-foreground">Need immediate action</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="clients" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="clients">Client Management</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="alerts">Alerts & Notifications</TabsTrigger>
            <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Client Portfolio Management</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search clients..." className="pl-10 w-64" />
                    </div>
                    <Select>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="review_required">Review Required</SelectItem>
                        <SelectItem value="onboarding">Onboarding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminData.clients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">{formatCurrency(client.totalValue)}</p>
                          <p className="text-xs text-muted-foreground">Portfolio Value</p>
                        </div>
                        <div className="text-center">
                          <Badge variant={getStatusColor(client.status)}>
                            {client.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-sm">{client.advisor}</p>
                          <p className="text-xs text-muted-foreground">Advisor</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm">{client.allowanceUsage}%</p>
                          <p className="text-xs text-muted-foreground">Allowance Used</p>
                        </div>
                        <div className="text-center">
                          {client.pendingActions > 0 && (
                            <Badge variant="secondary">{client.pendingActions} pending</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
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
                          <p className="text-sm text-muted-foreground">
                            {activity.type.replace('_', ' ').toUpperCase()}
                            {activity.amount > 0 && ` - ${formatCurrency(activity.amount)}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alerts & Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminData.alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3 flex-1">
                        <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                          alert.priority === 'high' ? 'text-destructive' : 
                          alert.priority === 'medium' ? 'text-warning' : 'text-muted-foreground'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{alert.client}</p>
                            <Badge variant={getPriorityColor(alert.priority)} className="text-xs">
                              {alert.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="ml-4">
                        Resolve
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Portfolio Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Monthly Portfolio Summary
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Asset Allocation Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Performance Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Risk Assessment Summary
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Regulatory Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Annual Allowance Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Contribution Summary
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Transfer Documentation
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Compliance Audit Trail
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Monitoring</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="font-medium text-success">Annual Allowance Monitoring</p>
                    <p className="text-sm text-muted-foreground">All clients within limits</p>
                  </div>
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="font-medium text-warning">Know Your Customer (KYC)</p>
                    <p className="text-sm text-muted-foreground">3 reviews pending</p>
                  </div>
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="font-medium text-success">Anti-Money Laundering</p>
                    <p className="text-sm text-muted-foreground">All checks complete</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Audit Trail</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span>Last full audit</span>
                      <span className="font-medium">December 2023</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>Compliance score</span>
                      <span className="font-medium text-success">98.5%</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>Outstanding issues</span>
                      <span className="font-medium">2</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span>Next review</span>
                      <span className="font-medium">March 2024</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}