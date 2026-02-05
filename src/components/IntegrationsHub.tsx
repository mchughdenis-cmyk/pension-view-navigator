import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  CreditCard, 
  Building2, 
  FileCheck, 
  Shield, 
  BarChart3, 
  FileText, 
  PiggyBank,
  ArrowRightLeft,
  Settings,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Key,
  Globe,
  RefreshCw,
  Upload,
  Link2,
  Activity,
  Clock,
  Loader2
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  description: string
  category: string
  status: 'connected' | 'disconnected' | 'pending' | 'error'
  icon: React.ReactNode
  lastSync?: string
  apiVersion?: string
  features: string[]
}

export default function IntegrationsHub() {
  const { toast } = useToast()
  const [activeCategory, setActiveCategory] = useState('all')
  const [isConnecting, setIsConnecting] = useState<string | null>(null)

  const integrations: Integration[] = [
    {
      id: 'card-payments',
      name: 'Card Payments Gateway',
      description: 'Process debit and credit card payments for contributions and one-off deposits',
      category: 'payments',
      status: 'connected',
      icon: <CreditCard className="w-6 h-6" />,
      lastSync: '2024-01-20 14:30',
      apiVersion: 'v3.2',
      features: ['Visa', 'Mastercard', 'Amex', '3D Secure', 'Recurring Payments']
    },
    {
      id: 'eft',
      name: 'Electronic Fund Transfers',
      description: 'BACS and Faster Payments for automated pension payments and withdrawals',
      category: 'payments',
      status: 'connected',
      icon: <ArrowRightLeft className="w-6 h-6" />,
      lastSync: '2024-01-20 09:00',
      apiVersion: 'v2.1',
      features: ['BACS', 'Faster Payments', 'CHAPS', 'Bulk Payments', 'Payment Status']
    },
    {
      id: 'direct-debit',
      name: 'Direct Debit Management',
      description: 'Set up and manage direct debits for regular pension contributions',
      category: 'payments',
      status: 'connected',
      icon: <Building2 className="w-6 h-6" />,
      lastSync: '2024-01-20 08:00',
      apiVersion: 'v1.5',
      features: ['DDI Setup', 'Mandate Management', 'Failed DD Handling', 'AUDDIS', 'ARUDD']
    },
    {
      id: 'kyc-aml',
      name: 'KYC/AML Verification',
      description: 'Identity verification and anti-money laundering checks for new clients',
      category: 'compliance',
      status: 'connected',
      icon: <Shield className="w-6 h-6" />,
      lastSync: '2024-01-20 15:45',
      apiVersion: 'v4.0',
      features: ['ID Verification', 'PEP Screening', 'Sanctions Check', 'Address Verification', 'Document Verification']
    },
    {
      id: 'morningstar',
      name: 'Morningstar API Centre',
      description: 'Access fund data, ratings, and investment research for portfolio management',
      category: 'investments',
      status: 'connected',
      icon: <BarChart3 className="w-6 h-6" />,
      lastSync: '2024-01-20 16:00',
      apiVersion: 'v3.8',
      features: ['Fund Data', 'Star Ratings', 'Performance Data', 'Holdings', 'Risk Metrics']
    },
    {
      id: 'hmrc-dps',
      name: 'HMRC Digital Pension Service',
      description: 'Connect to HMRC for tax relief claims and pension scheme reporting',
      category: 'compliance',
      status: 'connected',
      icon: <FileText className="w-6 h-6" />,
      lastSync: '2024-01-19 23:00',
      apiVersion: 'v2.0',
      features: ['Relief at Source', 'Event Reports', 'AFT Returns', 'PSR Reporting']
    },
    {
      id: 'lisa',
      name: 'LISA Government Gateway',
      description: 'Lifetime ISA integration for government bonus claims and reporting',
      category: 'compliance',
      status: 'pending',
      icon: <PiggyBank className="w-6 h-6" />,
      apiVersion: 'v1.2',
      features: ['Bonus Claims', 'Withdrawal Reporting', 'Annual Returns', 'First Home Buyer']
    },
    {
      id: 'dsp',
      name: 'Defined Contribution Scheme Portal',
      description: 'TPR and DWP integration for scheme governance and reporting',
      category: 'compliance',
      status: 'disconnected',
      icon: <FileCheck className="w-6 h-6" />,
      apiVersion: 'v1.0',
      features: ['Chair Statement', 'Scheme Returns', 'Member Reporting', 'Charge Cap']
    },
    {
      id: 'origo',
      name: 'Origo Transfer Service',
      description: 'Industry-standard pension transfer messaging and tracking',
      category: 'transfers',
      status: 'connected',
      icon: <ArrowRightLeft className="w-6 h-6" />,
      lastSync: '2024-01-20 12:00',
      apiVersion: 'v3.0',
      features: ['ORigo ID', 'Transfer Messaging', 'Status Tracking', 'Bulk Transfers', 'Ceding/Receiving']
    }
  ]

  const categories = [
    { id: 'all', name: 'All Integrations' },
    { id: 'payments', name: 'Payments' },
    { id: 'compliance', name: 'Compliance' },
    { id: 'investments', name: 'Investments' },
    { id: 'transfers', name: 'Transfers' }
  ]

  const filteredIntegrations = activeCategory === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === activeCategory)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'disconnected': return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="w-4 h-4" />
      case 'disconnected': return <XCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'error': return <AlertTriangle className="w-4 h-4" />
      default: return null
    }
  }

  const handleConnect = (integrationId: string) => {
    setIsConnecting(integrationId)
    setTimeout(() => {
      setIsConnecting(null)
      toast({
        title: "Connection Initiated",
        description: "API credentials are being validated...",
      })
    }, 2000)
  }

  const handleSync = (integrationId: string) => {
    toast({
      title: "Sync Started",
      description: "Data synchronization is in progress...",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Integrations Hub</h2>
          <p className="text-muted-foreground">Manage external service connections and API integrations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            API Health
          </Button>
          <Button variant="outline" size="sm">
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {integrations.filter(i => i.status === 'connected').length}
                </p>
                <p className="text-sm text-green-400">Connected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-500">
                  {integrations.filter(i => i.status === 'pending').length}
                </p>
                <p className="text-sm text-yellow-400">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-500/10 border-slate-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-slate-500" />
              <div>
                <p className="text-2xl font-bold text-slate-500">
                  {integrations.filter(i => i.status === 'disconnected').length}
                </p>
                <p className="text-sm text-slate-400">Disconnected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-500">
                  {integrations.filter(i => i.status === 'error').length}
                </p>
                <p className="text-sm text-red-400">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-5 w-full md:w-auto">
          {categories.map(cat => (
            <TabsTrigger key={cat.id} value={cat.id} className="text-xs md:text-sm">
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {integration.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        {integration.apiVersion && (
                          <p className="text-xs text-muted-foreground">API {integration.apiVersion}</p>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(integration.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(integration.status)}
                        {integration.status}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm">
                    {integration.description}
                  </CardDescription>
                  
                  <div className="flex flex-wrap gap-1">
                    {integration.features.slice(0, 3).map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {integration.features.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{integration.features.length - 3}
                      </Badge>
                    )}
                  </div>

                  {integration.lastSync && (
                    <p className="text-xs text-muted-foreground">
                      Last synced: {integration.lastSync}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    {integration.status === 'connected' ? (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleSync(integration.id)}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Sync
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Settings className="w-3 h-3 mr-1" />
                              Configure
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Configure {integration.name}</DialogTitle>
                              <DialogDescription>
                                Manage API settings and connection parameters
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>API Endpoint</Label>
                                <Input defaultValue={`https://api.${integration.id}.com/v3`} />
                              </div>
                              <div className="space-y-2">
                                <Label>API Key</Label>
                                <Input type="password" defaultValue="••••••••••••••••" />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label>Auto-sync enabled</Label>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label>Webhook notifications</Label>
                                <Switch defaultChecked />
                              </div>
                              <div className="space-y-2">
                                <Label>Sync Frequency</Label>
                                <Select defaultValue="hourly">
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="realtime">Real-time</SelectItem>
                                    <SelectItem value="hourly">Hourly</SelectItem>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline">Test Connection</Button>
                              <Button>Save Changes</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleConnect(integration.id)}
                        disabled={isConnecting === integration.id}
                      >
                        {isConnecting === integration.id ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Link2 className="w-3 h-3 mr-1" />
                            Connect
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
