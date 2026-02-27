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
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { WorkflowDialog, ConfirmDialog, type WorkflowFormData } from './AdminDialogs'
import { useWorkflows } from '@/hooks/useClientData'

export default function WorkflowEngine() {
  const { workflows, loading, fetchWorkflows, addWorkflow, updateWorkflow, deleteWorkflow } = useWorkflows()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<any | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleToggle = async (id: string) => {
    const wf = workflows.find(w => w.id === id)
    await updateWorkflow(id, { active: !wf?.active })
    toast.success(`${wf?.name} ${wf?.active ? 'paused' : 'activated'}`)
  }

  const handleAdd = async (data: WorkflowFormData) => {
    await addWorkflow({
      name: data.name,
      trigger: data.trigger,
      action: data.action,
      frequency: data.frequency,
      days_before_due: data.daysBeforeDue,
      assign_to: data.assignTo,
      active: data.active,
    })
    toast.success(`Workflow "${data.name}" created`)
  }

  const handleEdit = async (data: WorkflowFormData) => {
    if (!editingWorkflow) return
    await updateWorkflow(editingWorkflow.id, {
      name: data.name,
      trigger: data.trigger,
      action: data.action,
      frequency: data.frequency,
      days_before_due: data.daysBeforeDue,
      assign_to: data.assignTo,
      active: data.active,
    })
    toast.success(`Workflow "${data.name}" updated`)
    setEditingWorkflow(null)
  }

  const handleDelete = async (id: string) => {
    await deleteWorkflow(id)
    toast.success('Workflow deleted')
  }

  if (loading) return <p className="text-center text-muted-foreground py-8">Loading workflows...</p>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Active Workflows</p><p className="text-2xl font-bold text-success">{workflows.filter(w => w.active).length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Workflows</p><p className="text-2xl font-bold text-primary">{workflows.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Executions</p><p className="text-2xl font-bold text-foreground">{workflows.reduce((s, w) => s + (w.times_triggered || 0), 0).toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Paused</p><p className="text-2xl font-bold text-muted-foreground">{workflows.filter(w => !w.active).length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div><CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5" /> Automated Workflows</CardTitle><CardDescription>Event-driven tasks persisted to database</CardDescription></div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> New Workflow</Button>
              <Button variant="outline" size="sm" onClick={fetchWorkflows}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {workflows.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No workflows defined yet. Create one to automate tasks.</p>
          ) : (
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
                          <Badge variant="secondary" className="text-xs">→ {w.assign_to}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          <strong>Trigger:</strong> {w.trigger} → <strong>Action:</strong> {w.action}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          {w.days_before_due > 0 && <span>{w.days_before_due} days before</span>}
                          <span>Last: {w.last_triggered ? new Date(w.last_triggered).toLocaleDateString() : 'Never'}</span>
                          <span>Runs: {(w.times_triggered || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={w.active} onCheckedChange={() => handleToggle(w.id)} />
                      <Button variant="outline" size="sm" onClick={() => setEditingWorkflow({
                        ...w,
                        daysBeforeDue: w.days_before_due,
                        assignTo: w.assign_to,
                      })}><Edit className="w-4 h-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(w.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <WorkflowDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleAdd} mode="add" />
      <WorkflowDialog open={!!editingWorkflow} onClose={() => setEditingWorkflow(null)} onSave={handleEdit} mode="edit" initial={editingWorkflow || undefined} />
      <ConfirmDialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} onConfirm={() => deleteConfirm !== null && handleDelete(deleteConfirm)} title="Delete Workflow" description="Are you sure you want to delete this workflow? This action cannot be undone." variant="destructive" />
    </div>
  )
}
