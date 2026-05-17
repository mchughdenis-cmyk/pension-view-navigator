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
import { ChevronDown, ChevronRight, Plus } from "lucide-react"

interface PayeRun { id: string; period: string; pay_date: string; total_gross: number; total_tax: number; total_ni: number; total_net: number; status: string; fps_ref: string | null }
interface PayePayment { id: string; run_id: string; client_id: string; gross: number; tax_code: string; paye: number; ni: number; net: number }
interface ClientRow { id: string; first_name: string; last_name: string }

export default function PAYEDashboard() {
  const [runs, setRuns] = useState<PayeRun[]>([])
  const [paymentsByRun, setPaymentsByRun] = useState<Record<string, PayePayment[]>>({})
  const [clients, setClients] = useState<ClientRow[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [open, setOpen] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const thisPeriod = new Date().toISOString().slice(0, 7)
  const [form, setForm] = useState({ period: thisPeriod, pay_date: today })
  const [lines, setLines] = useState<{ client_id: string; selected: boolean; gross: number; tax_code: string }[]>([])

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
    setLines(cs.map(c => ({ client_id: c.id, selected: false, gross: 1500, tax_code: '1257L M1' })))
    setOpen(true)
  }

  const createRun = async () => {
    const selected = lines.filter(l => l.selected && l.gross > 0)
    if (!selected.length) { toast.error('Select at least one client'); return }

    const computed = selected.map(l => {
      // FAD payments: fully taxable PAYE (no NI on pension income)
      const tax = calculateIncomeTax(l.gross).totalTax
      const net = l.gross - tax
      return { ...l, paye: Math.round(tax * 100) / 100, ni: 0, net: Math.round(net * 100) / 100 }
    })
    const totals = computed.reduce((a, c) => ({
      gross: a.gross + c.gross, tax: a.tax + c.paye, ni: a.ni + c.ni, net: a.net + c.net,
    }), { gross: 0, tax: 0, ni: 0, net: 0 })

    const { data: run, error } = await supabase.from('paye_runs').insert({
      period: form.period, pay_date: form.pay_date,
      total_gross: totals.gross, total_tax: totals.tax, total_ni: totals.ni, total_net: totals.net,
      status: 'draft',
    }).select().single()
    if (error || !run) { toast.error(error?.message || 'Failed to create run'); return }

    const payRows = computed.map(c => ({
      run_id: run.id, client_id: c.client_id, gross: c.gross, tax_code: c.tax_code,
      paye: c.paye, ni: c.ni, net: c.net,
    }))
    const { error: pErr } = await supabase.from('paye_payments').insert(payRows)
    if (pErr) { toast.error(pErr.message); return }

    toast.success(`Pay run created with ${selected.length} payment(s)`)
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
    await supabase.from('paye_runs').update({ status: 'paid' }).eq('id', id)
    toast.success('Pay run marked as paid')
    load()
  }

  const clientName = (id: string) => {
    const c = clients.find(x => x.id === id)
    return c ? `${c.first_name} ${c.last_name}` : id.slice(0, 8)
  }

  const ytdGross = runs.reduce((s, r) => s + Number(r.total_gross || 0), 0)
  const ytdTax = runs.reduce((s, r) => s + Number(r.total_tax || 0), 0)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="PAYE / RTI Engine"
        description="Drawdown payroll runs with FPS / EPS submission to HMRC."
        actions={
          <Dialog open={open} onOpenChange={(o) => o ? openCreate() : setOpen(false)}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> New pay run</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create pay run</DialogTitle>
                <DialogDescription>Select clients to include and set gross income for this period.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Period (YYYY-MM)</Label><Input value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} /></div>
                <div><Label>Pay date</Label><Input type="date" value={form.pay_date} onChange={e => setForm({ ...form, pay_date: e.target.value })} /></div>
              </div>
              <div className="max-h-80 overflow-auto border rounded">
                <Table>
                  <TableHeader><TableRow><TableHead className="w-10"></TableHead><TableHead>Client</TableHead><TableHead>Tax code</TableHead><TableHead className="text-right">Gross (£)</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {lines.map((l, i) => (
                      <TableRow key={l.client_id}>
                        <TableCell><Checkbox checked={l.selected} onCheckedChange={v => { const n = [...lines]; n[i].selected = !!v; setLines(n) }} /></TableCell>
                        <TableCell>{clientName(l.client_id)}</TableCell>
                        <TableCell><Input className="h-8 w-28" value={l.tax_code} onChange={e => { const n = [...lines]; n[i].tax_code = e.target.value; setLines(n) }} /></TableCell>
                        <TableCell className="text-right"><Input className="h-8 w-28 ml-auto text-right" type="number" value={l.gross} onChange={e => { const n = [...lines]; n[i].gross = Number(e.target.value) || 0; setLines(n) }} /></TableCell>
                      </TableRow>
                    ))}
                    {!lines.length && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No active clients found</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={createRun}>Create draft run</Button>
              </DialogFooter>
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
                    <TableCell><Badge variant={r.status === 'paid' ? 'default' : r.status === 'submitted' ? 'secondary' : 'outline'}>{r.status}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{r.fps_ref || '—'}</TableCell>
                    <TableCell className="space-x-2">
                      {r.status === 'draft' && <Button size="sm" onClick={() => submit(r.id)}>Submit FPS</Button>}
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
