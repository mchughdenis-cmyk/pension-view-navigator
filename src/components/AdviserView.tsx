import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MobileHeader } from '@/components/ui/mobile-header'
import { SidebarNavLayout, type NavGroup } from '@/components/ui/sidebar-nav'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, TrendingUp, PiggyBank, DollarSign, FileText, Settings, LogOut,
  Search, Eye, Edit, UserPlus, Calendar, User, Shield, BarChart3,
  Bell, ClipboardList, Briefcase, LayoutDashboard, Building2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '@/contexts/RoleContext'
import { useIsMobile } from '@/hooks/use-mobile'
import { useFirm } from '@/contexts/FirmContext'
import { supabase } from '@/integrations/supabase/client'

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    items: [
      { value: "dashboard", label: "Dashboard", icon: BarChart3 },
      { value: "alerts", label: "Alerts & Tasks", icon: Bell },
    ],
  },
  {
    label: "Client Management",
    icon: Users,
    items: [
      { value: "clients", label: "My Clients", icon: Users },
    ],
  },
  {
    label: "Tools",
    icon: Briefcase,
    items: [
      { value: "onboarding", label: "Client Onboarding", icon: UserPlus },
      { value: "illustrations", label: "Illustrations", icon: FileText },
      { value: "reports", label: "Generate Reports", icon: ClipboardList },
    ],
  },
]

export default function AdviserView() {
  const navigate = useNavigate()
  const { user, switchRole } = useRole()
  const isMobile = useIsMobile()
  const { firmId, firm } = useFirm()
  const [activeTab, setActiveTab] = useState('clients')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const handleSignOut = () => { window.location.href = '/' }

  type ClientRow = {
    id: string; name: string; email: string;
    portfolioValue: number; isaValue: number; giaValue: number;
    lastContact: string; status: string; riskProfile: string;
    nextReview: string; pendingActions: number; monthlyDrawdown: number;
    accounts: string[];
  }
  const [clients, setClients] = useState<ClientRow[]>([])

  useEffect(() => {
    (async () => {
      let cq = supabase
        .from('clients')
        .select('id, first_name, last_name, email, status, risk_profile, adviser, mpaa_triggered')
        .order('last_name')
      if (firmId) cq = cq.eq('firm_id', firmId)
      const { data: cs } = await cq
      const ids = (cs ?? []).map((c: any) => c.id)
      const accountsByClient: Record<string, { account_type: string; total_value: number }[]> = {}
      if (ids.length) {
        const { data: accs } = await supabase
          .from('client_accounts')
          .select('client_id, account_type, total_value')
          .in('client_id', ids)
        ;(accs ?? []).forEach((a: any) => {
          (accountsByClient[a.client_id] ||= []).push({ account_type: a.account_type, total_value: Number(a.total_value || 0) })
        })
      }
      const rows: ClientRow[] = (cs ?? []).map((c: any) => {
        const accs = accountsByClient[c.id] ?? []
        const sumBy = (t: string) => accs.filter(a => a.account_type === t).reduce((s, a) => s + a.total_value, 0)
        return {
          id: c.id,
          name: `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim(),
          email: c.email ?? '',
          portfolioValue: sumBy('SIPP'),
          isaValue: sumBy('ISA'),
          giaValue: sumBy('GIA'),
          lastContact: '',
          status: c.status ?? 'active',
          riskProfile: c.risk_profile ?? '—',
          nextReview: '—',
          pendingActions: c.status === 'review_required' ? 1 : 0,
          monthlyDrawdown: 0,
          accounts: Array.from(new Set(accs.map(a => a.account_type))),
        }
      })
      setClients(rows)
    })()
  }, [firmId])

  const adviserStats = useMemo(() => {
    const totalAUM = clients.reduce((s, c) => s + c.portfolioValue + c.isaValue + c.giaValue, 0)
    const clientsInDrawdown = clients.filter(c => c.monthlyDrawdown > 0).length
    const pendingActions = clients.reduce((s, c) => s + c.pendingActions, 0)
    return { totalClients: clients.length, totalAUM, clientsInDrawdown, monthlyReviews: 0, pendingActions }
  }, [clients])


  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'review_required': return 'destructive'
      case 'onboarding': return 'secondary'
      default: return 'default'
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const headerActions = (
    <>
      <Button variant="outline" size="sm" onClick={() => switchRole('client')} className="w-full sm:w-auto justify-start"><User className="w-4 h-4 mr-2" /> Switch to Client</Button>
      <Button variant="outline" size="sm" onClick={() => switchRole('admin')} className="w-full sm:w-auto justify-start"><Shield className="w-4 h-4 mr-2" /> Switch to Admin</Button>
      <Button variant="outline" size="sm" onClick={() => navigate('/admin')} className="w-full sm:w-auto justify-start"><Building2 className="w-4 h-4 mr-2" /> Admin Dashboard</Button>
      <Button variant="outline" size="sm" onClick={() => navigate('/settings')} className="w-full sm:w-auto justify-start"><Settings className="w-4 h-4 mr-2" /> Settings</Button>
      <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full sm:w-auto justify-start"><LogOut className="w-4 h-4 mr-2" /> Sign Out</Button>
    </>
  )

  const handleTabChange = (value: string) => {
    // For tool items, navigate directly
    if (value === 'onboarding') { navigate('/onboarding'); return }
    if (value === 'illustrations') { navigate('/illustration'); return }
    if (value === 'reports') { navigate('/annual-summary'); return }
    setActiveTab(value)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">My Clients</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
                <CardContent><div className="text-2xl font-bold text-primary">{adviserStats.totalClients}</div><p className="text-xs text-muted-foreground">Active accounts</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Assets Under Management</CardTitle><TrendingUp className="h-4 w-4 text-success" /></CardHeader>
                <CardContent><div className="text-2xl font-bold text-success">{formatCurrency(adviserStats.totalAUM)}</div><p className="text-xs text-muted-foreground">Total portfolio value</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Clients in Drawdown</CardTitle><PiggyBank className="h-4 w-4 text-warning" /></CardHeader>
                <CardContent><div className="text-2xl font-bold text-warning">{adviserStats.clientsInDrawdown}</div><p className="text-xs text-muted-foreground">Taking withdrawals</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Monthly Reviews</CardTitle><Calendar className="h-4 w-4 text-primary" /></CardHeader>
                <CardContent><div className="text-2xl font-bold text-primary">{adviserStats.monthlyReviews}</div><p className="text-xs text-muted-foreground">This month</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pending Actions</CardTitle><FileText className="h-4 w-4 text-destructive" /></CardHeader>
                <CardContent><div className="text-2xl font-bold text-destructive">{adviserStats.pendingActions}</div><p className="text-xs text-muted-foreground">Require attention</p></CardContent>
              </Card>
            </div>
          </div>
        )

      case 'alerts':
        return (
          <div className="space-y-4">
            <Card className="border-warning/50 bg-warning/5">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-warning" /> Regulatory cash warnings</CardTitle>
                    <CardDescription>FCA COBS 19.10, CASS 7 and FSCS checks across your client book.</CardDescription>
                  </div>
                  <Button onClick={() => navigate('/cash-warnings')}>Review warnings</Button>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader><CardTitle>Alerts & Pending Tasks</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clients.filter(c => c.pendingActions > 0 || c.status === 'review_required').map(client => (
                    <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {client.status === 'review_required' ? 'Review required' : `${client.pendingActions} pending action(s)`}
                          {' • '}Next review: {client.nextReview}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(client.status)}>{client.status.replace('_', ' ')}</Badge>
                        <Button variant="outline" size="sm" onClick={() => switchRole('client', { id: client.id.toString(), name: client.name, email: client.email })}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'clients':
        return (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <CardTitle className="whitespace-nowrap">My Client Portfolio</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search clients..." className="pl-10 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36"><SelectValue placeholder="Filter" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="review_required">Review Required</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="flex-shrink-0"><UserPlus className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Add Client</span></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredClients.map((client) => {
                  const total = client.portfolioValue + client.isaValue + client.giaValue
                  const openPlan = (path: string) => {
                    switchRole('client', { id: client.id.toString(), name: client.name, email: client.email })
                    navigate(path)
                  }
                  const plans: { key: string; label: string; value: number; path: string; tone: string }[] = [
                    { key: 'SIPP', label: 'SIPP', value: client.portfolioValue, path: '/portfolio', tone: 'text-primary' },
                    { key: 'ISA',  label: 'Stocks & Shares ISA', value: client.isaValue, path: '/isa', tone: 'text-success' },
                    { key: 'GIA',  label: 'GIA', value: client.giaValue, path: '/gia', tone: 'text-warning' },
                  ].filter(p => client.accounts.includes(p.key))

                  return (
                    <div key={client.id} className="border rounded-lg overflow-hidden">
                      {/* Top strip: identity + headline valuation */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/40 border-b">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-base truncate">{client.name}</p>
                            <Badge variant={getStatusColor(client.status)}>{client.status.replace('_', ' ')}</Badge>
                            {client.pendingActions > 0 && <Badge variant="secondary">{client.pendingActions} pending</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{client.email} · {client.riskProfile} · review {client.nextReview}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Total valuation</p>
                          <p className="text-2xl md:text-3xl font-bold text-primary tabular-nums leading-tight">{formatCurrency(total)}</p>
                          {client.monthlyDrawdown > 0 && (
                            <p className="text-xs text-muted-foreground">Drawdown {formatCurrency(client.monthlyDrawdown)}/mo</p>
                          )}
                        </div>
                      </div>

                      {/* Plan tiles — click to drill into each plan */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-3">
                        {plans.map(p => (
                          <button
                            key={p.key}
                            type="button"
                            onClick={() => openPlan(p.path)}
                            className="text-left p-3 rounded-md border bg-card hover:bg-accent hover:border-primary/40 transition-colors group"
                            aria-label={`Open ${client.name}'s ${p.label}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-muted-foreground">{p.label}</span>
                              <Badge variant="outline" className="text-[10px] px-1 py-0">{p.key}</Badge>
                            </div>
                            <p className={`text-lg font-bold tabular-nums mt-1 ${p.tone}`}>{formatCurrency(p.value)}</p>
                            <p className="text-[11px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">Open plan →</p>
                          </button>
                        ))}
                      </div>

                      {/* Footer actions */}
                      <div className="flex flex-wrap gap-2 px-3 pb-3">
                        <Button variant="default" size="sm" onClick={() => switchRole('client', { id: client.id.toString(), name: client.name, email: client.email })}>
                          <Eye className="w-4 h-4 mr-2" /> Open client view
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openPlan('/annual-summary')}>
                          <FileText className="w-4 h-4 mr-2" /> Annual summary
                        </Button>
                        <Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )

      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-muted via-background to-secondary-muted">
      <MobileHeader
        title="Adviser Dashboard"
        subtitle={`${user?.name} - ${user?.email}`}
        badge={<Badge variant="outline">Adviser View</Badge>}
        actions={headerActions}
      />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-4 flex flex-wrap h-auto gap-1 bg-muted/60 p-1">
            <TabsTrigger value="dashboard" className="gap-2"><BarChart3 className="w-4 h-4" /> Overview</TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2"><Bell className="w-4 h-4" /> Alerts</TabsTrigger>
            <TabsTrigger value="clients" className="gap-2"><Users className="w-4 h-4" /> My Clients</TabsTrigger>
            <TabsTrigger value="onboarding" className="gap-2"><UserPlus className="w-4 h-4" /> Onboarding</TabsTrigger>
            <TabsTrigger value="illustrations" className="gap-2"><FileText className="w-4 h-4" /> Illustrations</TabsTrigger>
            <TabsTrigger value="reports" className="gap-2"><ClipboardList className="w-4 h-4" /> Reports</TabsTrigger>
          </TabsList>
          {renderContent()}
        </Tabs>
      </div>
    </div>
  )
}
