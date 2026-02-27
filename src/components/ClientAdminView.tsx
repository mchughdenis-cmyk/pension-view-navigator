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
import { useClientDetail, useActivityLog, useConsentRecords, useCrystallisationSegments, type Client, type CrystallisationSegment } from '@/hooks/useClientData'
import { Progress } from '@/components/ui/progress'

const navGroups: NavGroup[] = [
  {
    label: "Client Details",
    icon: LayoutDashboard,
    items: [
      { value: 'overview', label: 'Overview', icon: User },
      { value: 'accounts', label: 'Accounts', icon: Wallet },
      { value: 'investments', label: 'Investments', icon: TrendingUp },
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
      { value: 'notes', label: 'Notes & Tasks', icon: ClipboardList },
      { value: 'activity', label: 'Activity Log', icon: History },
    ],
  },
]

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)

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

  const {
    client, accounts, transactions, investments, beneficiaries, bceEvents, loading,
    updateClient, addAccount, updateAccount,
    addTransaction, updateTransaction, deleteTransaction,
    addInvestment, updateInvestment, deleteInvestment,
    addBeneficiary, updateBeneficiary, deleteBeneficiary,
    addBCE,
  } = useClientDetail(clientId)

  const { logs: activityLog, fetchLogs } = useActivityLog(clientId)
  const { records: consentRecords, setConsent } = useConsentRecords(clientId)
  const { segments, addSegment, updateSegment, fetchSegments } = useCrystallisationSegments(clientId)

  // Dialog states
  const [editingPersonal, setEditingPersonal] = useState(false)
  const [personalForm, setPersonalForm] = useState<Partial<Client>>({})
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [accountForm, setAccountForm] = useState({ type: 'SIPP', status: 'active' })
  const [txnDialogOpen, setTxnDialogOpen] = useState(false)
  const [txnForm, setTxnForm] = useState({ type: 'contribution', description: '', account_id: '', amount: 0 })
  const [editingTxnId, setEditingTxnId] = useState<string | null>(null)
  const [invDialogOpen, setInvDialogOpen] = useState(false)
  const [invForm, setInvForm] = useState({ fund_name: '', isin: '', sedol: '', units: 0, unit_price: 0, account_id: '' })
  const [benefDialogOpen, setBenefDialogOpen] = useState(false)
  const [benefForm, setBenefForm] = useState({ name: '', relationship: 'Spouse', allocation_pct: 0 })
  const [editingBenefId, setEditingBenefId] = useState<string | null>(null)
  const [bceDialogOpen, setBceDialogOpen] = useState(false)
  const [bceForm, setBceForm] = useState({ bce_type: 'BCE 1', crystallised_amount: 0, lta_percentage: 0, tax_free_lump_sum: 0 })
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [transferForm, setTransferForm] = useState({ direction: 'in', cedingScheme: '', amount: 0, type: 'full', account_id: '' })
  const [crystalliseDialogOpen, setCrystalliseDialogOpen] = useState(false)
  const [crystalliseForm, setCrystalliseForm] = useState({ amount: 0, account_id: '', drawdown_type: 'FAD' })
  const [ufplsDialogOpen, setUfplsDialogOpen] = useState(false)
  const [ufplsForm, setUfplsForm] = useState({ amount: 0, account_id: '', description: 'UFPLS payment' })

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-center"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" /><p className="mt-2 text-muted-foreground">Loading client data...</p></div></div>
  if (!client) return <div className="flex items-center justify-center min-h-screen"><p className="text-destructive">Client not found</p></div>

  const clientName = `${client.title || ''} ${client.first_name} ${client.last_name}`.trim()
  const totalValue = accounts.reduce((s, a) => s + Number(a.total_value), 0)

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Personal Details</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => { setPersonalForm(client); setEditingPersonal(true) }}><Edit className="w-4 h-4 mr-2" /> Edit</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground text-xs">Full Name</Label><p className="font-medium">{clientName}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Date of Birth</Label><p className="font-medium">{client.date_of_birth || '—'}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Email</Label><p className="font-medium">{client.email || '—'}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Phone</Label><p className="font-medium">{client.phone || '—'}</p></div>
                  <div><Label className="text-muted-foreground text-xs">NI Number</Label><p className="font-medium">{client.ni_number || '—'}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Address</Label><p className="font-medium">{[client.address_line1, client.city, client.postcode].filter(Boolean).join(', ') || '—'}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Adviser</Label><p className="font-medium">{client.adviser || '—'}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Risk Profile</Label><p className="font-medium capitalize">{client.risk_profile || '—'}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Marital Status</Label><p className="font-medium">{client.marital_status || '—'}</p></div>
                  <div><Label className="text-muted-foreground text-xs">Employment</Label><p className="font-medium">{client.employment_status || '—'}</p></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Account Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {accounts.map(acc => (
                    <div key={acc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Wallet className="w-4 h-4 text-primary" />
                        <div><p className="font-medium">{acc.account_type}</p><p className="text-xs text-muted-foreground">{acc.account_number}</p></div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatCurrency(Number(acc.total_value))}</p>
                        <Badge variant={acc.status === 'active' ? 'default' : 'secondary'}>{acc.status}</Badge>
                      </div>
                    </div>
                  ))}
                  {accounts.length === 0 && <p className="text-muted-foreground text-center py-4">No accounts yet</p>}
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
                <Button size="sm" onClick={() => { setAccountForm({ type: 'SIPP', status: 'active' }); setAccountDialogOpen(true) }}><Plus className="w-4 h-4 mr-2" /> Open Account</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accounts.map(acc => (
                  <div key={acc.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10"><Wallet className="w-5 h-5 text-primary" /></div>
                        <div><h4 className="font-semibold">{acc.account_type}</h4><p className="text-xs text-muted-foreground">Ref: {acc.account_number}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{acc.status}</Badge>
                        <Select value={acc.status} onValueChange={async (v) => {
                          await updateAccount(acc.id, { status: v })
                          toast.success(`${acc.account_type} status changed to ${v}`)
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
                      <div><p className="text-xs text-muted-foreground">Total Value</p><p className="text-lg font-bold text-primary">{formatCurrency(Number(acc.total_value))}</p></div>
                      <div><p className="text-xs text-muted-foreground">Cash Balance</p><p className="text-lg font-semibold">{formatCurrency(Number(acc.cash_balance))}</p></div>
                      <div><p className="text-xs text-muted-foreground">Opened</p><p className="text-lg font-semibold">{acc.opened_date || '—'}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case 'investments':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Holdings</CardTitle>
                <Button size="sm" onClick={() => { setInvForm({ fund_name: '', isin: '', sedol: '', units: 0, unit_price: 0, account_id: accounts[0]?.id || '' }); setInvDialogOpen(true) }}>
                  <Plus className="w-4 h-4 mr-2" /> Add Investment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fund</TableHead><TableHead>ISIN</TableHead><TableHead className="text-right">Units</TableHead>
                    <TableHead className="text-right">Price</TableHead><TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Cost</TableHead><TableHead className="text-right">Gain/Loss</TableHead><TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investments.map(inv => {
                    const gain = Number(inv.current_value) - Number(inv.cost_basis)
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.fund_name}</TableCell>
                        <TableCell className="text-xs font-mono">{inv.isin}</TableCell>
                        <TableCell className="text-right">{Number(inv.units).toLocaleString('en-GB', { maximumFractionDigits: 4 })}</TableCell>
                        <TableCell className="text-right">{formatCurrency(Number(inv.unit_price))}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(Number(inv.current_value))}</TableCell>
                        <TableCell className="text-right">{formatCurrency(Number(inv.cost_basis))}</TableCell>
                        <TableCell className={`text-right font-semibold ${gain >= 0 ? 'text-success' : 'text-destructive'}`}>{gain >= 0 ? '+' : ''}{formatCurrency(gain)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={async () => {
                            await deleteInvestment(inv.id)
                            toast.success('Investment removed')
                          }}><Trash2 className="w-3 h-3" /></Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {investments.length === 0 && <p className="text-center py-8 text-muted-foreground">No investments yet</p>}
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
                      ['Date', 'Type', 'Description', 'Amount', 'Status', 'Reference'],
                      transactions.map(t => [t.effective_date || '', t.transaction_type, t.description || '', t.amount, t.status, t.reference || ''])
                    )
                    toast.success('Transactions exported')
                  }}><Download className="w-4 h-4 mr-2" /> Export</Button>
                  <Button size="sm" onClick={() => {
                    setTxnForm({ type: 'contribution', description: '', account_id: accounts[0]?.id || '', amount: 0 })
                    setEditingTxnId(null)
                    setTxnDialogOpen(true)
                  }}><Plus className="w-4 h-4 mr-2" /> Add Transaction</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(txn => (
                    <TableRow key={txn.id}>
                      <TableCell className="text-sm">{txn.effective_date || txn.created_at?.slice(0, 10)}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{txn.transaction_type.replace('_', ' ')}</Badge></TableCell>
                      <TableCell className="font-medium">{txn.description}</TableCell>
                      <TableCell className="font-mono text-xs">{txn.reference}</TableCell>
                      <TableCell className={`text-right font-semibold ${Number(txn.amount) >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {Number(txn.amount) >= 0 ? '+' : ''}{formatCurrency(Number(txn.amount))}
                      </TableCell>
                      <TableCell>
                        <Select value={txn.status} onValueChange={async (v) => {
                          await updateTransaction(txn.id, { status: v })
                          toast.success(`Transaction status updated to ${v}`)
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
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={async () => {
                          await deleteTransaction(txn.id)
                          toast.success('Transaction reversed')
                        }}><Trash2 className="w-3 h-3" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {transactions.length === 0 && <p className="text-center py-8 text-muted-foreground">No transactions yet</p>}
            </CardContent>
          </Card>
        )

      case 'contributions':
        const contribs = transactions.filter(t => t.transaction_type === 'contribution' || t.transaction_type === 'employer_contribution')
        const totalContribs = contribs.reduce((s, c) => s + Math.abs(Number(c.amount)), 0)
        const totalTaxRelief = contribs.reduce((s, c) => s + Number(c.tax_relief_amount || 0), 0)
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Contributions</p><p className="text-2xl font-bold text-primary">{formatCurrency(totalContribs)}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Tax Relief</p><p className="text-2xl font-bold text-success">{formatCurrency(totalTaxRelief)}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">AA Used</p><p className="text-2xl font-bold text-warning">{(totalContribs / 60000 * 100).toFixed(1)}%</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Contributions Count</p><p className="text-2xl font-bold text-foreground">{contribs.length}</p></CardContent></Card>
            </div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Contribution History</CardTitle>
                  <Button size="sm" onClick={() => {
                    setTxnForm({ type: 'contribution', description: '', account_id: accounts.find(a => a.account_type === 'SIPP')?.id || accounts[0]?.id || '', amount: 0 })
                    setTxnDialogOpen(true)
                  }}><Plus className="w-4 h-4 mr-2" /> Record Contribution</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Tax Year</TableHead>
                      <TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Tax Relief</TableHead><TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contribs.map(c => (
                      <TableRow key={c.id}>
                        <TableCell>{c.effective_date || c.created_at?.slice(0, 10)}</TableCell>
                        <TableCell className="font-medium">{c.description}</TableCell>
                        <TableCell><Badge variant="outline">{c.tax_year || '—'}</Badge></TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(Math.abs(Number(c.amount)))}</TableCell>
                        <TableCell className="text-right text-success">{Number(c.tax_relief_amount) > 0 ? formatCurrency(Number(c.tax_relief_amount)) : '—'}</TableCell>
                        <TableCell><Badge variant="secondary">{c.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {contribs.length === 0 && <p className="text-center py-8 text-muted-foreground">No contributions recorded</p>}
              </CardContent>
            </Card>
          </div>
        )

      case 'transfers':
        const transferTxns = transactions.filter(t => t.transaction_type === 'transfer_in' || t.transaction_type === 'transfer_out')
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Transfers In</p><p className="text-2xl font-bold text-success">{formatCurrency(transferTxns.filter(t => t.transaction_type === 'transfer_in').reduce((s, t) => s + Math.abs(Number(t.amount)), 0))}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Transfers Out</p><p className="text-2xl font-bold text-destructive">{formatCurrency(transferTxns.filter(t => t.transaction_type === 'transfer_out').reduce((s, t) => s + Math.abs(Number(t.amount)), 0))}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pending</p><p className="text-2xl font-bold text-warning">{transferTxns.filter(t => t.status === 'pending').length}</p></CardContent></Card>
            </div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><ArrowRightLeft className="w-5 h-5" /> Transfer History</CardTitle>
                  <Button size="sm" onClick={() => {
                    setTransferForm({ direction: 'in', cedingScheme: '', amount: 0, type: 'full', account_id: accounts.find(a => a.account_type === 'SIPP')?.id || '' })
                    setTransferDialogOpen(true)
                  }}><Plus className="w-4 h-4 mr-2" /> New Transfer</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead><TableHead>Reference</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transferTxns.map(t => (
                      <TableRow key={t.id}>
                        <TableCell className="text-sm">{t.effective_date}</TableCell>
                        <TableCell><Badge className={t.transaction_type === 'transfer_in' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'} variant="outline">{t.transaction_type === 'transfer_in' ? 'Transfer In' : 'Transfer Out'}</Badge></TableCell>
                        <TableCell className="font-medium">{t.description}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(Math.abs(Number(t.amount)))}</TableCell>
                        <TableCell className="font-mono text-xs">{t.reference}</TableCell>
                        <TableCell>
                          <Select value={t.status} onValueChange={async (v) => {
                            await updateTransaction(t.id, { status: v })
                            toast.success(`Transfer status updated to ${v}`)
                          }}>
                            <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="settled">Settled</SelectItem>
                              <SelectItem value="reversed">Reversed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={async () => {
                            await deleteTransaction(t.id)
                            toast.success('Transfer removed')
                          }}><Trash2 className="w-3 h-3" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {transferTxns.length === 0 && <p className="text-center py-8 text-muted-foreground">No transfers recorded</p>}
              </CardContent>
            </Card>
          </div>
        )

      case 'drawdown':
        const drawdownTxns = transactions.filter(t => t.transaction_type === 'drawdown' || t.transaction_type === 'ufpls')
        const totalDrawn = drawdownTxns.reduce((s, t) => s + Math.abs(Number(t.amount)), 0)
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Drawn Down</p><p className="text-2xl font-bold text-primary">{formatCurrency(totalDrawn)}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">FAD Payments</p><p className="text-2xl font-bold text-foreground">{drawdownTxns.filter(t => t.transaction_type === 'drawdown').length}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">UFPLS Payments</p><p className="text-2xl font-bold text-foreground">{drawdownTxns.filter(t => t.transaction_type === 'ufpls').length}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Avg Payment</p><p className="text-2xl font-bold text-warning">{drawdownTxns.length > 0 ? formatCurrency(totalDrawn / drawdownTxns.length) : '£0.00'}</p></CardContent></Card>
            </div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Banknote className="w-5 h-5" /> Drawdown History</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => {
                      setUfplsForm({ amount: 0, account_id: accounts.find(a => a.account_type === 'SIPP')?.id || '', description: 'UFPLS payment' })
                      setUfplsDialogOpen(true)
                    }}><Plus className="w-4 h-4 mr-2" /> UFPLS</Button>
                    <Button size="sm" onClick={() => {
                      setTxnForm({ type: 'drawdown', description: 'FAD drawdown payment', account_id: accounts.find(a => a.account_type === 'SIPP')?.id || '', amount: 0 })
                      setTxnDialogOpen(true)
                    }}><Plus className="w-4 h-4 mr-2" /> FAD Drawdown</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead><TableHead>Reference</TableHead><TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drawdownTxns.map(t => (
                      <TableRow key={t.id}>
                        <TableCell>{t.effective_date}</TableCell>
                        <TableCell><Badge variant="outline" className={t.transaction_type === 'ufpls' ? 'border-warning text-warning' : ''}>{t.transaction_type === 'ufpls' ? 'UFPLS' : 'FAD'}</Badge></TableCell>
                        <TableCell className="font-medium">{t.description}</TableCell>
                        <TableCell className="text-right font-semibold text-destructive">{formatCurrency(Math.abs(Number(t.amount)))}</TableCell>
                        <TableCell className="font-mono text-xs">{t.reference}</TableCell>
                        <TableCell><Badge variant="secondary">{t.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {drawdownTxns.length === 0 && <p className="text-center py-8 text-muted-foreground">No drawdown payments</p>}
              </CardContent>
            </Card>
          </div>
        )

      case 'crystallisation':
        const totalCrystallised = bceEvents.reduce((s, e) => s + Number(e.crystallised_amount), 0)
        const totalPCLS = segments.reduce((s, seg) => s + Number(seg.pcls_amount), 0) || bceEvents.reduce((s, e) => s + Number(e.tax_free_lump_sum), 0)
        const totalLTA = bceEvents.reduce((s, e) => s + Number(e.lta_percentage), 0)
        const uncrystallised = totalValue - totalCrystallised

        // Death benefit rules
        const clientAge = client.date_of_birth
          ? Math.floor((new Date().getTime() - new Date(client.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : null
        const isOver75 = clientAge !== null && clientAge >= 75

        // PCLS calculator values
        const maxPCLS = Math.max(0, uncrystallised * 0.25)

        return (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Crystallised</p><p className="text-2xl font-bold text-primary">{formatCurrency(totalCrystallised)}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Uncrystallised</p><p className="text-2xl font-bold text-success">{formatCurrency(uncrystallised)}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">PCLS Taken</p><p className="text-2xl font-bold text-warning">{formatCurrency(totalPCLS)}</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">LTA Used</p><p className="text-2xl font-bold text-foreground">{totalLTA.toFixed(2)}%</p></CardContent></Card>
            </div>

            {/* Crystallisation progress */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Crystallisation Progress</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>Crystallised</span><span>{totalValue > 0 ? ((totalCrystallised / totalValue) * 100).toFixed(1) : 0}%</span></div>
                  <Progress value={totalValue > 0 ? (totalCrystallised / totalValue) * 100 : 0} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Crystallised: {formatCurrency(totalCrystallised)}</span>
                    <span>Uncrystallised: {formatCurrency(uncrystallised)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PCLS Calculator + Crystallise button */}
            {uncrystallised > 0 && (
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> PCLS Calculator</CardTitle>
                  <CardDescription>Calculate tax-free cash entitlement from uncrystallised funds</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-4 rounded-lg border bg-background">
                      <p className="text-xs text-muted-foreground">Uncrystallised Fund</p>
                      <p className="text-xl font-bold">{formatCurrency(uncrystallised)}</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-background">
                      <p className="text-xs text-muted-foreground">Max PCLS (25%)</p>
                      <p className="text-xl font-bold text-success">{formatCurrency(maxPCLS)}</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-background">
                      <p className="text-xs text-muted-foreground">Residual for Drawdown</p>
                      <p className="text-xl font-bold text-primary">{formatCurrency(uncrystallised - maxPCLS)}</p>
                    </div>
                  </div>
                  <Button onClick={() => {
                    setCrystalliseForm({ amount: uncrystallised, account_id: accounts.find(a => a.account_type === 'SIPP')?.id || '', drawdown_type: 'FAD' })
                    setCrystalliseDialogOpen(true)
                  }}><Target className="w-4 h-4 mr-2" /> Crystallise Now</Button>
                </CardContent>
              </Card>
            )}

            {/* Death Benefit Rules */}
            <Card className={isOver75 ? 'border-warning/30 bg-warning/5' : 'border-success/30 bg-success/5'}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5" /> Death Benefit Rules
                  {clientAge !== null && <Badge variant="outline">{isOver75 ? 'Post-75' : 'Pre-75'} (Age {clientAge})</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clientAge === null ? (
                  <p className="text-muted-foreground">Date of birth required to determine applicable rules.</p>
                ) : isOver75 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Post-75 Rules Apply</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Lump sum death benefits taxed at recipient's marginal income tax rate</li>
                      <li>Beneficiary drawdown also taxed at marginal rate</li>
                      <li>No 2-year window for tax-free treatment</li>
                      <li>Nominee/successor can inherit drawdown pot</li>
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Pre-75 Rules Apply</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Lump sum to nominees typically <strong>tax-free</strong> if paid within 2 years of death</li>
                      <li>Beneficiary drawdown: tax-free if within 2 years</li>
                      <li>After 2 years: taxed at recipient's marginal rate</li>
                      <li>Uncrystallised funds can be paid as lump sum or used for drawdown</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Segments table */}
            {segments.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" /> Crystallised Segments</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Drawdown</TableHead>
                        <TableHead className="text-right">Crystallised</TableHead><TableHead className="text-right">PCLS</TableHead>
                        <TableHead className="text-right">Residual Fund</TableHead><TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {segments.map(seg => (
                        <TableRow key={seg.id}>
                          <TableCell className="text-sm">{new Date(seg.created_at).toLocaleDateString()}</TableCell>
                          <TableCell><Badge variant="outline" className="capitalize">{seg.segment_type}</Badge></TableCell>
                          <TableCell><Badge variant={seg.drawdown_type === 'UFPLS' ? 'secondary' : 'default'}>{seg.drawdown_type}</Badge></TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(Number(seg.crystallised_amount))}</TableCell>
                          <TableCell className="text-right text-success">{formatCurrency(Number(seg.pcls_amount))}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(seg.residual_fund))}</TableCell>
                          <TableCell>
                            <Select value={seg.status} onValueChange={async v => {
                              await updateSegment(seg.id, { status: v })
                              toast.success('Segment status updated')
                            }}>
                              <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="exhausted">Exhausted</SelectItem>
                                <SelectItem value="transferred">Transferred</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* BCE Events */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" /> BCE Events</CardTitle>
                  <Button size="sm" onClick={() => { setBceForm({ bce_type: 'BCE 1', crystallised_amount: 0, lta_percentage: 0, tax_free_lump_sum: 0 }); setBceDialogOpen(true) }}>
                    <Plus className="w-4 h-4 mr-2" /> Record BCE
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Crystallised</TableHead>
                      <TableHead className="text-right">LTA %</TableHead><TableHead className="text-right">PCLS</TableHead><TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bceEvents.map(e => (
                      <TableRow key={e.id}>
                        <TableCell>{e.event_date}</TableCell>
                        <TableCell><Badge variant="outline">{e.bce_type}</Badge></TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(Number(e.crystallised_amount))}</TableCell>
                        <TableCell className="text-right">{Number(e.lta_percentage).toFixed(2)}%</TableCell>
                        <TableCell className="text-right text-success">{Number(e.tax_free_lump_sum) > 0 ? formatCurrency(Number(e.tax_free_lump_sum)) : '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{e.notes || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {bceEvents.length === 0 && <p className="text-center py-8 text-muted-foreground">No BCE events recorded</p>}
              </CardContent>
            </Card>
          </div>
        )

      case 'compliance':
        const consentTypes = ['Marketing Communications', 'Data Processing', 'Third Party Sharing', 'Electronic Statements']
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-lg">KYC / AML Status</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-success" /><div><p className="font-medium">Identity Verified</p><p className="text-xs text-muted-foreground">Passport verified via electronic check</p></div></div>
                    <Badge className="bg-success/10 text-success border-success/20">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-success" /><div><p className="font-medium">AML Screening</p><p className="text-xs text-muted-foreground">PEP & sanctions check clear</p></div></div>
                    <Badge className="bg-success/10 text-success border-success/20">Clear</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Risk & Suitability</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2"><p className="font-medium">Current Risk Profile</p>
                      <Select value={client.risk_profile || 'Moderate'} onValueChange={async v => {
                        await updateClient({ risk_profile: v })
                        toast.success(`Risk profile updated to ${v}`)
                      }}>
                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cautious">Cautious</SelectItem>
                          <SelectItem value="Moderate">Moderate</SelectItem>
                          <SelectItem value="Balanced">Balanced</SelectItem>
                          <SelectItem value="Adventurous">Adventurous</SelectItem>
                          <SelectItem value="Aggressive">Aggressive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* MPAA & Annual Allowance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-lg">MPAA Status</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Money Purchase Annual Allowance</p>
                      <p className="text-xs text-muted-foreground">Triggered when flexi-access drawdown is taken. Reduces AA to £10,000.</p>
                    </div>
                    <Switch checked={client.mpaa_triggered} onCheckedChange={async (checked) => {
                      await updateClient({ mpaa_triggered: checked } as any)
                      toast.success(`MPAA ${checked ? 'triggered' : 'cleared'}`)
                    }} />
                  </div>
                  {client.mpaa_triggered && (
                    <div className="mt-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                      <p className="text-sm text-warning font-medium">⚠ MPAA Active — Annual allowance reduced to £10,000</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Annual Allowance</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Used this tax year</span>
                      <span className="font-semibold">{formatCurrency(Number(client.annual_allowance_used) || 0)} / {formatCurrency(client.mpaa_triggered ? 10000 : 60000)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div className={`h-3 rounded-full transition-all ${((Number(client.annual_allowance_used) || 0) / (client.mpaa_triggered ? 10000 : 60000)) > 0.8 ? 'bg-destructive' : 'bg-primary'}`}
                        style={{ width: `${Math.min(100, ((Number(client.annual_allowance_used) || 0) / (client.mpaa_triggered ? 10000 : 60000)) * 100)}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">{(((Number(client.annual_allowance_used) || 0) / (client.mpaa_triggered ? 10000 : 60000)) * 100).toFixed(1)}% of allowance used</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* GDPR Consent */}
            <Card>
              <CardHeader><CardTitle className="text-lg">GDPR Consent Management</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {consentTypes.map(type => {
                    const record = consentRecords.find(r => r.consent_type === type)
                    return (
                      <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{type}</p>
                          {record && (
                            <p className="text-xs text-muted-foreground">
                              {record.granted ? `Granted ${new Date(record.granted_at).toLocaleDateString()}` : `Withdrawn ${new Date(record.withdrawn_at).toLocaleDateString()}`}
                            </p>
                          )}
                        </div>
                        <Switch checked={record?.granted || false} onCheckedChange={async (checked) => {
                          await setConsent(type, checked)
                          toast.success(`${type}: consent ${checked ? 'granted' : 'withdrawn'}`)
                        }} />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'beneficiaries':
        const totalAlloc = beneficiaries.reduce((s, b) => s + Number(b.allocation_pct), 0)
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Heart className="w-5 h-5" /> Beneficiary Nominations</CardTitle>
                  <CardDescription>Total allocation: {totalAlloc}%{totalAlloc !== 100 && <span className="text-destructive ml-2">(should be 100%)</span>}</CardDescription>
                </div>
                <Button size="sm" onClick={() => { setBenefForm({ name: '', relationship: 'Spouse', allocation_pct: 0 }); setEditingBenefId(null); setBenefDialogOpen(true) }}>
                  <Plus className="w-4 h-4 mr-2" /> Add Beneficiary
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead><TableHead>Relationship</TableHead>
                    <TableHead className="text-right">Allocation</TableHead><TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {beneficiaries.map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell><Badge variant="outline">{b.relationship}</Badge></TableCell>
                      <TableCell className="text-right font-semibold">{Number(b.allocation_pct)}%</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setBenefForm({ name: b.name, relationship: b.relationship, allocation_pct: Number(b.allocation_pct) })
                            setEditingBenefId(b.id)
                            setBenefDialogOpen(true)
                          }}><Edit className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={async () => {
                            await deleteBeneficiary(b.id)
                            toast.success('Beneficiary removed')
                          }}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {beneficiaries.length === 0 && <p className="text-center py-8 text-muted-foreground">No beneficiaries nominated</p>}
            </CardContent>
          </Card>
        )

      case 'notes':
        return (
          <Card>
            <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Notes feature uses the activity log for audit trail.</p>
            </CardContent>
          </Card>
        )

      case 'activity':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Activity Log</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => fetchLogs()}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    downloadCSV(`activity-log-${clientId}`,
                      ['Date', 'Action', 'Description', 'User'],
                      activityLog.map((l: any) => [l.created_at, l.action, l.description, l.performed_by])
                    )
                    toast.success('Activity log exported')
                  }}><Download className="w-4 h-4 mr-2" /> Export</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead><TableHead>Action</TableHead>
                    <TableHead>Description</TableHead><TableHead className="text-right">User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLog.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</TableCell>
                      <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                      <TableCell className="text-sm">{log.description}</TableCell>
                      <TableCell className="text-sm text-right text-muted-foreground">{log.performed_by}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {activityLog.length === 0 && <p className="text-center py-8 text-muted-foreground">No activity recorded yet</p>}
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
                  <div className="flex items-center gap-3"><Shield className="w-4 h-4 text-muted-foreground" /><div><p className="font-medium text-sm">Client Status</p></div></div>
                  <Select value={client.status} onValueChange={async v => {
                    await updateClient({ status: v })
                    toast.success(`Status changed to ${v}`)
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
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  setPersonalForm(client); setEditingPersonal(true)
                }}><User className="w-4 h-4 mr-2" /> Edit Client Details</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  downloadCSV(`gdpr-export-${clientId}`,
                    ['Field', 'Value'],
                    Object.entries(client).filter(([k]) => !['id', 'created_at', 'updated_at'].includes(k)).map(([k, v]) => [k, String(v || '')])
                  )
                  toast.success('GDPR data export complete')
                }}><Download className="w-4 h-4 mr-2" /> Export All Data (GDPR)</Button>
                <Button variant="destructive" className="w-full justify-start" onClick={async () => {
                  await updateClient({ status: 'closed' })
                  toast.success('Account closure initiated')
                }}><Ban className="w-4 h-4 mr-2" /> Close Account</Button>
              </CardContent>
            </Card>
          </div>
        )

      default: return null
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
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{clientName}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="default">{client.status}</Badge>
                  <Badge variant="outline">{client.risk_profile} risk</Badge>
                  <Badge variant="secondary">Adviser: {client.adviser || 'Unassigned'}</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => {
                downloadCSV(`client-export-${clientId}`, ['Field', 'Value'],
                  Object.entries(client).filter(([k]) => !['id', 'created_at', 'updated_at'].includes(k)).map(([k, v]) => [k, String(v || '')])
                )
                toast.success('Client data exported')
              }}><Download className="w-4 h-4 mr-2" /> Export</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Portfolio</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</div><p className="text-xs text-muted-foreground">{accounts.length} accounts</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Transactions</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-foreground">{transactions.length}</div><p className="text-xs text-muted-foreground">total records</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Investments</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-foreground">{investments.length}</div><p className="text-xs text-muted-foreground">holdings</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Status</CardTitle></CardHeader>
            <CardContent><div className="text-lg font-bold capitalize text-success">{client.status}</div><p className="text-xs text-muted-foreground">Since {new Date(client.created_at).toLocaleDateString()}</p></CardContent></Card>
        </div>

        <SidebarNavLayout groups={navGroups} activeTab={activeTab} onTabChange={setActiveTab}>
          {renderContent()}
        </SidebarNavLayout>
      </div>

      {/* ── DIALOGS ── */}

      {/* Edit Personal Details */}
      <FormDialog open={editingPersonal} onClose={() => setEditingPersonal(false)} title="Edit Client Details" onSave={async () => {
        await updateClient(personalForm)
        toast.success('Client details updated')
      }}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Title</Label>
            <Select value={personalForm.title || 'Mr'} onValueChange={v => setPersonalForm(p => ({ ...p, title: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Mr">Mr</SelectItem><SelectItem value="Mrs">Mrs</SelectItem>
                <SelectItem value="Ms">Ms</SelectItem><SelectItem value="Dr">Dr</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>First Name</Label><Input value={personalForm.first_name || ''} onChange={e => setPersonalForm(p => ({ ...p, first_name: e.target.value }))} /></div>
        </div>
        <div className="space-y-1"><Label>Last Name</Label><Input value={personalForm.last_name || ''} onChange={e => setPersonalForm(p => ({ ...p, last_name: e.target.value }))} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Email</Label><Input value={personalForm.email || ''} onChange={e => setPersonalForm(p => ({ ...p, email: e.target.value }))} /></div>
          <div className="space-y-1"><Label>Phone</Label><Input value={personalForm.phone || ''} onChange={e => setPersonalForm(p => ({ ...p, phone: e.target.value }))} /></div>
        </div>
        <div className="space-y-1"><Label>Address</Label><Input value={personalForm.address_line1 || ''} onChange={e => setPersonalForm(p => ({ ...p, address_line1: e.target.value }))} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>City</Label><Input value={personalForm.city || ''} onChange={e => setPersonalForm(p => ({ ...p, city: e.target.value }))} /></div>
          <div className="space-y-1"><Label>Postcode</Label><Input value={personalForm.postcode || ''} onChange={e => setPersonalForm(p => ({ ...p, postcode: e.target.value }))} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>NI Number</Label><Input value={personalForm.ni_number || ''} onChange={e => setPersonalForm(p => ({ ...p, ni_number: e.target.value }))} /></div>
          <div className="space-y-1"><Label>Date of Birth</Label><Input type="date" value={personalForm.date_of_birth || ''} onChange={e => setPersonalForm(p => ({ ...p, date_of_birth: e.target.value }))} /></div>
        </div>
        <div className="space-y-1"><Label>Adviser</Label>
          <Select value={personalForm.adviser || ''} onValueChange={v => setPersonalForm(p => ({ ...p, adviser: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
              <SelectItem value="Mark Williams">Mark Williams</SelectItem>
              <SelectItem value="Jennifer Davis">Jennifer Davis</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FormDialog>

      {/* Add Account */}
      <FormDialog open={accountDialogOpen} onClose={() => setAccountDialogOpen(false)} title="Open New Account" onSave={async () => {
        const accNum = `${accountForm.type}-${String(Date.now()).slice(-6)}`
        await addAccount({ account_type: accountForm.type, account_number: accNum, status: 'active', cash_balance: 0, total_value: 0 })
        toast.success(`${accountForm.type} account opened`)
      }}>
        <div className="space-y-1"><Label>Account Type</Label>
          <Select value={accountForm.type} onValueChange={v => setAccountForm(p => ({ ...p, type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SIPP">SIPP</SelectItem>
              <SelectItem value="ISA">ISA</SelectItem>
              <SelectItem value="GIA">GIA</SelectItem>
              <SelectItem value="SSAS">SSAS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FormDialog>

      {/* Add Transaction */}
      <FormDialog open={txnDialogOpen} onClose={() => { setTxnDialogOpen(false); setEditingTxnId(null) }} title="Add Transaction" description="Process a contribution, withdrawal, transfer, or other transaction"
        onSave={async () => {
          const sign = ['contribution', 'transfer_in', 'dividend', 'sell', 'tax_relief', 'employer_contribution'].includes(txnForm.type) ? 1 : -1
          const taxRelief = txnForm.type === 'contribution' ? txnForm.amount * 0.25 : 0
          const ref = `${txnForm.type.toUpperCase().slice(0, 4)}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`
          await addTransaction({
            account_id: txnForm.account_id,
            transaction_type: txnForm.type,
            description: txnForm.description,
            amount: txnForm.amount * sign,
            reference: ref,
            status: 'pending',
            effective_date: new Date().toISOString().split('T')[0],
            tax_year: '2024/25',
            tax_relief_amount: taxRelief,
          })
          toast.success('Transaction processed')
        }} saveLabel="Process" saveDisabled={!txnForm.description || !txnForm.amount || !txnForm.account_id}>
        <div className="space-y-1"><Label>Transaction Type</Label>
          <Select value={txnForm.type} onValueChange={v => setTxnForm(p => ({ ...p, type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="contribution">Contribution</SelectItem>
              <SelectItem value="employer_contribution">Employer Contribution</SelectItem>
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
        <div className="space-y-1"><Label>Account</Label>
          <Select value={txnForm.account_id} onValueChange={v => setTxnForm(p => ({ ...p, account_id: v }))}>
            <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
            <SelectContent>
              {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.account_type} ({a.account_number})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>Description</Label><Input value={txnForm.description} onChange={e => setTxnForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Monthly contribution" /></div>
        <div className="space-y-1"><Label>Amount (£)</Label><Input type="number" step="0.01" value={txnForm.amount || ''} onChange={e => setTxnForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} /></div>
      </FormDialog>

      {/* Add Investment */}
      <FormDialog open={invDialogOpen} onClose={() => setInvDialogOpen(false)} title="Add Investment" onSave={async () => {
        const value = invForm.units * invForm.unit_price
        await addInvestment({
          account_id: invForm.account_id,
          fund_name: invForm.fund_name,
          isin: invForm.isin,
          sedol: invForm.sedol,
          units: invForm.units,
          unit_price: invForm.unit_price,
          current_value: value,
          cost_basis: value,
        })
        toast.success('Investment added')
      }} saveDisabled={!invForm.fund_name || !invForm.account_id}>
        <div className="space-y-1"><Label>Account</Label>
          <Select value={invForm.account_id} onValueChange={v => setInvForm(p => ({ ...p, account_id: v }))}>
            <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
            <SelectContent>
              {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.account_type} ({a.account_number})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>Fund Name</Label><Input value={invForm.fund_name} onChange={e => setInvForm(p => ({ ...p, fund_name: e.target.value }))} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>ISIN</Label><Input value={invForm.isin} onChange={e => setInvForm(p => ({ ...p, isin: e.target.value }))} /></div>
          <div className="space-y-1"><Label>SEDOL</Label><Input value={invForm.sedol} onChange={e => setInvForm(p => ({ ...p, sedol: e.target.value }))} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Units</Label><Input type="number" step="0.0001" value={invForm.units || ''} onChange={e => setInvForm(p => ({ ...p, units: parseFloat(e.target.value) || 0 }))} /></div>
          <div className="space-y-1"><Label>Unit Price (£)</Label><Input type="number" step="0.01" value={invForm.unit_price || ''} onChange={e => setInvForm(p => ({ ...p, unit_price: parseFloat(e.target.value) || 0 }))} /></div>
        </div>
      </FormDialog>

      {/* Add Beneficiary */}
      <FormDialog open={benefDialogOpen} onClose={() => { setBenefDialogOpen(false); setEditingBenefId(null) }} title={editingBenefId ? 'Edit Beneficiary' : 'Add Beneficiary'} onSave={async () => {
        if (editingBenefId) {
          await updateBeneficiary(editingBenefId, benefForm)
          toast.success('Beneficiary updated')
        } else {
          await addBeneficiary(benefForm)
          toast.success('Beneficiary added')
        }
      }} saveDisabled={!benefForm.name || !benefForm.allocation_pct}>
        <div className="space-y-1"><Label>Name</Label><Input value={benefForm.name} onChange={e => setBenefForm(p => ({ ...p, name: e.target.value }))} /></div>
        <div className="space-y-1"><Label>Relationship</Label>
          <Select value={benefForm.relationship} onValueChange={v => setBenefForm(p => ({ ...p, relationship: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Spouse">Spouse</SelectItem><SelectItem value="Partner">Partner</SelectItem>
              <SelectItem value="Son">Son</SelectItem><SelectItem value="Daughter">Daughter</SelectItem>
              <SelectItem value="Parent">Parent</SelectItem><SelectItem value="Sibling">Sibling</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>Allocation %</Label><Input type="number" step="0.5" value={benefForm.allocation_pct || ''} onChange={e => setBenefForm(p => ({ ...p, allocation_pct: parseFloat(e.target.value) || 0 }))} /></div>
      </FormDialog>

      {/* Add BCE */}
      <FormDialog open={bceDialogOpen} onClose={() => setBceDialogOpen(false)} title="Record BCE Event" onSave={async () => {
        await addBCE({ ...bceForm, event_date: new Date().toISOString().split('T')[0] })
        toast.success('BCE event recorded')
      }} saveDisabled={!bceForm.crystallised_amount}>
        <div className="space-y-1"><Label>BCE Type</Label>
          <Select value={bceForm.bce_type} onValueChange={v => setBceForm(p => ({ ...p, bce_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="BCE 1">BCE 1 - Pension Commencement</SelectItem>
              <SelectItem value="BCE 2">BCE 2 - Scheme Pension</SelectItem>
              <SelectItem value="BCE 5">BCE 5 - Reaching Age 75</SelectItem>
              <SelectItem value="BCE 6">BCE 6 - PCLS</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>Crystallised Amount (£)</Label><Input type="number" step="0.01" value={bceForm.crystallised_amount || ''} onChange={e => setBceForm(p => ({ ...p, crystallised_amount: parseFloat(e.target.value) || 0 }))} /></div>
        <div className="space-y-1"><Label>LTA Percentage</Label><Input type="number" step="0.01" value={bceForm.lta_percentage || ''} onChange={e => setBceForm(p => ({ ...p, lta_percentage: parseFloat(e.target.value) || 0 }))} /></div>
        <div className="space-y-1"><Label>Tax-Free Lump Sum (£)</Label><Input type="number" step="0.01" value={bceForm.tax_free_lump_sum || ''} onChange={e => setBceForm(p => ({ ...p, tax_free_lump_sum: parseFloat(e.target.value) || 0 }))} /></div>
      </FormDialog>

      {/* New Transfer */}
      <FormDialog open={transferDialogOpen} onClose={() => setTransferDialogOpen(false)} title="Record Transfer" onSave={async () => {
        const sign = transferForm.direction === 'in' ? 1 : -1
        const ref = `TRF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`
        await addTransaction({
          account_id: transferForm.account_id,
          transaction_type: transferForm.direction === 'in' ? 'transfer_in' : 'transfer_out',
          description: `${transferForm.type} transfer ${transferForm.direction} - ${transferForm.cedingScheme}`,
          amount: transferForm.amount * sign,
          reference: ref,
          status: 'pending',
          effective_date: new Date().toISOString().split('T')[0],
        })
        toast.success('Transfer recorded')
      }} saveDisabled={!transferForm.cedingScheme || !transferForm.amount || !transferForm.account_id}>
        <div className="space-y-1"><Label>Direction</Label>
          <Select value={transferForm.direction} onValueChange={v => setTransferForm(p => ({ ...p, direction: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="in">Transfer In</SelectItem><SelectItem value="out">Transfer Out</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>Account</Label>
          <Select value={transferForm.account_id} onValueChange={v => setTransferForm(p => ({ ...p, account_id: v }))}>
            <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
            <SelectContent>
              {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.account_type} ({a.account_number})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>{transferForm.direction === 'in' ? 'Ceding Scheme' : 'Receiving Scheme'}</Label>
          <Input value={transferForm.cedingScheme} onChange={e => setTransferForm(p => ({ ...p, cedingScheme: e.target.value }))} placeholder="e.g. Aviva Pension" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Amount (£)</Label><Input type="number" step="0.01" value={transferForm.amount || ''} onChange={e => setTransferForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} /></div>
          <div className="space-y-1"><Label>Type</Label>
            <Select value={transferForm.type} onValueChange={v => setTransferForm(p => ({ ...p, type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="full">Full Transfer</SelectItem><SelectItem value="partial">Partial Transfer</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
      </FormDialog>

      {/* Crystallise Now */}
      <FormDialog open={crystalliseDialogOpen} onClose={() => setCrystalliseDialogOpen(false)} title="Crystallise Funds" description="Designate funds for drawdown with 25% PCLS"
        onSave={async () => {
          const pcls = crystalliseForm.amount * 0.25
          const residual = crystalliseForm.amount * 0.75
          // Create BCE event
          const bce = await addBCE({
            bce_type: 'BCE 1',
            crystallised_amount: crystalliseForm.amount,
            tax_free_lump_sum: pcls,
            lta_percentage: 0,
            event_date: new Date().toISOString().split('T')[0],
            notes: `${crystalliseForm.drawdown_type} crystallisation — PCLS: £${pcls.toFixed(2)}, Residual: £${residual.toFixed(2)}`,
          })
          if (bce) {
            await addSegment({
              account_id: crystalliseForm.account_id,
              bce_event_id: bce.id,
              segment_type: 'designated',
              crystallised_amount: crystalliseForm.amount,
              pcls_amount: pcls,
              residual_fund: residual,
              drawdown_type: crystalliseForm.drawdown_type,
              status: 'active',
            })
            toast.success(`£${crystalliseForm.amount.toLocaleString()} crystallised — PCLS: £${pcls.toLocaleString()}`)
          }
        }} saveLabel="Crystallise" saveDisabled={!crystalliseForm.amount || !crystalliseForm.account_id}>
        <div className="space-y-1"><Label>Account</Label>
          <Select value={crystalliseForm.account_id} onValueChange={v => setCrystalliseForm(p => ({ ...p, account_id: v }))}>
            <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
            <SelectContent>
              {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.account_type} ({a.account_number})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>Amount to Crystallise (£)</Label><Input type="number" step="0.01" value={crystalliseForm.amount || ''} onChange={e => setCrystalliseForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} /></div>
        {crystalliseForm.amount > 0 && (
          <div className="grid grid-cols-2 gap-4 p-3 rounded-lg border bg-muted/50">
            <div><p className="text-xs text-muted-foreground">PCLS (25%)</p><p className="font-bold text-success">{formatCurrency(crystalliseForm.amount * 0.25)}</p></div>
            <div><p className="text-xs text-muted-foreground">Residual Fund (75%)</p><p className="font-bold text-primary">{formatCurrency(crystalliseForm.amount * 0.75)}</p></div>
          </div>
        )}
        <div className="space-y-1"><Label>Drawdown Type</Label>
          <Select value={crystalliseForm.drawdown_type} onValueChange={v => setCrystalliseForm(p => ({ ...p, drawdown_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="FAD">Flexi-Access Drawdown (FAD)</SelectItem>
              <SelectItem value="none">No Drawdown (PCLS only)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FormDialog>

      {/* UFPLS Processing */}
      <FormDialog open={ufplsDialogOpen} onClose={() => setUfplsDialogOpen(false)} title="Process UFPLS" description="Uncrystallised Funds Pension Lump Sum — 25% tax-free, 75% taxable"
        onSave={async () => {
          const taxFree = ufplsForm.amount * 0.25
          const taxable = ufplsForm.amount * 0.75
          // Create BCE event
          const bce = await addBCE({
            bce_type: 'BCE 1',
            crystallised_amount: ufplsForm.amount,
            tax_free_lump_sum: taxFree,
            lta_percentage: 0,
            event_date: new Date().toISOString().split('T')[0],
            notes: `UFPLS: £${ufplsForm.amount.toFixed(2)} (Tax-free: £${taxFree.toFixed(2)}, Taxable: £${taxable.toFixed(2)})`,
          })
          if (bce) {
            // Create segment
            await addSegment({
              account_id: ufplsForm.account_id,
              bce_event_id: bce.id,
              segment_type: 'undesignated',
              crystallised_amount: ufplsForm.amount,
              pcls_amount: taxFree,
              residual_fund: 0,
              drawdown_type: 'UFPLS',
              status: 'exhausted',
            })
            // Create transaction
            await addTransaction({
              account_id: ufplsForm.account_id,
              transaction_type: 'ufpls',
              description: ufplsForm.description,
              amount: -ufplsForm.amount,
              reference: `UFPLS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
              status: 'pending',
              effective_date: new Date().toISOString().split('T')[0],
              notes: `Tax-free: £${taxFree.toFixed(2)} | Taxable: £${taxable.toFixed(2)}`,
            })
            toast.success(`UFPLS of £${ufplsForm.amount.toLocaleString()} processed`)
          }
        }} saveLabel="Process UFPLS" saveDisabled={!ufplsForm.amount || !ufplsForm.account_id}>
        <div className="space-y-1"><Label>Account</Label>
          <Select value={ufplsForm.account_id} onValueChange={v => setUfplsForm(p => ({ ...p, account_id: v }))}>
            <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
            <SelectContent>
              {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.account_type} ({a.account_number})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>UFPLS Amount (£)</Label><Input type="number" step="0.01" value={ufplsForm.amount || ''} onChange={e => setUfplsForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} /></div>
        {ufplsForm.amount > 0 && (
          <div className="grid grid-cols-2 gap-4 p-3 rounded-lg border bg-warning/10">
            <div><p className="text-xs text-muted-foreground">Tax-Free (25%)</p><p className="font-bold text-success">{formatCurrency(ufplsForm.amount * 0.25)}</p></div>
            <div><p className="text-xs text-muted-foreground">Taxable (75%)</p><p className="font-bold text-destructive">{formatCurrency(ufplsForm.amount * 0.75)}</p></div>
          </div>
        )}
        <div className="space-y-1"><Label>Description</Label><Input value={ufplsForm.description} onChange={e => setUfplsForm(p => ({ ...p, description: e.target.value }))} /></div>
        <div className="p-3 rounded-lg border bg-muted/50 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">⚠️ UFPLS triggers MPAA</p>
          <p>Taking a UFPLS will trigger the Money Purchase Annual Allowance, reducing the client's annual allowance to £10,000 for future contributions.</p>
        </div>
      </FormDialog>
    </div>
  )
}
