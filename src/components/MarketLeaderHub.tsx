import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/ui/page-primitives"
import { formatGBP } from "@/lib/pensionCalculations"

export default function MarketLeaderHub() {
  const [data, setData] = useState<Record<string, any[]>>({})
  useEffect(() => {
    (async () => {
      const tables = ['scheme_pensions','capped_drawdown_segments','pension_sharing_orders','in_specie_transfers',
        'bulk_orders','bulk_order_lines','webhook_subscriptions','open_banking_consents','open_banking_accounts',
        'lisa_bonus_claims','jisa_holders','sso_configurations','firm_branding','dr_drills']
      const out: Record<string, any[]> = {}
      for (const t of tables) {
        const { data } = await supabase.from(t as any).select('*').limit(50)
        out[t] = data || []
      }
      setData(out)
    })()
  }, [])
  const get = (k: string) => data[k] || []
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader title="Advanced Capabilities" description="Scheme pensions, capped drawdown, pension sharing, bulk dealing, webhooks, Open Banking, JISA/LISA, SSO, branding & DR." />
      <Tabs defaultValue="scheme_pensions">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="scheme_pensions">Scheme pension</TabsTrigger>
          <TabsTrigger value="capped">Capped DD</TabsTrigger>
          <TabsTrigger value="sharing">Sharing orders</TabsTrigger>
          <TabsTrigger value="bulk">Bulk dealing</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="ob">Open Banking</TabsTrigger>
          <TabsTrigger value="lisa">JISA / LISA</TabsTrigger>
          <TabsTrigger value="sso">SSO &amp; branding</TabsTrigger>
          <TabsTrigger value="dr">DR drills</TabsTrigger>
        </TabsList>

        <TabsContent value="scheme_pensions"><Card><CardHeader><CardTitle>Scheme pensions / annuities</CardTitle></CardHeader><CardContent><Table>
          <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Provider</TableHead><TableHead className="text-right">Gross p.a.</TableHead><TableHead>Escalation</TableHead><TableHead>Spouse %</TableHead><TableHead>Guarantee</TableHead><TableHead>Commenced</TableHead></TableRow></TableHeader>
          <TableBody>{get('scheme_pensions').map(r => <TableRow key={r.id}><TableCell className="capitalize">{r.pension_type.replace('_',' ')}</TableCell><TableCell>{r.provider}</TableCell><TableCell className="text-right">{formatGBP(Number(r.gross_annual))}</TableCell><TableCell>{(Number(r.escalation_pct)*100).toFixed(1)}%</TableCell><TableCell>{(Number(r.spouse_pct)*100).toFixed(0)}%</TableCell><TableCell>{r.guarantee_period_years}y</TableCell><TableCell>{r.commencement_date}</TableCell></TableRow>)}</TableBody>
        </Table></CardContent></Card></TabsContent>

        <TabsContent value="capped"><Card><CardHeader><CardTitle>Capped drawdown (legacy)</CardTitle></CardHeader><CardContent><Table>
          <TableHeader><TableRow><TableHead className="text-right">Fund</TableHead><TableHead className="text-right">GAD basis</TableHead><TableHead>Cap %</TableHead><TableHead className="text-right">Max p.a.</TableHead><TableHead>Last review</TableHead><TableHead>Next review</TableHead></TableRow></TableHeader>
          <TableBody>{get('capped_drawdown_segments').map(r => <TableRow key={r.id}><TableCell className="text-right">{formatGBP(Number(r.fund_value))}</TableCell><TableCell className="text-right">{formatGBP(Number(r.gad_basis_amount))}</TableCell><TableCell>{Number(r.gad_cap_pct).toFixed(0)}%</TableCell><TableCell className="text-right">{formatGBP(Number(r.current_max_pa))}</TableCell><TableCell>{r.last_review_date}</TableCell><TableCell>{r.next_review_date}</TableCell></TableRow>)}</TableBody>
        </Table></CardContent></Card></TabsContent>

        <TabsContent value="sharing"><Card><CardHeader><CardTitle>Pension sharing orders &amp; in-specie transfers</CardTitle></CardHeader><CardContent className="space-y-6"><Table>
          <TableHeader><TableRow><TableHead>Ex-partner</TableHead><TableHead>Court order</TableHead><TableHead>%</TableHead><TableHead className="text-right">Transfer value</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{get('pension_sharing_orders').map(r => <TableRow key={r.id}><TableCell>{r.ex_partner_name}</TableCell><TableCell>{r.court_order_date}</TableCell><TableCell>{Number(r.percentage).toFixed(0)}%</TableCell><TableCell className="text-right">{formatGBP(Number(r.transfer_value))}</TableCell><TableCell><Badge>{r.status}</Badge></TableCell></TableRow>)}</TableBody>
        </Table>
        <h3 className="font-semibold">In-specie transfers</h3>
        <Table>
          <TableHeader><TableRow><TableHead>Direction</TableHead><TableHead>Valuation date</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Basis</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{get('in_specie_transfers').map(r => <TableRow key={r.id}><TableCell className="capitalize">{r.direction}</TableCell><TableCell>{r.valuation_date}</TableCell><TableCell className="text-right">{formatGBP(Number(r.total_value))}</TableCell><TableCell className="capitalize">{r.valuation_basis.replace('_',' ')}</TableCell><TableCell><Badge>{r.status}</Badge></TableCell></TableRow>)}</TableBody>
        </Table></CardContent></Card></TabsContent>

        <TabsContent value="bulk"><Card><CardHeader><CardTitle>Bulk dealing engine</CardTitle></CardHeader><CardContent className="space-y-4"><Table>
          <TableHeader><TableRow><TableHead>Trade date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total value</TableHead><TableHead className="text-right">Clients</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
          <TableBody>{get('bulk_orders').map(r => <TableRow key={r.id}><TableCell>{r.trade_date}</TableCell><TableCell><Badge>{r.status}</Badge></TableCell><TableCell className="text-right">{formatGBP(Number(r.total_value))}</TableCell><TableCell className="text-right">{r.total_clients}</TableCell><TableCell className="text-sm">{r.notes}</TableCell></TableRow>)}</TableBody>
        </Table>
        <h3 className="font-semibold">Aggregated lines</h3>
        <Table>
          <TableHeader><TableRow><TableHead>Symbol</TableHead><TableHead>Side</TableHead><TableHead className="text-right">Units</TableHead><TableHead className="text-right">Price</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{get('bulk_order_lines').map(r => <TableRow key={r.id}><TableCell className="font-mono">{r.symbol}</TableCell><TableCell className="capitalize">{r.side}</TableCell><TableCell className="text-right">{Number(r.units).toFixed(0)}</TableCell><TableCell className="text-right">{Number(r.price || 0).toFixed(2)}</TableCell><TableCell><Badge>{r.status}</Badge></TableCell></TableRow>)}</TableBody>
        </Table></CardContent></Card></TabsContent>

        <TabsContent value="webhooks"><Card><CardHeader><CardTitle>Webhook subscriptions</CardTitle></CardHeader><CardContent><Table>
          <TableHeader><TableRow><TableHead>URL</TableHead><TableHead>Events</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{get('webhook_subscriptions').map(r => <TableRow key={r.id}><TableCell className="font-mono text-xs">{r.url}</TableCell><TableCell className="text-sm">{(r.events||[]).join(', ')}</TableCell><TableCell><Badge>{r.status}</Badge></TableCell></TableRow>)}</TableBody>
        </Table></CardContent></Card></TabsContent>

        <TabsContent value="ob"><Card><CardHeader><CardTitle>Open Banking (AISP / PISP)</CardTitle></CardHeader><CardContent className="space-y-4"><Table>
          <TableHeader><TableRow><TableHead>Bank</TableHead><TableHead>Consent ref</TableHead><TableHead>Scope</TableHead><TableHead>Expires</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{get('open_banking_consents').map(r => <TableRow key={r.id}><TableCell>{r.bank}</TableCell><TableCell className="font-mono text-xs">{r.consent_ref}</TableCell><TableCell className="text-xs">{r.scope}</TableCell><TableCell className="text-sm">{r.expires_at ? new Date(r.expires_at).toLocaleDateString('en-GB') : '—'}</TableCell><TableCell><Badge>{r.status}</Badge></TableCell></TableRow>)}</TableBody>
        </Table>
        <h3 className="font-semibold">Synced accounts</h3>
        <Table>
          <TableHeader><TableRow><TableHead>Account</TableHead><TableHead className="text-right">Balance</TableHead><TableHead>Last synced</TableHead></TableRow></TableHeader>
          <TableBody>{get('open_banking_accounts').map(r => <TableRow key={r.id}><TableCell className="font-mono text-xs">{r.account_ref}</TableCell><TableCell className="text-right">{formatGBP(Number(r.balance))}</TableCell><TableCell className="text-sm">{r.last_synced ? new Date(r.last_synced).toLocaleString('en-GB') : '—'}</TableCell></TableRow>)}</TableBody>
        </Table></CardContent></Card></TabsContent>

        <TabsContent value="lisa"><Card><CardHeader><CardTitle>JISA &amp; LISA wrappers</CardTitle></CardHeader><CardContent className="space-y-4">
          <h3 className="font-semibold">LISA bonus claims</h3>
          <Table>
            <TableHeader><TableRow><TableHead>Tax year</TableHead><TableHead className="text-right">Contributions</TableHead><TableHead className="text-right">Bonus (25%)</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{get('lisa_bonus_claims').map(r => <TableRow key={r.id}><TableCell>{r.tax_year}</TableCell><TableCell className="text-right">{formatGBP(Number(r.contributions))}</TableCell><TableCell className="text-right">{formatGBP(Number(r.bonus_amount))}</TableCell><TableCell><Badge>{r.claim_status}</Badge></TableCell></TableRow>)}</TableBody>
          </Table>
          <h3 className="font-semibold">JISA holders</h3>
          <Table>
            <TableHeader><TableRow><TableHead>Child</TableHead><TableHead>DOB</TableHead><TableHead>Matures</TableHead></TableRow></TableHeader>
            <TableBody>{get('jisa_holders').map(r => <TableRow key={r.id}><TableCell>{r.child_first_name} {r.child_last_name}</TableCell><TableCell>{r.child_dob}</TableCell><TableCell>{r.matures_on || '—'}</TableCell></TableRow>)}</TableBody>
          </Table>
        </CardContent></Card></TabsContent>

        <TabsContent value="sso"><Card><CardHeader><CardTitle>SSO configurations &amp; branding</CardTitle></CardHeader><CardContent className="space-y-4"><Table>
          <TableHeader><TableRow><TableHead>Provider</TableHead><TableHead>Domain</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{get('sso_configurations').map(r => <TableRow key={r.id}><TableCell className="uppercase font-mono text-xs">{r.provider}</TableCell><TableCell>{r.domain}</TableCell><TableCell><Badge>{r.status}</Badge></TableCell></TableRow>)}</TableBody>
        </Table>
        <h3 className="font-semibold">Firm branding</h3>
        <Table>
          <TableHeader><TableRow><TableHead>Custom domain</TableHead><TableHead>Primary</TableHead><TableHead>Accent</TableHead></TableRow></TableHeader>
          <TableBody>{get('firm_branding').map(r => <TableRow key={r.id}><TableCell>{r.custom_domain}</TableCell><TableCell><span className="inline-block h-4 w-4 rounded mr-2 align-middle" style={{background: r.primary_color}} />{r.primary_color}</TableCell><TableCell><span className="inline-block h-4 w-4 rounded mr-2 align-middle" style={{background: r.accent_color}} />{r.accent_color}</TableCell></TableRow>)}</TableBody>
        </Table></CardContent></Card></TabsContent>

        <TabsContent value="dr"><Card><CardHeader><CardTitle>Disaster recovery drills</CardTitle></CardHeader><CardContent><Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Scenario</TableHead><TableHead>RTO target</TableHead><TableHead>Actual RTO</TableHead><TableHead>RPO target</TableHead><TableHead>Actual RPO</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{get('dr_drills').map(r => <TableRow key={r.id}><TableCell>{r.drill_date}</TableCell><TableCell>{r.scenario}</TableCell><TableCell>{r.rto_minutes}m</TableCell><TableCell>{r.actual_rto ? `${r.actual_rto}m` : '—'}</TableCell><TableCell>{r.rpo_minutes}m</TableCell><TableCell>{r.actual_rpo ? `${r.actual_rpo}m` : '—'}</TableCell><TableCell><Badge variant={r.status === 'passed' ? 'default' : 'secondary'}>{r.status}</Badge></TableCell></TableRow>)}</TableBody>
        </Table></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  )
}
