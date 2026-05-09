import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Download, ArrowUpRight, ArrowDownLeft, RefreshCw, Receipt, TrendingUp, DollarSign, Banknote, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { downloadCSV } from '@/lib/adminExportUtils'
import { useAllTransactions, useClients } from '@/hooks/useClientData'
import { supabase } from '@/integrations/supabase/client'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }).format(amount)

const typeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  contribution: { label: 'Contribution', color: 'bg-success/10 text-success border-success/20', icon: ArrowDownLeft },
  employer_contribution: { label: 'Employer', color: 'bg-success/10 text-success border-success/20', icon: ArrowDownLeft },
  transfer_in: { label: 'Transfer In', color: 'bg-primary/10 text-primary border-primary/20', icon: RefreshCw },
  transfer_out: { label: 'Transfer Out', color: 'bg-warning/10 text-warning border-warning/20', icon: ArrowUpRight },
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
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [txnForm, setTxnForm] = useState({ client_id: '', account_id: '', type: 'contribution', description: '', amount: 0 })

  const { transactions, loading, addTransaction, updateTransactionStatus, deleteTransaction } = useAllTransactions()
  const { clients } = useClients()

  // Get accounts for selected client
  const [clientAccounts, setClientAccounts] = useState<any[]>([])
  const loadClientAccounts = async (clientId: string) => {
    const { supabase } = await import('@/integrations/supabase/client')
    const { data } = await supabase.from('client_accounts').select('id, account_type, account_number').eq('client_id', clientId)
    setClientAccounts(data || [])
  }

  const filtered = transactions.filter(t => {
    const matchesSearch = (t.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.reference || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || t.transaction_type === typeFilter
    const matchesAccount = accountFilter === 'all' || t.account_type === accountFilter
    return matchesSearch && matchesType && matchesAccount
  })

  const totalIn = filtered.filter(t => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0)
  const totalOut = filtered.filter(t => Number(t.amount) < 0).reduce((s, t) => s + Math.abs(Number(t.amount)), 0)

  const handleExport = () => {
    downloadCSV('transaction-ledger',
      ['Date', 'Reference', 'Client', 'Account', 'Type', 'Description', 'Amount', 'Balance', 'Status'],
      filtered.map(t => [t.effective_date || '', t.reference || '', t.client_name || '', t.account_type || '', typeConfig[t.transaction_type]?.label || t.transaction_type, t.description || '', t.amount, t.running_balance, t.status])
    )
    toast.success('Transaction ledger exported as CSV')
  }

  if (loading) return <div className="flex items-center justify-center py-12"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>

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
                  {Object.entries(typeConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
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
              <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
              <Button size="sm" onClick={() => { setTxnForm({ client_id: '', account_id: '', type: 'contribution', description: '', amount: 0 }); setClientAccounts([]); setAddDialogOpen(true) }}>
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
                  <TableHead>Date</TableHead><TableHead>Reference</TableHead><TableHead>Client</TableHead>
                  <TableHead>Account</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(txn => {
                  const config = typeConfig[txn.transaction_type] || typeConfig.contribution
                  const Icon = config.icon
                  const amt = Number(txn.amount)
                  return (
                    <TableRow key={txn.id} className="cursor-pointer hover:bg-accent/50">
                      <TableCell className="text-xs whitespace-nowrap">{txn.effective_date || txn.created_at?.slice(0, 10)}</TableCell>
                      <TableCell className="text-xs font-mono">{txn.reference}</TableCell>
                      <TableCell className="font-medium">{txn.client_name}</TableCell>
                      <TableCell><Badge variant="outline">{txn.account_type}</Badge></TableCell>
                      <TableCell>
                        <Badge className={config.color} variant="outline"><Icon className="w-3 h-3 mr-1" />{config.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{txn.description}</TableCell>
                      <TableCell className={`text-right font-semibold ${amt >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {amt >= 0 ? '+' : ''}{formatCurrency(amt)}
                      </TableCell>
                      <TableCell>
                        <Select value={txn.status} onValueChange={async (v) => {
                          await updateTransactionStatus(txn.id, v)
                          toast.success(`Status updated to ${v}`)
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
                  )
                })}
              </TableBody>
            </Table>
          </div>
          {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">No transactions found</p>}
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
            <div className="space-y-1"><Label>Client</Label>
              <Select value={txnForm.client_id} onValueChange={v => { setTxnForm(p => ({ ...p, client_id: v, account_id: '' })); loadClientAccounts(v) }}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Account</Label>
              <Select value={txnForm.account_id} onValueChange={v => setTxnForm(p => ({ ...p, account_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {clientAccounts.map((a: any) => <SelectItem key={a.id} value={a.id}>{a.account_type} ({a.account_number})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Transaction Type</Label>
              <Select value={txnForm.type} onValueChange={v => setTxnForm(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(typeConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Description</Label><Input value={txnForm.description} onChange={e => setTxnForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Monthly contribution" /></div>
            <div className="space-y-1"><Label>Amount (£)</Label><Input type="number" step="0.01" value={txnForm.amount || ''} onChange={e => setTxnForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button disabled={!txnForm.description || !txnForm.amount || !txnForm.client_id || !txnForm.account_id} onClick={async () => {
              const sign = ['contribution', 'employer_contribution', 'transfer_in', 'dividend', 'sell', 'tax_relief'].includes(txnForm.type) ? 1 : -1
              const ref = `${txnForm.type.toUpperCase().slice(0, 4)}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`
              await addTransaction({
                client_id: txnForm.client_id,
                account_id: txnForm.account_id,
                transaction_type: txnForm.type,
                description: txnForm.description,
                amount: txnForm.amount * sign,
                reference: ref,
                status: 'pending',
                effective_date: new Date().toISOString().split('T')[0],
              })
              toast.success('Transaction processed')
              setAddDialogOpen(false)
            }}>Process Transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
