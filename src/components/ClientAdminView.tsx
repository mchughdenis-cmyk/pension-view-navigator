import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BackButton } from '@/components/ui/back-button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SidebarNavLayout, type NavGroup } from '@/components/ui/sidebar-nav'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  User, Shield, FileText, Mail, Phone, Calendar, AlertTriangle, CheckCircle, Clock,
  Edit, Save, Send, Plus, Wallet, Briefcase, TrendingUp, Ban, RefreshCw, Eye,
  MessageSquare, ClipboardList, Settings, History, Lock, Unlock, Download,
  Heart, DollarSign, Receipt, ArrowUpRight, ArrowDownLeft, Banknote, PiggyBank, Target,
  LayoutDashboard, Trash2, ArrowRightLeft,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { downloadCSV } from '@/lib/adminExportUtils'

const navGroups: NavGroup[] = [
  {
    label: "Client Details",
    icon: LayoutDashboard,
    items: [
      { value: 'overview', label: 'Overview', icon: User },
      { value: 'accounts', label: 'Accounts', icon: Wallet },
      { value: 'settings', label: 'Account Settings', icon: Settings },
    ],
  },
  {
    label: "Financial",
    icon: DollarSign,
    items: [
      { value: 'transactions', label: 'Transactions', icon: ClipboardList },
      { value: 'contributions', label: 'Contributions', icon: PiggyBank },
      { value: 'transfers', label: 'Transfers', icon: ArrowRightLeft },
      { value: 'drawdown', label: 'Drawdown', icon: Banknote },
      { value: 'crystallisation', label: 'BCE', icon: Target },
    ],
  },
  {
    label: "Compliance & Risk",
    icon: Shield,
    items: [
      { value: 'compliance', label: 'Compliance', icon: Shield },
      { value: 'beneficiaries', label: 'Beneficiaries', icon: Heart },
    ],
  },
  {
    label: "Communications",
    icon: Mail,
    items: [
      { value: 'communications', label: 'Communications', icon: Mail },
      { value: 'notes', label: 'Notes & Tasks', icon: ClipboardList },
      { value: 'activity', label: 'Activity Log', icon: History },
    ],
  },
]

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)

const getNoteTypeColor = (type: string) => {
  switch (type) {
    case 'review': return 'bg-primary/10 text-primary'
    case 'action': return 'bg-success/10 text-success'
    case 'system': return 'bg-muted text-muted-foreground'
    default: return 'bg-muted text-muted-foreground'
  }
}

// ── Generic Form Dialog ──
function FormDialog({ open, onClose, title, description, children, onSave, saveLabel = 'Save', saveDisabled = false }: {
  open: boolean; onClose: () => void; title: string; description?: string;
  children: React.ReactNode; onSave: () => void; saveLabel?: string; saveDisabled?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-4 py-2">{children}</div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(); onClose() }} disabled={saveDisabled}>{saveLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ClientAdminView() {
  const navigate = useNavigate()
  const { clientId } = useParams()
  const [activeTab, setActiveTab] = useState('overview')

  // ── Editable personal details ──
  const [personalDetails, setPersonalDetails] = useState({
    name: 'John Smith', email: 'john.smith@email.com', phone: '07700 900123',
    dob: '1975-03-15', nino: 'AB123456C', address: '42 High Street, London, SW1A 1AA',
    adviser: 'Sarah Johnson', status: 'active', riskProfile: 'balanced',
    joinDate: '2019-06-12', lastLogin: '2024-01-15', kycStatus: 'verified', kycExpiry: '2025-06-12', amlStatus: 'clear',
  })
  const [editingPersonal, setEditingPersonal] = useState(false)
  const [personalForm, setPersonalForm] = useState(personalDetails)

  // ── Accounts ──
  const [accounts, setAccounts] = useState([
    { id: 1, type: 'SIPP', value: 287450, status: 'active', reference: 'SIPP-001247', contributions: 45000, taxRelief: 11250 },
    { id: 2, type: 'S&S ISA', value: 87650, status: 'active', reference: 'ISA-003891', contributions: 12500, taxRelief: 0 },
    { id: 3, type: 'GIA', value: 145200, status: 'active', reference: 'GIA-002156', contributions: 130000, taxRelief: 0 },
  ])
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [accountForm, setAccountForm] = useState({ type: 'SIPP', status: 'active' })

  // ── Transactions ──
  const [transactions, setTransactions] = useState([
    { id: 1, date: '2024-01-15', type: 'contribution', description: 'Monthly contribution', account: 'SIPP', amount: 1000, status: 'settled' },
    { id: 2, date: '2024-01-14', type: 'buy', description: 'Buy Vanguard FTSE All-World ETF', account: 'ISA', amount: -5000, status: 'settled' },
    { id: 3, date: '2024-01-12', type: 'sell', description: 'Sell Fundsmith Equity Fund', account: 'SIPP', amount: 8500, status: 'settled' },
    { id: 4, date: '2024-01-08', type: 'drawdown', description: 'Monthly drawdown payment', account: 'SIPP', amount: -2850, status: 'settled' },
    { id: 5, date: '2024-01-01', type: 'fee', description: 'Platform fee Q4 2023', account: 'SIPP', amount: -179.66, status: 'settled' },
    { id: 6, date: '2024-01-01', type: 'fee', description: 'Platform fee Q4 2023', account: 'ISA', amount: -54.78, status: 'settled' },
  ])
  const [txnDialogOpen, setTxnDialogOpen] = useState(false)
  const [txnForm, setTxnForm] = useState({ type: 'contribution', description: '', account: 'SIPP', amount: 0 })
  const [editingTxn, setEditingTxn] = useState<number | null>(null)

  // ── Contributions ──
  const [contributions, setContributions] = useState([
    { id: 1, taxYear: '2023-24', type: 'Employee', gross: 12000, net: 9600, taxRelief: 2400, method: 'Relief at Source', frequency: 'Monthly' },
    { id: 2, taxYear: '2023-24', type: 'Employer', gross: 6000, net: 6000, taxRelief: 0, method: 'Net Pay', frequency: 'Monthly' },
    { id: 3, taxYear: '2023-24', type: 'Single', gross: 25000, net: 20000, taxRelief: 5000, method: 'Relief at Source', frequency: 'One-off' },
    { id: 4, taxYear: '2022-23', type: 'Employee', gross: 10000, net: 8000, taxRelief: 2000, method: 'Relief at Source', frequency: 'Monthly' },
    { id: 5, taxYear: '2022-23', type: 'Employer', gross: 5000, net: 5000, taxRelief: 0, method: 'Net Pay', frequency: 'Monthly' },
  ])
  const [contribDialogOpen, setContribDialogOpen] = useState(false)
  const [contribForm, setContribForm] = useState({ taxYear: '2024-25', type: 'Employee', gross: 0, net: 0, taxRelief: 0, method: 'Relief at Source', frequency: 'Monthly' })
  const [editingContrib, setEditingContrib] = useState<number | null>(null)

  // ── Transfers ──
  const [transfers, setTransfers] = useState([
    { id: 1, date: '2023-06-15', direction: 'in', cedingScheme: 'Aviva Pension', receivingScheme: 'Airgead SIPP', amount: 125000, type: 'full', status: 'completed', reference: 'TRF-2023-001' },
    { id: 2, date: '2024-01-10', direction: 'in', cedingScheme: 'Standard Life', receivingScheme: 'Airgead SIPP', amount: 25000, type: 'partial', status: 'pending', reference: 'TRF-2024-001' },
  ])
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [transferForm, setTransferForm] = useState({ direction: 'in', cedingScheme: '', receivingScheme: 'Airgead SIPP', amount: 0, type: 'full', reference: '' })

  // ── Drawdown ──
  const [drawdownConfig, setDrawdownConfig] = useState({
    monthlyAmount: 2850, frequency: 'Monthly', taxFreeElement: 25, paymentDate: '8th',
    bankAccount: '****4521', startDate: '2023-07-01', status: 'active',
  })
  const [drawdownHistory, setDrawdownHistory] = useState([
    { id: 1, date: '2024-01-08', grossAmount: 2850, taxFree: 712.50, taxable: 2137.50, taxDeducted: 427.50, netPaid: 2422.50, status: 'paid' },
    { id: 2, date: '2023-12-08', grossAmount: 2850, taxFree: 712.50, taxable: 2137.50, taxDeducted: 427.50, netPaid: 2422.50, status: 'paid' },
    { id: 3, date: '2023-11-08', grossAmount: 2500, taxFree: 625.00, taxable: 1875.00, taxDeducted: 375.00, netPaid: 2125.00, status: 'paid' },
  ])
  const [drawdownDialogOpen, setDrawdownDialogOpen] = useState(false)
  const [drawdownForm, setDrawdownForm] = useState(drawdownConfig)
  const [adhocDrawdownOpen, setAdhocDrawdownOpen] = useState(false)
  const [adhocForm, setAdhocForm] = useState({ amount: 0, reason: '' })

  // ── Beneficiaries ──
  const [beneficiaries, setBeneficiaries] = useState([
    { id: 1, name: 'Jane Smith', relationship: 'Spouse', dob: '1977-08-22', share: 75, type: 'Expression of Wish', dateSet: '2022-03-15', status: 'active' },
    { id: 2, name: 'Tom Smith', relationship: 'Son', dob: '2005-04-10', share: 12.5, type: 'Expression of Wish', dateSet: '2022-03-15', status: 'active' },
    { id: 3, name: 'Emily Smith', relationship: 'Daughter', dob: '2008-11-30', share: 12.5, type: 'Expression of Wish', dateSet: '2022-03-15', status: 'active' },
  ])
  const [benefDialogOpen, setBenefDialogOpen] = useState(false)
  const [benefForm, setBenefForm] = useState({ name: '', relationship: 'Spouse', dob: '', share: 0, type: 'Expression of Wish' })
  const [editingBenef, setEditingBenef] = useState<number | null>(null)

  // ── BCE ──
  const [bceEvents, setBceEvents] = useState([
    { id: 1, date: '2023-06-12', type: 'BCE 1', description: 'Drawdown designation', amount: 150000, lta_used: 13.9, cumulative_lta: 13.9, status: 'registered' },
    { id: 2, date: '2022-01-15', type: 'BCE 6', description: 'Tax-free cash (PCLS)', amount: 50000, lta_used: 4.6, cumulative_lta: 18.5, status: 'registered' },
  ])
  const [bceDialogOpen, setBceDialogOpen] = useState(false)
  const [bceForm, setBceForm] = useState({ type: 'BCE 1', description: '', amount: 0, lta_used: 0 })

  // ── Notes & Tasks ──
  const [notes, setNotes] = useState([
    { id: 1, date: '2024-01-15', author: 'Sarah Johnson', content: 'Client confirmed happy with current drawdown level.', type: 'review' },
    { id: 2, date: '2023-12-20', author: 'Sarah Johnson', content: 'Client requested increase in monthly drawdown from £2,500 to £2,850. Approved and processed.', type: 'action' },
    { id: 3, date: '2023-11-15', author: 'Michael Brown', content: 'Quarterly review completed. Risk profile remains balanced.', type: 'review' },
  ])
  const [newNote, setNewNote] = useState('')
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Annual review due', dueDate: '2024-06-12', status: 'upcoming', priority: 'medium' },
    { id: 2, title: 'Beneficiary nomination review', dueDate: '2024-03-01', status: 'overdue', priority: 'high' },
    { id: 3, title: 'Risk profile reassessment', dueDate: '2024-09-15', status: 'upcoming', priority: 'low' },
  ])
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', dueDate: '', priority: 'medium' })

  // ── Communications ──
  const [communications, setCommunications] = useState([
    { id: 1, date: '2024-01-15', type: 'Email', subject: 'Annual review confirmation', status: 'sent', by: 'System' },
    { id: 2, date: '2024-01-10', type: 'Letter', subject: 'Tax year statement 2023/24', status: 'sent', by: 'System' },
    { id: 3, date: '2023-12-20', type: 'Phone', subject: 'Drawdown increase request', status: 'completed', by: 'Sarah Johnson' },
  ])
  const [commDialogOpen, setCommDialogOpen] = useState(false)
  const [commForm, setCommForm] = useState({ type: 'Email', subject: '', notes: '' })

  // ── Activity Log ──
  const [activityLog, setActivityLog] = useState([
    { date: '2024-01-15 14:30', action: 'Login', detail: 'Client logged in via web', user: 'John Smith' },
    { date: '2024-01-15 14:32', action: 'View Portfolio', detail: 'Viewed SIPP portfolio', user: 'John Smith' },
    { date: '2024-01-15 11:00', action: 'Contribution', detail: 'Monthly contribution of £1,000 processed', user: 'System' },
    { date: '2024-01-14 09:15', action: 'Admin Update', detail: 'Adviser updated risk profile notes', user: 'Sarah Johnson' },
    { date: '2024-01-10 16:45', action: 'Document Sent', detail: 'Tax year statement generated and sent', user: 'System' },
    { date: '2024-01-08 10:00', action: 'Drawdown', detail: 'Monthly drawdown of £2,850 paid to bank', user: 'System' },
  ])

  const addActivityEntry = (action: string, detail: string) => {
    setActivityLog(prev => [{ date: new Date().toISOString().replace('T', ' ').slice(0, 16), action, detail, user: 'Admin' }, ...prev])
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Personal Details</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => { setPersonalForm(personalDetails); setEditingPersonal(true) }}><Edit className="w-4 h-4 mr-2" /> Edit Details</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground text-xs">Full Name</Label><p className="font-medium">{personalDetails.name}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Date of Birth</Label><p className="font-medium">{personalDetails.dob}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Email</Label><p className="font-medium">{personalDetails.email}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Phone</Label><p className="font-medium">{personalDetails.phone}</p></div>
                  <div><Label className="text-muted-foreground text-xs">NI Number</Label><p className="font-medium">{personalDetails.nino}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Address</Label><p className="font-medium">{personalDetails.address}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Adviser</Label><p className="font-medium">{personalDetails.adviser}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Risk Profile</Label><p className="font-medium capitalize">{personalDetails.riskProfile}</p></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Upcoming Tasks</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {task.status === 'overdue' ? <AlertTriangle className="w-4 h-4 text-destructive" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                        <div><p className="font-medium text-sm">{task.title}</p><p className="text-xs text-muted-foreground">Due: {task.dueDate}</p></div>
                      </div>
                      <Badge variant={task.status === 'overdue' ? 'destructive' : 'secondary'}>{task.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'accounts':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Investment Accounts</CardTitle>
                <Button size="sm" onClick={() => { setAccountForm({ type: 'SIPP', status: 'active' }); setAccountDialogOpen(true) }}><Plus className="w-4 h-4 mr-2" /> Open New Account</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div key={account.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {account.type === 'SIPP' ? <Wallet className="w-5 h-5 text-primary" /> :
                           account.type === 'S&S ISA' ? <Shield className="w-5 h-5 text-success" /> :
                           <Briefcase className="w-5 h-5 text-accent-foreground" />}
                        </div>
                        <div><h4 className="font-semibold">{account.type}</h4><p className="text-xs text-muted-foreground">Ref: {account.reference}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{account.status}</Badge>
                        <Select value={account.status} onValueChange={(v) => {
                          setAccounts(prev => prev.map(a => a.id === account.id ? { ...a, status: v } : a))
                          toast.success(`${account.type} status changed to ${v}`)
                          addActivityEntry('Account Update', `${account.type} status changed to ${v}`)
                        }}>
                          <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div><p className="text-xs text-muted-foreground">Current Value</p><p className="text-lg font-bold text-primary">{formatCurrency(account.value)}</p></div>
                      <div><p className="text-xs text-muted-foreground">Total Contributions</p><p className="text-lg font-semibold">{formatCurrency(account.contributions)}</p></div>
                      <div><p className="text-xs text-muted-foreground">Tax Relief</p><p className="text-lg font-semibold text-success">{formatCurrency(account.taxRelief)}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case 'transactions':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle>Client Transactions</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    downloadCSV(`client-transactions-${clientId}`,
                      ['Date', 'Type', 'Description', 'Account', 'Amount', 'Status'],
                      transactions.map(t => [t.date, t.type, t.description, t.account, t.amount, t.status])
                    )
                    toast.success('Transactions exported')
                  }}><Download className="w-4 h-4 mr-2" /> Export</Button>
                  <Button size="sm" onClick={() => { setTxnForm({ type: 'contribution', description: '', account: 'SIPP', amount: 0 }); setEditingTxn(null); setTxnDialogOpen(true) }}>
                    <Plus className="w-4 h-4 mr-2" /> Add Transaction
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead>
                    <TableHead>Account</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(txn => (
                    <TableRow key={txn.id}>
                      <TableCell className="text-sm">{txn.date}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{txn.type}</Badge></TableCell>
                      <TableCell className="font-medium">{txn.description}</TableCell>
                      <TableCell><Badge variant="secondary">{txn.account}</Badge></TableCell>
                      <TableCell className={`text-right font-semibold ${txn.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {txn.amount >= 0 ? '+' : ''}{formatCurrency(txn.amount)}
                      </TableCell>
                      <TableCell>
                        <Select value={txn.status} onValueChange={(v) => {
                          setTransactions(prev => prev.map(t => t.id === txn.id ? { ...t, status: v } : t))
                          toast.success(`Transaction status updated to ${v}`)
                          addActivityEntry('Transaction Update', `${txn.description} status changed to ${v}`)
                        }}>
                          <SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="settled">Settled</SelectItem>
                            <SelectItem value="reversed">Reversed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setTxnForm({ type: txn.type, description: txn.description, account: txn.account, amount: Math.abs(txn.amount) })
                            setEditingTxn(txn.id)
                            setTxnDialogOpen(true)
                          }}><Edit className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => {
                            setTransactions(prev => prev.filter(t => t.id !== txn.id))
                            toast.success('Transaction reversed and removed')
                            addActivityEntry('Transaction Reversal', `Reversed: ${txn.description}`)
                          }}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )

      case 'contributions':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Contributions (2023-24)</p><p className="text-2xl font-bold text-primary">{formatCurrency(contributions.filter(c => c.taxYear === '2023-24').reduce((s, c) => s + c.gross, 0))}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Tax Relief Claimed</p><p className="text-2xl font-bold text-success">{formatCurrency(contributions.filter(c => c.taxYear === '2023-24').reduce((s, c) => s + c.taxRelief, 0))}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Annual Allowance Used</p><p className="text-2xl font-bold text-warning">{(contributions.filter(c => c.taxYear === '2023-24').reduce((s, c) => s + c.gross, 0) / 60000 * 100).toFixed(1)}%</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Carry Forward Available</p><p className="text-2xl font-bold text-foreground">£77,000</p></CardContent></Card>
            </div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Contribution History</CardTitle>
                  <Button size="sm" onClick={() => { setContribForm({ taxYear: '2024-25', type: 'Employee', gross: 0, net: 0, taxRelief: 0, method: 'Relief at Source', frequency: 'Monthly' }); setEditingContrib(null); setContribDialogOpen(true) }}>
                    <Plus className="w-4 h-4 mr-2" /> Record Contribution
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tax Year</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Gross</TableHead>
                      <TableHead className="text-right">Net Paid</TableHead><TableHead className="text-right">Tax Relief</TableHead>
                      <TableHead>Method</TableHead><TableHead>Frequency</TableHead><TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contributions.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.taxYear}</TableCell>
                        <TableCell><Badge variant="outline">{c.type}</Badge></TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(c.gross)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(c.net)}</TableCell>
                        <TableCell className="text-right text-success">{c.taxRelief > 0 ? formatCurrency(c.taxRelief) : '—'}</TableCell>
                        <TableCell className="text-sm">{c.method}</TableCell>
                        <TableCell><Badge variant="secondary">{c.frequency}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => {
                              setContribForm(c); setEditingContrib(c.id); setContribDialogOpen(true)
                            }}><Edit className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => {
                              setContributions(prev => prev.filter(x => x.id !== c.id))
                              toast.success('Contribution record removed')
                              addActivityEntry('Contribution Removed', `Removed ${c.type} contribution of ${formatCurrency(c.gross)}`)
                            }}><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        </TableCell>
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
                    { year: '2023-24', allowance: 60000, used: contributions.filter(c => c.taxYear === '2023-24').reduce((s, c) => s + c.gross, 0) },
                    { year: '2022-23', allowance: 60000, used: contributions.filter(c => c.taxYear === '2022-23').reduce((s, c) => s + c.gross, 0) },
                    { year: '2021-22', allowance: 40000, used: 25000 },
                    { year: '2020-21', allowance: 40000, used: 23000 },
                  ].map(y => (
                    <div key={y.year} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{y.year}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Allowance: {formatCurrency(y.allowance)}</span>
                        <span>Used: {formatCurrency(y.used)}</span>
                        <span className="font-semibold text-success">Remaining: {formatCurrency(y.allowance - y.used)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'transfers':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Transfers In</p><p className="text-2xl font-bold text-success">{formatCurrency(transfers.filter(t => t.direction === 'in').reduce((s, t) => s + t.amount, 0))}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Transfers Out</p><p className="text-2xl font-bold text-destructive">{formatCurrency(transfers.filter(t => t.direction === 'out').reduce((s, t) => s + t.amount, 0))}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pending Transfers</p><p className="text-2xl font-bold text-warning">{transfers.filter(t => t.status === 'pending').length}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Completed</p><p className="text-2xl font-bold text-foreground">{transfers.filter(t => t.status === 'completed').length}</p></CardContent></Card>
            </div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><ArrowRightLeft className="w-5 h-5" /> Transfer History</CardTitle>
                  <Button size="sm" onClick={() => { setTransferForm({ direction: 'in', cedingScheme: '', receivingScheme: 'Airgead SIPP', amount: 0, type: 'full', reference: '' }); setTransferDialogOpen(true) }}>
                    <Plus className="w-4 h-4 mr-2" /> New Transfer
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead><TableHead>Direction</TableHead><TableHead>From</TableHead><TableHead>To</TableHead>
                      <TableHead className="text-right">Amount</TableHead><TableHead>Type</TableHead><TableHead>Ref</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.map(t => (
                      <TableRow key={t.id}>
                        <TableCell className="text-sm">{t.date}</TableCell>
                        <TableCell><Badge className={t.direction === 'in' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'} variant="outline">{t.direction === 'in' ? 'Transfer In' : 'Transfer Out'}</Badge></TableCell>
                        <TableCell className="font-medium">{t.cedingScheme}</TableCell>
                        <TableCell className="font-medium">{t.receivingScheme}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(t.amount)}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{t.type}</Badge></TableCell>
                        <TableCell className="font-mono text-xs">{t.reference}</TableCell>
                        <TableCell>
                          <Select value={t.status} onValueChange={(v) => {
                            setTransfers(prev => prev.map(x => x.id === t.id ? { ...x, status: v } : x))
                            toast.success(`Transfer ${t.reference} status updated to ${v}`)
                            addActivityEntry('Transfer Update', `Transfer ${t.reference} status changed to ${v}`)
                          }}>
                            <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="awaiting_discharge">Awaiting Discharge</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => {
                            setTransfers(prev => prev.filter(x => x.id !== t.id))
                            toast.success('Transfer record removed')
                          }}><Trash2 className="w-3 h-3" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )

      case 'drawdown':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Monthly Drawdown</p><p className="text-2xl font-bold text-primary">{formatCurrency(drawdownConfig.monthlyAmount)}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Tax-Free Element</p><p className="text-2xl font-bold text-success">{drawdownConfig.taxFreeElement}%</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Payment Date</p><p className="text-2xl font-bold text-foreground">{drawdownConfig.paymentDate}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Status</p><p className="text-2xl font-bold text-success capitalize">{drawdownConfig.status}</p></CardContent></Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Banknote className="w-5 h-5" /> Regular Drawdown Configuration</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setDrawdownForm(drawdownConfig); setDrawdownDialogOpen(true) }}><Edit className="w-4 h-4 mr-2" /> Amend</Button>
                    <Button size="sm" onClick={() => setAdhocDrawdownOpen(true)}><Plus className="w-4 h-4 mr-2" /> Ad-hoc Payment</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div><Label className="text-muted-foreground text-xs">Gross Amount</Label><p className="font-semibold">{formatCurrency(drawdownConfig.monthlyAmount)}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Frequency</Label><p className="font-semibold">{drawdownConfig.frequency}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Bank Account</Label><p className="font-semibold">{drawdownConfig.bankAccount}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Start Date</Label><p className="font-semibold">{drawdownConfig.startDate}</p></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Drawdown Payment History</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead><TableHead className="text-right">Gross</TableHead><TableHead className="text-right">Tax-Free</TableHead>
                      <TableHead className="text-right">Taxable</TableHead><TableHead className="text-right">Tax Deducted</TableHead>
                      <TableHead className="text-right">Net Paid</TableHead><TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drawdownHistory.map(d => (
                      <TableRow key={d.id}>
                        <TableCell>{d.date}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(d.grossAmount)}</TableCell>
                        <TableCell className="text-right text-success">{formatCurrency(d.taxFree)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(d.taxable)}</TableCell>
                        <TableCell className="text-right text-destructive">{formatCurrency(d.taxDeducted)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(d.netPaid)}</TableCell>
                        <TableCell><Badge variant="default">{d.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )

      case 'beneficiaries':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2"><Heart className="w-5 h-5" /> Beneficiary Nominations</CardTitle>
                    <CardDescription>Expression of wish and death benefit nominations</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => { setBenefForm({ name: '', relationship: 'Spouse', dob: '', share: 0, type: 'Expression of Wish' }); setEditingBenef(null); setBenefDialogOpen(true) }}><Plus className="w-4 h-4 mr-2" /> Add Beneficiary</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {beneficiaries.map(b => (
                    <div key={b.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10"><Heart className="w-5 h-5 text-primary" /></div>
                          <div><h4 className="font-semibold">{b.name}</h4><p className="text-sm text-muted-foreground">{b.relationship} • DOB: {b.dob}</p></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default">{b.status}</Badge>
                          <Button variant="outline" size="sm" onClick={() => {
                            setBenefForm({ name: b.name, relationship: b.relationship, dob: b.dob, share: b.share, type: b.type })
                            setEditingBenef(b.id); setBenefDialogOpen(true)
                          }}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => {
                            setBeneficiaries(prev => prev.filter(x => x.id !== b.id))
                            toast.success(`Beneficiary ${b.name} removed`)
                            addActivityEntry('Beneficiary Removed', `Removed beneficiary: ${b.name}`)
                          }}><Trash2 className="w-4 h-4" /></Button>
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
                  <p className="text-sm"><strong>Total allocation:</strong> {beneficiaries.reduce((s, b) => s + b.share, 0)}%
                    {beneficiaries.reduce((s, b) => s + b.share, 0) !== 100 && <span className="text-destructive ml-2">(Warning: does not total 100%)</span>}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'crystallisation':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Crystallised</p><p className="text-2xl font-bold text-primary">{formatCurrency(bceEvents.reduce((s, b) => s + b.amount, 0))}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">LTA Used</p><p className="text-2xl font-bold text-warning">{bceEvents.length > 0 ? bceEvents[0].cumulative_lta : 0}%</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Transitional Protection</p><p className="text-2xl font-bold text-success">None</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Lump Sum Allowance</p><p className="text-2xl font-bold text-foreground">£218,325</p></CardContent></Card>
            </div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" /> Benefit Crystallisation Events</CardTitle>
                    <CardDescription>Record of all pension crystallisation events (BCE 1-9)</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => { setBceForm({ type: 'BCE 1', description: '', amount: 0, lta_used: 0 }); setBceDialogOpen(true) }}><Plus className="w-4 h-4 mr-2" /> Record BCE</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead><TableHead>BCE Type</TableHead><TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead><TableHead className="text-right">LTA Used</TableHead>
                      <TableHead className="text-right">Cumulative</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bceEvents.map(bce => (
                      <TableRow key={bce.id}>
                        <TableCell className="text-sm">{bce.date}</TableCell>
                        <TableCell><Badge variant="outline">{bce.type}</Badge></TableCell>
                        <TableCell className="font-medium">{bce.description}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(bce.amount)}</TableCell>
                        <TableCell className="text-right">{bce.lta_used}%</TableCell>
                        <TableCell className="text-right font-semibold text-warning">{bce.cumulative_lta}%</TableCell>
                        <TableCell><Badge variant="default">{bce.status}</Badge></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => {
                            setBceEvents(prev => prev.filter(x => x.id !== bce.id))
                            toast.success('BCE record removed')
                            addActivityEntry('BCE Removed', `Removed ${bce.type}: ${bce.description}`)
                          }}><Trash2 className="w-3 h-3" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )

      case 'compliance':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">KYC / AML Status</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-success" /><div><p className="font-medium">Identity Verified</p><p className="text-xs text-muted-foreground">Passport verified via electronic check</p></div></div>
                  <Badge className="bg-success/10 text-success border-success/20">Verified</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-success" /><div><p className="font-medium">Address Verified</p><p className="text-xs text-muted-foreground">Utility bill confirmed</p></div></div>
                  <Badge className="bg-success/10 text-success border-success/20">Verified</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-success" /><div><p className="font-medium">AML Screening</p><p className="text-xs text-muted-foreground">PEP & sanctions check clear</p></div></div>
                  <Badge className="bg-success/10 text-success border-success/20">Clear</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-warning" /><div><p className="font-medium">Next Review Due</p><p className="text-xs text-muted-foreground">Scheduled reverification</p></div></div>
                  <Badge variant="secondary">{personalDetails.kycExpiry}</Badge>
                </div>
                <Button variant="outline" className="w-full" onClick={() => { toast.success('KYC reverification triggered'); addActivityEntry('KYC', 'Reverification triggered') }}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Trigger Reverification
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Risk & Suitability</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2"><p className="font-medium">Current Risk Profile</p>
                    <Select value={personalDetails.riskProfile} onValueChange={v => {
                      setPersonalDetails(prev => ({ ...prev, riskProfile: v }))
                      toast.success(`Risk profile updated to ${v}`)
                      addActivityEntry('Risk Profile', `Risk profile changed to ${v}`)
                    }}>
                      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-medium mb-2">Suitability Assessment</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Investment objective</span><span>Growth & Income</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Time horizon</span><span>10+ years</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Capacity for loss</span><span>Medium</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'communications':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Communication History</CardTitle>
                <Button size="sm" onClick={() => { setCommForm({ type: 'Email', subject: '', notes: '' }); setCommDialogOpen(true) }}><Send className="w-4 h-4 mr-2" /> New Communication</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Subject</TableHead>
                    <TableHead>By</TableHead><TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communications.map((comm) => (
                    <TableRow key={comm.id} className="cursor-pointer hover:bg-accent/50">
                      <TableCell className="text-sm">{comm.date}</TableCell>
                      <TableCell><Badge variant="outline">{comm.type}</Badge></TableCell>
                      <TableCell className="font-medium">{comm.subject}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{comm.by}</TableCell>
                      <TableCell className="text-right"><Badge variant="secondary">{comm.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )

      case 'notes':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Case Notes</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-4 space-y-2">
                  <Textarea placeholder="Add a new note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={3} />
                  <Button size="sm" disabled={!newNote.trim()} onClick={() => {
                    setNotes(prev => [{ id: Date.now(), date: new Date().toISOString().split('T')[0], author: 'Admin', content: newNote, type: 'action' }, ...prev])
                    addActivityEntry('Note Added', newNote.slice(0, 50) + '...')
                    setNewNote('')
                    toast.success('Note added')
                  }}><Plus className="w-4 h-4 mr-2" /> Add Note</Button>
                </div>
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getNoteTypeColor(note.type)}>{note.type}</Badge>
                          <span className="text-sm font-medium">{note.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{note.date}</span>
                          <Button variant="ghost" size="sm" className="text-destructive h-6 w-6 p-0" onClick={() => {
                            setNotes(prev => prev.filter(n => n.id !== note.id))
                            toast.success('Note deleted')
                          }}><Trash2 className="w-3 h-3" /></Button>
                        </div>
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
                  <Button size="sm" variant="outline" onClick={() => { setTaskForm({ title: '', dueDate: '', priority: 'medium' }); setTaskDialogOpen(true) }}><Plus className="w-4 h-4 mr-2" /> Add Task</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {task.status === 'overdue' ? <AlertTriangle className="w-4 h-4 text-destructive" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                        <div><p className="font-medium text-sm">{task.title}</p><p className="text-xs text-muted-foreground">Due: {task.dueDate}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'}>{task.priority}</Badge>
                        <Select value={task.status} onValueChange={v => {
                          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: v } : t))
                          toast.success(`Task status updated to ${v}`)
                        }}>
                          <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="sm" className="text-destructive h-6 w-6 p-0" onClick={() => {
                          setTasks(prev => prev.filter(t => t.id !== task.id))
                          toast.success('Task removed')
                        }}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'activity':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>Complete audit trail of all actions on this account</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  downloadCSV(`activity-log-${clientId}`,
                    ['Date', 'Action', 'Detail', 'User'],
                    activityLog.map(l => [l.date, l.action, l.detail, l.user])
                  )
                  toast.success('Activity log exported')
                }}><Download className="w-4 h-4 mr-2" /> Export</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead><TableHead>Action</TableHead>
                    <TableHead>Detail</TableHead><TableHead className="text-right">User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLog.map((log, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{log.date}</TableCell>
                      <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                      <TableCell className="text-sm">{log.detail}</TableCell>
                      <TableCell className="text-sm text-right text-muted-foreground">{log.user}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )

      case 'settings':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Account Controls</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3"><Lock className="w-4 h-4 text-muted-foreground" /><div><p className="font-medium text-sm">Account Locked</p><p className="text-xs text-muted-foreground">Prevent all transactions</p></div></div>
                  <Switch onCheckedChange={(v) => { toast.info(v ? 'Account locked' : 'Account unlocked'); addActivityEntry('Account Lock', v ? 'Account locked' : 'Account unlocked') }} />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3"><Ban className="w-4 h-4 text-muted-foreground" /><div><p className="font-medium text-sm">Withdrawals Suspended</p><p className="text-xs text-muted-foreground">Block outgoing payments</p></div></div>
                  <Switch onCheckedChange={(v) => { toast.info(v ? 'Withdrawals suspended' : 'Withdrawals enabled'); addActivityEntry('Withdrawals', v ? 'Suspended' : 'Enabled') }} />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-muted-foreground" /><div><p className="font-medium text-sm">Email Notifications</p><p className="text-xs text-muted-foreground">System emails enabled</p></div></div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3"><Shield className="w-4 h-4 text-muted-foreground" /><div><p className="font-medium text-sm">Client Status</p><p className="text-xs text-muted-foreground">Change active status</p></div></div>
                  <Select value={personalDetails.status} onValueChange={v => {
                    setPersonalDetails(prev => ({ ...prev, status: v }))
                    toast.success(`Client status changed to ${v}`)
                    addActivityEntry('Status Change', `Client status changed to ${v}`)
                  }}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="deceased">Deceased</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Administrative Actions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => { toast.success('Password reset email sent'); addActivityEntry('Security', 'Password reset initiated') }}><RefreshCw className="w-4 h-4 mr-2" /> Reset Client Password</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  setPersonalForm(personalDetails); setEditingPersonal(true)
                }}><User className="w-4 h-4 mr-2" /> Reassign Adviser</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => { toast.success('Statement generation started'); addActivityEntry('Document', 'Statement generated') }}><FileText className="w-4 h-4 mr-2" /> Generate Statement</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  downloadCSV(`gdpr-export-${clientId}`,
                    ['Field', 'Value'],
                    Object.entries(personalDetails).map(([k, v]) => [k, String(v)])
                  )
                  toast.success('GDPR data export complete')
                  addActivityEntry('GDPR', 'Full data export downloaded')
                }}><Download className="w-4 h-4 mr-2" /> Export All Data (GDPR)</Button>
                <Button variant="destructive" className="w-full justify-start" onClick={() => {
                  setPersonalDetails(prev => ({ ...prev, status: 'closed' }))
                  toast.success('Account closure initiated')
                  addActivityEntry('Account Closure', 'Account closure initiated')
                }}><Ban className="w-4 h-4 mr-2" /> Close Account</Button>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-muted via-background to-secondary-muted">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <BackButton label="Back to Admin" to="/admin" />

        <div className="mt-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10"><User className="w-8 h-8 text-primary" /></div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{personalDetails.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="default">{personalDetails.status}</Badge>
                  <Badge variant="outline">{personalDetails.riskProfile} risk</Badge>
                  <Badge variant="secondary">Adviser: {personalDetails.adviser}</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}><Eye className="w-4 h-4 mr-2" /> View as Client</Button>
              <Button variant="outline" size="sm" onClick={() => {
                downloadCSV(`client-export-${clientId}`,
                  ['Field', 'Value'],
                  Object.entries(personalDetails).map(([k, v]) => [k, String(v)])
                )
                toast.success('Client data exported')
              }}><Download className="w-4 h-4 mr-2" /> Export Data</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Portfolio</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(accounts.reduce((s, a) => s + a.value, 0))}</div>
              <p className="text-xs text-muted-foreground">{accounts.length} accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">KYC Status</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-success" /><span className="text-lg font-bold text-success">Verified</span></div>
              <p className="text-xs text-muted-foreground">Expires {personalDetails.kycExpiry}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Last Login</CardTitle></CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-foreground">{personalDetails.lastLogin}</div>
              <p className="text-xs text-muted-foreground">Member since {personalDetails.joinDate}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Open Tasks</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{tasks.filter(t => t.status !== 'completed').length}</div>
              <p className="text-xs text-destructive">{tasks.filter(t => t.status === 'overdue').length} overdue</p>
            </CardContent>
          </Card>
        </div>

        <SidebarNavLayout groups={navGroups} activeTab={activeTab} onTabChange={setActiveTab}>
          {renderContent()}
        </SidebarNavLayout>
      </div>

      {/* ── DIALOGS ── */}

      {/* Edit Personal Details */}
      <FormDialog open={editingPersonal} onClose={() => setEditingPersonal(false)} title="Edit Client Details" description="Update personal information" onSave={() => {
        setPersonalDetails(personalForm)
        toast.success('Client details updated')
        addActivityEntry('Personal Details', `Updated client details for ${personalForm.name}`)
      }}>
        <div className="space-y-1"><Label>Full Name</Label><Input value={personalForm.name} onChange={e => setPersonalForm(p => ({ ...p, name: e.target.value }))} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Email</Label><Input value={personalForm.email} onChange={e => setPersonalForm(p => ({ ...p, email: e.target.value }))} /></div>
          <div className="space-y-1"><Label>Phone</Label><Input value={personalForm.phone} onChange={e => setPersonalForm(p => ({ ...p, phone: e.target.value }))} /></div>
        </div>
        <div className="space-y-1"><Label>Address</Label><Input value={personalForm.address} onChange={e => setPersonalForm(p => ({ ...p, address: e.target.value }))} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>NI Number</Label><Input value={personalForm.nino} onChange={e => setPersonalForm(p => ({ ...p, nino: e.target.value }))} /></div>
          <div className="space-y-1"><Label>Date of Birth</Label><Input type="date" value={personalForm.dob} onChange={e => setPersonalForm(p => ({ ...p, dob: e.target.value }))} /></div>
        </div>
        <div className="space-y-1"><Label>Adviser</Label>
          <Select value={personalForm.adviser} onValueChange={v => setPersonalForm(p => ({ ...p, adviser: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
              <SelectItem value="Michael Brown">Michael Brown</SelectItem>
              <SelectItem value="Jennifer Davis">Jennifer Davis</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FormDialog>

      {/* Add Account */}
      <FormDialog open={accountDialogOpen} onClose={() => setAccountDialogOpen(false)} title="Open New Account" onSave={() => {
        const newId = Math.max(0, ...accounts.map(a => a.id)) + 1
        const ref = `${accountForm.type.replace(/[^A-Z]/g, '').slice(0, 4)}-${String(newId).padStart(6, '0')}`
        setAccounts(prev => [...prev, { id: newId, type: accountForm.type, value: 0, status: 'active', reference: ref, contributions: 0, taxRelief: 0 }])
        toast.success(`${accountForm.type} account opened`)
        addActivityEntry('New Account', `Opened ${accountForm.type} account`)
      }}>
        <div className="space-y-1"><Label>Account Type</Label>
          <Select value={accountForm.type} onValueChange={v => setAccountForm(p => ({ ...p, type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SIPP">SIPP</SelectItem>
              <SelectItem value="S&S ISA">S&S ISA</SelectItem>
              <SelectItem value="GIA">GIA</SelectItem>
              <SelectItem value="SSAS">SSAS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FormDialog>

      {/* Add/Edit Transaction */}
      <FormDialog open={txnDialogOpen} onClose={() => { setTxnDialogOpen(false); setEditingTxn(null) }} title={editingTxn ? 'Edit Transaction' : 'Add Manual Transaction'} description="Process a contribution, withdrawal, transfer, or other transaction" onSave={() => {
        const sign = ['contribution', 'transfer_in', 'dividend', 'sell', 'tax_relief'].includes(txnForm.type) ? 1 : -1
        if (editingTxn) {
          setTransactions(prev => prev.map(t => t.id === editingTxn ? { ...t, ...txnForm, amount: txnForm.amount * sign } : t))
          toast.success('Transaction updated')
          addActivityEntry('Transaction Amended', `Updated: ${txnForm.description}`)
        } else {
          const newId = Math.max(0, ...transactions.map(t => t.id)) + 1
          setTransactions(prev => [{ id: newId, date: new Date().toISOString().split('T')[0], ...txnForm, amount: txnForm.amount * sign, status: 'pending' }, ...prev])
          toast.success('Transaction recorded')
          addActivityEntry('New Transaction', `${txnForm.type}: ${txnForm.description} (${formatCurrency(txnForm.amount)})`)
        }
      }} saveLabel={editingTxn ? 'Save Changes' : 'Process Transaction'} saveDisabled={!txnForm.description || !txnForm.amount}>
        <div className="space-y-1"><Label>Transaction Type</Label>
          <Select value={txnForm.type} onValueChange={v => setTxnForm(p => ({ ...p, type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="contribution">Contribution</SelectItem>
              <SelectItem value="transfer_in">Transfer In</SelectItem>
              <SelectItem value="transfer_out">Transfer Out</SelectItem>
              <SelectItem value="drawdown">Drawdown</SelectItem>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
              <SelectItem value="fee">Fee</SelectItem>
              <SelectItem value="dividend">Dividend</SelectItem>
              <SelectItem value="tax_relief">Tax Relief</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>Description</Label><Input value={txnForm.description} onChange={e => setTxnForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Monthly contribution" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Account</Label>
            <Select value={txnForm.account} onValueChange={v => setTxnForm(p => ({ ...p, account: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {accounts.map(a => <SelectItem key={a.id} value={a.type}>{a.type} ({a.reference})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>Amount (£)</Label><Input type="number" step="0.01" value={txnForm.amount || ''} onChange={e => setTxnForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} /></div>
        </div>
      </FormDialog>

      {/* Record Contribution */}
      <FormDialog open={contribDialogOpen} onClose={() => { setContribDialogOpen(false); setEditingContrib(null) }} title={editingContrib ? 'Edit Contribution' : 'Record Contribution'} onSave={() => {
        if (editingContrib) {
          setContributions(prev => prev.map(c => c.id === editingContrib ? { ...c, ...contribForm } : c))
          toast.success('Contribution record updated')
          addActivityEntry('Contribution Amended', `Updated ${contribForm.type} contribution: ${formatCurrency(contribForm.gross)}`)
        } else {
          const newId = Math.max(0, ...contributions.map(c => c.id)) + 1
          setContributions(prev => [{ id: newId, ...contribForm }, ...prev])
          toast.success('Contribution recorded')
          addActivityEntry('Contribution', `Recorded ${contribForm.type} contribution: ${formatCurrency(contribForm.gross)}`)
        }
      }} saveDisabled={!contribForm.gross}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Tax Year</Label>
            <Select value={contribForm.taxYear} onValueChange={v => setContribForm(p => ({ ...p, taxYear: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-25">2024-25</SelectItem>
                <SelectItem value="2023-24">2023-24</SelectItem>
                <SelectItem value="2022-23">2022-23</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>Contribution Type</Label>
            <Select value={contribForm.type} onValueChange={v => setContribForm(p => ({ ...p, type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Employee">Employee</SelectItem>
                <SelectItem value="Employer">Employer</SelectItem>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Third Party">Third Party</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1"><Label>Gross (£)</Label><Input type="number" step="0.01" value={contribForm.gross || ''} onChange={e => {
            const gross = parseFloat(e.target.value) || 0
            const taxRelief = contribForm.method === 'Relief at Source' ? gross * 0.2 : 0
            setContribForm(p => ({ ...p, gross, net: gross - taxRelief, taxRelief }))
          }} /></div>
          <div className="space-y-1"><Label>Net Paid (£)</Label><Input type="number" step="0.01" value={contribForm.net || ''} onChange={e => setContribForm(p => ({ ...p, net: parseFloat(e.target.value) || 0 }))} /></div>
          <div className="space-y-1"><Label>Tax Relief (£)</Label><Input type="number" step="0.01" value={contribForm.taxRelief || ''} onChange={e => setContribForm(p => ({ ...p, taxRelief: parseFloat(e.target.value) || 0 }))} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Method</Label>
            <Select value={contribForm.method} onValueChange={v => setContribForm(p => ({ ...p, method: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Relief at Source">Relief at Source</SelectItem>
                <SelectItem value="Net Pay">Net Pay</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>Frequency</Label>
            <Select value={contribForm.frequency} onValueChange={v => setContribForm(p => ({ ...p, frequency: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
                <SelectItem value="Annual">Annual</SelectItem>
                <SelectItem value="One-off">One-off</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormDialog>

      {/* New Transfer */}
      <FormDialog open={transferDialogOpen} onClose={() => setTransferDialogOpen(false)} title="Record Transfer" description="Create a pension transfer in or out" onSave={() => {
        const newId = Math.max(0, ...transfers.map(t => t.id)) + 1
        const ref = `TRF-${new Date().getFullYear()}-${String(newId).padStart(3, '0')}`
        setTransfers(prev => [...prev, { id: newId, date: new Date().toISOString().split('T')[0], ...transferForm, reference: ref, status: 'pending' }])
        toast.success('Transfer recorded')
        addActivityEntry('Transfer', `New ${transferForm.direction === 'in' ? 'transfer in' : 'transfer out'}: ${formatCurrency(transferForm.amount)}`)
      }} saveDisabled={!transferForm.cedingScheme || !transferForm.amount}>
        <div className="space-y-1"><Label>Direction</Label>
          <Select value={transferForm.direction} onValueChange={v => setTransferForm(p => ({ ...p, direction: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="in">Transfer In</SelectItem>
              <SelectItem value="out">Transfer Out</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Ceding Scheme</Label><Input value={transferForm.cedingScheme} onChange={e => setTransferForm(p => ({ ...p, cedingScheme: e.target.value }))} placeholder="e.g. Aviva Pension" /></div>
          <div className="space-y-1"><Label>Receiving Scheme</Label><Input value={transferForm.receivingScheme} onChange={e => setTransferForm(p => ({ ...p, receivingScheme: e.target.value }))} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Amount (£)</Label><Input type="number" step="0.01" value={transferForm.amount || ''} onChange={e => setTransferForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} /></div>
          <div className="space-y-1"><Label>Transfer Type</Label>
            <Select value={transferForm.type} onValueChange={v => setTransferForm(p => ({ ...p, type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Transfer</SelectItem>
                <SelectItem value="partial">Partial Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormDialog>

      {/* Amend Drawdown */}
      <FormDialog open={drawdownDialogOpen} onClose={() => setDrawdownDialogOpen(false)} title="Amend Regular Drawdown" description="Update the regular drawdown configuration" onSave={() => {
        setDrawdownConfig(drawdownForm)
        toast.success('Drawdown configuration updated')
        addActivityEntry('Drawdown Amended', `Monthly drawdown changed to ${formatCurrency(drawdownForm.monthlyAmount)}`)
      }}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Monthly Amount (£)</Label><Input type="number" step="0.01" value={drawdownForm.monthlyAmount} onChange={e => setDrawdownForm(p => ({ ...p, monthlyAmount: parseFloat(e.target.value) || 0 }))} /></div>
          <div className="space-y-1"><Label>Frequency</Label>
            <Select value={drawdownForm.frequency} onValueChange={v => setDrawdownForm(p => ({ ...p, frequency: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
                <SelectItem value="Annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Tax-Free Element (%)</Label><Input type="number" step="0.1" value={drawdownForm.taxFreeElement} onChange={e => setDrawdownForm(p => ({ ...p, taxFreeElement: parseFloat(e.target.value) || 0 }))} /></div>
          <div className="space-y-1"><Label>Payment Date</Label>
            <Select value={drawdownForm.paymentDate} onValueChange={v => setDrawdownForm(p => ({ ...p, paymentDate: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1st">1st of month</SelectItem>
                <SelectItem value="8th">8th of month</SelectItem>
                <SelectItem value="15th">15th of month</SelectItem>
                <SelectItem value="25th">25th of month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1"><Label>Status</Label>
          <Select value={drawdownForm.status} onValueChange={v => setDrawdownForm(p => ({ ...p, status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="ceased">Ceased</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FormDialog>

      {/* Ad-hoc Drawdown */}
      <FormDialog open={adhocDrawdownOpen} onClose={() => setAdhocDrawdownOpen(false)} title="Process Ad-hoc Drawdown" description="One-off drawdown payment" onSave={() => {
        const taxFree = adhocForm.amount * drawdownConfig.taxFreeElement / 100
        const taxable = adhocForm.amount - taxFree
        const tax = taxable * 0.2
        const net = adhocForm.amount - tax
        const newId = Math.max(0, ...drawdownHistory.map(d => d.id)) + 1
        setDrawdownHistory(prev => [{ id: newId, date: new Date().toISOString().split('T')[0], grossAmount: adhocForm.amount, taxFree, taxable, taxDeducted: tax, netPaid: net, status: 'pending' }, ...prev])
        toast.success(`Ad-hoc drawdown of ${formatCurrency(adhocForm.amount)} processed`)
        addActivityEntry('Ad-hoc Drawdown', `${formatCurrency(adhocForm.amount)} - ${adhocForm.reason}`)
      }} saveDisabled={!adhocForm.amount} saveLabel="Process Payment">
        <div className="space-y-1"><Label>Gross Amount (£)</Label><Input type="number" step="0.01" value={adhocForm.amount || ''} onChange={e => setAdhocForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} /></div>
        <div className="space-y-1"><Label>Reason</Label><Input value={adhocForm.reason} onChange={e => setAdhocForm(p => ({ ...p, reason: e.target.value }))} placeholder="e.g. Emergency withdrawal" /></div>
        {adhocForm.amount > 0 && (
          <div className="p-3 bg-accent/30 rounded-lg text-sm space-y-1">
            <div className="flex justify-between"><span>Tax-free ({drawdownConfig.taxFreeElement}%)</span><span className="text-success">{formatCurrency(adhocForm.amount * drawdownConfig.taxFreeElement / 100)}</span></div>
            <div className="flex justify-between"><span>Tax deducted (20%)</span><span className="text-destructive">-{formatCurrency((adhocForm.amount - adhocForm.amount * drawdownConfig.taxFreeElement / 100) * 0.2)}</span></div>
            <div className="flex justify-between font-semibold"><span>Estimated net payment</span><span>{formatCurrency(adhocForm.amount - (adhocForm.amount - adhocForm.amount * drawdownConfig.taxFreeElement / 100) * 0.2)}</span></div>
          </div>
        )}
      </FormDialog>

      {/* Beneficiary Dialog */}
      <FormDialog open={benefDialogOpen} onClose={() => { setBenefDialogOpen(false); setEditingBenef(null) }} title={editingBenef ? 'Edit Beneficiary' : 'Add Beneficiary'} onSave={() => {
        if (editingBenef) {
          setBeneficiaries(prev => prev.map(b => b.id === editingBenef ? { ...b, ...benefForm, dateSet: new Date().toISOString().split('T')[0] } : b))
          toast.success('Beneficiary updated')
          addActivityEntry('Beneficiary Updated', `Updated: ${benefForm.name}`)
        } else {
          const newId = Math.max(0, ...beneficiaries.map(b => b.id)) + 1
          setBeneficiaries(prev => [...prev, { id: newId, ...benefForm, dateSet: new Date().toISOString().split('T')[0], status: 'active' }])
          toast.success('Beneficiary added')
          addActivityEntry('Beneficiary Added', `Added: ${benefForm.name} (${benefForm.share}%)`)
        }
      }} saveDisabled={!benefForm.name || !benefForm.share}>
        <div className="space-y-1"><Label>Full Name</Label><Input value={benefForm.name} onChange={e => setBenefForm(p => ({ ...p, name: e.target.value }))} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Relationship</Label>
            <Select value={benefForm.relationship} onValueChange={v => setBenefForm(p => ({ ...p, relationship: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Spouse">Spouse</SelectItem>
                <SelectItem value="Civil Partner">Civil Partner</SelectItem>
                <SelectItem value="Son">Son</SelectItem>
                <SelectItem value="Daughter">Daughter</SelectItem>
                <SelectItem value="Sibling">Sibling</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>Date of Birth</Label><Input type="date" value={benefForm.dob} onChange={e => setBenefForm(p => ({ ...p, dob: e.target.value }))} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Share (%)</Label><Input type="number" step="0.5" value={benefForm.share || ''} onChange={e => setBenefForm(p => ({ ...p, share: parseFloat(e.target.value) || 0 }))} /></div>
          <div className="space-y-1"><Label>Nomination Type</Label>
            <Select value={benefForm.type} onValueChange={v => setBenefForm(p => ({ ...p, type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Expression of Wish">Expression of Wish</SelectItem>
                <SelectItem value="Binding Nomination">Binding Nomination</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormDialog>

      {/* BCE Dialog */}
      <FormDialog open={bceDialogOpen} onClose={() => setBceDialogOpen(false)} title="Record BCE" description="Register a Benefit Crystallisation Event" onSave={() => {
        const newId = Math.max(0, ...bceEvents.map(b => b.id)) + 1
        const prevCumulative = bceEvents.length > 0 ? bceEvents[0].cumulative_lta : 0
        setBceEvents(prev => [{ id: newId, date: new Date().toISOString().split('T')[0], ...bceForm, cumulative_lta: prevCumulative + bceForm.lta_used, status: 'registered' }, ...prev])
        toast.success('BCE recorded')
        addActivityEntry('BCE Registered', `${bceForm.type}: ${bceForm.description} (${formatCurrency(bceForm.amount)})`)
      }} saveDisabled={!bceForm.description || !bceForm.amount}>
        <div className="space-y-1"><Label>BCE Type</Label>
          <Select value={bceForm.type} onValueChange={v => setBceForm(p => ({ ...p, type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="BCE 1">BCE 1 - Drawdown Designation</SelectItem>
              <SelectItem value="BCE 2">BCE 2 - Scheme Pension</SelectItem>
              <SelectItem value="BCE 3">BCE 3 - Lifetime Annuity</SelectItem>
              <SelectItem value="BCE 4">BCE 4 - Lump Sum</SelectItem>
              <SelectItem value="BCE 5">BCE 5 - Pension Commencement</SelectItem>
              <SelectItem value="BCE 6">BCE 6 - PCLS</SelectItem>
              <SelectItem value="BCE 7">BCE 7 - Death (before 75)</SelectItem>
              <SelectItem value="BCE 8">BCE 8 - Transfer to QROPS</SelectItem>
              <SelectItem value="BCE 9">BCE 9 - Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>Description</Label><Input value={bceForm.description} onChange={e => setBceForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Drawdown designation" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Amount (£)</Label><Input type="number" step="0.01" value={bceForm.amount || ''} onChange={e => setBceForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} /></div>
          <div className="space-y-1"><Label>LTA Used (%)</Label><Input type="number" step="0.1" value={bceForm.lta_used || ''} onChange={e => setBceForm(p => ({ ...p, lta_used: parseFloat(e.target.value) || 0 }))} /></div>
        </div>
      </FormDialog>

      {/* Communication Dialog */}
      <FormDialog open={commDialogOpen} onClose={() => setCommDialogOpen(false)} title="New Communication" onSave={() => {
        const newId = Math.max(0, ...communications.map(c => c.id)) + 1
        setCommunications(prev => [{ id: newId, date: new Date().toISOString().split('T')[0], type: commForm.type, subject: commForm.subject, status: 'sent', by: 'Admin' }, ...prev])
        toast.success('Communication recorded')
        addActivityEntry('Communication', `${commForm.type}: ${commForm.subject}`)
      }} saveDisabled={!commForm.subject}>
        <div className="space-y-1"><Label>Type</Label>
          <Select value={commForm.type} onValueChange={v => setCommForm(p => ({ ...p, type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Letter">Letter</SelectItem>
              <SelectItem value="Phone">Phone</SelectItem>
              <SelectItem value="Meeting">Meeting</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>Subject</Label><Input value={commForm.subject} onChange={e => setCommForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Annual review reminder" /></div>
        <div className="space-y-1"><Label>Notes</Label><Textarea value={commForm.notes} onChange={e => setCommForm(p => ({ ...p, notes: e.target.value }))} rows={3} /></div>
      </FormDialog>

      {/* Task Dialog */}
      <FormDialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)} title="Add Task" onSave={() => {
        const newId = Math.max(0, ...tasks.map(t => t.id)) + 1
        setTasks(prev => [...prev, { id: newId, ...taskForm, status: 'upcoming' }])
        toast.success('Task created')
        addActivityEntry('Task Created', taskForm.title)
      }} saveDisabled={!taskForm.title || !taskForm.dueDate}>
        <div className="space-y-1"><Label>Task Title</Label><Input value={taskForm.title} onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Annual review" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Due Date</Label><Input type="date" value={taskForm.dueDate} onChange={e => setTaskForm(p => ({ ...p, dueDate: e.target.value }))} /></div>
          <div className="space-y-1"><Label>Priority</Label>
            <Select value={taskForm.priority} onValueChange={v => setTaskForm(p => ({ ...p, priority: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormDialog>
    </div>
  )
}
