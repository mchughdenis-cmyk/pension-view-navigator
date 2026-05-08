import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { ShieldCheck, AlertTriangle } from 'lucide-react'

const fmtGBP = (n: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n)

export default function CASSReconciliation() {
  const [recons, setRecons] = useState<any[]>([])
  const [breaches, setBreaches] = useState<any[]>([])
  const [external, setExternal] = useState('')
  const [running, setRunning] = useState(false)

  const load = async () => {
    const [r, b] = await Promise.all([
      supabase.from('cass_reconciliations').select('*').order('recon_date', { ascending: false }).limit(30),
      supabase.from('cass_breaches').select('*').eq('status', 'open').order('breach_date', { ascending: false }),
    ])
    setRecons(r.data || [])
    setBreaches(b.data || [])
  }

  useEffect(() => { load() }, [])

  const runRecon = async () => {
    setRunning(true)
    try {
      const url = `https://hzmkgkgrelxwmkswdkyw.supabase.co/functions/v1/cass-reconciliation`
      const body: any = {}
      if (external) body.external_balance = Number(external)
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = await res.json()
      if (json.status === 'passed') toast.success(`CASS passed — variance £${json.variance}`)
      else toast.error(`CASS breach — variance £${json.variance}`)
      load()
    } catch (e: any) { toast.error(e.message) }
    setRunning(false)
  }

  const lastPassed = recons.find(r => r.status === 'passed')

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-4">
      <header>
        <h1 className="text-2xl font-semibold flex items-center gap-2"><ShieldCheck className="h-6 w-6" />CASS 7 Client Money Reconciliation</h1>
        <p className="text-sm text-muted-foreground">Daily reconciliation of internal client cash vs external bank balance per FCA CASS rules</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4"><div className="text-xs text-muted-foreground">Latest passed</div>
          <div className="text-lg font-semibold mt-1">{lastPassed ? new Date(lastPassed.recon_date).toLocaleDateString('en-GB') : '—'}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Open breaches</div>
          <div className="text-lg font-semibold mt-1 flex items-center gap-2">
            {breaches.length}
            {breaches.length > 0 && <AlertTriangle className="h-4 w-4 text-destructive" />}
          </div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Total reconciliations (30d)</div>
          <div className="text-lg font-semibold mt-1">{recons.length}</div></Card>
      </div>

      <Card className="p-4">
        <h2 className="font-semibold mb-3">Run reconciliation</h2>
        <div className="flex items-end gap-3 max-w-xl">
          <div className="flex-1">
            <Label className="text-xs">External bank balance (optional)</Label>
            <Input type="number" value={external} onChange={e => setExternal(e.target.value)} placeholder="Leave blank to use latest bank file" />
          </div>
          <Button onClick={runRecon} disabled={running}>{running ? 'Running...' : 'Reconcile'}</Button>
        </div>
      </Card>

      {breaches.length > 0 && (
        <Card className="p-4 border-destructive/50">
          <h2 className="font-semibold mb-3 text-destructive">Open breaches</h2>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Severity</TableHead><TableHead>Amount</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
            <TableBody>{breaches.map(b => (
              <TableRow key={b.id}>
                <TableCell>{new Date(b.breach_date).toLocaleDateString('en-GB')}</TableCell>
                <TableCell>{b.breach_type}</TableCell>
                <TableCell><Badge variant={b.severity === 'major' ? 'destructive' : 'secondary'}>{b.severity}</Badge></TableCell>
                <TableCell>{fmtGBP(Number(b.amount))}</TableCell>
                <TableCell className="text-sm">{b.description}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </Card>
      )}

      <Card className="p-4">
        <h2 className="font-semibold mb-3">Recent reconciliations</h2>
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Internal</TableHead><TableHead>External</TableHead><TableHead>Variance</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{recons.map(r => (
            <TableRow key={r.id}>
              <TableCell>{new Date(r.recon_date).toLocaleDateString('en-GB')}</TableCell>
              <TableCell>{fmtGBP(Number(r.internal_balance))}</TableCell>
              <TableCell>{fmtGBP(Number(r.external_balance))}</TableCell>
              <TableCell className={Math.abs(Number(r.variance)) > 1 ? 'text-destructive font-medium' : ''}>{fmtGBP(Number(r.variance))}</TableCell>
              <TableCell><Badge variant={r.status === 'passed' ? 'secondary' : 'destructive'}>{r.status}</Badge></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </Card>
    </div>
  )
}
