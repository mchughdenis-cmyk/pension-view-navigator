import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader, StatCard } from "@/components/ui/page-primitives"
import { LSA_LIMIT, LSDBA_LIMIT, summariseAllowances } from "@/lib/lsaLsdba"
import { formatGBP } from "@/lib/pensionCalculations"

export default function LSAAllowance() {
  const [entries, setEntries] = useState<any[]>([])
  useEffect(() => { supabase.from('lsa_lsdba_ledger').select('*').order('event_date', { ascending: false }).then(({ data }) => setEntries(data || [])) }, [])
  const s = summariseAllowances(entries)
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader title="LSA / LSDBA Tracking" description={`Post-LTA allowances (effective 6 April 2024). LSA cap ${formatGBP(LSA_LIMIT)} · LSDBA cap ${formatGBP(LSDBA_LIMIT)}.`} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle>Lump Sum Allowance (LSA)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold">{formatGBP(s.lsaUsed)} <span className="text-sm font-normal text-muted-foreground">used</span></div>
            <Progress value={s.lsaPctUsed * 100} />
            <div className="text-sm text-muted-foreground">{formatGBP(s.lsaRemaining)} remaining</div>
          </CardContent></Card>
        <Card><CardHeader><CardTitle>Lump Sum &amp; Death Benefit Allowance (LSDBA)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold">{formatGBP(s.lsdbaUsed)} <span className="text-sm font-normal text-muted-foreground">used</span></div>
            <Progress value={s.lsdbaPctUsed * 100} />
            <div className="text-sm text-muted-foreground">{formatGBP(s.lsdbaRemaining)} remaining</div>
          </CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Allowance ledger</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Event</TableHead><TableHead className="text-right">LSA used</TableHead><TableHead className="text-right">LSDBA used</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
            <TableBody>{entries.map(e => (
              <TableRow key={e.id}>
                <TableCell>{e.event_date}</TableCell>
                <TableCell className="capitalize">{e.event_type.replace('_', ' ')}</TableCell>
                <TableCell className="text-right">{formatGBP(Number(e.lsa_used))}</TableCell>
                <TableCell className="text-right">{formatGBP(Number(e.lsdba_used))}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{e.notes}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
