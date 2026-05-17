import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowRightLeft, Plus, Search, CheckCircle2, XCircle, AlertTriangle, Send,
  RefreshCw, Building2, Loader2, ChevronRight,
} from 'lucide-react'

type Transfer = {
  id: string; origo_ref: string; direction: 'inbound' | 'outbound';
  client_name: string; client_ref: string | null;
  ceding_provider: string; receiving_provider: string;
  transfer_value: number; transfer_type: string;
  current_state: string; progress_pct: number;
  expected_settlement_date: string | null; actual_settlement_date: string | null;
  rejection_reason: string | null; last_event_at: string;
}

// state -> { label, next_action_label, next_action }
const STATE_META: Record<string, { label: string; action?: string; actionLabel?: string; terminal?: boolean }> = {
  initiated:           { label: 'Initiated',            action: 'send_discovery',     actionLabel: 'Send discovery' },
  discovery_sent:      { label: 'Discovery sent',       action: 'send_discovery' },
  discovery_acked:     { label: 'Discovery acknowledged', action: 'request_quote',    actionLabel: 'Request quote' },
  quote_pending:       { label: 'Quote pending' },
  quote_received:      { label: 'Quote received',       action: 'send_option',        actionLabel: 'Send option to proceed' },
  option_sent:         { label: 'Option sent' },
  ceding_confirmed:    { label: 'Ceding confirmed',     action: 'request_settlement', actionLabel: 'Instruct settlement' },
  settlement_pending:  { label: 'Settlement pending' },
  settled:             { label: 'Settled',              terminal: true },
  rejected:            { label: 'Rejected',             terminal: true },
  cancelled:           { label: 'Cancelled',            terminal: true },
}

const STATE_STYLE: Record<string, string> = {
  settled:   'bg-green-500/15 text-green-600 border-green-500/30',
  rejected:  'bg-red-500/15 text-red-600 border-red-500/30',
  cancelled: 'bg-slate-500/15 text-slate-500 border-slate-500/30',
}

const fmt = (n: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0 }).format(n)

export default function OrigoTransfers() {
  const { toast } = useToast()
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [advancing, setAdvancing] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [newOpen, setNewOpen] = useState(false)
  const [form, setForm] = useState({ direction: 'inbound', client_name: '', client_ref: '', provider: '', value: '', type: 'cetv' })

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('origo_transfers').select('*').order('last_event_at', { ascending: false })
    setTransfers((data as Transfer[]) || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const advance = async (t: Transfer, action: string) => {
    setAdvancing(t.id)
    try {
      const { data, error } = await supabase.functions.invoke('origo-state-machine', { body: { transfer_id: t.id, action } })
      if (error) throw error
      toast({ title: 'Transfer advanced', description: `Now: ${STATE_META[data.state]?.label ?? data.state}` })
      await load()
    } catch (e: any) {
      toast({ title: 'Action failed', description: e.message, variant: 'destructive' })
    } finally {
      setAdvancing(null)
    }
  }

  const createTransfer = async () => {
    if (!form.client_name || !form.provider || !form.value) {
      toast({ title: 'Missing fields', variant: 'destructive' }); return
    }
    const ref = `ORG-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000 + 100000)}`
    const row = {
      origo_ref: ref, direction: form.direction, client_name: form.client_name, client_ref: form.client_ref || null,
      ceding_provider: form.direction === 'inbound' ? form.provider : 'Airgead SIPP',
      receiving_provider: form.direction === 'inbound' ? 'Airgead SIPP' : form.provider,
      transfer_value: Number(form.value), transfer_type: form.type,
      current_state: 'initiated', progress_pct: 5,
    }
    const { error } = await supabase.from('origo_transfers').insert(row)
    if (error) { toast({ title: 'Create failed', description: error.message, variant: 'destructive' }); return }
    toast({ title: 'Transfer created', description: ref })
    setNewOpen(false); setForm({ direction: 'inbound', client_name: '', client_ref: '', provider: '', value: '', type: 'cetv' })
    await load()
  }

  const filtered = transfers.filter(t => {
    const s = search.toLowerCase()
    const matchSearch = !s || t.client_name.toLowerCase().includes(s) || t.origo_ref.toLowerCase().includes(s) || (t.client_ref ?? '').toLowerCase().includes(s)
    const matchState = stateFilter === 'all' || t.current_state === stateFilter
    const matchType = typeFilter === 'all' || t.direction === typeFilter
    return matchSearch && matchState && matchType
  })

  const stats = {
    total: transfers.length,
    active: transfers.filter(t => !STATE_META[t.current_state]?.terminal).length,
    settled: transfers.filter(t => t.current_state === 'settled').length,
    inboundValue: transfers.filter(t => t.direction === 'inbound' && t.current_state !== 'rejected' && t.current_state !== 'cancelled')
      .reduce((s, t) => s + Number(t.transfer_value || 0), 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Origo Transfer Service</h2>
          <p className="text-muted-foreground">Live state machine — discovery → quote → option → settlement</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Dialog open={newOpen} onOpenChange={setNewOpen}>
            <DialogTrigger asChild><Button data-testid="new-transfer-btn"><Plus className="w-4 h-4 mr-2" />New Transfer</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Initiate Origo transfer</DialogTitle>
                <DialogDescription>Creates an inbound or outbound transfer in the <code>initiated</code> state.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Direction</Label>
                    <Select value={form.direction} onValueChange={v => setForm({ ...form, direction: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inbound">Inbound</SelectItem>
                        <SelectItem value="outbound">Outbound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cetv">CETV (cash)</SelectItem>
                        <SelectItem value="in_specie">In-specie</SelectItem>
                        <SelectItem value="dc_to_dc">DC to DC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Client name</Label><Input value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Client reference</Label><Input value={form.client_ref} onChange={e => setForm({ ...form, client_ref: e.target.value })} placeholder="CL-..." /></div>
                <div className="space-y-2"><Label>{form.direction === 'inbound' ? 'Ceding' : 'Receiving'} provider</Label><Input value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} placeholder="Aviva, Standard Life..." /></div>
                <div className="space-y-2"><Label>Transfer value (£)</Label><Input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} /></div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
                <Button onClick={createTransfer}><Send className="w-4 h-4 mr-2" />Initiate</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><ArrowRightLeft className="w-8 h-8 text-primary" /><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Total</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Loader2 className="w-8 h-8 text-blue-500" /><div><p className="text-2xl font-bold">{stats.active}</p><p className="text-sm text-muted-foreground">Active</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><CheckCircle2 className="w-8 h-8 text-green-500" /><div><p className="text-2xl font-bold">{stats.settled}</p><p className="text-sm text-muted-foreground">Settled</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Building2 className="w-8 h-8 text-primary" /><div><p className="text-2xl font-bold">{fmt(stats.inboundValue)}</p><p className="text-sm text-muted-foreground">Inbound value</p></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by client, ref, Origo ID..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-full md:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All states</SelectItem>
                {Object.entries(STATE_META).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All directions</SelectItem>
                <SelectItem value="inbound">Inbound</SelectItem>
                <SelectItem value="outbound">Outbound</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Origo ref</TableHead><TableHead>Client</TableHead><TableHead>Direction</TableHead>
              <TableHead>Counterparty</TableHead><TableHead>Value</TableHead>
              <TableHead>State</TableHead><TableHead className="w-[260px]">Progress</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {loading && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>}
              {!loading && filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No transfers</TableCell></TableRow>}
              {filtered.map(t => {
                const meta = STATE_META[t.current_state] ?? { label: t.current_state }
                const style = STATE_STYLE[t.current_state] ?? 'bg-blue-500/15 text-blue-600 border-blue-500/30'
                return (
                  <TableRow key={t.id} data-testid={`transfer-row-${t.origo_ref}`}>
                    <TableCell className="font-mono text-xs">{t.origo_ref}</TableCell>
                    <TableCell><div className="font-medium">{t.client_name}</div><div className="text-xs text-muted-foreground">{t.client_ref}</div></TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{t.direction}</Badge></TableCell>
                    <TableCell className="text-sm">{t.direction === 'inbound' ? t.ceding_provider : t.receiving_provider}</TableCell>
                    <TableCell>{fmt(Number(t.transfer_value))}</TableCell>
                    <TableCell><Badge variant="outline" className={style}>{meta.label}</Badge></TableCell>
                    <TableCell><div className="flex items-center gap-2"><Progress value={t.progress_pct} className="h-2" /><span className="text-xs text-muted-foreground w-8">{t.progress_pct}%</span></div></TableCell>
                    <TableCell className="text-right">
                      {meta.action && meta.actionLabel ? (
                        <Button size="sm" disabled={advancing === t.id} onClick={() => advance(t, meta.action!)} data-testid={`advance-${t.origo_ref}`}>
                          {advancing === t.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                          {meta.actionLabel}
                        </Button>
                      ) : meta.terminal ? (
                        t.current_state === 'settled' ? <CheckCircle2 className="w-5 h-5 text-green-500 inline" />
                        : t.current_state === 'rejected' ? <span title={t.rejection_reason ?? ''}><XCircle className="w-5 h-5 text-red-500 inline" /></span>
                        : <span className="text-xs text-muted-foreground">{meta.label}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic flex items-center gap-1 justify-end"><Loader2 className="w-3 h-3 animate-spin" />Awaiting counterparty</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {transfers.some(t => t.current_state === 'rejected') && (
        <Card className="border-yellow-500/30">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Rejected transfers require review</p>
              <p className="text-muted-foreground">Common causes: unreconciled GMP, scams flag (TPR amber/red), missing discharge forms.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
