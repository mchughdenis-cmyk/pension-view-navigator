import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader, StatCard } from "@/components/ui/page-primitives"
import { formatGBP } from "@/lib/pensionCalculations"
import { toast } from "sonner"

export default function PAYEDashboard() {
  const [runs, setRuns] = useState<any[]>([])
  const load = () => supabase.from('paye_runs').select('*').order('pay_date', { ascending: false }).then(({ data }) => setRuns(data || []))
  useEffect(() => { load() }, [])

  const submit = async (id: string) => {
    await supabase.from('paye_runs').update({ status: 'submitted', fps_ref: 'FPS-' + Date.now() }).eq('id', id)
    await supabase.from('hmrc_submissions').insert({ submission_type: 'rti_paye', period: new Date().toISOString().slice(0, 7), status: 'submitted', total_amount: 0, hmrc_ref: 'HMRC-RTI-' + Date.now(), submitted_at: new Date().toISOString() })
    toast.success('FPS submitted to HMRC')
    load()
  }

  const ytdGross = runs.reduce((s, r) => s + Number(r.total_gross || 0), 0)
  const ytdTax = runs.reduce((s, r) => s + Number(r.total_tax || 0), 0)
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader title="PAYE / RTI Engine" description="Drawdown payroll runs with FPS / EPS submission to HMRC." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="YTD gross" value={formatGBP(ytdGross)} />
        <StatCard label="YTD PAYE" value={formatGBP(ytdTax)} />
        <StatCard label="Pay runs" value={runs.length} />
      </div>
      <Card>
        <CardHeader><CardTitle>Pay runs</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Period</TableHead><TableHead>Pay date</TableHead><TableHead className="text-right">Gross</TableHead><TableHead className="text-right">PAYE</TableHead><TableHead className="text-right">Net</TableHead><TableHead>Status</TableHead><TableHead>FPS ref</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>{runs.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.period}</TableCell>
                <TableCell>{r.pay_date}</TableCell>
                <TableCell className="text-right">{formatGBP(Number(r.total_gross))}</TableCell>
                <TableCell className="text-right">{formatGBP(Number(r.total_tax))}</TableCell>
                <TableCell className="text-right">{formatGBP(Number(r.total_net))}</TableCell>
                <TableCell><Badge variant={r.status === 'paid' ? 'default' : r.status === 'submitted' ? 'secondary' : 'outline'}>{r.status}</Badge></TableCell>
                <TableCell className="font-mono text-xs">{r.fps_ref || '—'}</TableCell>
                <TableCell>{r.status === 'draft' && <Button size="sm" onClick={() => submit(r.id)}>Submit FPS</Button>}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
