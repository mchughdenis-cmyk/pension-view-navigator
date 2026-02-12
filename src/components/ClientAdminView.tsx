import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BackButton } from '@/components/ui/back-button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MobileTabs, TabsContent } from '@/components/ui/mobile-tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import {
  User,
  Shield,
  FileText,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Save,
  Send,
  Plus,
  Wallet,
  Briefcase,
  TrendingUp,
  Ban,
  RefreshCw,
  Eye,
  MessageSquare,
  ClipboardList,
  Settings,
  History,
  Lock,
  Unlock,
  Download,
  Heart,
  DollarSign,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  PiggyBank,
  Target,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

const clientTabs = [
  { value: 'overview', label: 'Overview', icon: User },
  { value: 'accounts', label: 'Accounts', icon: Wallet },
  { value: 'transactions', label: 'Transactions', icon: ClipboardList },
  { value: 'contributions', label: 'Contributions', icon: PiggyBank },
  { value: 'beneficiaries', label: 'Beneficiaries', icon: Heart },
  { value: 'crystallisation', label: 'BCE', icon: Target },
  { value: 'compliance', label: 'Compliance', icon: Shield },
  { value: 'communications', label: 'Communications', icon: Mail },
  { value: 'notes', label: 'Notes & Tasks', icon: ClipboardList },
  { value: 'activity', label: 'Activity Log', icon: History },
  { value: 'settings', label: 'Account Settings', icon: Settings },
]

// Mock client detail data
const clientDetail = {
  id: 1,
  name: 'John Smith',
  email: 'john.smith@email.com',
  phone: '07700 900123',
  dob: '1975-03-15',
  nino: 'AB123456C',
  address: '42 High Street, London, SW1A 1AA',
  adviser: 'Sarah Johnson',
  status: 'active',
  riskProfile: 'balanced',
  joinDate: '2019-06-12',
  lastLogin: '2024-01-15',
  kycStatus: 'verified',
  kycExpiry: '2025-06-12',
  amlStatus: 'clear',
  accounts: [
    { type: 'SIPP', value: 287450, status: 'active', reference: 'SIPP-001247', contributions: 45000, taxRelief: 11250 },
    { type: 'S&S ISA', value: 87650, status: 'active', reference: 'ISA-003891', contributions: 12500, taxRelief: 0 },
    { type: 'GIA', value: 145200, status: 'active', reference: 'GIA-002156', contributions: 130000, taxRelief: 0 },
  ],
  communications: [
    { id: 1, date: '2024-01-15', type: 'Email', subject: 'Annual review confirmation', status: 'sent', by: 'System' },
    { id: 2, date: '2024-01-10', type: 'Letter', subject: 'Tax year statement 2023/24', status: 'sent', by: 'System' },
    { id: 3, date: '2023-12-20', type: 'Phone', subject: 'Drawdown increase request', status: 'completed', by: 'Sarah Johnson' },
    { id: 4, date: '2023-12-01', type: 'Email', subject: 'Contribution receipt', status: 'sent', by: 'System' },
    { id: 5, date: '2023-11-15', type: 'Meeting', subject: 'Quarterly portfolio review', status: 'completed', by: 'Sarah Johnson' },
  ],
  notes: [
    { id: 1, date: '2024-01-15', author: 'Sarah Johnson', content: 'Client confirmed happy with current drawdown level. No changes requested at this time.', type: 'review' },
    { id: 2, date: '2023-12-20', author: 'Sarah Johnson', content: 'Client requested increase in monthly drawdown from £2,500 to £2,850. Approved and processed.', type: 'action' },
    { id: 3, date: '2023-11-15', author: 'Michael Brown', content: 'Quarterly review completed. Risk profile remains balanced. Portfolio performing within expected range.', type: 'review' },
    { id: 4, date: '2023-10-01', author: 'System', content: 'KYC reverification completed automatically. All documents valid.', type: 'system' },
  ],
  tasks: [
    { id: 1, title: 'Annual review due', dueDate: '2024-06-12', status: 'upcoming', priority: 'medium' },
    { id: 2, title: 'Beneficiary nomination review', dueDate: '2024-03-01', status: 'overdue', priority: 'high' },
    { id: 3, title: 'Risk profile reassessment', dueDate: '2024-09-15', status: 'upcoming', priority: 'low' },
  ],
  activityLog: [
    { date: '2024-01-15 14:30', action: 'Login', detail: 'Client logged in via web', user: 'John Smith' },
    { date: '2024-01-15 14:32', action: 'View Portfolio', detail: 'Viewed SIPP portfolio', user: 'John Smith' },
    { date: '2024-01-15 11:00', action: 'Contribution', detail: 'Monthly contribution of £1,000 processed', user: 'System' },
    { date: '2024-01-14 09:15', action: 'Admin Update', detail: 'Adviser updated risk profile notes', user: 'Sarah Johnson' },
    { date: '2024-01-10 16:45', action: 'Document Sent', detail: 'Tax year statement generated and sent', user: 'System' },
    { date: '2024-01-08 10:00', action: 'Drawdown', detail: 'Monthly drawdown of £2,850 paid to bank', user: 'System' },
  ],
}

const clientTransactions = [
  { id: 1, date: '2024-01-15', type: 'contribution', description: 'Monthly contribution', account: 'SIPP', amount: 1000, status: 'settled' },
  { id: 2, date: '2024-01-14', type: 'buy', description: 'Buy Vanguard FTSE All-World ETF', account: 'ISA', amount: -5000, status: 'settled' },
  { id: 3, date: '2024-01-12', type: 'sell', description: 'Sell Fundsmith Equity Fund', account: 'SIPP', amount: 8500, status: 'settled' },
  { id: 4, date: '2024-01-08', type: 'drawdown', description: 'Monthly drawdown payment', account: 'SIPP', amount: -2850, status: 'settled' },
  { id: 5, date: '2024-01-01', type: 'fee', description: 'Platform fee Q4 2023', account: 'SIPP', amount: -179.66, status: 'settled' },
  { id: 6, date: '2024-01-01', type: 'fee', description: 'Platform fee Q4 2023', account: 'ISA', amount: -54.78, status: 'settled' },
]

const clientBeneficiaries = [
  { id: 1, name: 'Jane Smith', relationship: 'Spouse', dob: '1977-08-22', share: 75, type: 'Expression of Wish', dateSet: '2022-03-15', status: 'active' },
  { id: 2, name: 'Tom Smith', relationship: 'Son', dob: '2005-04-10', share: 12.5, type: 'Expression of Wish', dateSet: '2022-03-15', status: 'active' },
  { id: 3, name: 'Emily Smith', relationship: 'Daughter', dob: '2008-11-30', share: 12.5, type: 'Expression of Wish', dateSet: '2022-03-15', status: 'active' },
]

const clientContributions = [
  { id: 1, taxYear: '2023-24', type: 'Employee', gross: 12000, net: 9600, taxRelief: 2400, method: 'Relief at Source', frequency: 'Monthly' },
  { id: 2, taxYear: '2023-24', type: 'Employer', gross: 6000, net: 6000, taxRelief: 0, method: 'Net Pay', frequency: 'Monthly' },
  { id: 3, taxYear: '2023-24', type: 'Single', gross: 25000, net: 20000, taxRelief: 5000, method: 'Relief at Source', frequency: 'One-off' },
  { id: 4, taxYear: '2022-23', type: 'Employee', gross: 10000, net: 8000, taxRelief: 2000, method: 'Relief at Source', frequency: 'Monthly' },
  { id: 5, taxYear: '2022-23', type: 'Employer', gross: 5000, net: 5000, taxRelief: 0, method: 'Net Pay', frequency: 'Monthly' },
]

const crystallisationEvents = [
  { id: 1, date: '2023-06-12', type: 'BCE 1', description: 'Drawdown designation', amount: 150000, lta_used: 13.9, cumulative_lta: 13.9, status: 'registered' },
  { id: 2, date: '2022-01-15', type: 'BCE 6', description: 'Tax-free cash (PCLS)', amount: 50000, lta_used: 4.6, cumulative_lta: 18.5, status: 'registered' },
]

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)

const getNoteTypeColor = (type: string) => {
  switch (type) {
    case 'review': return 'bg-primary/10 text-primary'
    case 'action': return 'bg-success/10 text-success'
    case 'system': return 'bg-muted text-muted-foreground'
    default: return 'bg-muted text-muted-foreground'
  }
}

export default function ClientAdminView() {
  const navigate = useNavigate()
  const { clientId } = useParams()
  const [newNote, setNewNote] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-muted via-background to-secondary-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <BackButton label="Back to Admin" to="/admin" />

        {/* Client Header */}
        <div className="mt-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{clientDetail.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="default">{clientDetail.status}</Badge>
                  <Badge variant="outline">{clientDetail.riskProfile} risk</Badge>
                  <Badge variant="secondary">Adviser: {clientDetail.adviser}</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                <Eye className="w-4 h-4 mr-2" /> View as Client
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" /> Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(clientDetail.accounts.reduce((s, a) => s + a.value, 0))}
              </div>
              <p className="text-xs text-muted-foreground">{clientDetail.accounts.length} accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">KYC Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-lg font-bold text-success">Verified</span>
              </div>
              <p className="text-xs text-muted-foreground">Expires {clientDetail.kycExpiry}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Last Login</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-foreground">{clientDetail.lastLogin}</div>
              <p className="text-xs text-muted-foreground">Member since {clientDetail.joinDate}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Open Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{clientDetail.tasks.filter(t => t.status !== 'completed').length}</div>
              <p className="text-xs text-destructive">{clientDetail.tasks.filter(t => t.status === 'overdue').length} overdue</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <MobileTabs tabs={clientTabs} defaultValue="overview">

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Full Name</Label>
                      <p className="font-medium">{clientDetail.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Date of Birth</Label>
                      <p className="font-medium">{clientDetail.dob}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Email</Label>
                      <p className="font-medium">{clientDetail.email}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Phone</Label>
                      <p className="font-medium">{clientDetail.phone}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">NI Number</Label>
                      <p className="font-medium">{clientDetail.nino}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Address</Label>
                      <p className="font-medium">{clientDetail.address}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Edit className="w-4 h-4 mr-2" /> Edit Details
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clientDetail.tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {task.status === 'overdue' ? (
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                          ) : (
                            <Clock className="w-4 h-4 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{task.title}</p>
                            <p className="text-xs text-muted-foreground">Due: {task.dueDate}</p>
                          </div>
                        </div>
                        <Badge variant={task.status === 'overdue' ? 'destructive' : 'secondary'}>
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Investment Accounts</CardTitle>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Open New Account
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientDetail.accounts.map((account, i) => (
                    <div key={i} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {account.type === 'SIPP' ? <Wallet className="w-5 h-5 text-primary" /> :
                             account.type === 'S&S ISA' ? <Shield className="w-5 h-5 text-success" /> :
                             <Briefcase className="w-5 h-5 text-accent-foreground" />}
                          </div>
                          <div>
                            <h4 className="font-semibold">{account.type}</h4>
                            <p className="text-xs text-muted-foreground">Ref: {account.reference}</p>
                          </div>
                        </div>
                        <Badge>{account.status}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Current Value</p>
                          <p className="text-lg font-bold text-primary">{formatCurrency(account.value)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Contributions</p>
                          <p className="text-lg font-semibold">{formatCurrency(account.contributions)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Tax Relief</p>
                          <p className="text-lg font-semibold text-success">{formatCurrency(account.taxRelief)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" /> View Holdings
                        </Button>
                        <Button variant="outline" size="sm">
                          <TrendingUp className="w-4 h-4 mr-2" /> Transactions
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" /> Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Client Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Client Transactions</CardTitle>
                  <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Export</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientTransactions.map(txn => (
                      <TableRow key={txn.id}>
                        <TableCell className="text-sm">{txn.date}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{txn.type}</Badge></TableCell>
                        <TableCell className="font-medium">{txn.description}</TableCell>
                        <TableCell><Badge variant="secondary">{txn.account}</Badge></TableCell>
                        <TableCell className={`text-right font-semibold ${txn.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {txn.amount >= 0 ? '+' : ''}£{Math.abs(txn.amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell><Badge variant="default">{txn.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contributions Tab */}
          <TabsContent value="contributions">
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Contributions (2023-24)</p><p className="text-2xl font-bold text-primary">£43,000</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Tax Relief Claimed</p><p className="text-2xl font-bold text-success">£7,400</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Annual Allowance Used</p><p className="text-2xl font-bold text-warning">71.7%</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Carry Forward Available</p><p className="text-2xl font-bold text-foreground">£77,000</p><p className="text-xs text-muted-foreground">3 prior years</p></CardContent></Card>
              </div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Contribution History</CardTitle>
                    <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Record Contribution</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tax Year</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Gross</TableHead>
                        <TableHead className="text-right">Net Paid</TableHead>
                        <TableHead className="text-right">Tax Relief</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Frequency</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientContributions.map(c => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.taxYear}</TableCell>
                          <TableCell><Badge variant="outline">{c.type}</Badge></TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(c.gross)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(c.net)}</TableCell>
                          <TableCell className="text-right text-success">{c.taxRelief > 0 ? formatCurrency(c.taxRelief) : '—'}</TableCell>
                          <TableCell className="text-sm">{c.method}</TableCell>
                          <TableCell><Badge variant="secondary">{c.frequency}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Annual Allowance Carry Forward</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { year: '2023-24', allowance: 60000, used: 43000, remaining: 17000 },
                      { year: '2022-23', allowance: 60000, used: 15000, remaining: 45000 },
                      { year: '2021-22', allowance: 40000, used: 25000, remaining: 15000 },
                      { year: '2020-21', allowance: 40000, used: 23000, remaining: 17000 },
                    ].map(y => (
                      <div key={y.year} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{y.year}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Allowance: {formatCurrency(y.allowance)}</span>
                          <span>Used: {formatCurrency(y.used)}</span>
                          <span className="font-semibold text-success">Remaining: {formatCurrency(y.remaining)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Beneficiaries Tab */}
          <TabsContent value="beneficiaries">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2"><Heart className="w-5 h-5" /> Beneficiary Nominations</CardTitle>
                      <CardDescription>Expression of wish and death benefit nominations</CardDescription>
                    </div>
                    <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Beneficiary</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clientBeneficiaries.map(b => (
                      <div key={b.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10"><Heart className="w-5 h-5 text-primary" /></div>
                            <div>
                              <h4 className="font-semibold">{b.name}</h4>
                              <p className="text-sm text-muted-foreground">{b.relationship} • DOB: {b.dob}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="default">{b.status}</Badge>
                            <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div><span className="text-muted-foreground">Share:</span> <strong>{b.share}%</strong></div>
                          <div><span className="text-muted-foreground">Type:</span> <strong>{b.type}</strong></div>
                          <div><span className="text-muted-foreground">Set:</span> <strong>{b.dateSet}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-accent/30 rounded-lg">
                    <p className="text-sm"><strong>Total allocation:</strong> {clientBeneficiaries.reduce((s, b) => s + b.share, 0)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Last reviewed: 2022-03-15 • Next review due: 2024-03-15</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Death Benefit Options</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 border rounded-lg flex items-center justify-between">
                    <div><p className="font-medium">Lump Sum Death Benefit</p><p className="text-xs text-muted-foreground">Paid to nominated beneficiaries</p></div>
                    <Badge variant="default">Nominated</Badge>
                  </div>
                  <div className="p-3 border rounded-lg flex items-center justify-between">
                    <div><p className="font-medium">Beneficiary Drawdown</p><p className="text-xs text-muted-foreground">Continue pension for spouse/dependant</p></div>
                    <Badge variant="secondary">Available</Badge>
                  </div>
                  <div className="p-3 border rounded-lg flex items-center justify-between">
                    <div><p className="font-medium">Annuity Purchase</p><p className="text-xs text-muted-foreground">Buy guaranteed income for beneficiary</p></div>
                    <Badge variant="secondary">Available</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Crystallisation Events Tab */}
          <TabsContent value="crystallisation">
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Crystallised</p><p className="text-2xl font-bold text-primary">£200,000</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">LTA Used (Pre-April 2024)</p><p className="text-2xl font-bold text-warning">18.5%</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Transitional Protection</p><p className="text-2xl font-bold text-success">None</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Lump Sum Allowance</p><p className="text-2xl font-bold text-foreground">£218,325</p><p className="text-xs text-muted-foreground">remaining of £268,275</p></CardContent></Card>
              </div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" /> Benefit Crystallisation Events</CardTitle>
                      <CardDescription>Record of all pension crystallisation events (BCE 1-9)</CardDescription>
                    </div>
                    <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Record BCE</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>BCE Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">LTA Used</TableHead>
                        <TableHead className="text-right">Cumulative</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {crystallisationEvents.map(bce => (
                        <TableRow key={bce.id}>
                          <TableCell className="text-sm">{bce.date}</TableCell>
                          <TableCell><Badge variant="outline">{bce.type}</Badge></TableCell>
                          <TableCell className="font-medium">{bce.description}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(bce.amount)}</TableCell>
                          <TableCell className="text-right">{bce.lta_used}%</TableCell>
                          <TableCell className="text-right font-semibold text-warning">{bce.cumulative_lta}%</TableCell>
                          <TableCell><Badge variant="default">{bce.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Transitional Arrangements (Post April 2024)</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-accent/30 rounded-lg">
                    <p className="text-sm"><strong>Lump Sum Allowance (LSA):</strong> £268,275</p>
                    <p className="text-xs text-muted-foreground mt-1">Maximum tax-free lump sums from all registered pension schemes</p>
                  </div>
                  <div className="p-3 bg-accent/30 rounded-lg">
                    <p className="text-sm"><strong>Lump Sum & Death Benefit Allowance (LSDBA):</strong> £1,073,100</p>
                    <p className="text-xs text-muted-foreground mt-1">Combined limit for tax-free lump sums and death benefits</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">Protection Status</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Fixed Protection 2016</span><Badge variant="secondary">Not held</Badge></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Individual Protection 2016</span><Badge variant="secondary">Not held</Badge></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Enhanced Protection</span><Badge variant="secondary">Not held</Badge></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Primary Protection</span><Badge variant="secondary">Not held</Badge></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">KYC / AML Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <div>
                        <p className="font-medium">Identity Verified</p>
                        <p className="text-xs text-muted-foreground">Passport verified via electronic check</p>
                      </div>
                    </div>
                    <Badge className="bg-success/10 text-success border-success/20">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <div>
                        <p className="font-medium">Address Verified</p>
                        <p className="text-xs text-muted-foreground">Utility bill confirmed</p>
                      </div>
                    </div>
                    <Badge className="bg-success/10 text-success border-success/20">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <div>
                        <p className="font-medium">AML Screening</p>
                        <p className="text-xs text-muted-foreground">PEP & sanctions check clear</p>
                      </div>
                    </div>
                    <Badge className="bg-success/10 text-success border-success/20">Clear</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-warning" />
                      <div>
                        <p className="font-medium">Next Review Due</p>
                        <p className="text-xs text-muted-foreground">Scheduled reverification</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{clientDetail.kycExpiry}</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" /> Trigger Reverification
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Risk & Suitability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Current Risk Profile</p>
                      <Badge variant="outline">{clientDetail.riskProfile}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Last assessed: 2023-11-15</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium mb-2">Suitability Assessment</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Investment objective</span>
                        <span>Growth & Income</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time horizon</span>
                        <span>10+ years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capacity for loss</span>
                        <span>Medium</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Edit className="w-4 h-4 mr-2" /> Update Risk Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Communication History</CardTitle>
                  <Button size="sm">
                    <Send className="w-4 h-4 mr-2" /> New Communication
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>By</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientDetail.communications.map((comm) => (
                      <TableRow key={comm.id} className="cursor-pointer hover:bg-accent/50">
                        <TableCell className="text-sm">{comm.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{comm.type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{comm.subject}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{comm.by}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{comm.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes & Tasks Tab */}
          <TabsContent value="notes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Case Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 space-y-2">
                    <Textarea
                      placeholder="Add a new note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                    <Button size="sm" disabled={!newNote.trim()}>
                      <Plus className="w-4 h-4 mr-2" /> Add Note
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {clientDetail.notes.map((note) => (
                      <div key={note.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getNoteTypeColor(note.type)}>{note.type}</Badge>
                            <span className="text-sm font-medium">{note.author}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{note.date}</span>
                        </div>
                        <p className="text-sm">{note.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Tasks</CardTitle>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" /> Add Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clientDetail.tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {task.status === 'overdue' ? (
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                          ) : (
                            <Clock className="w-4 h-4 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{task.title}</p>
                            <p className="text-xs text-muted-foreground">Due: {task.dueDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'}>
                            {task.priority}
                          </Badge>
                          <Badge variant={task.status === 'overdue' ? 'destructive' : 'secondary'}>
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Complete audit trail of all actions on this account</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Detail</TableHead>
                      <TableHead className="text-right">User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientDetail.activityLog.map((log, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{log.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{log.detail}</TableCell>
                        <TableCell className="text-sm text-right text-muted-foreground">{log.user}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Account Locked</p>
                        <p className="text-xs text-muted-foreground">Prevent all transactions</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Ban className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Withdrawals Suspended</p>
                        <p className="text-xs text-muted-foreground">Block outgoing payments</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Email Notifications</p>
                        <p className="text-xs text-muted-foreground">System emails enabled</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Administrative Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="w-4 h-4 mr-2" /> Reset Client Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" /> Reassign Adviser
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" /> Generate Statement
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" /> Export All Data (GDPR)
                  </Button>
                  <Button variant="destructive" className="w-full justify-start">
                    <Ban className="w-4 h-4 mr-2" /> Close Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </MobileTabs>
      </div>
    </div>
  )
}
