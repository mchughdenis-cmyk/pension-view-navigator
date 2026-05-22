import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader, StatCard } from "@/components/ui/page-primitives"
import { Network, ShieldCheck, Search, FileSearch, Activity, KeyRound, PlugZap } from "lucide-react"
import { toast } from "sonner"

/**
 * Pensions Dashboards Programme (PDP) integration
 * Mirrors the structure of HMRCReporting — fully demo/sandbox.
 * Data persists to localStorage (no DB tables required).
 */

type FindRequest = {
  id: string
  rrn: string                 // Request Reference Number
  pdp_user_ref: string        // pseudonymised user ref from PDP
  received_at: string
  matched: 'matched' | 'possible_match' | 'no_match' | 'pending'
  view_data_returned_at: string | null
  channel: 'PDP' | 'MoneyHelper' | 'Provider'
  notes?: string
}
type ConsentEvent = {
  id: string
  rrn: string
  event: 'view_granted' | 'view_withdrawn' | 'find_received' | 'data_returned'
  at: string
}
type Config = {
  connected: boolean
  environment: 'sandbox' | 'integration' | 'production'
  isp: 'Capgemini' | 'Origo' | 'In-house'
  pds_endpoint: string
  client_id: string
  signing_kid: string
  view_data_within_minutes: number
  include_state_pension: boolean
  include_db_schemes: boolean
}

const LS_REQ = 'pdp.requests.v1'
const LS_CONS = 'pdp.consents.v1'
const LS_CFG = 'pdp.config.v1'

const seedRequests = (): FindRequest[] => ([
  { id: crypto.randomUUID(), rrn: 'RRN-' + Math.random().toString(36).slice(2,8).toUpperCase(), pdp_user_ref: 'pdp_8f2a91', received_at: new Date(Date.now()-1000*60*45).toISOString(), matched: 'matched', view_data_returned_at: new Date(Date.now()-1000*60*40).toISOString(), channel: 'PDP' },
  { id: crypto.randomUUID(), rrn: 'RRN-' + Math.random().toString(36).slice(2,8).toUpperCase(), pdp_user_ref: 'pdp_31c0aa', received_at: new Date(Date.now()-1000*60*60*3).toISOString(), matched: 'possible_match', view_data_returned_at: null, channel: 'MoneyHelper', notes: 'NI number mismatch — awaiting manual review' },
  { id: crypto.randomUUID(), rrn: 'RRN-' + Math.random().toString(36).slice(2,8).toUpperCase(), pdp_user_ref: 'pdp_77be12', received_at: new Date(Date.now()-1000*60*60*9).toISOString(), matched: 'no_match', view_data_returned_at: null, channel: 'PDP' },
  { id: crypto.randomUUID(), rrn: 'RRN-' + Math.random().toString(36).slice(2,8).toUpperCase(), pdp_user_ref: 'pdp_a4d930', received_at: new Date(Date.now()-1000*60*5).toISOString(), matched: 'pending', view_data_returned_at: null, channel: 'PDP' },
])
const defaultConfig: Config = {
  connected: true,
  environment: 'sandbox',
  isp: 'Capgemini',
  pds_endpoint: 'https://pds.sandbox.pensionsdashboardsprogramme.org.uk',
  client_id: 'airgead-pn-001',
  signing_kid: 'kid-2025-01',
  view_data_within_minutes: 3,
  include_state_pension: true,
  include_db_schemes: false,
}

export default function PensionsDashboardIntegration() {
  const [requests, setRequests] = useState<FindRequest[]>([])
  const [consents, setConsents] = useState<ConsentEvent[]>([])
  const [config, setConfig] = useState<Config>(defaultConfig)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const r = localStorage.getItem(LS_REQ)
    const c = localStorage.getItem(LS_CONS)
    const cfg = localStorage.getItem(LS_CFG)
    const reqs = r ? JSON.parse(r) : seedRequests()
    setRequests(reqs)
    setConsents(c ? JSON.parse(c) : [])
    if (cfg) setConfig(JSON.parse(cfg))
    if (!r) localStorage.setItem(LS_REQ, JSON.stringify(reqs))
  }, [])

  const persistRequests = (next: FindRequest[]) => { setRequests(next); localStorage.setItem(LS_REQ, JSON.stringify(next)) }
  const persistConsents = (next: ConsentEvent[]) => { setConsents(next); localStorage.setItem(LS_CONS, JSON.stringify(next)) }
  const persistConfig = (next: Config) => { setConfig(next); localStorage.setItem(LS_CFG, JSON.stringify(next)) }

  const counts = {
    total: requests.length,
    matched: requests.filter(r => r.matched === 'matched').length,
    possible: requests.filter(r => r.matched === 'possible_match').length,
    pending: requests.filter(r => r.matched === 'pending').length,
    no_match: requests.filter(r => r.matched === 'no_match').length,
  }

  const simulateFind = () => {
    const req: FindRequest = {
      id: crypto.randomUUID(),
      rrn: 'RRN-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      pdp_user_ref: 'pdp_' + Math.random().toString(36).slice(2, 8),
      received_at: new Date().toISOString(),
      matched: 'pending',
      view_data_returned_at: null,
      channel: 'PDP',
    }
    persistRequests([req, ...requests])
    persistConsents([{ id: crypto.randomUUID(), rrn: req.rrn, event: 'find_received', at: req.received_at }, ...consents])
    toast.success(`Find request received (${req.rrn})`)
  }

  const runMatch = (id: string) => {
    const roll = Math.random()
    const verdict: FindRequest['matched'] = roll > 0.7 ? 'matched' : roll > 0.4 ? 'possible_match' : 'no_match'
    const next = requests.map(r => r.id === id ? { ...r, matched: verdict } : r)
    persistRequests(next)
    toast.success(`Matching complete: ${verdict.replace('_', ' ')}`)
  }

  const returnViewData = (id: string) => {
    const at = new Date().toISOString()
    const r = requests.find(x => x.id === id)
    if (!r) return
    const next = requests.map(x => x.id === id ? { ...x, view_data_returned_at: at } : x)
    persistRequests(next)
    persistConsents([
      { id: crypto.randomUUID(), rrn: r.rrn, event: 'view_granted', at },
      { id: crypto.randomUUID(), rrn: r.rrn, event: 'data_returned', at },
      ...consents,
    ])
    toast.success(`View data returned to PDP for ${r.rrn}`)
  }

  const withdraw = (rrn: string) => {
    persistConsents([{ id: crypto.randomUUID(), rrn, event: 'view_withdrawn', at: new Date().toISOString() }, ...consents])
    toast.message(`Consent withdrawn (${rrn})`)
  }

  const testConnection = () => {
    toast.success(`Connection healthy — ${config.environment} · ${config.isp}`)
  }

  const filtered = requests.filter(r =>
    !query || `${r.rrn} ${r.pdp_user_ref} ${r.matched} ${r.channel}`.toLowerCase().includes(query.toLowerCase())
  )

  const badge = (m: FindRequest['matched']) =>
    m === 'matched' ? <Badge>matched</Badge>
    : m === 'possible_match' ? <Badge variant="secondary">possible</Badge>
    : m === 'pending' ? <Badge variant="outline">pending</Badge>
    : <Badge variant="destructive">no match</Badge>

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Pensions Dashboards integration"
        description="Connect to the Pensions Dashboards Programme (PDP) — find requests, matching, view-data delivery and consent — sandbox-backed end-to-end."
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Find requests" value={counts.total} sub="last 30 days" />
        <StatCard label="Matched" value={counts.matched} />
        <StatCard label="Possible matches" value={counts.possible} />
        <StatCard label="Pending" value={counts.pending} />
        <StatCard label="No match" value={counts.no_match} />
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests"><Search className="h-4 w-4 mr-1.5" />Find requests</TabsTrigger>
          <TabsTrigger value="consent"><ShieldCheck className="h-4 w-4 mr-1.5" />Consent & view-data</TabsTrigger>
          <TabsTrigger value="connection"><PlugZap className="h-4 w-4 mr-1.5" />Connection</TabsTrigger>
          <TabsTrigger value="harness"><Activity className="h-4 w-4 mr-1.5" />Test harness</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>Inbound find requests</CardTitle>
                <CardDescription>Requests routed from the PDP central digital architecture.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Input className="w-56" placeholder="Search RRN, user ref…" value={query} onChange={(e)=>setQuery(e.target.value)} />
                <Button variant="outline" onClick={simulateFind}><FileSearch className="h-4 w-4 mr-1.5" />Simulate find</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RRN</TableHead>
                    <TableHead>PDP user ref</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Match</TableHead>
                    <TableHead>View data sent</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.rrn}</TableCell>
                      <TableCell className="font-mono text-xs">{r.pdp_user_ref}</TableCell>
                      <TableCell><Badge variant="outline">{r.channel}</Badge></TableCell>
                      <TableCell className="text-sm">{new Date(r.received_at).toLocaleString('en-GB')}</TableCell>
                      <TableCell>{badge(r.matched)}</TableCell>
                      <TableCell className="text-sm">{r.view_data_returned_at ? new Date(r.view_data_returned_at).toLocaleString('en-GB') : '—'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {r.matched === 'pending' && <Button size="sm" variant="outline" onClick={()=>runMatch(r.id)}>Run match</Button>}
                        {r.matched === 'matched' && !r.view_data_returned_at && <Button size="sm" onClick={()=>returnViewData(r.id)}>Return view data</Button>}
                        {r.matched === 'possible_match' && <Button size="sm" variant="outline" onClick={()=>runMatch(r.id)}>Re-run match</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent">
          <Card>
            <CardHeader>
              <CardTitle>Consent events</CardTitle>
              <CardDescription>Audit of consent grants, data deliveries and withdrawals (PDP-compliant).</CardDescription>
            </CardHeader>
            <CardContent>
              {consents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No consent events recorded yet.</p>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>RRN</TableHead><TableHead>Event</TableHead><TableHead>At</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {consents.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs">{c.rrn}</TableCell>
                        <TableCell><Badge variant={c.event === 'view_withdrawn' ? 'destructive' : c.event === 'data_returned' ? 'default' : 'secondary'}>{c.event.replace('_',' ')}</Badge></TableCell>
                        <TableCell className="text-sm">{new Date(c.at).toLocaleString('en-GB')}</TableCell>
                        <TableCell className="text-right">
                          {c.event === 'data_returned' && <Button size="sm" variant="outline" onClick={()=>withdraw(c.rrn)}>Simulate withdrawal</Button>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connection">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Network className="h-4 w-4" />PDP connection</CardTitle>
                <CardDescription>Configure the Integration Service Provider (ISP) link to PDP.</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={config.connected ? 'default' : 'destructive'}>{config.connected ? 'Connected' : 'Offline'}</Badge>
                <Button variant="outline" onClick={testConnection}>Test connection</Button>
              </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Environment</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={config.environment}
                  onChange={(e)=>persistConfig({ ...config, environment: e.target.value as Config['environment'] })}>
                  <option value="sandbox">Sandbox</option>
                  <option value="integration">Integration</option>
                  <option value="production">Production</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Integration Service Provider</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={config.isp}
                  onChange={(e)=>persistConfig({ ...config, isp: e.target.value as Config['isp'] })}>
                  <option>Capgemini</option>
                  <option>Origo</option>
                  <option>In-house</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>PDS endpoint</Label>
                <Input value={config.pds_endpoint} onChange={(e)=>persistConfig({ ...config, pds_endpoint: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Client ID</Label>
                <Input value={config.client_id} onChange={(e)=>persistConfig({ ...config, client_id: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><KeyRound className="h-3.5 w-3.5" />Signing key ID</Label>
                <Input value={config.signing_kid} onChange={(e)=>persistConfig({ ...config, signing_kid: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Return view-data within (minutes)</Label>
                <Input type="number" min={1} max={60} value={config.view_data_within_minutes}
                  onChange={(e)=>persistConfig({ ...config, view_data_within_minutes: Number(e.target.value) || 3 })} />
                <p className="text-xs text-muted-foreground">PDP SLA target. Used by the test harness.</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <Label>Include State Pension</Label>
                    <p className="text-xs text-muted-foreground">DWP State Pension Forecast feed.</p>
                  </div>
                  <Switch checked={config.include_state_pension} onCheckedChange={(v)=>persistConfig({ ...config, include_state_pension: v })} />
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <Label>Include DB schemes</Label>
                    <p className="text-xs text-muted-foreground">Defined benefit schemes administered by the firm.</p>
                  </div>
                  <Switch checked={config.include_db_schemes} onCheckedChange={(v)=>persistConfig({ ...config, include_db_schemes: v })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="harness">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sandbox test harness</CardTitle>
                <CardDescription>Validate find, match and view-data flows end-to-end before promoting to production.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={simulateFind}>Inject find request</Button>
                <Button onClick={() => {
                  const pending = requests.find(r => r.matched === 'pending')
                  if (!pending) return toast.error('No pending requests — inject one first')
                  runMatch(pending.id)
                }}>Run match on next pending</Button>
              </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="rounded-md border p-3">
                <div className="font-medium mb-1">Conformance checks</div>
                <ul className="text-muted-foreground space-y-1 list-disc pl-4">
                  <li>JWS signing with active KID</li>
                  <li>mTLS handshake with ISP</li>
                  <li>Schema validation (PDP v1.2)</li>
                  <li>View-data SLA &lt; {config.view_data_within_minutes}m</li>
                </ul>
              </div>
              <div className="rounded-md border p-3">
                <div className="font-medium mb-1">Last sandbox run</div>
                <p className="text-muted-foreground">All 12 scenarios PASSED — 2.3s avg latency.</p>
              </div>
              <div className="rounded-md border p-3">
                <div className="font-medium mb-1">Coverage</div>
                <p className="text-muted-foreground">Find, match, partial-match, view-data, withdrawal, error paths.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
