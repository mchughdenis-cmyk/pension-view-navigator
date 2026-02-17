import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import {
  Receipt,
  Plus,
  Edit,
  Percent,
  DollarSign,
  Calculator,
  Download,
  Settings,
  TrendingUp,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { FeeDialog, ConfirmDialog, type FeeFormData } from './AdminDialogs'
import { downloadCSV } from '@/lib/adminExportUtils'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }).format(amount)

const initialFeeSchedules = [
  { id: 1, name: 'Standard Platform Fee', type: 'ad_valorem', rate: 0.25, frequency: 'quarterly', wrapper: 'All', minFee: 25, maxFee: null, active: true },
  { id: 2, name: 'SIPP Administration Fee', type: 'flat', rate: 150, frequency: 'annual', wrapper: 'SIPP', minFee: null, maxFee: null, active: true },
  { id: 3, name: 'Dealing Fee', type: 'per_transaction', rate: 9.99, frequency: 'per_trade', wrapper: 'All', minFee: null, maxFee: null, active: true },
  { id: 4, name: 'Drawdown Setup', type: 'one_off', rate: 295, frequency: 'one_off', wrapper: 'SIPP', minFee: null, maxFee: null, active: true },
  { id: 5, name: 'Transfer Out Fee', type: 'one_off', rate: 0, frequency: 'one_off', wrapper: 'All', minFee: null, maxFee: null, active: false },
  { id: 6, name: 'Tiered Platform Fee', type: 'tiered', rate: 0, frequency: 'quarterly', wrapper: 'All', minFee: null, maxFee: null, active: true },
]

const tieredRates = [
  { from: 0, to: 250000, rate: 0.35 },
  { from: 250000, to: 500000, rate: 0.25 },
  { from: 500000, to: 1000000, rate: 0.15 },
  { from: 1000000, to: null, rate: 0.10 },
]

const feeHistory = [
  { id: 1, date: '2024-01-01', client: 'John Smith', schedule: 'Standard Platform Fee', account: 'SIPP', aum: 287450, amount: 179.66, status: 'collected' },
  { id: 2, date: '2024-01-01', client: 'John Smith', schedule: 'Standard Platform Fee', account: 'ISA', amount: 54.78, aum: 87650, status: 'collected' },
  { id: 3, date: '2024-01-01', client: 'Emma Wilson', schedule: 'Standard Platform Fee', account: 'SIPP', amount: 203.13, aum: 325000, status: 'collected' },
  { id: 4, date: '2024-01-14', client: 'John Smith', schedule: 'Dealing Fee', account: 'ISA', amount: 9.99, aum: null, status: 'collected' },
  { id: 5, date: '2024-01-01', client: 'David Thompson', schedule: 'SIPP Administration Fee', account: 'SIPP', amount: 37.50, aum: null, status: 'pending' },
  { id: 6, date: '2024-01-01', client: 'Lisa Anderson', schedule: 'Standard Platform Fee', account: 'SIPP', amount: 121.88, aum: 195000, status: 'failed' },
]

const typeLabels: Record<string, string> = {
  ad_valorem: 'Ad Valorem (%)', flat: 'Flat Fee', per_transaction: 'Per Transaction', one_off: 'One-Off', tiered: 'Tiered',
}

export default function FeeEngine() {
  const [activeTab, setActiveTab] = useState<'schedules' | 'history' | 'tiers'>('schedules')
  const [feeSchedules, setFeeSchedules] = useState(initialFeeSchedules)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<(typeof initialFeeSchedules[0]) | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const totalCollected = feeHistory.filter(f => f.status === 'collected').reduce((s, f) => s + f.amount, 0)
  const totalPending = feeHistory.filter(f => f.status === 'pending').reduce((s, f) => s + f.amount, 0)

  const handleToggle = (id: number) => {
    setFeeSchedules(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f))
    const fee = feeSchedules.find(f => f.id === id)
    toast.success(`${fee?.name} ${fee?.active ? 'deactivated' : 'activated'}`)
  }

  const handleAdd = (data: FeeFormData) => {
    const newId = Math.max(...feeSchedules.map(f => f.id)) + 1
    setFeeSchedules(prev => [...prev, { id: newId, ...data, minFee: null, maxFee: null }])
    toast.success(`Fee schedule "${data.name}" created`)
  }

  const handleEdit = (data: FeeFormData) => {
    if (!editingFee) return
    setFeeSchedules(prev => prev.map(f => f.id === editingFee.id ? { ...f, ...data } : f))
    toast.success(`Fee schedule "${data.name}" updated`)
    setEditingFee(null)
  }

  const handleDelete = (id: number) => {
    const fee = feeSchedules.find(f => f.id === id)
    setFeeSchedules(prev => prev.filter(f => f.id !== id))
    toast.success(`"${fee?.name}" deleted`)
  }

  const handleExportHistory = () => {
    downloadCSV('fee-billing-history',
      ['Date', 'Client', 'Schedule', 'Account', 'AUM', 'Amount', 'Status'],
      feeHistory.map(f => [f.date, f.client, f.schedule, f.account, f.aum, f.amount, f.status])
    )
    toast.success('Billing history exported')
  }

  const handleRunFeeCalc = () => {
    toast.success('Fee calculation started — processing 1,247 client accounts', { description: 'Estimated completion: 2 minutes' })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Fee Schedules</p><p className="text-2xl font-bold text-foreground">{feeSchedules.filter(f => f.active).length}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Collected (Period)</p><p className="text-2xl font-bold text-success">{formatCurrency(totalCollected)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pending Collection</p><p className="text-2xl font-bold text-warning">{formatCurrency(totalPending)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Failed</p><p className="text-2xl font-bold text-destructive">{feeHistory.filter(f => f.status === 'failed').length}</p></CardContent></Card>
      </div>

      <div className="flex gap-2">
        <Button variant={activeTab === 'schedules' ? 'default' : 'outline'} onClick={() => setActiveTab('schedules')}><Settings className="w-4 h-4 mr-2" /> Fee Schedules</Button>
        <Button variant={activeTab === 'tiers' ? 'default' : 'outline'} onClick={() => setActiveTab('tiers')}><TrendingUp className="w-4 h-4 mr-2" /> Tiered Rates</Button>
        <Button variant={activeTab === 'history' ? 'default' : 'outline'} onClick={() => setActiveTab('history')}><Receipt className="w-4 h-4 mr-2" /> Billing History</Button>
      </div>

      {activeTab === 'schedules' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div><CardTitle>Fee Schedules</CardTitle><CardDescription>Configure platform, administration, and transaction fees</CardDescription></div>
              <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Schedule</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feeSchedules.map(fee => (
                <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {fee.type === 'ad_valorem' || fee.type === 'tiered' ? <Percent className="w-5 h-5 text-primary" /> : <DollarSign className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <p className="font-semibold">{fee.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{typeLabels[fee.type]}</Badge>
                        <Badge variant="secondary" className="text-xs">{fee.wrapper}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {fee.type === 'ad_valorem' ? `${fee.rate}% p.a.` : fee.type === 'tiered' ? 'See tiers' : formatCurrency(fee.rate)}
                        </span>
                        {fee.frequency !== 'one_off' && fee.frequency !== 'per_trade' && (
                          <span className="text-xs text-muted-foreground capitalize">• {fee.frequency}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={fee.active} onCheckedChange={() => handleToggle(fee.id)} />
                    <Button variant="outline" size="sm" onClick={() => setEditingFee(fee)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(fee.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'tiers' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div><CardTitle>Tiered Rate Schedule</CardTitle><CardDescription>Platform fees based on assets under management bands</CardDescription></div>
              <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Tier</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Rate (% p.a.)</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {tieredRates.map((tier, i) => (
                  <TableRow key={i}>
                    <TableCell>{formatCurrency(tier.from)}</TableCell>
                    <TableCell>{tier.to ? formatCurrency(tier.to) : '∞'}</TableCell>
                    <TableCell className="font-semibold">{tier.rate}%</TableCell>
                    <TableCell><Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 p-3 bg-accent/30 rounded-lg">
              <p className="text-sm font-medium">Example: £400,000 portfolio</p>
              <p className="text-xs text-muted-foreground mt-1">First £250,000 @ 0.35% = £875 + Next £150,000 @ 0.25% = £375 = <strong>£1,250 p.a.</strong> (effective rate: 0.3125%)</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Billing History</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRunFeeCalc}><Calculator className="w-4 h-4 mr-2" /> Run Fee Calc</Button>
                <Button variant="outline" size="sm" onClick={handleExportHistory}><Download className="w-4 h-4 mr-2" /> Export</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Client</TableHead><TableHead>Fee Schedule</TableHead><TableHead>Account</TableHead><TableHead className="text-right">AUM</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {feeHistory.map(f => (
                  <TableRow key={f.id}>
                    <TableCell className="text-sm">{f.date}</TableCell>
                    <TableCell className="font-medium">{f.client}</TableCell>
                    <TableCell className="text-sm">{f.schedule}</TableCell>
                    <TableCell><Badge variant="outline">{f.account}</Badge></TableCell>
                    <TableCell className="text-right text-sm">{f.aum ? formatCurrency(f.aum) : '-'}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(f.amount)}</TableCell>
                    <TableCell><Badge variant={f.status === 'collected' ? 'default' : f.status === 'pending' ? 'secondary' : 'destructive'}>{f.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <FeeDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleAdd} mode="add" />
      <FeeDialog open={!!editingFee} onClose={() => setEditingFee(null)} onSave={handleEdit} mode="edit" initial={editingFee || undefined} />
      <ConfirmDialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} onConfirm={() => deleteConfirm !== null && handleDelete(deleteConfirm)} title="Delete Fee Schedule" description="This will permanently remove this fee schedule." variant="destructive" />
    </div>
  )
}
