import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Receipt,
  Plus,
  Edit,
  Percent,
  DollarSign,
  Download,
  Settings,
  TrendingUp,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { FeeDialog, ConfirmDialog, type FeeFormData } from './AdminDialogs'
import { downloadCSV } from '@/lib/adminExportUtils'
import { useFeeSchedules } from '@/hooks/useClientData'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }).format(amount)

const typeLabels: Record<string, string> = {
  ad_valorem: 'Ad Valorem (%)', flat: 'Flat Fee', per_transaction: 'Per Transaction', one_off: 'One-Off', tiered: 'Tiered',
}

export default function FeeEngine() {
  const { schedules, loading, fetchSchedules, addSchedule, updateSchedule, deleteSchedule } = useFeeSchedules()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<any | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleToggle = async (id: string) => {
    const fee = schedules.find(f => f.id === id)
    if (!fee) return
    await updateSchedule(id, { active: !fee.active })
    toast.success(`${fee.name} ${fee.active ? 'deactivated' : 'activated'}`)
  }

  const handleAdd = async (data: FeeFormData) => {
    await addSchedule({ name: data.name, type: data.type, rate: data.rate, frequency: data.frequency, wrapper: data.wrapper, active: data.active })
    toast.success(`Fee schedule "${data.name}" created`)
  }

  const handleEdit = async (data: FeeFormData) => {
    if (!editingFee) return
    await updateSchedule(editingFee.id, { name: data.name, type: data.type, rate: data.rate, frequency: data.frequency, wrapper: data.wrapper, active: data.active })
    toast.success(`Fee schedule "${data.name}" updated`)
    setEditingFee(null)
  }

  const handleDelete = async (id: string) => {
    const fee = schedules.find(f => f.id === id)
    await deleteSchedule(id)
    toast.success(`"${fee?.name}" deleted`)
  }

  const handleExport = () => {
    downloadCSV('fee-schedules',
      ['Name', 'Type', 'Rate', 'Frequency', 'Wrapper', 'Active'],
      schedules.map(f => [f.name, f.type, f.rate, f.frequency, f.wrapper, f.active ? 'Yes' : 'No'])
    )
    toast.success('Fee schedules exported')
  }

  if (loading) return <p className="text-center text-muted-foreground py-8">Loading fee schedules...</p>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Schedules</p><p className="text-2xl font-bold text-foreground">{schedules.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Active</p><p className="text-2xl font-bold text-success">{schedules.filter(f => f.active).length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Inactive</p><p className="text-2xl font-bold text-warning">{schedules.filter(f => !f.active).length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div><CardTitle>Fee Schedules</CardTitle><CardDescription>Configure platform, administration, and transaction fees — persisted to database</CardDescription></div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchSchedules}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
              <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-2" /> Export</Button>
              <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Schedule</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No fee schedules configured. Add one to get started.</p>
          ) : (
            <div className="space-y-3">
              {schedules.map(fee => (
                <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {fee.type === 'ad_valorem' || fee.type === 'tiered' ? <Percent className="w-5 h-5 text-primary" /> : <DollarSign className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <p className="font-semibold">{fee.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{typeLabels[fee.type] || fee.type}</Badge>
                        <Badge variant="secondary" className="text-xs">{fee.wrapper}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {fee.type === 'ad_valorem' ? `${fee.rate}% p.a.` : fee.type === 'tiered' ? 'See tiers' : formatCurrency(Number(fee.rate))}
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
          )}
        </CardContent>
      </Card>

      <FeeDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleAdd} mode="add" />
      <FeeDialog open={!!editingFee} onClose={() => setEditingFee(null)} onSave={handleEdit} mode="edit" initial={editingFee || undefined} />
      <ConfirmDialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} onConfirm={() => deleteConfirm !== null && handleDelete(deleteConfirm)} title="Delete Fee Schedule" description="This will permanently remove this fee schedule." variant="destructive" />
    </div>
  )
}
