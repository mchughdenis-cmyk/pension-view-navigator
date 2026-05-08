import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Building2, Plus, Users } from 'lucide-react'
import { toast } from 'sonner'

export default function FirmHierarchy() {
  const [firms, setFirms] = useState<any[]>([])
  const [advisers, setAdvisers] = useState<any[]>([])
  const [newFirm, setNewFirm] = useState({ name: '', fca_ref: '' })
  const [newAdviser, setNewAdviser] = useState({ name: '', email: '', firm_id: '', role: 'adviser' })

  const load = async () => {
    const [f, a] = await Promise.all([
      supabase.from('firms').select('*').order('name'),
      supabase.from('advisers').select('*').order('name'),
    ])
    setFirms(f.data || [])
    setAdvisers(a.data || [])
  }
  useEffect(() => { load() }, [])

  const addFirm = async () => {
    if (!newFirm.name) return
    const { error } = await supabase.from('firms').insert(newFirm)
    if (error) toast.error(error.message)
    else { toast.success('Firm added'); setNewFirm({ name: '', fca_ref: '' }); load() }
  }

  const addAdviser = async () => {
    if (!newAdviser.name || !newAdviser.firm_id) return
    const { error } = await supabase.from('advisers').insert(newAdviser)
    if (error) toast.error(error.message)
    else { toast.success('Adviser added'); setNewAdviser({ name: '', email: '', firm_id: '', role: 'adviser' }); load() }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Building2 className="h-6 w-6" />Firms & Advisers</h1>
          <p className="text-sm text-muted-foreground">IFA network hierarchy with fee splits and agency assignments</p>
        </div>
        <Dialog>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Add firm</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New firm</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Firm name</Label><Input value={newFirm.name} onChange={e => setNewFirm({ ...newFirm, name: e.target.value })} /></div>
              <div><Label>FCA reference</Label><Input value={newFirm.fca_ref} onChange={e => setNewFirm({ ...newFirm, fca_ref: e.target.value })} /></div>
              <Button onClick={addFirm}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {firms.map(f => {
          const firmAdvisers = advisers.filter(a => a.firm_id === f.id)
          return (
            <Card key={f.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">{f.name}</h3>
                  <div className="text-xs text-muted-foreground">FCA: {f.fca_ref || '—'}</div>
                </div>
                <Badge variant="secondary">{firmAdvisers.length} advisers</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                <div><div className="text-muted-foreground">Platform fee</div><div className="font-medium">{f.default_platform_fee_pct}%</div></div>
                <div><div className="text-muted-foreground">Adviser fee</div><div className="font-medium">{f.default_adviser_fee_pct}%</div></div>
              </div>

              <div className="mt-4 space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" />Advisers</div>
                {firmAdvisers.map(a => (
                  <div key={a.id} className="flex items-center justify-between text-sm border-b border-border py-1.5">
                    <div>
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-muted-foreground">{a.email}</div>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">{a.role}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="p-4">
        <h2 className="font-semibold mb-3">Add adviser</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input placeholder="Name" value={newAdviser.name} onChange={e => setNewAdviser({ ...newAdviser, name: e.target.value })} />
          <Input placeholder="Email" value={newAdviser.email} onChange={e => setNewAdviser({ ...newAdviser, email: e.target.value })} />
          <select className="bg-background border border-input rounded-md px-3 py-2 text-sm" value={newAdviser.firm_id} onChange={e => setNewAdviser({ ...newAdviser, firm_id: e.target.value })}>
            <option value="">Select firm...</option>
            {firms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <Button onClick={addAdviser}>Add adviser</Button>
        </div>
      </Card>
    </div>
  )
}
