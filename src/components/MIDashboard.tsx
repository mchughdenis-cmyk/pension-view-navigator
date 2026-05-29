import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useFirm } from '@/contexts/FirmContext'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronRight } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend, AreaChart, Area } from 'recharts'

const fmtGBP = (n: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)

type Case = {
  id: string
  case_ref: string | null
  case_type: string | null
  title: string | null
  queue: string | null
  status: string | null
  priority: string | null
  sla_due_at: string | null
  client_id: string | null
}

export default function MIDashboard() {
  const navigate = useNavigate()
  const { firmId, firm } = useFirm()
  const [aua, setAua] = useState<any[]>([])
  const [flows, setFlows] = useState<any[]>([])
  const [feeYield, setFeeYield] = useState<any[]>([])
  const [openCases, setOpenCases] = useState<Case[]>([])

  useEffect(() => {
    // Find which clients are in-scope so we can scope ops_cases.
    // Platform mode (firmId === null): include all unassigned cases across every firm.
    const loadCases = async () => {
      let aq = supabase
        .from('agency_assignments')
        .select('client_id, firm_id')
        .is('assigned_to', null)
      if (firmId) aq = aq.eq('firm_id', firmId)
      const { data: assignments } = await aq
      const clientIds = (assignments ?? []).map(a => a.client_id).filter(Boolean) as string[]
      if (clientIds.length === 0) { setOpenCases([]); return }
      const { data: cases } = await supabase
        .from('ops_cases')
        .select('id, case_ref, case_type, title, queue, status, priority, sla_due_at, client_id')
        .in('client_id', clientIds)
        .not('status', 'in', '(resolved,closed)')
        .order('sla_due_at', { ascending: true, nullsFirst: false })
        .limit(25)
      setOpenCases((cases ?? []) as Case[])
    }

    const auaQ = firmId
      ? supabase.from('mi_aua_by_firm').select('*').eq('firm_id', firmId)
      : supabase.from('mi_aua_by_firm').select('*')
    const flowsQ = firmId
      ? supabase.from('mi_net_flows').select('*').eq('firm_id', firmId).order('month', { ascending: false }).limit(12)
      : supabase.from('mi_net_flows').select('*').order('month', { ascending: false }).limit(36)
    const feeQ = firmId
      ? supabase.from('mi_fee_yield').select('*').eq('firm_id', firmId).order('month', { ascending: false }).limit(12)
      : supabase.from('mi_fee_yield').select('*').order('month', { ascending: false }).limit(36)

    Promise.all([auaQ, flowsQ, feeQ, loadCases()]).then(([a, f, fy]) => {
      setAua(a.data || [])

      // When in platform mode, sum rows that share the same month across firms
      const aggregate = (rows: any[], valueKeys: string[]) => {
        if (firmId) return rows.slice().reverse()
        const map = new Map<string, any>()
        for (const r of rows) {
          const k = r.month
          const cur = map.get(k) ?? { month: k, ...Object.fromEntries(valueKeys.map(v => [v, 0])) }
          for (const v of valueKeys) cur[v] = Number(cur[v] || 0) + Number(r[v] || 0)
          map.set(k, cur)
        }
        return Array.from(map.values()).sort((a, b) => String(a.month).localeCompare(String(b.month))).slice(-12)
      }

      setFlows(aggregate(f.data || [], ['net_flow', 'inflow', 'outflow']))
      setFeeYield(aggregate(fy.data || [], ['total_fees', 'fees_charged', 'aua']))
    })
  }, [firmId])

  const totalAua = aua.reduce((s, x) => s + Number(x.aua || 0), 0)
  const totalClients = aua.reduce((s, x) => s + Number(x.client_count || 0), 0)
  const last30Flow = flows.slice(-1)[0]?.net_flow || 0
  const totalFees = feeYield.reduce((s, x) => s + Number(x.total_fees || 0), 0)

  const breached = openCases.filter(c => c.sla_due_at && new Date(c.sla_due_at) < new Date()).length

  const openCase = (c: Case) => navigate(`/cockpit?case=${c.id}`)

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Management Information</h1>
        <p className="text-sm text-muted-foreground">
          Live AUA, net flows, fee yield, and operations health
          {firm && <> · scoped to <span className="font-medium text-foreground">{firm.name}</span></>}
        </p>
      </header>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="text-xs text-muted-foreground">Total AUA</div><div className="text-2xl font-semibold mt-1">{fmtGBP(totalAua)}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Active clients</div><div className="text-2xl font-semibold mt-1">{totalClients.toLocaleString()}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Latest month net flow</div><div className="text-2xl font-semibold mt-1">{fmtGBP(Number(last30Flow))}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Fees (12m)</div><div className="text-2xl font-semibold mt-1">{fmtGBP(totalFees)}</div></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3">Net flows by month</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={flows}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => fmtGBP(Number(v))} />
              <Area type="monotone" dataKey="net_flow" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3">AUA</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={aua}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="firm_name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => fmtGBP(Number(v))} />
              <Bar dataKey="aua" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3">Fee yield (12m)</h2>
          {feeYield.length === 0 ? (
            <div className="text-sm text-muted-foreground py-12 text-center">No fees billed in the last 12 months for this firm.</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={feeYield}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `£${v}`} />
                <Tooltip formatter={(v: any) => fmtGBP(Number(v))} />
                <Legend />
                <Line type="monotone" dataKey="total_fees" stroke="hsl(var(--secondary))" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Open operations cases</h2>
            <div className="flex items-center gap-2">
              {breached > 0 && <Badge variant="destructive" className="text-[10px]">{breached} SLA breached</Badge>}
              <button onClick={() => navigate('/cockpit')} className="text-xs text-primary hover:underline">View all</button>
            </div>
          </div>
          <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1">
            {openCases.length === 0 && <div className="text-sm text-muted-foreground py-8 text-center">No open cases for this firm.</div>}
            {openCases.map(c => {
              const isBreached = c.sla_due_at && new Date(c.sla_due_at) < new Date()
              return (
                <button
                  key={c.id}
                  onClick={() => openCase(c)}
                  className="w-full flex items-center justify-between text-left text-sm border-b border-border px-2 py-2 rounded hover:bg-muted transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{c.case_ref || c.title || c.case_type || 'Case'}</span>
                      {isBreached && <Badge variant="destructive" className="text-[10px]">Breached</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {c.queue ?? '—'} · {c.status ?? '—'}{c.priority ? ` · ${c.priority}` : ''}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0 ml-2" />
                </button>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
