import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Search,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Receipt,
  TrendingUp,
  DollarSign,
  Banknote,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { downloadCSV } from '@/lib/adminExportUtils'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }).format(amount)

const transactions = [
  { id: 'TXN-001', date: '2024-01-15 14:30', client: 'John Smith', account: 'SIPP', type: 'contribution', description: 'Monthly contribution', amount: 1000, balance: 287450, status: 'settled', reference: 'CONT-2024-0115' },
  { id: 'TXN-002', date: '2024-01-15 11:15', client: 'Emma Wilson', account: 'SIPP', type: 'transfer_in', description: 'Pension transfer from Aviva', amount: 25000, balance: 325000, status: 'pending', reference: 'TRF-2024-0115' },
  { id: 'TXN-003', date: '2024-01-15 09:45', client: 'David Thompson', account: 'SIPP', type: 'drawdown', description: 'Monthly drawdown payment', amount: -3000, balance: 747000, status: 'settled', reference: 'DWN-2024-0115' },
  { id: 'TXN-004', date: '2024-01-14 16:00', client: 'John Smith', account: 'ISA', type: 'buy', description: 'Buy Vanguard FTSE All-World ETF', amount: -5000, balance: 82650, status: 'settled', reference: 'BUY-2024-0114' },
  { id: 'TXN-005', date: '2024-01-14 10:30', client: 'Lisa Anderson', account: 'GIA', type: 'dividend', description: 'Dividend - iShares UK Equity', amount: 342.50, balance: 195342, status: 'settled', reference: 'DIV-2024-0114' },
  { id: 'TXN-006', date: '2024-01-13 15:20', client: 'David Thompson', account: 'SIPP', type: 'fee', description: 'Platform fee Q4 2023', amount: -187.50, balance: 750000, status: 'settled', reference: 'FEE-2024-0113' },
  { id: 'TXN-007', date: '2024-01-13 09:00', client: 'Emma Wilson', account: 'ISA', type: 'contribution', description: 'ISA subscription 2023/24', amount: 10000, balance: 85000, status: 'settled', reference: 'CONT-2024-0113' },
  { id: 'TXN-008', date: '2024-01-12 14:15', client: 'John Smith', account: 'SIPP', type: 'sell', description: 'Sell Fundsmith Equity Fund', amount: 8500, balance: 286450, status: 'settled', reference: 'SEL-2024-0112' },
  { id: 'TXN-009', date: '2024-01-12 11:00', client: 'Lisa Anderson', account: 'SIPP', type: 'tax_relief', description: 'HMRC basic rate tax relief', amount: 250, balance: 195000, status: 'pending', reference: 'TAX-2024-0112' },
  { id: 'TXN-010', date: '2024-01-11 16:30', client: 'David Thompson', account: 'GIA', type: 'withdrawal', description: 'Ad-hoc withdrawal to bank', amount: -15000, balance: 135200, status: 'settled', reference: 'WDR-2024-0111' },
]

const typeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  contribution: { label: 'Contribution', color: 'bg-success/10 text-success border-success/20', icon: ArrowDownLeft },
  transfer_in: { label: 'Transfer In', color: 'bg-primary/10 text-primary border-primary/20', icon: RefreshCw },
  drawdown: { label: 'Drawdown', color: 'bg-warning/10 text-warning border-warning/20', icon: ArrowUpRight },
  buy: { label: 'Buy', color: 'bg-primary/10 text-primary border-primary/20', icon: TrendingUp },
  sell: { label: 'Sell', color: 'bg-accent/10 text-accent-foreground border-accent/20', icon: DollarSign },
  dividend: { label: 'Dividend', color: 'bg-success/10 text-success border-success/20', icon: Banknote },
  fee: { label: 'Fee', color: 'bg-muted text-muted-foreground border-muted', icon: Receipt },
  tax_relief: { label: 'Tax Relief', color: 'bg-success/10 text-success border-success/20', icon: Receipt },
  withdrawal: { label: 'Withdrawal', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: ArrowUpRight },
}

export default function TransactionLedger() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [accountFilter, setAccountFilter] = useState('all')
  const [txnData, setTxnData] = useState(transactions)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [txnForm, setTxnForm] = useState({ client: 'John Smith', account: 'SIPP', type: 'contribution', description: '', amount: 0 })

  const filtered = txnData.filter(t => {
    const matchesSearch = t.client.toLowerCase().includes(searchTerm.toLowerCase()) || t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.reference.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || t.type === typeFilter
    const matchesAccount = accountFilter === 'all' || t.account === accountFilter
    return matchesSearch && matchesType && matchesAccount
  })

  const totalIn = filtered.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const totalOut = filtered.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)

  const handleExport = () => {
    downloadCSV('transaction-ledger',
      ['Date', 'Reference', 'Client', 'Account', 'Type', 'Description', 'Amount', 'Balance', 'Status'],
      filtered.map(t => [t.date, t.reference, t.client, t.account, typeConfig[t.type]?.label || t.type, t.description, t.amount, t.balance, t.status])
    )
    toast.success('Transaction ledger exported as CSV')
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Transactions</p><p className="text-2xl font-bold text-foreground">{filtered.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Inflows</p><p className="text-2xl font-bold text-success">{formatCurrency(totalIn)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Outflows</p><p className="text-2xl font-bold text-destructive">{formatCurrency(totalOut)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Net Flow</p><p className={`text-2xl font-bold ${totalIn - totalOut >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(totalIn - totalOut)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle className="flex items-center gap-2"><Receipt className="w-5 h-5" /> Transaction Ledger</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search transactions..." className="pl-10 w-56" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="contribution">Contributions</SelectItem>
                  <SelectItem value="drawdown">Drawdowns</SelectItem>
                  <SelectItem value="buy">Buys</SelectItem>
                  <SelectItem value="sell">Sells</SelectItem>
                  <SelectItem value="dividend">Dividends</SelectItem>
                  <SelectItem value="fee">Fees</SelectItem>
                  <SelectItem value="transfer_in">Transfers In</SelectItem>
                  <SelectItem value="withdrawal">Withdrawals</SelectItem>
                  <SelectItem value="tax_relief">Tax Relief</SelectItem>
                </SelectContent>
              </Select>
              <Select value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Account" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  <SelectItem value="SIPP">SIPP</SelectItem>
                  <SelectItem value="ISA">ISA</SelectItem>
                  <SelectItem value="GIA">GIA</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
              <Button size="sm" onClick={() => { setTxnForm({ client: 'John Smith', account: 'SIPP', type: 'contribution', description: '', amount: 0 }); setAddDialogOpen(true) }}>
                <Plus className="w-4 h-4 mr-2" /> Add Transaction
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(txn => {
                  const config = typeConfig[txn.type] || typeConfig.contribution
                  const Icon = config.icon
                  return (
                    <TableRow key={txn.id} className="cursor-pointer hover:bg-accent/50">
                      <TableCell className="text-xs whitespace-nowrap">{txn.date}</TableCell>
                      <TableCell className="text-xs font-mono">{txn.reference}</TableCell>
                      <TableCell className="font-medium">{txn.client}</TableCell>
                      <TableCell><Badge variant="outline">{txn.account}</Badge></TableCell>
                      <TableCell>
                        <Badge className={config.color} variant="outline">
                          <Icon className="w-3 h-3 mr-1" />{config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{txn.description}</TableCell>
                      <TableCell className={`text-right font-semibold ${txn.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {txn.amount >= 0 ? '+' : ''}{formatCurrency(txn.amount)}
                      </TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(txn.balance)}</TableCell>
                      <TableCell>
                        <Select value={txn.status} onValueChange={(v) => {
                          setTxnData(prev => prev.map(t => t.id === txn.id ? { ...t, status: v } : t))
                          toast.success(`Transaction ${txn.reference} status updated to ${v}`)
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
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => {
                          setTxnData(prev => prev.filter(t => t.id !== txn.id))
                          toast.success('Transaction reversed and removed')
                        }}><Trash2 className="w-3 h-3" /></Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Transaction Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Manual Transaction</DialogTitle>
            <DialogDescription>Process a contribution, transfer, drawdown, or other transaction</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Client</Label>
                <Select value={txnForm.client} onValueChange={v => setTxnForm(p => ({ ...p, client: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="John Smith">John Smith</SelectItem>
                    <SelectItem value="Emma Wilson">Emma Wilson</SelectItem>
                    <SelectItem value="David Thompson">David Thompson</SelectItem>
                    <SelectItem value="Lisa Anderson">Lisa Anderson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Account</Label>
                <Select value={txnForm.account} onValueChange={v => setTxnForm(p => ({ ...p, account: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIPP">SIPP</SelectItem>
                    <SelectItem value="ISA">ISA</SelectItem>
                    <SelectItem value="GIA">GIA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1"><Label>Transaction Type</Label>
              <Select value={txnForm.type} onValueChange={v => setTxnForm(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="contribution">Contribution</SelectItem>
                  <SelectItem value="transfer_in">Transfer In</SelectItem>
                  <SelectItem value="drawdown">Drawdown</SelectItem>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                  <SelectItem value="dividend">Dividend</SelectItem>
                  <SelectItem value="fee">Fee</SelectItem>
                  <SelectItem value="tax_relief">Tax Relief</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Description</Label><Input value={txnForm.description} onChange={e => setTxnForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Monthly contribution" /></div>
            <div className="space-y-1"><Label>Amount (£)</Label><Input type="number" step="0.01" value={txnForm.amount || ''} onChange={e => setTxnForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button disabled={!txnForm.description || !txnForm.amount} onClick={() => {
              const sign = ['contribution', 'transfer_in', 'dividend', 'sell', 'tax_relief'].includes(txnForm.type) ? 1 : -1
              const newId = `TXN-${String(txnData.length + 1).padStart(3, '0')}`
              const ref = `${txnForm.type.toUpperCase().slice(0, 4)}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`
              setTxnData(prev => [{
                id: newId, date: new Date().toISOString().replace('T', ' ').slice(0, 16),
                client: txnForm.client, account: txnForm.account, type: txnForm.type,
                description: txnForm.description, amount: txnForm.amount * sign,
                balance: 0, status: 'pending', reference: ref,
              }, ...prev])
              toast.success('Transaction processed')
              setAddDialogOpen(false)
            }}>Process Transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
