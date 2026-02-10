import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MobileHeader } from '@/components/ui/mobile-header'
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
  Shield
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '@/contexts/RoleContext'
import { useIsMobile } from '@/hooks/use-mobile'

export default function AdviserView() {
  const navigate = useNavigate()
  const { user, switchRole } = useRole()
  const isMobile = useIsMobile()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const handleSignOut = () => {
    window.location.href = '/'
  }

  // Mock adviser client data
  const adviserStats = {
    totalClients: 47,
    totalAUM: 8750000,
    clientsInDrawdown: 12,
    monthlyReviews: 3,
    pendingActions: 5
  }

  const clients = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      portfolioValue: 287450,
      isaValue: 87650,
      giaValue: 145200,
      lastContact: "2024-01-15",
      status: "active",
      riskProfile: "balanced",
      nextReview: "2024-03-15",
      pendingActions: 0,
      monthlyDrawdown: 2850,
      accounts: ['SIPP', 'ISA', 'GIA']
    },
    {
      id: 2,
      name: "Emma Wilson",
      email: "emma.wilson@email.com", 
      portfolioValue: 325000,
      isaValue: 42000,
      giaValue: 0,
      lastContact: "2024-01-14",
      status: "active",
      riskProfile: "conservative",
      nextReview: "2024-02-28",
      pendingActions: 1,
      monthlyDrawdown: 0,
      accounts: ['SIPP', 'ISA']
    },
    {
      id: 3,
      name: "David Thompson",
      email: "david.thompson@email.com",
      portfolioValue: 750000,
      isaValue: 120000,
      giaValue: 350000,
      lastContact: "2024-01-10",
      status: "review_required",
      riskProfile: "aggressive",
      nextReview: "2024-01-20",
      pendingActions: 2,
      monthlyDrawdown: 4200,
      accounts: ['SIPP', 'ISA', 'GIA']
    },
    {
      id: 4,
      name: "Lisa Anderson",
      email: "lisa.anderson@email.com",
      portfolioValue: 195000,
      isaValue: 0,
      giaValue: 28000,
      lastContact: "2024-01-08",
      status: "onboarding",
      riskProfile: "balanced",
      nextReview: "2024-02-01",
      pendingActions: 1,
      monthlyDrawdown: 0,
      accounts: ['SIPP', 'GIA']
    }
  ]

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

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const headerActions = (
    <>
      <Button variant="outline" size="sm" onClick={() => switchRole('client')} className="w-full sm:w-auto justify-start">
        <User className="w-4 h-4 mr-2" />
        Switch to Client
      </Button>
      <Button variant="outline" size="sm" onClick={() => switchRole('admin')} className="w-full sm:w-auto justify-start">
        <Shield className="w-4 h-4 mr-2" />
        Admin Portal
      </Button>
      <Button variant="outline" size="sm" onClick={() => navigate('/settings')} className="w-full sm:w-auto justify-start">
        <Settings className="w-4 h-4 mr-2" />
        Settings
      </Button>
      <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full sm:w-auto justify-start">
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-muted via-background to-secondary-muted">
      {/* Header */}
      <MobileHeader
        title="Adviser Dashboard"
        subtitle={`${user?.name} - ${user?.email}`}
        badge={<Badge variant="outline">Adviser View</Badge>}
        actions={headerActions}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{adviserStats.totalClients}</div>
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
                {formatCurrency(adviserStats.totalAUM)}
              </div>
              <p className="text-xs text-muted-foreground">Total portfolio value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients in Drawdown</CardTitle>
              <PiggyBank className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{adviserStats.clientsInDrawdown}</div>
              <p className="text-xs text-muted-foreground">Taking withdrawals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Reviews</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{adviserStats.monthlyReviews}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
              <FileText className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{adviserStats.pendingActions}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Client Management */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <CardTitle>My Client Portfolio</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search clients..." 
                    className="pl-10 w-full sm:w-48 md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-36">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="review_required">Review Required</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="flex-shrink-0">
                    <UserPlus className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Add Client</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredClients.map((client) => (
                <div key={client.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  {/* Mobile Layout */}
                  <div className="md:hidden space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{client.name}</p>
                       <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                      <Badge variant={getStatusColor(client.status)}>
                        {client.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {client.accounts.map(acc => (
                        <Badge key={acc} variant="outline" className="text-xs">{acc}</Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Value</p>
                        <p className="font-semibold">{formatCurrency(client.portfolioValue + client.isaValue + client.giaValue)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Risk Profile</p>
                        <p className="font-medium">{client.riskProfile}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Next Review</p>
                        <p className="font-medium">{client.nextReview}</p>
                      </div>
                      <div>
                        {client.monthlyDrawdown > 0 && (
                          <>
                            <p className="text-muted-foreground">Drawdown</p>
                            <p className="font-medium">{formatCurrency(client.monthlyDrawdown)}/mo</p>
                          </>
                        )}
                        {client.pendingActions > 0 && (
                          <Badge variant="secondary" className="mt-1">{client.pendingActions} pending</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => switchRole('client', { id: client.id.toString(), name: client.name, email: client.email })}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{formatCurrency(client.portfolioValue + client.isaValue + client.giaValue)}</p>
                        <p className="text-xs text-muted-foreground">Total Value</p>
                        <div className="flex justify-center gap-1 mt-1">
                          {client.accounts.map(acc => (
                            <Badge key={acc} variant="outline" className="text-[10px] px-1 py-0">{acc}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-center">
                        <Badge variant={getStatusColor(client.status)}>
                          {client.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-sm">{client.riskProfile}</p>
                        <p className="text-xs text-muted-foreground">Risk Profile</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm">{client.nextReview}</p>
                        <p className="text-xs text-muted-foreground">Next Review</p>
                      </div>
                      <div className="text-center">
                        {client.pendingActions > 0 && (
                          <Badge variant="secondary">{client.pendingActions} pending</Badge>
                        )}
                        {client.monthlyDrawdown > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatCurrency(client.monthlyDrawdown)}/month
                          </p>
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 sm:mt-8">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => navigate('/onboarding')}>
              Client Onboarding
            </Button>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => navigate('/illustration')}>
              Generate Illustrations
            </Button>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => navigate('/annual-summary')}>
              Generate Reports
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}