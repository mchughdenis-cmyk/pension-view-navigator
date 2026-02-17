import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

// Generic confirmation dialog
export function ConfirmDialog({
  open, onClose, onConfirm, title, description, variant = 'default',
}: {
  open: boolean; onClose: () => void; onConfirm: () => void;
  title: string; description: string; variant?: 'default' | 'destructive';
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant={variant === 'destructive' ? 'destructive' : 'default'} onClick={() => { onConfirm(); onClose(); }}>
            {variant === 'destructive' ? 'Delete' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Client Add/Edit Dialog
export interface ClientFormData {
  name: string; email: string; advisor: string; riskProfile: string; status: string;
}
export function ClientDialog({
  open, onClose, onSave, initial, mode = 'add',
}: {
  open: boolean; onClose: () => void; onSave: (data: ClientFormData) => void;
  initial?: Partial<ClientFormData>; mode?: 'add' | 'edit';
}) {
  const [form, setForm] = useState<ClientFormData>({ name: '', email: '', advisor: 'Sarah Johnson', riskProfile: 'balanced', status: 'onboarding' })
  useEffect(() => { if (initial) setForm(f => ({ ...f, ...initial })) }, [initial])
  const update = (k: keyof ClientFormData, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          <DialogDescription>{mode === 'edit' ? 'Update client details' : 'Register a new client in the system'}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-1"><Label>Full Name</Label><Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="John Smith" /></div>
          <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="john@example.com" /></div>
          <div className="space-y-1"><Label>Assigned Adviser</Label>
            <Select value={form.advisor} onValueChange={v => update('advisor', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                <SelectItem value="Michael Brown">Michael Brown</SelectItem>
                <SelectItem value="Jennifer Davis">Jennifer Davis</SelectItem>
                <SelectItem value="Alex Turner">Alex Turner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>Risk Profile</Label>
            <Select value={form.riskProfile} onValueChange={v => update('riskProfile', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="aggressive">Aggressive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>Status</Label>
            <Select value={form.status} onValueChange={v => update('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="review_required">Review Required</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(form); onClose() }} disabled={!form.name || !form.email}>{mode === 'edit' ? 'Save Changes' : 'Add Client'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Workflow Add/Edit Dialog
export interface WorkflowFormData {
  name: string; trigger: string; action: string; frequency: string; daysBeforeDue: number; assignTo: string; active: boolean;
}
export function WorkflowDialog({
  open, onClose, onSave, initial, mode = 'add',
}: {
  open: boolean; onClose: () => void; onSave: (data: WorkflowFormData) => void;
  initial?: Partial<WorkflowFormData>; mode?: 'add' | 'edit';
}) {
  const [form, setForm] = useState<WorkflowFormData>({ name: '', trigger: '', action: '', frequency: 'Per event', daysBeforeDue: 0, assignTo: 'System', active: true })
  useEffect(() => { if (initial) setForm(f => ({ ...f, ...initial })) }, [initial])
  const update = (k: keyof WorkflowFormData, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Workflow' : 'Create Workflow'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-1"><Label>Workflow Name</Label><Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Birthday Reminder" /></div>
          <div className="space-y-1"><Label>Trigger</Label><Input value={form.trigger} onChange={e => update('trigger', e.target.value)} placeholder="e.g. Client turns 55" /></div>
          <div className="space-y-1"><Label>Action</Label><Input value={form.action} onChange={e => update('action', e.target.value)} placeholder="e.g. Create task + Send email" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={v => update('frequency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Per event">Per event</SelectItem>
                  <SelectItem value="One-off">One-off</SelectItem>
                  <SelectItem value="Annual">Annual</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Days Before Due</Label><Input type="number" value={form.daysBeforeDue} onChange={e => update('daysBeforeDue', parseInt(e.target.value) || 0)} /></div>
          </div>
          <div className="space-y-1"><Label>Assign To</Label>
            <Select value={form.assignTo} onValueChange={v => update('assignTo', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="System">System</SelectItem>
                <SelectItem value="Adviser">Adviser</SelectItem>
                <SelectItem value="Compliance">Compliance</SelectItem>
                <SelectItem value="Portfolio Manager">Portfolio Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={v => update('active', v)} /><Label>Active</Label></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(form); onClose() }} disabled={!form.name || !form.trigger}>{mode === 'edit' ? 'Save' : 'Create'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Fee Schedule Dialog
export interface FeeFormData {
  name: string; type: string; rate: number; frequency: string; wrapper: string; active: boolean;
}
export function FeeDialog({
  open, onClose, onSave, initial, mode = 'add',
}: {
  open: boolean; onClose: () => void; onSave: (data: FeeFormData) => void;
  initial?: Partial<FeeFormData>; mode?: 'add' | 'edit';
}) {
  const [form, setForm] = useState<FeeFormData>({ name: '', type: 'ad_valorem', rate: 0, frequency: 'quarterly', wrapper: 'All', active: true })
  useEffect(() => { if (initial) setForm(f => ({ ...f, ...initial })) }, [initial])
  const update = (k: keyof FeeFormData, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{mode === 'edit' ? 'Edit Fee Schedule' : 'Add Fee Schedule'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={e => update('name', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Fee Type</Label>
              <Select value={form.type} onValueChange={v => update('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ad_valorem">Ad Valorem (%)</SelectItem>
                  <SelectItem value="flat">Flat Fee</SelectItem>
                  <SelectItem value="per_transaction">Per Transaction</SelectItem>
                  <SelectItem value="one_off">One-Off</SelectItem>
                  <SelectItem value="tiered">Tiered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Rate {form.type === 'ad_valorem' ? '(%)' : '(£)'}</Label><Input type="number" step="0.01" value={form.rate} onChange={e => update('rate', parseFloat(e.target.value) || 0)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={v => update('frequency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="per_trade">Per Trade</SelectItem>
                  <SelectItem value="one_off">One-Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Wrapper</Label>
              <Select value={form.wrapper} onValueChange={v => update('wrapper', v)}>
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
          <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={v => update('active', v)} /><Label>Active</Label></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(form); onClose() }} disabled={!form.name}>{mode === 'edit' ? 'Save' : 'Add'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Trade Order Dialog
export interface OrderFormData {
  client: string; account: string; side: string; instrument: string; quantity: number; price: number;
}
export function OrderDialog({
  open, onClose, onSave,
}: {
  open: boolean; onClose: () => void; onSave: (data: OrderFormData) => void;
}) {
  const [form, setForm] = useState<OrderFormData>({ client: 'John Smith', account: 'SIPP', side: 'buy', instrument: '', quantity: 0, price: 0 })
  const update = (k: keyof OrderFormData, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>New Trade Order</DialogTitle><DialogDescription>Create a buy or sell order</DialogDescription></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-1"><Label>Client</Label>
            <Select value={form.client} onValueChange={v => update('client', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="John Smith">John Smith</SelectItem>
                <SelectItem value="Emma Wilson">Emma Wilson</SelectItem>
                <SelectItem value="David Thompson">David Thompson</SelectItem>
                <SelectItem value="Lisa Anderson">Lisa Anderson</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Account</Label>
              <Select value={form.account} onValueChange={v => update('account', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SIPP">SIPP</SelectItem>
                  <SelectItem value="ISA">ISA</SelectItem>
                  <SelectItem value="GIA">GIA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Side</Label>
              <Select value={form.side} onValueChange={v => update('side', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1"><Label>Instrument</Label><Input value={form.instrument} onChange={e => update('instrument', e.target.value)} placeholder="e.g. Vanguard FTSE All-World ETF" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={e => update('quantity', parseInt(e.target.value) || 0)} /></div>
            <div className="space-y-1"><Label>Price (£)</Label><Input type="number" step="0.01" value={form.price} onChange={e => update('price', parseFloat(e.target.value) || 0)} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(form); onClose() }} disabled={!form.instrument || !form.quantity}>Place Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// User Management Dialog  
export interface UserFormData {
  name: string; email: string; role: string; status: string; department: string;
}
export function UserDialog({
  open, onClose, onSave, initial, mode = 'add',
}: {
  open: boolean; onClose: () => void; onSave: (data: UserFormData) => void;
  initial?: Partial<UserFormData>; mode?: 'add' | 'edit';
}) {
  const [form, setForm] = useState<UserFormData>({ name: '', email: '', role: 'adviser', status: 'active', department: 'Advisory' })
  useEffect(() => { if (initial) setForm(f => ({ ...f, ...initial })) }, [initial])
  const update = (k: keyof UserFormData, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{mode === 'edit' ? 'Edit User' : 'Add User'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-1"><Label>Full Name</Label><Input value={form.name} onChange={e => update('name', e.target.value)} /></div>
          <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={e => update('email', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Role</Label>
              <Select value={form.role} onValueChange={v => update('role', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="adviser">Adviser</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Status</Label>
              <Select value={form.status} onValueChange={v => update('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1"><Label>Department</Label>
            <Select value={form.department} onValueChange={v => update('department', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Advisory">Advisory</SelectItem>
                <SelectItem value="Compliance">Compliance</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="Management">Management</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(form); onClose() }} disabled={!form.name || !form.email}>{mode === 'edit' ? 'Save' : 'Add User'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
