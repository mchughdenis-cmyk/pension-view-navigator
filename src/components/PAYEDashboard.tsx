import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { PageHeader, StatCard } from "@/components/ui/page-primitives"
import { formatGBP, calculateIncomeTax } from "@/lib/pensionCalculations"
import { toast } from "sonner"
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, Plus, TrendingDown } from "lucide-react"
import { useFirm } from "@/contexts/FirmContext"

interface PayeRun { id: string; period: string; pay_date: string; total_gross: number; total_tax: number; total_ni: number; total_net: number; status: string; fps_ref: string | null }
interface PayePayment { id: string; run_id: string; client_id: string; gross: number; tax_code: string; paye: number; ni: number; net: number }
interface ClientRow { id: string; first_name: string; last_name: string }
interface AccountRow { id: string; client_id: string; account_type: string; cash_balance: number; total_value: number }
interface Line {
  client_id: string
  selected: boolean
  gross: number
  tax_code: string
  account_id?: string
  cash_balance: number
  total_value: number
  paye: number
  net: number
  shortfall: number
  trade_raised: boolean
  trade_order_id?: string
}

type Step = 'select' | 'cashcheck' | 'confirm'

export default function PAYEDashboard() {
  const { firmId } = useFirm()
  const [runs, setRuns] = useState<PayeRun[]>([])
  const [paymentsByRun, setPaymentsByRun] = useState<Record<string, PayePayment[]>>({})
  const [clients, setClients] = useState<ClientRow[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('select')

  const today = new Date().toISOString().slice(0, 10)
  const thisPeriod = new Date().toISOString().slice(0, 7)
  const [form, setForm] = useState({ period: thisPeriod, pay_date: today })
  const [lines, setLines] = useState<Line[]>([])

  const load = async () => {
    const { data: r } = await supabase.from('paye_runs').select('*').order('pay_date', { ascending: false })
    setRuns((r as PayeRun[]) || [])
    const { data: p } = await supabase.from('paye_payments').select('*')
    const grouped: Record<string, PayePayment[]> = {}
    ;((p as PayePayment[]) || []).forEach(pay => { (grouped[pay.run_id] ||= []).push(pay) })
    setPaymentsByRun(grouped)
  }
  useEffect(() => { load() }, [])

  const openCreate = async () => {
    const { data } = await supabase.from('clients').select('id, first_name, last_name').eq('status', 'active').order('last_name')
    const cs = (data as ClientRow[]) || []
    setClients(cs)
    // pull SIPP accounts for these clients
    const { data: accs } = await supabase.from('client_accounts').select('id, client_id, account_type, cash_balance, total_value').in('account_type', ['SIPP', 'sipp'])
    const accByClient: Record<string, AccountRow> = {}
    ;((accs as AccountRow[]) || []).forEach(a => { accByClient[a.client_id] = a })
    setLines(cs.map(c => {
      const a = accByClient[c.id]
      return {
        client_id: c.id, selected: false, gross: 1500, tax_code: '1257L M1',
        account_id: a?.id, cash_balance: Number(a?.cash_balance || 0), total_value: Number(a?.total_value || 0),
        paye: 0, net: 0, shortfall: 0, trade_raised: false,
      }
    }))
    setStep('select')
    setOpen(true)
  }

  const computeTax = (gross: number) => {
    const paye = Math.round(calculateIncomeTax(gross).totalTax * 100) / 100
    const net = Math.round((gross - paye) * 100) / 100
    return { paye, net }
  }

  const goCashCheck = () => {
    const selected = lines.filter(l => l.selected && l.gross > 0)
    if (!selected.length) { toast.error('Select at least one client'); return }
    setLines(lines.map(l => {
      if (!l.selected || l.gross <= 0) return l
      const { paye, net } = computeTax(l.gross)
      const shortfall = Math.max(0, net - l.cash_balance)
      return { ...l, paye, net, shortfall }
    }))
    setStep('cashcheck')
  }

  const raiseTrade = async (idx: number) => {
    const l = lines[idx]
    if (!l.account_id) { toast.error('No SIPP account for this client'); return }
    if (l.shortfall <= 0) return
    // Pick largest holding to sell, fall back to "CASH SELL"
    const { data: holdings } = await supabase.from('investments').select('id, fund_name, current_value').eq('account_id', l.account_id).order('current_value', { ascending: false }).limit(1)
    const instrument = (holdings && holdings[0]?.fund_name) || 'TBD — largest holding'
    const { data: order, error } = await supabase.from('trade_orders').insert({
      client_id: l.client_id, account_id: l.account_id,
      client_name: clients.find(c => c.id === l.client_id)?.last_name || '',
      account_type: 'SIPP', side: 'sell', instrument,
      quantity: 0, price: 0, value: l.shortfall, status: 'pending',
    }).select().single()
    if (error || !order) { toast.error(error?.message || 'Failed to raise trade'); return }
    const n = [...lines]; n[idx] = { ...l, trade_raised: true, trade_order_id: order.id }; setLines(n)
    toast.success(`Sell instruction raised: ${formatGBP(l.shortfall)} ${instrument}`)
  }

  const createRun = async () => {
    const selected = lines.filter(l => l.selected && l.gross > 0)
    const blocked = selected.filter(l => l.shortfall > 0 && !l.trade_raised)
    if (blocked.length) { toast.error(`${blocked.length} payment(s) have a cash shortfall — raise sell instructions first`); return }

    const totals = selected.reduce((a, c) => ({
      gross: a.gross + c.gross, tax: a.tax + c.paye, ni: a.ni, net: a.net + c.net,
    }), { gross: 0, tax: 0, ni: 0, net: 0 })

    const status = selected.some(l => l.shortfall > 0) ? 'awaiting_settlement' : 'draft'
    const { data: run, error } = await supabase.from('paye_runs').insert({
      period: form.period, pay_date: form.pay_date,
      total_gross: totals.gross, total_tax: totals.tax, total_ni: totals.ni, total_net: totals.net,
      status,
    }).select().single()
    if (error || !run) { toast.error(error?.message || 'Failed to create run'); return }

    const payRows = selected.map(c => ({
      run_id: run.id, client_id: c.client_id, gross: c.gross, tax_code: c.tax_code,
      paye: c.paye, ni: 0, net: c.net,
    }))
    const { error: pErr } = await supabase.from('paye_payments').insert(payRows)
    if (pErr) { toast.error(pErr.message); return }

    toast.success(`Pay run created — ${selected.length} payment(s), status: ${status.replace('_', ' ')}`)
    setOpen(false)
    load()
  }

  const submit = async (id: string) => {
    await supabase.from('paye_runs').update({ status: 'submitted', fps_ref: 'FPS-' + Date.now() }).eq('id', id)
    await supabase.from('hmrc_submissions').insert({ submission_type: 'rti_paye', period: thisPeriod, status: 'submitted', total_amount: 0, hmrc_ref: 'HMRC-RTI-' + Date.now(), submitted_at: new Date().toISOString() })
    toast.success('FPS submitted to HMRC')
    load()
  }

  const markPaid = async (id: string) => {
    // Post withdrawal transactions debiting each client's SIPP cash
    const pays = paymentsByRun[id] || []
    const { data: accs } = await supabase.from('client_accounts').select('id, client_id, account_type, cash_balance').in('account_type', ['SIPP', 'sipp']).in('client_id', pays.map(p => p.client_id))
    const accByClient: Record<string, AccountRow> = {}
    ;((accs as AccountRow[]) || []).forEach(a => { accByClient[a.client_id] = a })
    const run = runs.find(r => r.id === id)
    const txRows: any[] = []
    for (const p of pays) {
      const a = accByClient[p.client_id]
      if (!a) continue
      txRows.push({
        account_id: a.id, client_id: p.client_id, transaction_type: 'pension_payment',
        description: `Drawdown income (period ${run?.period}) — gross ${formatGBP(Number(p.gross))}, PAYE ${formatGBP(Number(p.paye))}`,
        amount: -Number(p.net), reference: `PAYE-${id.slice(0, 8)}`, status: 'completed',
        effective_date: run?.pay_date || today,
      })
      await supabase.from('client_accounts').update({ cash_balance: Number(a.cash_balance) - Number(p.net) }).eq('id', a.id)
    }
    if (txRows.length) await supabase.from('transactions').insert(txRows)
    await supabase.from('paye_runs').update({ status: 'paid' }).eq('id', id)
    toast.success(`Pay run paid — ${txRows.length} cash debit(s) posted`)
    load()
  }

  const clientName = (id: string) => {
    const c = clients.find(x => x.id === id)
    return c ? `${c.first_name} ${c.last_name}` : id.slice(0, 8)
  }

  const ytdGross = runs.reduce((s, r) => s + Number(r.total_gross || 0), 0)
  const ytdTax = runs.reduce((s, r) => s + Number(r.total_tax || 0), 0)
  const selectedLines = lines.filter(l => l.selected && l.gross > 0)
  const shortfallCount = selectedLines.filter(l => l.shortfall > 0 && !l.trade_raised).length

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="PAYE / RTI Engine"
        description="Drawdown payroll runs — cash check, trade raising, FPS submission and ledger posting."
        actions={
          <Dialog open={open} onOpenChange={(o) => o ? openCreate() : setOpen(false)}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> New pay run</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create pay run · Step {step === 'select' ? 1 : step === 'cashcheck' ? 2 : 3} of 3</DialogTitle>
                <DialogDescription>
                  {step === 'select' && 'Select clients to include and set gross income for this period.'}
                  {step === 'cashcheck' && 'Cash check against SIPP balances. Raise sell instructions for any shortfall.'}
                  {step === 'confirm' && 'Review and create the pay run.'}
                </DialogDescription>
              </DialogHeader>

              {step === 'select' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Period (YYYY-MM)</Label><Input value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} /></div>
                    <div><Label>Pay date</Label><Input type="date" value={form.pay_date} onChange={e => setForm({ ...form, pay_date: e.target.value })} /></div>
                  </div>
                  <div className="max-h-80 overflow-auto border rounded">
                    <Table>
                      <TableHeader><TableRow><TableHead className="w-10"></TableHead><TableHead>Client</TableHead><TableHead className="text-right">SIPP cash</TableHead><TableHead>Tax code</TableHead><TableHead className="text-right">Gross (£)</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {lines.map((l, i) => (
                          <TableRow key={l.client_id}>
                            <TableCell><Checkbox checked={l.selected} disabled={!l.account_id} onCheckedChange={v => { const n = [...lines]; n[i].selected = !!v; setLines(n) }} /></TableCell>
                            <TableCell>{clientName(l.client_id)}{!l.account_id && <span className="ml-2 text-xs text-muted-foreground">(no SIPP)</span>}</TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">{l.account_id ? formatGBP(l.cash_balance) : '—'}</TableCell>
                            <TableCell><Input className="h-8 w-28" value={l.tax_code} onChange={e => { const n = [...lines]; n[i].tax_code = e.target.value; setLines(n) }} /></TableCell>
                            <TableCell className="text-right"><Input className="h-8 w-28 ml-auto text-right" type="number" value={l.gross} onChange={e => { const n = [...lines]; n[i].gross = Number(e.target.value) || 0; setLines(n) }} /></TableCell>
                          </TableRow>
                        ))}
                        {!lines.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No active clients found</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={goCashCheck}>Next: cash check →</Button>
                  </DialogFooter>
                </>
              )}

              {step === 'cashcheck' && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <StatCard label="Payments" value={selectedLines.length} />
                    <StatCard label="Shortfalls" value={selectedLines.filter(l => l.shortfall > 0).length} />
                    <StatCard label="To be raised" value={shortfallCount} />
                  </div>
                  <div className="max-h-80 overflow-auto border rounded">
                    <Table>
                      <TableHeader><TableRow><TableHead>Client</TableHead><TableHead className="text-right">Net due</TableHead><TableHead className="text-right">SIPP cash</TableHead><TableHead className="text-right">Shortfall</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                      <TableBody>
                        {selectedLines.map(l => {
                          const idx = lines.findIndex(x => x.client_id === l.client_id)
                          const ok = l.shortfall <= 0
                          return (
                            <TableRow key={l.client_id}>
                              <TableCell>{clientName(l.client_id)}</TableCell>
                              <TableCell className="text-right">{formatGBP(l.net)}</TableCell>
                              <TableCell className="text-right">{formatGBP(l.cash_balance)}</TableCell>
                              <TableCell className="text-right">{l.shortfall > 0 ? <span className="text-destructive font-medium">{formatGBP(l.shortfall)}</span> : '—'}</TableCell>
                              <TableCell>
                                {ok && <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Sufficient</Badge>}
                                {!ok && l.trade_raised && <Badge variant="secondary" className="gap-1"><TrendingDown className="h-3 w-3" /> Trade raised</Badge>}
                                {!ok && !l.trade_raised && <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Short</Badge>}
                              </TableCell>
                              <TableCell>
                                {!ok && !l.trade_raised && <Button size="sm" variant="outline" onClick={() => raiseTrade(idx)}>Raise sell</Button>}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setStep('select')}>← Back</Button>
                    <Button onClick={() => setStep('confirm')} disabled={shortfallCount > 0}>
                      {shortfallCount > 0 ? `Resolve ${shortfallCount} shortfall(s)` : 'Next: confirm →'}
                    </Button>
                  </DialogFooter>
                </>
              )}

              {step === 'confirm' && (() => {
                const totals = selectedLines.reduce((a, c) => ({ gross: a.gross + c.gross, paye: a.paye + c.paye, net: a.net + c.net }), { gross: 0, paye: 0, net: 0 })
                const awaiting = selectedLines.some(l => l.shortfall > 0)
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <StatCard label="Total gross" value={formatGBP(totals.gross)} />
                      <StatCard label="Total PAYE" value={formatGBP(totals.paye)} />
                      <StatCard label="Total net" value={formatGBP(totals.net)} />
                    </div>
                    {awaiting && (
                      <div className="text-xs p-3 bg-secondary rounded border flex gap-2 items-start">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>Some payments require trade settlement. Run will be created with status <strong>awaiting_settlement</strong> until sell instructions clear; submit FPS once settled.</span>
                      </div>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setStep('cashcheck')}>← Back</Button>
                      <Button onClick={createRun}>Create pay run</Button>
                    </DialogFooter>
                  </>
                )
              })()}
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="YTD gross" value={formatGBP(ytdGross)} />
        <StatCard label="YTD PAYE" value={formatGBP(ytdTax)} />
        <StatCard label="Pay runs" value={runs.length} />
      </div>
      <Card>
        <CardHeader><CardTitle>Pay runs</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead className="w-8"></TableHead><TableHead>Period</TableHead><TableHead>Pay date</TableHead><TableHead className="text-right">Gross</TableHead><TableHead className="text-right">PAYE</TableHead><TableHead className="text-right">Net</TableHead><TableHead>Status</TableHead><TableHead>FPS ref</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>{runs.map(r => {
              const isOpen = expanded[r.id]
              const pays = paymentsByRun[r.id] || []
              return (
                <>
                  <TableRow key={r.id}>
                    <TableCell><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpanded({ ...expanded, [r.id]: !isOpen })}>{isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</Button></TableCell>
                    <TableCell className="font-mono text-xs">{r.period}</TableCell>
                    <TableCell>{r.pay_date}</TableCell>
                    <TableCell className="text-right">{formatGBP(Number(r.total_gross))}</TableCell>
                    <TableCell className="text-right">{formatGBP(Number(r.total_tax))}</TableCell>
                    <TableCell className="text-right">{formatGBP(Number(r.total_net))}</TableCell>
                    <TableCell><Badge variant={r.status === 'paid' ? 'default' : r.status === 'submitted' ? 'secondary' : r.status === 'awaiting_settlement' ? 'destructive' : 'outline'}>{r.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{r.fps_ref || '—'}</TableCell>
                    <TableCell className="space-x-2">
                      {(r.status === 'draft' || r.status === 'awaiting_settlement') && <Button size="sm" onClick={() => submit(r.id)}>Submit FPS</Button>}
                      {r.status === 'submitted' && <Button size="sm" variant="outline" onClick={() => markPaid(r.id)}>Mark paid</Button>}
                    </TableCell>
                  </TableRow>
                  {isOpen && (
                    <TableRow key={r.id + '-detail'}>
                      <TableCell colSpan={9} className="bg-muted/30">
                        <div className="p-2">
                          <div className="text-xs font-semibold mb-2">{pays.length} payment line(s)</div>
                          <Table>
                            <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Tax code</TableHead><TableHead className="text-right">Gross</TableHead><TableHead className="text-right">PAYE</TableHead><TableHead className="text-right">Net</TableHead></TableRow></TableHeader>
                            <TableBody>{pays.map(p => (
                              <TableRow key={p.id}>
                                <TableCell className="font-mono text-xs">{p.client_id.slice(0, 8)}</TableCell>
                                <TableCell>{p.tax_code}</TableCell>
                                <TableCell className="text-right">{formatGBP(Number(p.gross))}</TableCell>
                                <TableCell className="text-right">{formatGBP(Number(p.paye))}</TableCell>
                                <TableCell className="text-right">{formatGBP(Number(p.net))}</TableCell>
                              </TableRow>
                            ))}</TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )
            })}
            {!runs.length && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-6">No pay runs yet — click "New pay run" to create one.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
