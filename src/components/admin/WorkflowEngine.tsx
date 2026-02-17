import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Plus,
  Edit,
  CheckCircle,
  AlertTriangle,
  Zap,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { WorkflowDialog, ConfirmDialog, type WorkflowFormData } from './AdminDialogs'

const initialWorkflows = [
  { id: 1, name: 'Annual Review Reminder', trigger: 'Anniversary date', action: 'Create task + Send email', frequency: 'Annual', daysBeforeDue: 30, assignTo: 'Adviser', active: true, lastTriggered: '2024-01-10', timesTriggered: 245 },
  { id: 2, name: 'KYC Expiry Reminder', trigger: 'KYC expiry date', action: 'Create task + Send email + Flag account', frequency: 'One-off', daysBeforeDue: 60, assignTo: 'Compliance', active: true, lastTriggered: '2024-01-08', timesTriggered: 89 },
  { id: 3, name: 'Drawdown Birthday Trigger', trigger: 'Client turns 55', action: 'Create task + Send welcome pack', frequency: 'One-off', daysBeforeDue: 90, assignTo: 'Adviser', active: true, lastTriggered: '2024-01-05', timesTriggered: 34 },
  { id: 4, name: 'Large Transaction Alert', trigger: 'Transaction > £50,000', action: 'Send alert to compliance', frequency: 'Per event', daysBeforeDue: 0, assignTo: 'Compliance', active: true, lastTriggered: '2024-01-14', timesTriggered: 156 },
  { id: 5, name: 'Failed Payment Retry', trigger: 'Payment failure', action: 'Retry in 3 days + Notify client', frequency: 'Per event', daysBeforeDue: 3, assignTo: 'System', active: true, lastTriggered: '2024-01-12', timesTriggered: 23 },
  { id: 6, name: 'Contribution Receipt', trigger: 'Contribution received', action: 'Send confirmation email', frequency: 'Per event', daysBeforeDue: 0, assignTo: 'System', active: true, lastTriggered: '2024-01-15', timesTriggered: 3456 },
  { id: 7, name: 'Quarterly Rebalance Check', trigger: 'Start of quarter', action: 'Run drift analysis + Create task if needed', frequency: 'Quarterly', daysBeforeDue: 0, assignTo: 'Portfolio Manager', active: true, lastTriggered: '2024-01-02', timesTriggered: 12 },
  { id: 8, name: 'Inactive Client Alert', trigger: 'No login for 180 days', action: 'Create task + Send re-engagement email', frequency: 'Per event', daysBeforeDue: 0, assignTo: 'Adviser', active: false, lastTriggered: '2023-12-01', timesTriggered: 67 },
]

const initialExecutions = [
  { id: 1, workflow: 'Contribution Receipt', client: 'John Smith', date: '2024-01-15 11:00', result: 'success' as const, detail: 'Email sent to john.smith@email.com' },
  { id: 2, workflow: 'Large Transaction Alert', client: 'David Thompson', date: '2024-01-14 16:00', result: 'success' as const, detail: 'Alert sent to compliance team' },
  { id: 3, workflow: 'Failed Payment Retry', client: 'Lisa Anderson', date: '2024-01-12 09:00', result: 'success' as const, detail: 'Retry scheduled for 2024-01-15' },
  { id: 4, workflow: 'Annual Review Reminder', client: 'Emma Wilson', date: '2024-01-10 08:00', result: 'success' as const, detail: 'Task created, email sent to adviser' },
  { id: 5, workflow: 'KYC Expiry Reminder', client: '15 clients', date: '2024-01-08 07:00', result: 'partial' as const, detail: '14 emails sent, 1 bounced' },
]

export default function WorkflowEngine() {
  const [workflows, setWorkflows] = useState(initialWorkflows)
  const [executions] = useState(initialExecutions)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<(typeof initialWorkflows[0]) | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const handleToggle = (id: number) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, active: !w.active } : w))
    const wf = workflows.find(w => w.id === id)
    toast.success(`${wf?.name} ${wf?.active ? 'paused' : 'activated'}`)
  }

  const handleAdd = (data: WorkflowFormData) => {
    const newId = Math.max(...workflows.map(w => w.id)) + 1
    setWorkflows(prev => [...prev, { id: newId, ...data, lastTriggered: 'Never', timesTriggered: 0 }])
    toast.success(`Workflow "${data.name}" created`)
  }

  const handleEdit = (data: WorkflowFormData) => {
    if (!editingWorkflow) return
    setWorkflows(prev => prev.map(w => w.id === editingWorkflow.id ? { ...w, ...data } : w))
    toast.success(`Workflow "${data.name}" updated`)
    setEditingWorkflow(null)
  }

  const handleDelete = (id: number) => {
    const wf = workflows.find(w => w.id === id)
    setWorkflows(prev => prev.filter(w => w.id !== id))
    toast.success(`Workflow "${wf?.name}" deleted`)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Active Workflows</p><p className="text-2xl font-bold text-success">{workflows.filter(w => w.active).length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Executions (Month)</p><p className="text-2xl font-bold text-primary">4,082</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Success Rate</p><p className="text-2xl font-bold text-success">99.2%</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Paused Workflows</p><p className="text-2xl font-bold text-muted-foreground">{workflows.filter(w => !w.active).length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div><CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5" /> Automated Workflows</CardTitle><CardDescription>Configure event-driven tasks, notifications, and automations</CardDescription></div>
            <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> New Workflow</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workflows.map(w => (
              <div key={w.id} className={`p-4 border rounded-lg transition-colors ${w.active ? 'hover:bg-accent/50' : 'opacity-60'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${w.active ? 'bg-success/10' : 'bg-muted'}`}>
                      <Zap className={`w-5 h-5 ${w.active ? 'text-success' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold">{w.name}</h4>
                        <Badge variant="outline" className="text-xs">{w.frequency}</Badge>
                        <Badge variant="secondary" className="text-xs">→ {w.assignTo}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Trigger:</strong> {w.trigger} → <strong>Action:</strong> {w.action}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        {w.daysBeforeDue > 0 && <span>{w.daysBeforeDue} days before</span>}
                        <span>Last: {w.lastTriggered}</span>
                        <span>Runs: {w.timesTriggered.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={w.active} onCheckedChange={() => handleToggle(w.id)} />
                    <Button variant="outline" size="sm" onClick={() => { setEditingWorkflow(w); }}><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(w.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Executions</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {executions.map(exec => (
              <div key={exec.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {exec.result === 'success' ? <CheckCircle className="w-4 h-4 text-success" /> : <AlertTriangle className="w-4 h-4 text-warning" />}
                  <div>
                    <p className="font-medium text-sm">{exec.workflow}</p>
                    <p className="text-xs text-muted-foreground">{exec.client} • {exec.detail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={exec.result === 'success' ? 'default' : 'secondary'}>{exec.result}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">{exec.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <WorkflowDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleAdd} mode="add" />
      <WorkflowDialog open={!!editingWorkflow} onClose={() => setEditingWorkflow(null)} onSave={handleEdit} mode="edit" initial={editingWorkflow || undefined} />
      <ConfirmDialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} onConfirm={() => deleteConfirm !== null && handleDelete(deleteConfirm)} title="Delete Workflow" description="Are you sure you want to delete this workflow? This action cannot be undone." variant="destructive" />
    </div>
  )
}
