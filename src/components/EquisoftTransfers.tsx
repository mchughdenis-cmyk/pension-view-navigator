import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader, StatCard } from "@/components/ui/page-primitives"
import {
  ArrowRightLeft, Plus, Search, CheckCircle2, XCircle, Loader2, ChevronRight, Send,
  RefreshCw, Building2, ShieldCheck, Layers, ClipboardList, AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"

/**
 * Equisoft in-specie transfer service
 * Mirrors the Origo state machine but for in-specie (asset-by-asset) re-registrations,
 * with custodian/transfers-team queues for trade & settlement actions.
 * Fully demo: localStorage persistence — no DB schema required.
 */

type LineStatus =
  | "pending_match"
  | "matched"
  | "unmatchable"
  | "re_registration_instructed"
  | "in_flight"
  | "settled"
  | "failed"

interface AssetLine {
  id: string
  isin: string
  name: string
  units: number
  indicative_value: number
  status: LineStatus
  custodian_ref?: string | null
  note?: string | null
}

type TransferState =
  | "initiated"
  | "instruction_validated"
  | "ceding_acknowledged"
  | "asset_list_received"
  | "matching_complete"
  | "custodian_instructed"
  | "in_flight"
  | "partially_settled"
  | "settled"
  | "rejected"
  | "cancelled"

interface EquisoftTransfer {
  id: string
  equisoft_ref: string
  direction: "inbound" | "outbound"
  client_name: string
  client_ref: string
  ceding_provider: string
  receiving_provider: string
  custodian: "Pershing" | "SEI" | "Northern Trust" | "In-house"
  wrapper: "SIPP" | "ISA" | "GIA"
  state: TransferState
  progress_pct: number
  estimated_value: number
  initiated_at: string
  last_event_at: string
  rejection_reason?: string | null
  lines: AssetLine[]
}

const LS = "equisoft.transfers.v1"

const STATE_META: Record<TransferState, { label: string; pct: number; nextAction?: string; nextLabel?: string; team?: "transfers" | "custodian"; terminal?: boolean }> = {
  initiated:               { label: "Initiated",                pct: 5,  nextAction: "validate",         nextLabel: "Validate instruction", team: "transfers" },
  instruction_validated:   { label: "Instruction validated",    pct: 15, nextAction: "ack_ceding",       nextLabel: "Send to ceding scheme", team: "transfers" },
  ceding_acknowledged:     { label: "Ceding acknowledged",      pct: 30, nextAction: "request_assets",   nextLabel: "Request asset list", team: "transfers" },
  asset_list_received:     { label: "Asset list received",      pct: 45, nextAction: "run_matching",     nextLabel: "Run line matching", team: "transfers" },
  matching_complete:       { label: "Matching complete",        pct: 60, nextAction: "instruct_custodian", nextLabel: "Instruct custodian", team: "custodian" },
  custodian_instructed:    { label: "Custodian instructed",     pct: 70, nextAction: "mark_in_flight",   nextLabel: "Mark in-flight", team: "custodian" },
  in_flight:               { label: "In flight (re-registering)", pct: 80 },
  partially_settled:       { label: "Partially settled",        pct: 90, nextAction: "complete",         nextLabel: "Finalise settlement", team: "custodian" },
  settled:                 { label: "Settled",                  pct: 100, terminal: true },
  rejected:                { label: "Rejected",                 pct: 100, terminal: true },
  cancelled:               { label: "Cancelled",                pct: 100, terminal: true },
}

const fmt = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n)

function seed(): EquisoftTransfer[] {
  const now = Date.now()
  const t1: EquisoftTransfer = {
    id: crypto.randomUUID(), equisoft_ref: "EQS-2025-100451", direction: "inbound",
    client_name: "Margaret Hughes", client_ref: "CL-00214",
    ceding_provider: "Hargreaves Lansdown SIPP", receiving_provider: "Airgead SIPP",
    custodian: "Pershing", wrapper: "SIPP",
    state: "in_flight", progress_pct: 80,
    estimated_value: 184_500,
    initiated_at: new Date(now - 86_400_000 * 6).toISOString(),
    last_event_at: new Date(now - 3_600_000 * 5).toISOString(),
    lines: [
      { id: crypto.randomUUID(), isin: "GB00B3X7QG63", name: "Vanguard FTSE All-World ETF", units: 540, indicative_value: 62_100, status: "in_flight", custodian_ref: "PSH-INF-88231" },
      { id: crypto.randomUUID(), isin: "GB00BD3RZ582", name: "Fundsmith Equity I Acc", units: 1_200, indicative_value: 71_400, status: "settled", custodian_ref: "PSH-INF-88232" },
      { id: crypto.randomUUID(), isin: "IE00B4L5Y983", name: "iShares Core MSCI World", units: 380, indicative_value: 51_000, status: "in_flight", custodian_ref: "PSH-INF-88233" },
    ],
  }
  const t2: EquisoftTransfer = {
    id: crypto.randomUUID(), equisoft_ref: "EQS-2025-100462", direction: "inbound",
    client_name: "David Okafor", client_ref: "CL-00318",
    ceding_provider: "AJ Bell SIPP", receiving_provider: "Airgead SIPP",
    custodian: "SEI", wrapper: "SIPP",
    state: "matching_complete", progress_pct: 60, estimated_value: 92_000,
    initiated_at: new Date(now - 86_400_000 * 2).toISOString(),
    last_event_at: new Date(now - 3_600_000 * 2).toISOString(),
    lines: [
      { id: crypto.randomUUID(), isin: "IE00BKM4GZ66", name: "iShares Core MSCI EM IMI", units: 240, indicative_value: 38_400, status: "matched" },
      { id: crypto.randomUUID(), isin: "GB00B5BFJG71", name: "Lindsell Train Global Equity", units: 110, indicative_value: 53_600, status: "matched" },
    ],
  }
  const t3: EquisoftTransfer = {
    id: crypto.randomUUID(), equisoft_ref: "EQS-2025-100470", direction: "outbound",
    client_name: "Priya Shah", client_ref: "CL-00125",
    ceding_provider: "Airgead SIPP", receiving_provider: "Quilter Cheviot",
    custodian: "Pershing", wrapper: "SIPP",
    state: "asset_list_received", progress_pct: 45, estimated_value: 245_000,
    initiated_at: new Date(now - 86_400_000).toISOString(),
    last_event_at: new Date(now - 1_800_000).toISOString(),
    lines: [
      { id: crypto.randomUUID(), isin: "GB00BPN5P749", name: "Baillie Gifford Managed B Acc", units: 980, indicative_value: 140_000, status: "pending_match" },
      { id: crypto.randomUUID(), isin: "GB00B41YBW71", name: "Royal London Sterling Extra Yield Bond", units: 4_200, indicative_value: 51_500, status: "pending_match" },
      { id: crypto.randomUUID(), isin: "GB00B59G4Q73", name: "Property Trust (illiquid)", units: 12, indicative_value: 53_500, status: "unmatchable", note: "No corresponding line — cash alternative required" },
    ],
  }
  return [t1, t2, t3]
}

export default function EquisoftTransfers() {
  const [transfers, setTransfers] = useState<EquisoftTransfer[]>([])
  const [search, setSearch] = useState("")
  const [stateFilter, setStateFilter] = useState<string>("all")
  const [dirFilter, setDirFilter] = useState<string>("all")
  const [newOpen, setNewOpen] = useState(false)
  const [form, setForm] = useState({
    direction: "inbound" as "inbound" | "outbound",
    client_name: "", client_ref: "", provider: "", value: "",
    custodian: "Pershing" as EquisoftTransfer["custodian"],
    wrapper: "SIPP" as EquisoftTransfer["wrapper"],
  })

  useEffect(() => {
    const raw = localStorage.getItem(LS)
    const next = raw ? JSON.parse(raw) : seed()
    setTransfers(next)
    if (!raw) localStorage.setItem(LS, JSON.stringify(next))
  }, [])

  const persist = (next: EquisoftTransfer[]) => {
    setTransfers(next)
    localStorage.setItem(LS, JSON.stringify(next))
  }

  const stats = {
    total: transfers.length,
    active: transfers.filter(t => !STATE_META[t.state].terminal).length,
    settled: transfers.filter(t => t.state === "settled").length,
    inboundValue: transfers.filter(t => t.direction === "inbound" && t.state !== "rejected" && t.state !== "cancelled").reduce((s, t) => s + t.estimated_value, 0),
    pendingCustodian: transfers.filter(t => ["matching_complete", "custodian_instructed", "in_flight", "partially_settled"].includes(t.state)).length,
  }

  const advance = (t: EquisoftTransfer) => {
    const meta = STATE_META[t.state]
    if (!meta.nextAction) return
    const order: TransferState[] = [
      "initiated", "instruction_validated", "ceding_acknowledged", "asset_list_received",
      "matching_complete", "custodian_instructed", "in_flight", "partially_settled", "settled",
    ]
    const idx = order.indexOf(t.state)
    const nextState = order[Math.min(idx + 1, order.length - 1)]
    let lines = t.lines
    if (meta.nextAction === "run_matching") {
      lines = t.lines.map(l => l.status === "pending_match" ? { ...l, status: l.note ? "unmatchable" : "matched" } : l)
    } else if (meta.nextAction === "instruct_custodian") {
      lines = t.lines.map(l => l.status === "matched" ? { ...l, status: "re_registration_instructed", custodian_ref: `${t.custodian.slice(0, 3).toUpperCase()}-INF-${Math.floor(Math.random() * 90000 + 10000)}` } : l)
    } else if (meta.nextAction === "mark_in_flight") {
      lines = t.lines.map(l => l.status === "re_registration_instructed" ? { ...l, status: "in_flight" } : l)
    } else if (meta.nextAction === "complete") {
      lines = t.lines.map(l => l.status === "in_flight" ? { ...l, status: "settled" } : l)
    }
    const next = transfers.map(x => x.id === t.id ? { ...x, state: nextState, progress_pct: STATE_META[nextState].pct, lines, last_event_at: new Date().toISOString() } : x)
    persist(next)
    toast.success(`${t.equisoft_ref} → ${STATE_META[nextState].label}`)
  }

  const settleLine = (transferId: string, lineId: string) => {
    const next = transfers.map(t => {
      if (t.id !== transferId) return t
      const lines = t.lines.map(l => l.id === lineId ? { ...l, status: "settled" as LineStatus } : l)
      const allSettled = lines.every(l => l.status === "settled" || l.status === "unmatchable")
      const anySettled = lines.some(l => l.status === "settled")
      const state: TransferState = allSettled ? "settled" : anySettled ? "partially_settled" : t.state
      return { ...t, lines, state, progress_pct: STATE_META[state].pct, last_event_at: new Date().toISOString() }
    })
    persist(next)
    toast.success("Line settled")
  }

  const fail = (transferId: string, lineId: string) => {
    const next = transfers.map(t => t.id !== transferId ? t : { ...t, lines: t.lines.map(l => l.id === lineId ? { ...l, status: "failed" as LineStatus } : l), last_event_at: new Date().toISOString() })
    persist(next)
    toast.error("Line marked as failed — investigation required")
  }

  const create = () => {
    if (!form.client_name || !form.provider || !form.value) return toast.error("Missing fields")
    const t: EquisoftTransfer = {
      id: crypto.randomUUID(),
      equisoft_ref: `EQS-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000 + 100000)}`,
      direction: form.direction,
      client_name: form.client_name, client_ref: form.client_ref || "—",
      ceding_provider: form.direction === "inbound" ? form.provider : "Airgead SIPP",
      receiving_provider: form.direction === "inbound" ? "Airgead SIPP" : form.provider,
      custodian: form.custodian, wrapper: form.wrapper,
      state: "initiated", progress_pct: 5, estimated_value: Number(form.value),
      initiated_at: new Date().toISOString(), last_event_at: new Date().toISOString(),
      lines: [],
    }
    persist([t, ...transfers])
    toast.success(`Initiated ${t.equisoft_ref}`)
    setNewOpen(false)
    setForm({ direction: "inbound", client_name: "", client_ref: "", provider: "", value: "", custodian: "Pershing", wrapper: "SIPP" })
  }

  const filtered = useMemo(() => transfers.filter(t => {
    const s = search.toLowerCase()
    return (!s || `${t.client_name} ${t.equisoft_ref} ${t.client_ref}`.toLowerCase().includes(s))
      && (stateFilter === "all" || t.state === stateFilter)
      && (dirFilter === "all" || t.direction === dirFilter)
  }), [transfers, search, stateFilter, dirFilter])

  const custodianQueue = transfers.filter(t => STATE_META[t.state].team === "custodian")
  const transfersQueue = transfers.filter(t => STATE_META[t.state].team === "transfers")

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Equisoft in-specie transfers"
        description="Initiate, track and settle asset-by-asset re-registrations with ceding scheme and custodian — Equisoft API integration."
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total transfers" value={stats.total} />
        <StatCard label="Active" value={stats.active} />
        <StatCard label="Settled" value={stats.settled} />
        <StatCard label="Custodian queue" value={stats.pendingCustodian} />
        <StatCard label="Inbound value" value={fmt(stats.inboundValue)} />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all"><ArrowRightLeft className="h-4 w-4 mr-1.5" />All transfers</TabsTrigger>
          <TabsTrigger value="transfers"><ClipboardList className="h-4 w-4 mr-1.5" />Transfers team</TabsTrigger>
          <TabsTrigger value="custodian"><Building2 className="h-4 w-4 mr-1.5" />Custodian queue</TabsTrigger>
          <TabsTrigger value="connection"><ShieldCheck className="h-4 w-4 mr-1.5" />Connection</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle>All transfers</CardTitle>
                <CardDescription>Discovery → asset list → matching → custodian → settlement</CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9 w-56" placeholder="Search client, ref…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All states</SelectItem>
                    {Object.entries(STATE_META).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={dirFilter} onValueChange={setDirFilter}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All directions</SelectItem>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                  </SelectContent>
                </Select>
                <Dialog open={newOpen} onOpenChange={setNewOpen}>
                  <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-1.5" />New transfer</Button></DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Initiate Equisoft in-specie transfer</DialogTitle>
                      <DialogDescription>Creates a transfer in the <code>initiated</code> state, ready for transfers-team validation.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Direction</Label>
                          <Select value={form.direction} onValueChange={v => setForm({ ...form, direction: v as "inbound" | "outbound" })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="inbound">Inbound</SelectItem>
                              <SelectItem value="outbound">Outbound</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Wrapper</Label>
                          <Select value={form.wrapper} onValueChange={v => setForm({ ...form, wrapper: v as EquisoftTransfer["wrapper"] })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SIPP">SIPP</SelectItem>
                              <SelectItem value="ISA">ISA</SelectItem>
                              <SelectItem value="GIA">GIA</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2"><Label>Client name</Label><Input value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Client reference</Label><Input value={form.client_ref} onChange={e => setForm({ ...form, client_ref: e.target.value })} placeholder="CL-…" /></div>
                      <div className="space-y-2"><Label>{form.direction === "inbound" ? "Ceding" : "Receiving"} provider</Label><Input value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} placeholder="Hargreaves Lansdown, AJ Bell…" /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2"><Label>Estimated value (£)</Label><Input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} /></div>
                        <div className="space-y-2">
                          <Label>Custodian</Label>
                          <Select value={form.custodian} onValueChange={v => setForm({ ...form, custodian: v as EquisoftTransfer["custodian"] })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pershing">Pershing</SelectItem>
                              <SelectItem value="SEI">SEI</SelectItem>
                              <SelectItem value="Northern Trust">Northern Trust</SelectItem>
                              <SelectItem value="In-house">In-house</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
                      <Button onClick={create}><Send className="w-4 h-4 mr-2" />Initiate</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <TransferTable rows={filtered} onAdvance={advance} onSettleLine={settleLine} onFailLine={fail} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers">
          <Card>
            <CardHeader>
              <CardTitle>Transfers team queue</CardTitle>
              <CardDescription>Validation, ceding-scheme messaging, asset-list intake and ISIN matching.</CardDescription>
            </CardHeader>
            <CardContent>
              <TransferTable rows={transfersQueue} onAdvance={advance} onSettleLine={settleLine} onFailLine={fail} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custodian">
          <Card>
            <CardHeader>
              <CardTitle>Custodian / trade & settlement queue</CardTitle>
              <CardDescription>Re-registration instructions, CREST/account moves, partial settlement tracking.</CardDescription>
            </CardHeader>
            <CardContent>
              <TransferTable rows={custodianQueue} onAdvance={advance} onSettleLine={settleLine} onFailLine={fail} showCustodian />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle>Equisoft connection</CardTitle>
              <CardDescription>API endpoint, authentication and routing rules. Sandbox-backed.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <Label>Endpoint</Label>
                <Input defaultValue="https://api.equisoft.com/transfers/v2" />
              </div>
              <div className="space-y-1">
                <Label>Environment</Label>
                <Select defaultValue="sandbox">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Default custodian</Label>
                <Select defaultValue="Pershing">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pershing">Pershing</SelectItem>
                    <SelectItem value="SEI">SEI</SelectItem>
                    <SelectItem value="Northern Trust">Northern Trust</SelectItem>
                    <SelectItem value="In-house">In-house</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>OAuth client ID</Label>
                <Input defaultValue="airgead-equisoft-prod" />
              </div>
              <div className="md:col-span-2 rounded-md border p-3 text-muted-foreground flex items-start gap-2">
                <Layers className="h-4 w-4 mt-0.5" />
                <div>
                  Equisoft routes in-specie messages between the ceding scheme, receiving scheme and custodian. The receiving scheme owns
                  validation and matching; the custodian/transfers team owns re-registration, trade & settlement.
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button variant="outline" onClick={() => toast.success("Connection healthy — Equisoft sandbox · Pershing")}><RefreshCw className="h-4 w-4 mr-1.5" />Test connection</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TransferTable({
  rows, onAdvance, onSettleLine, onFailLine, showCustodian,
}: {
  rows: EquisoftTransfer[]
  onAdvance: (t: EquisoftTransfer) => void
  onSettleLine: (transferId: string, lineId: string) => void
  onFailLine: (transferId: string, lineId: string) => void
  showCustodian?: boolean
}) {
  const [expanded, setExpanded] = useState<string | null>(null)
  if (rows.length === 0) return <p className="text-sm text-muted-foreground py-6 text-center">No transfers in this queue.</p>
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ref</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Dir.</TableHead>
          <TableHead>Counterparty</TableHead>
          {showCustodian && <TableHead>Custodian</TableHead>}
          <TableHead>Value</TableHead>
          <TableHead>State</TableHead>
          <TableHead className="w-[220px]">Progress</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(t => {
          const meta = STATE_META[t.state]
          return (
            <>
              <TableRow key={t.id} className="cursor-pointer" onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
                <TableCell className="font-mono text-xs">{t.equisoft_ref}</TableCell>
                <TableCell><div className="font-medium">{t.client_name}</div><div className="text-xs text-muted-foreground">{t.client_ref} · {t.wrapper}</div></TableCell>
                <TableCell><Badge variant="outline" className="capitalize">{t.direction}</Badge></TableCell>
                <TableCell className="text-sm">{t.direction === "inbound" ? t.ceding_provider : t.receiving_provider}</TableCell>
                {showCustodian && <TableCell className="text-sm">{t.custodian}</TableCell>}
                <TableCell>{fmt(t.estimated_value)}</TableCell>
                <TableCell>
                  <Badge variant={meta.terminal ? (t.state === "settled" ? "default" : "destructive") : "secondary"}>
                    {meta.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={t.progress_pct} className="h-2" />
                    <span className="text-xs text-muted-foreground w-8">{t.progress_pct}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                  {meta.nextAction && meta.nextLabel ? (
                    <Button size="sm" onClick={() => onAdvance(t)}>
                      <ChevronRight className="w-3 h-3 mr-1" />{meta.nextLabel}
                    </Button>
                  ) : meta.terminal ? (
                    t.state === "settled"
                      ? <CheckCircle2 className="w-5 h-5 text-green-500 inline" />
                      : <XCircle className="w-5 h-5 text-red-500 inline" />
                  ) : (
                    <span className="text-xs text-muted-foreground italic flex items-center gap-1 justify-end">
                      <Loader2 className="w-3 h-3 animate-spin" />In flight
                    </span>
                  )}
                </TableCell>
              </TableRow>
              {expanded === t.id && (
                <TableRow>
                  <TableCell colSpan={showCustodian ? 9 : 8} className="bg-muted/30">
                    <div className="p-3 space-y-3">
                      <div className="text-sm font-medium flex items-center gap-2">
                        <Layers className="h-4 w-4" /> Asset lines ({t.lines.length})
                      </div>
                      {t.lines.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No asset lines received yet.</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ISIN</TableHead>
                              <TableHead>Holding</TableHead>
                              <TableHead className="text-right">Units</TableHead>
                              <TableHead className="text-right">Value</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Custodian ref</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {t.lines.map(l => (
                              <TableRow key={l.id}>
                                <TableCell className="font-mono text-xs">{l.isin}</TableCell>
                                <TableCell className="text-sm">{l.name}{l.note && <div className="text-xs text-muted-foreground">{l.note}</div>}</TableCell>
                                <TableCell className="text-right text-sm">{l.units.toLocaleString("en-GB")}</TableCell>
                                <TableCell className="text-right text-sm">{fmt(l.indicative_value)}</TableCell>
                                <TableCell>
                                  <Badge variant={
                                    l.status === "settled" ? "default"
                                    : l.status === "failed" || l.status === "unmatchable" ? "destructive"
                                    : "secondary"
                                  }>{l.status.replace(/_/g, " ")}</Badge>
                                </TableCell>
                                <TableCell className="font-mono text-xs">{l.custodian_ref ?? "—"}</TableCell>
                                <TableCell className="text-right space-x-1">
                                  {(l.status === "in_flight" || l.status === "re_registration_instructed") && (
                                    <>
                                      <Button size="sm" variant="outline" onClick={() => onSettleLine(t.id, l.id)}>Mark settled</Button>
                                      <Button size="sm" variant="ghost" onClick={() => onFailLine(t.id, l.id)}>Fail</Button>
                                    </>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                      {t.lines.some(l => l.status === "unmatchable") && (
                        <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-500/10 border border-amber-500/30 rounded-md p-2">
                          <AlertTriangle className="h-4 w-4 mt-0.5" />
                          <span>One or more lines cannot be re-registered (illiquid / unsupported instrument). Offer cash alternative or refuse via ceding scheme.</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          )
        })}
      </TableBody>
    </Table>
  )
}
