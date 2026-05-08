import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader, StatCard } from "@/components/ui/page-primitives"
import { formatGBP } from "@/lib/pensionCalculations"

export default function SSASModule() {
  const [schemes, setSchemes] = useState<any[]>([])
  const [loanbacks, setLoanbacks] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  useEffect(() => {
    supabase.from('ssas_schemes').select('*').then(({ data }) => setSchemes(data || []))
    supabase.from('ssas_loanbacks').select('*').then(({ data }) => setLoanbacks(data || []))
    supabase.from('ssas_members').select('*').then(({ data }) => setMembers(data || []))
  }, [])
  const totalAssets = schemes.reduce((s, x) => s + Number(x.total_assets || 0), 0)
  const totalLoans = loanbacks.reduce((s, x) => s + Number(x.outstanding_balance || 0), 0)
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader title="SSAS Administration" description="Small Self-Administered Schemes — member-trustees, loanbacks, 50% test." />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Schemes" value={schemes.length} />
        <StatCard label="Total assets" value={formatGBP(totalAssets)} />
        <StatCard label="Loanbacks outstanding" value={formatGBP(totalLoans)} />
        <StatCard label="Members" value={members.length} />
      </div>
      <Tabs defaultValue="schemes">
        <TabsList><TabsTrigger value="schemes">Schemes</TabsTrigger><TabsTrigger value="loanbacks">Loanbacks</TabsTrigger><TabsTrigger value="members">Members</TabsTrigger></TabsList>
        <TabsContent value="schemes">
          <Card><CardContent className="pt-6">
            <Table>
              <TableHeader><TableRow><TableHead>Ref</TableHead><TableHead>Scheme</TableHead><TableHead>Sponsoring employer</TableHead><TableHead>Trustee</TableHead><TableHead className="text-right">Assets</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{schemes.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.scheme_ref}</TableCell>
                  <TableCell className="font-medium">{s.scheme_name}</TableCell>
                  <TableCell>{s.sponsoring_employer}</TableCell>
                  <TableCell className="text-sm">{s.professional_trustee}</TableCell>
                  <TableCell className="text-right">{formatGBP(Number(s.total_assets))}</TableCell>
                  <TableCell><Badge>{s.status}</Badge></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="loanbacks">
          <Card><CardContent className="pt-6">
            <Table>
              <TableHeader><TableRow><TableHead>Borrower</TableHead><TableHead className="text-right">Principal</TableHead><TableHead className="text-right">Outstanding</TableHead><TableHead>Rate</TableHead><TableHead>Charge</TableHead><TableHead>50% test</TableHead></TableRow></TableHeader>
              <TableBody>{loanbacks.map(l => (
                <TableRow key={l.id}>
                  <TableCell>{l.borrower_employer}</TableCell>
                  <TableCell className="text-right">{formatGBP(Number(l.principal))}</TableCell>
                  <TableCell className="text-right">{formatGBP(Number(l.outstanding_balance))}</TableCell>
                  <TableCell>{(Number(l.interest_rate) * 100).toFixed(2)}%</TableCell>
                  <TableCell className="text-sm">{l.charge_secured}</TableCell>
                  <TableCell><Badge variant={l.fifty_pct_test_pass ? 'default' : 'destructive'}>{l.fifty_pct_test_pass ? 'PASS' : 'FAIL'}</Badge></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="members">
          <Card><CardContent className="pt-6">
            <Table>
              <TableHeader><TableRow><TableHead>Scheme</TableHead><TableHead>Trustee</TableHead><TableHead className="text-right">Share %</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
              <TableBody>{members.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">{schemes.find(s => s.id === m.scheme_id)?.scheme_ref || m.scheme_id?.slice(0, 8)}</TableCell>
                  <TableCell>{m.is_trustee ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right">{Number(m.share_pct).toFixed(0)}%</TableCell>
                  <TableCell>{m.joined_date}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
