import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import {
  Play,
  RefreshCw,
  Calculator,
  Download,
  Upload,
  Database,
  Receipt,
  FileBarChart,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
} from 'lucide-react'

const bulkOperations = [
  { id: 1, name: 'Quarterly Fee Collection', type: 'fees', lastRun: '2026-01-01', nextRun: '2026-04-01', clientsAffected: 1247, status: 'completed', duration: '12 mins' },
  { id: 2, name: 'Portfolio Rebalance - All Models', type: 'rebalance', lastRun: '2026-01-10', nextRun: '2026-04-10', clientsAffected: 1131, status: 'completed', duration: '45 mins' },
  { id: 3, name: 'SMPI Statement Generation', type: 'documents', lastRun: '2026-01-10', nextRun: '2026-09-01', clientsAffected: 1060, status: 'in_progress', duration: 'Running...' },
  { id: 4, name: 'Annual Benefit Statements', type: 'documents', lastRun: '2025-09-01', nextRun: '2026-09-01', clientsAffected: 1247, status: 'scheduled', duration: '~30 mins' },
  { id: 5, name: 'KYC Batch Reverification', type: 'compliance', lastRun: '2026-01-08', nextRun: '2026-02-08', clientsAffected: 89, status: 'completed', duration: '8 mins' },
  { id: 6, name: 'Daily Reconciliation', type: 'reconciliation', lastRun: '2026-01-15', nextRun: '2026-01-16', clientsAffected: 1247, status: 'completed', duration: '5 mins' },
  { id: 7, name: 'Adviser Fee Collection', type: 'fees', lastRun: '2026-01-01', nextRun: '2026-04-01', clientsAffected: 1247, status: 'completed', duration: '8 mins' },
  { id: 8, name: 'Dividend Processing', type: 'corporate_actions', lastRun: '2026-01-15', nextRun: 'As needed', clientsAffected: 487, status: 'completed', duration: '15 mins' },
]

const statusConfig: Record<string, { variant: string; icon: React.ElementType }> = {
  completed: { variant: 'default', icon: CheckCircle },
  in_progress: { variant: 'secondary', icon: RefreshCw },
  scheduled: { variant: 'outline', icon: Clock },
  failed: { variant: 'destructive', icon: AlertTriangle },
}

const typeConfig: Record<string, string> = {
  fees: 'bg-primary/10 text-primary',
  rebalance: 'bg-success/10 text-success',
  documents: 'bg-warning/10 text-warning',
  compliance: 'bg-accent/10 text-accent-foreground',
  reconciliation: 'bg-muted text-muted-foreground',
  corporate_actions: 'bg-primary/10 text-primary',
}

export default function BulkOperations() {
  const completed = bulkOperations.filter(o => o.status === 'completed').length
  const running = bulkOperations.filter(o => o.status === 'in_progress').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Operations</p><p className="text-2xl font-bold text-foreground">{bulkOperations.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Completed</p><p className="text-2xl font-bold text-success">{completed}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Running</p><p className="text-2xl font-bold text-warning">{running}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Scheduled</p><p className="text-2xl font-bold text-muted-foreground">{bulkOperations.filter(o => o.status === 'scheduled').length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div><CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5" /> Bulk Operations</CardTitle><CardDescription>Run and schedule bulk processes across all clients</CardDescription></div>
            <Button size="sm"><Play className="w-4 h-4 mr-2" /> Run Custom Batch</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bulkOperations.map(op => {
              const status = statusConfig[op.status] || statusConfig.completed
              const StatusIcon = status.icon
              return (
                <div key={op.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {op.type === 'fees' ? <Receipt className="w-5 h-5 text-primary" /> :
                         op.type === 'rebalance' ? <RefreshCw className="w-5 h-5 text-primary" /> :
                         op.type === 'documents' ? <FileBarChart className="w-5 h-5 text-primary" /> :
                         op.type === 'reconciliation' ? <Database className="w-5 h-5 text-primary" /> :
                         <Calculator className="w-5 h-5 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{op.name}</h4>
                          <Badge className={`${typeConfig[op.type]} text-xs`} variant="outline">{op.type.replace('_', ' ')}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>Clients: {op.clientsAffected.toLocaleString()}</span>
                          <span>Last: {op.lastRun}</span>
                          <span>Next: {op.nextRun}</span>
                          <span>Duration: {op.duration}</span>
                        </div>
                        {op.status === 'in_progress' && (
                          <div className="mt-2">
                            <Progress value={59.8} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">59.8% complete</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={status.variant as any}><StatusIcon className="w-3 h-3 mr-1" />{op.status.replace('_', ' ')}</Badge>
                      {op.status === 'completed' && <Button size="sm" variant="outline"><Play className="w-4 h-4 mr-1" /> Re-run</Button>}
                      {op.status === 'scheduled' && <Button size="sm"><Play className="w-4 h-4 mr-1" /> Run Now</Button>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
