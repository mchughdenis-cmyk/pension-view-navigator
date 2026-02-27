import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Plus,
  Edit,
  Trash2,
  Settings,
  UserCheck,
  Download,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAdviserFees } from '@/hooks/useClientData'
import { downloadCSV } from '@/lib/adminExportUtils'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }).format(amount)

interface FeeFormData {
  adviser_name: string
  client_id: string
  fee_type: string
  rate: number
  frequency: string
  wrapper: string
  status: string
  notes: string
}

const emptyForm: FeeFormData = {
  adviser_name: '',
  client_id: '',
  fee_type: 'ongoing',
  rate: 0,
  frequency: 'quarterly',
  wrapper: 'All',
  status: 'active',
  notes: '',
}

export default function AdviserCharging() {
  const { fees, clients, loading, fetchFees, addFee, updateFee, deleteFee } = useAdviserFees()
  const [activeTab, setActiveTab] = useState<'overview' | 'agreements'>('overview')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FeeFormData>(emptyForm)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(true) }
  const openEdit = (fee: any) => {
    setForm({
      adviser_name: fee.adviser_name,
      client_id: fee.client_id,
      fee_type: fee.fee_type,
      rate: Number(fee.rate),
      frequency: fee.frequency,
      wrapper: fee.wrapper,
      status: fee.status,
      notes: fee.notes || '',
    })
    setEditingId(fee.id)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.adviser_name || !form.client_id) {
      toast.error('Adviser name and client are required')
      return
    }
    if (editingId) {
      await updateFee(editingId, form)
      toast.success('Fee agreement updated')
    } else {
      await addFee(form)
      toast.success('Fee agreement created')
    }
    setDialogOpen(false)
  }

  const handleDelete = async () => {
    if (!deleteConfirmId) return
    await deleteFee(deleteConfirmId)
    toast.success('Fee agreement deleted')
    setDeleteConfirmId(null)
  }

  const handleExport = () => {
    downloadCSV('adviser-fees',
      ['Adviser', 'Client', 'Fee Type', 'Rate', 'Frequency', 'Wrapper', 'Status'],
      fees.map(f => [f.adviser_name, f.client_name || f.client_id, f.fee_type, f.rate, f.frequency, f.wrapper, f.status])
    )
    toast.success('Adviser fees exported')
  }

  // Group by adviser for overview
  const adviserSummary = fees.reduce((acc: Record<string, { clientCount: Set<string>; totalRate: number; count: number }>, f: any) => {
    if (!acc[f.adviser_name]) acc[f.adviser_name] = { clientCount: new Set(), totalRate: 0, count: 0 }
    acc[f.adviser_name].clientCount.add(f.client_id)
    acc[f.adviser_name].totalRate += Number(f.rate)
    acc[f.adviser_name].count++
    return acc
  }, {} as Record<string, { clientCount: Set<string>; totalRate: number; count: number }>)

  if (loading) return <p className="text-center text-muted-foreground py-8">Loading adviser fees...</p>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Fee Agreements</p><p className="text-2xl font-bold text-foreground">{fees.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Active Agreements</p><p className="text-2xl font-bold text-success">{fees.filter(f => f.status === 'active').length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Unique Advisers</p><p className="text-2xl font-bold text-primary">{Object.keys(adviserSummary).length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Unique Clients</p><p className="text-2xl font-bold text-foreground">{new Set(fees.map(f => f.client_id)).size}</p></CardContent></Card>
      </div>

      <div className="flex gap-2">
        <Button variant={activeTab === 'overview' ? 'default' : 'outline'} onClick={() => setActiveTab('overview')}><Settings className="w-4 h-4 mr-2" /> Overview</Button>
        <Button variant={activeTab === 'agreements' ? 'default' : 'outline'} onClick={() => setActiveTab('agreements')}><UserCheck className="w-4 h-4 mr-2" /> All Agreements</Button>
      </div>

      {activeTab === 'overview' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div><CardTitle>Adviser Fee Summary</CardTitle><CardDescription>Aggregated view by adviser from the database</CardDescription></div>
              <div className="flex gap-2">
                <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-2" /> Add Agreement</Button>
                <Button variant="outline" size="sm" onClick={fetchFees}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {Object.keys(adviserSummary).length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No adviser fee agreements yet. Add one to get started.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adviser</TableHead>
                    <TableHead className="text-right">Clients</TableHead>
                    <TableHead className="text-right">Agreements</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(adviserSummary).map(([adviser, data]: [string, { clientCount: Set<string>; totalRate: number; count: number }]) => (
                    <TableRow key={adviser}>
                      <TableCell className="font-medium">{adviser}</TableCell>
                      <TableCell className="text-right">{data.clientCount.size}</TableCell>
                      <TableCell className="text-right">{data.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'agreements' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div><CardTitle>Client Fee Agreements</CardTitle><CardDescription>Individual adviser charging agreements per client — persisted to database</CardDescription></div>
              <div className="flex gap-2">
                <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-2" /> Add</Button>
                <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-2" /> Export</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {fees.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No agreements yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Adviser</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Wrapper</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees.map(fee => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">{fee.client_name || fee.client_id}</TableCell>
                      <TableCell>{fee.adviser_name}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{fee.fee_type.replace('_', ' ')}</Badge></TableCell>
                      <TableCell className="text-right font-semibold">{fee.fee_type === 'ad_hoc' ? formatCurrency(Number(fee.rate)) : `${fee.rate}%`}</TableCell>
                      <TableCell className="text-sm capitalize">{fee.frequency.replace('_', ' ')}</TableCell>
                      <TableCell><Badge variant="secondary">{fee.wrapper}</Badge></TableCell>
                      <TableCell><Badge variant={fee.status === 'active' ? 'default' : 'secondary'}>{fee.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => openEdit(fee)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(fee.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'Add'} Fee Agreement</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Adviser Name</Label>
              <Input value={form.adviser_name} onChange={e => setForm(prev => ({ ...prev, adviser_name: e.target.value }))} placeholder="e.g. Sarah Johnson" />
            </div>
            <div>
              <Label>Client</Label>
              <Select value={form.client_id} onValueChange={v => setForm(prev => ({ ...prev, client_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fee Type</Label>
                <Select value={form.fee_type} onValueChange={v => setForm(prev => ({ ...prev, fee_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Initial</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="ad_hoc">Ad Hoc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rate ({form.fee_type === 'ad_hoc' ? '£' : '%'})</Label>
                <Input type="number" step="0.01" value={form.rate} onChange={e => setForm(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Frequency</Label>
                <Select value={form.frequency} onValueChange={v => setForm(prev => ({ ...prev, frequency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="one_off">One-off</SelectItem>
                    <SelectItem value="per_event">Per Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Wrapper</Label>
                <Select value={form.wrapper} onValueChange={v => setForm(prev => ({ ...prev, wrapper: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="SIPP">SIPP</SelectItem>
                    <SelectItem value="ISA">ISA</SelectItem>
                    <SelectItem value="GIA">GIA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(prev => ({ ...prev, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Optional notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingId ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Fee Agreement</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">Are you sure? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
