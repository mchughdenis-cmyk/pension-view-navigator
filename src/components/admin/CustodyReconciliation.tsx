import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Download,
  Upload,
  Database,
  BarChart3,
  FileText,
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
  Calendar,
  Eye,
} from 'lucide-react'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }).format(amount)

const reconciliations = [
  { id: 1, date: '2024-01-15', type: 'Cash', account: 'Client Money Account', internalBalance: 42750000, externalBalance: 42750000, difference: 0, status: 'matched', items: 1247 },
  { id: 2, date: '2024-01-15', type: 'Stock', account: 'Nominee Holdings', internalBalance: 38450000, externalBalance: 38452340, difference: 2340, status: 'break', items: 3842 },
  { id: 3, date: '2024-01-14', type: 'Cash', account: 'Dealing Account', internalBalance: 1250000, externalBalance: 1250000, difference: 0, status: 'matched', items: 156 },
  { id: 4, date: '2024-01-14', type: 'Stock', account: 'Crest Holdings', internalBalance: 15670000, externalBalance: 15670000, difference: 0, status: 'matched', items: 2104 },
  { id: 5, date: '2024-01-13', type: 'Cash', account: 'Tax Reclaim', internalBalance: 87500, externalBalance: 85200, difference: -2300, status: 'investigating', items: 45 },
]

const corporateActions = [
  { id: 1, date: '2024-01-20', type: 'Dividend', security: 'Vanguard FTSE All-World ETF', exDate: '2024-01-18', payDate: '2024-01-25', rate: '£0.42 per share', affectedClients: 487, totalValue: 89400, status: 'pending' },
  { id: 2, date: '2024-01-15', type: 'Dividend', security: 'iShares UK Equity Index', exDate: '2024-01-12', payDate: '2024-01-19', rate: '£0.18 per share', affectedClients: 312, totalValue: 34200, status: 'processing' },
  { id: 3, date: '2024-01-10', type: 'Stock Split', security: 'Tesla Inc (TSLA)', exDate: '2024-01-08', payDate: '2024-01-10', rate: '3:1 split', affectedClients: 45, totalValue: 0, status: 'completed' },
  { id: 4, date: '2024-01-05', type: 'Rights Issue', security: 'Barclays PLC', exDate: '2024-01-03', payDate: '2024-01-20', rate: '1 for 5 @ £1.45', affectedClients: 156, totalValue: 45240, status: 'action_required' },
  { id: 5, date: '2024-01-02', type: 'Dividend', security: 'L&G UK Index Trust', exDate: '2023-12-28', payDate: '2024-01-05', rate: '£0.25 per unit', affectedClients: 534, totalValue: 67800, status: 'completed' },
  { id: 6, date: '2023-12-20', type: 'Merger', security: 'Vodafone Group / Three UK', exDate: '2024-02-01', payDate: 'TBC', rate: '0.8 new shares per old', affectedClients: 89, totalValue: 0, status: 'announced' },
]

const statusConfig: Record<string, { variant: string; icon: React.ElementType }> = {
  matched: { variant: 'default', icon: CheckCircle },
  break: { variant: 'destructive', icon: AlertTriangle },
  investigating: { variant: 'secondary', icon: Clock },
  pending: { variant: 'secondary', icon: Clock },
  processing: { variant: 'outline', icon: RefreshCw },
  completed: { variant: 'default', icon: CheckCircle },
  action_required: { variant: 'destructive', icon: AlertTriangle },
  announced: { variant: 'outline', icon: Calendar },
}

export default function CustodyReconciliation() {
  const [activeView, setActiveView] = useState<'reconciliation' | 'corporate_actions'>('reconciliation')

  const matchedCount = reconciliations.filter(r => r.status === 'matched').length
  const breakCount = reconciliations.filter(r => r.status === 'break' || r.status === 'investigating').length

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Reconciliation Status</p>
            <p className="text-2xl font-bold text-success">{matchedCount}/{reconciliations.length} Matched</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Breaks / Investigating</p>
            <p className="text-2xl font-bold text-destructive">{breakCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending Corporate Actions</p>
            <p className="text-2xl font-bold text-warning">{corporateActions.filter(c => c.status !== 'completed').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Dividend Income (Period)</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(corporateActions.filter(c => c.type === 'Dividend').reduce((s, c) => s + c.totalValue, 0))}</p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button variant={activeView === 'reconciliation' ? 'default' : 'outline'} onClick={() => setActiveView('reconciliation')}>
          <Database className="w-4 h-4 mr-2" /> Reconciliation
        </Button>
        <Button variant={activeView === 'corporate_actions' ? 'default' : 'outline'} onClick={() => setActiveView('corporate_actions')}>
          <ArrowRightLeft className="w-4 h-4 mr-2" /> Corporate Actions
        </Button>
      </div>

      {activeView === 'reconciliation' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5" /> Stock & Cash Reconciliation</CardTitle>
                <CardDescription>Daily reconciliation between internal records and custodian/bank statements</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm"><RefreshCw className="w-4 h-4 mr-2" /> Run Reconciliation</Button>
                <Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-2" /> Import Statement</Button>
                <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Export</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Internal Balance</TableHead>
                  <TableHead className="text-right">External Balance</TableHead>
                  <TableHead className="text-right">Difference</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reconciliations.map(rec => {
                  const config = statusConfig[rec.status]
                  const Icon = config.icon
                  return (
                    <TableRow key={rec.id}>
                      <TableCell className="text-sm">{rec.date}</TableCell>
                      <TableCell><Badge variant="outline">{rec.type}</Badge></TableCell>
                      <TableCell className="font-medium">{rec.account}</TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(rec.internalBalance)}</TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(rec.externalBalance)}</TableCell>
                      <TableCell className={`text-right font-semibold ${rec.difference === 0 ? 'text-success' : 'text-destructive'}`}>
                        {rec.difference === 0 ? '—' : formatCurrency(rec.difference)}
                      </TableCell>
                      <TableCell className="text-right text-sm">{rec.items.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={config.variant as any}><Icon className="w-3 h-3 mr-1" />{rec.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm"><Eye className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeView === 'corporate_actions' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2"><ArrowRightLeft className="w-5 h-5" /> Corporate Actions</CardTitle>
                <CardDescription>Dividends, stock splits, rights issues, mergers and other corporate events</CardDescription>
              </div>
              <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Export</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {corporateActions.map(action => {
                const config = statusConfig[action.status]
                const Icon = config.icon
                return (
                  <div key={action.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {action.type === 'Dividend' ? <DollarSign className="w-5 h-5 text-primary" /> :
                           action.type === 'Stock Split' ? <TrendingUp className="w-5 h-5 text-primary" /> :
                           <ArrowRightLeft className="w-5 h-5 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{action.security}</h4>
                            <Badge variant="outline">{action.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Rate: {action.rate}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>Ex-date: {action.exDate}</span>
                            <span>Pay date: {action.payDate}</span>
                            <span>Clients: {action.affectedClients}</span>
                            {action.totalValue > 0 && <span>Value: {formatCurrency(action.totalValue)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={config.variant as any}><Icon className="w-3 h-3 mr-1" />{action.status.replace('_', ' ')}</Badge>
                        {action.status === 'action_required' && <Button size="sm">Process</Button>}
                        {action.status === 'pending' && <Button size="sm" variant="outline">Review</Button>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
