import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  TrendingUp, 
  PiggyBank, 
  DollarSign, 
  FileText, 
  Settings,
  LogOut,
  Search,
  Eye,
  Edit,
  UserPlus,
  Calendar,
  User,
  Shield,
  Building2,
  AlertTriangle,
  BarChart3
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '@/contexts/RoleContext'
import { useFirm } from '@/contexts/FirmContext'
import { supabase } from '@/integrations/supabase/client'

export default function AdminView() {
  const navigate = useNavigate()
  const { user, switchRole } = useRole()
  const { firmId, firm, firms } = useFirm()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const handleSignOut = () => {
    window.location.href = '/'
  }

  type ClientRow = {
    id: string; name: string; email: string;
    portfolioValue: number; status: string; riskProfile: string;
    adviser: string; pendingActions: number; allowanceUsage: number;
  }
  const [allClients, setAllClients] = useState<ClientRow[]>([])
  const [advisers, setAdvisers] = useState<{ name: string; clients: number; aum: number }[]>([])

  useEffect(() => {
    (async () => {
      let cq = supabase
        .from('clients')
        .select('id, first_name, last_name, email, status, risk_profile, adviser, annual_allowance_used, firm_id')
        .order('last_name')
      if (firmId) cq = cq.eq('firm_id', firmId)
      const { data: cs } = await cq
      const ids = (cs ?? []).map((c: any) => c.id)
      const totals: Record<string, number> = {}
      if (ids.length) {
        const { data: accs } = await supabase
          .from('client_accounts')
          .select('client_id, total_value')
          .in('client_id', ids)
        ;(accs ?? []).forEach((a: any) => {
          totals[a.client_id] = (totals[a.client_id] ?? 0) + Number(a.total_value || 0)
        })
      }
      const rows: ClientRow[] = (cs ?? []).map((c: any) => ({
        id: c.id,
        name: `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim(),
        email: c.email ?? '',
        portfolioValue: totals[c.id] ?? 0,
        status: c.status ?? 'active',
        riskProfile: c.risk_profile ?? '—',
        adviser: c.adviser ?? 'Unassigned',
        pendingActions: c.status === 'review_required' ? 1 : 0,
        allowanceUsage: Math.min(100, Math.round((Number(c.annual_allowance_used || 0) / 60000) * 100)),
      }))
      setAllClients(rows)

      const byAdviser = new Map<string, { clients: number; aum: number }>()
      rows.forEach(r => {
        const k = r.adviser || 'Unassigned'
        const cur = byAdviser.get(k) ?? { clients: 0, aum: 0 }
        cur.clients += 1
        cur.aum += r.portfolioValue
        byAdviser.set(k, cur)
      })
      setAdvisers(Array.from(byAdviser, ([name, v]) => ({ name, ...v })))
    })()
  }, [firmId])

  const adminStats = useMemo(() => {
    const totalAUM = allClients.reduce((s, c) => s + c.portfolioValue, 0)
    return {
      totalClients: allClients.length,
      totalAdvisers: advisers.length,
      totalAUM,
      clientsInDrawdown: 0,
      pendingActions: allClients.reduce((s, c) => s + c.pendingActions, 0),
      overdueReviews: allClients.filter(c => c.status === 'review_required').length,
      newClientsThisMonth: 0,
    }
  }, [allClients, advisers])


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'review_required': return 'destructive'
      case 'onboarding': return 'secondary'
      default: return 'default'
    }
  }

  const filteredClients = allClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.adviser.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-muted via-background to-secondary-muted">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-start gap-4 py-4">
            <div className="min-w-0 flex-1 basis-72">
              <h1 className="text-2xl font-bold text-foreground">Admin Portal</h1>
              <p className="text-muted-foreground truncate">{user?.name} - System Administrator</p>
              <Badge variant="outline" className="mt-1">Admin View</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => switchRole('client')}>
                <User className="w-4 h-4 mr-2" />
                Switch to Client
              </Button>
              <Button variant="outline" size="sm" onClick={() => switchRole('adviser')}>
                <Shield className="w-4 h-4 mr-2" />
                Switch to Adviser
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                <Building2 className="w-4 h-4 mr-2" />
                Full Admin Dashboard
              </Button>
              <Button variant="default" size="sm" onClick={() => navigate('/operations')}>
                <Building2 className="w-4 h-4 mr-2" />
                Pension Operations
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{adminStats.totalClients.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+{adminStats.newClientsThisMonth} this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Advisers</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{adminStats.totalAdvisers}</div>
              <p className="text-xs text-muted-foreground">Active advisers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total AUM</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(adminStats.totalAUM)}
              </div>
              <p className="text-xs text-muted-foreground">All portfolios</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients in Drawdown</CardTitle>
              <PiggyBank className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{adminStats.clientsInDrawdown}</div>
              <p className="text-xs text-muted-foreground">Taking withdrawals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
              <Calendar className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{adminStats.pendingActions}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Reviews</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{adminStats.overdueReviews}</div>
              <p className="text-xs text-muted-foreground">Critical</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <BarChart3 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">98.5%</div>
              <p className="text-xs text-muted-foreground">Uptime</p>
            </CardContent>
          </Card>
        </div>

        {/* Adviser Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Adviser Overview</CardTitle>
            <CardDescription>Performance summary of all advisers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {advisers.map((adviser, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-semibold">{adviser.name}</h4>
                  <p className="text-sm text-muted-foreground">{adviser.clients} clients</p>
                  <p className="text-lg font-bold">{formatCurrency(adviser.aum)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Clients Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Client Accounts</CardTitle>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search clients or advisers..." 
                    className="pl-10 w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1 grid grid-cols-7 gap-4 items-center">
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{formatCurrency(client.portfolioValue)}</p>
                      <p className="text-xs text-muted-foreground">Portfolio Value</p>
                    </div>
                    <div className="text-center">
                      <Badge variant={getStatusColor(client.status)}>
                        {client.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm">{client.adviser}</p>
                      <p className="text-xs text-muted-foreground">Adviser</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm">{client.allowanceUsage}%</p>
                      <p className="text-xs text-muted-foreground">Allowance Used</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm">{client.riskProfile}</p>
                      <p className="text-xs text-muted-foreground">Risk Profile</p>
                    </div>
                    <div className="text-center">
                      {client.pendingActions > 0 && (
                        <Badge variant="secondary">{client.pendingActions} pending</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => switchRole('client', { id: client.id.toString(), name: client.name, email: client.email })}
                    >
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

        {/* Admin Quick Actions */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">Admin Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate('/admin')}>
              Full Admin Dashboard
            </Button>
            <Button variant="outline">
              System Reports
            </Button>
            <Button variant="outline">
              User Management
            </Button>
            <Button variant="outline">
              Compliance Monitoring
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}