import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card } from '@/components/ui/card'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend, AreaChart, Area } from 'recharts'

const fmtGBP = (n: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)

export default function MIDashboard() {
  const [aua, setAua] = useState<any[]>([])
  const [flows, setFlows] = useState<any[]>([])
  const [feeYield, setFeeYield] = useState<any[]>([])
  const [queueHealth, setQueueHealth] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      supabase.from('mi_aua_by_firm').select('*'),
      supabase.from('mi_net_flows').select('*').limit(12),
      supabase.from('mi_fee_yield').select('*').limit(12),
      supabase.from('mi_ops_queue_health').select('*'),
    ]).then(([a, f, fy, q]) => {
      setAua(a.data || [])
      setFlows((f.data || []).reverse())
      setFeeYield((fy.data || []).reverse())
      setQueueHealth(q.data || [])
    })
  }, [])

  const totalAua = aua.reduce((s, x) => s + Number(x.aua || 0), 0)
  const totalClients = aua.reduce((s, x) => s + Number(x.client_count || 0), 0)
  const last30Flow = flows.slice(-1)[0]?.net_flow || 0
  const totalFees = feeYield.reduce((s, x) => s + Number(x.total_fees || 0), 0)

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Management Information</h1>
        <p className="text-sm text-muted-foreground">Live AUA, net flows, fee yield, and operations health</p>
      </header>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="text-xs text-muted-foreground">Total AUA</div><div className="text-2xl font-semibold mt-1">{fmtGBP(totalAua)}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Active clients</div><div className="text-2xl font-semibold mt-1">{totalClients.toLocaleString()}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Latest month net flow</div><div className="text-2xl font-semibold mt-1">{fmtGBP(last30Flow)}</div></Card>
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
          <h2 className="text-sm font-semibold mb-3">AUA by firm</h2>
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
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3">Operations queue health</h2>
          <div className="space-y-2">
            {queueHealth.length === 0 && <div className="text-sm text-muted-foreground">No active queues</div>}
            {queueHealth.map((q, i) => (
              <div key={i} className="flex items-center justify-between text-sm border-b border-border pb-1.5">
                <span className="font-medium">{q.queue} · {q.status}</span>
                <div className="flex gap-3 text-xs">
                  <span>{q.case_count} cases</span>
                  {Number(q.sla_breached) > 0 && <span className="text-destructive">{q.sla_breached} breached</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
