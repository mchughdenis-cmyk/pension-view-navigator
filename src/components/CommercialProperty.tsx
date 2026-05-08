import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader, StatCard } from "@/components/ui/page-primitives"
import { formatGBP } from "@/lib/pensionCalculations"

export default function CommercialProperty() {
  const [props, setProps] = useState<any[]>([])
  const [leases, setLeases] = useState<any[]>([])
  const [rent, setRent] = useState<any[]>([])
  const [ins, setIns] = useState<any[]>([])
  useEffect(() => {
    supabase.from('commercial_properties').select('*').then(({ data }) => setProps(data || []))
    supabase.from('property_leases').select('*').then(({ data }) => setLeases(data || []))
    supabase.from('property_rent_ledger').select('*').order('due_date', { ascending: false }).then(({ data }) => setRent(data || []))
    supabase.from('property_insurance').select('*').then(({ data }) => setIns(data || []))
  }, [])
  const totalValue = props.reduce((s, p) => s + Number(p.valuation || 0), 0)
  const annualRent = leases.reduce((s, l) => s + Number(l.rent_pa || 0), 0)
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader title="Commercial Property" description="Pension-owned freehold/leasehold portfolio with rent collection and insurance." />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Properties" value={props.length} />
        <StatCard label="Total valuation" value={formatGBP(totalValue)} />
        <StatCard label="Annual rent" value={formatGBP(annualRent)} />
        <StatCard label="Active leases" value={leases.length} />
      </div>
      <Tabs defaultValue="properties">
        <TabsList><TabsTrigger value="properties">Properties</TabsTrigger><TabsTrigger value="leases">Leases</TabsTrigger><TabsTrigger value="rent">Rent ledger</TabsTrigger><TabsTrigger value="insurance">Insurance</TabsTrigger></TabsList>
        <TabsContent value="properties"><Card><CardContent className="pt-6"><Table>
          <TableHeader><TableRow><TableHead>Address</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Valuation</TableHead><TableHead>Valued</TableHead><TableHead>VAT</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{props.map(p => <TableRow key={p.id}><TableCell>{p.address}</TableCell><TableCell className="capitalize">{p.property_type}</TableCell><TableCell className="text-right">{formatGBP(Number(p.valuation))}</TableCell><TableCell>{p.valuation_date}</TableCell><TableCell>{p.vat_registered ? 'Yes' : 'No'}</TableCell><TableCell><Badge>{p.status}</Badge></TableCell></TableRow>)}</TableBody>
        </Table></CardContent></Card></TabsContent>
        <TabsContent value="leases"><Card><CardContent className="pt-6"><Table>
          <TableHeader><TableRow><TableHead>Tenant</TableHead><TableHead className="text-right">Rent p.a.</TableHead><TableHead>Frequency</TableHead><TableHead>Next review</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{leases.map(l => <TableRow key={l.id}><TableCell>{l.tenant_name}</TableCell><TableCell className="text-right">{formatGBP(Number(l.rent_pa))}</TableCell><TableCell className="capitalize">{l.frequency}</TableCell><TableCell>{l.next_review}</TableCell><TableCell><Badge>{l.status}</Badge></TableCell></TableRow>)}</TableBody>
        </Table></CardContent></Card></TabsContent>
        <TabsContent value="rent"><Card><CardContent className="pt-6"><Table>
          <TableHeader><TableRow><TableHead>Due</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Received</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{rent.map(r => <TableRow key={r.id}><TableCell>{r.due_date}</TableCell><TableCell className="text-right">{formatGBP(Number(r.amount_due))}</TableCell><TableCell className="text-right">{formatGBP(Number(r.amount_received))}</TableCell><TableCell><Badge variant={r.status === 'received' ? 'default' : 'secondary'}>{r.status}</Badge></TableCell></TableRow>)}</TableBody>
        </Table></CardContent></Card></TabsContent>
        <TabsContent value="insurance"><Card><CardContent className="pt-6"><Table>
          <TableHeader><TableRow><TableHead>Provider</TableHead><TableHead>Policy</TableHead><TableHead className="text-right">Premium</TableHead><TableHead>Renewal</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{ins.map(i => <TableRow key={i.id}><TableCell>{i.provider}</TableCell><TableCell className="font-mono text-xs">{i.policy_ref}</TableCell><TableCell className="text-right">{formatGBP(Number(i.premium))}</TableCell><TableCell>{i.renewal_date}</TableCell><TableCell><Badge>{i.status}</Badge></TableCell></TableRow>)}</TableBody>
        </Table></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  )
}
