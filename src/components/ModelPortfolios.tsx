import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'

export default function ModelPortfolios() {
  const [models, setModels] = useState<any[]>([])
  const [holdings, setHoldings] = useState<Record<string, any[]>>({})
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('model_portfolios').select('*, model_holdings(*)').order('risk_level').then(({ data }) => {
      setModels(data || [])
      const h: Record<string, any[]> = {}
      for (const m of data || []) h[m.id] = m.model_holdings || []
      setHoldings(h)
      if (data && data.length) setSelected(data[1]?.id || data[0].id)
    })
  }, [])

  const sel = models.find(m => m.id === selected)
  const sum = sel ? (holdings[sel.id] || []).reduce((s, h) => s + Number(h.target_pct || 0), 0) : 0

  const runRebalanceDemo = async () => {
    // Use first active account for demo
    const { data: acct } = await supabase.from('client_accounts').select('id').eq('status', 'active').limit(1).maybeSingle()
    if (!acct) return toast.error('No active account to rebalance')
    const url = `https://hzmkgkgrelxwmkswdkyw.supabase.co/functions/v1/rebalance-engine`
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ account_id: acct.id, dry_run: true }) })
    const json = await res.json()
    if (res.ok) toast.success(`Rebalance analysed: ${json.trades?.length || 0} trades, £${Math.round(json.total_buy || 0)} buy / £${Math.round(json.total_sell || 0)} sell`)
    else toast.error(json.error || 'Rebalance failed')
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Model Portfolio Service</h1>
          <p className="text-sm text-muted-foreground">DFM-managed risk-rated models with drift monitoring & rebalancing</p>
        </div>
        <Button onClick={runRebalanceDemo}>Run rebalance (dry run)</Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {models.map(m => (
          <Card
            key={m.id}
            className={`p-4 cursor-pointer transition-colors ${selected === m.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelected(m.id)}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{m.name}</h3>
              <Badge variant="secondary">Risk {m.risk_level}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
              <div><div className="text-muted-foreground">OCF</div><div className="font-medium">{m.ocf}%</div></div>
              <div><div className="text-muted-foreground">Drift tol.</div><div className="font-medium">{m.drift_tolerance_pct}%</div></div>
              <div><div className="text-muted-foreground">Rebalance</div><div className="font-medium capitalize">{m.rebalance_frequency}</div></div>
            </div>
          </Card>
        ))}
      </div>

      {sel && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">{sel.name} — Holdings</h2>
            <Badge variant={Math.abs(sum - 100) < 0.01 ? 'secondary' : 'destructive'}>Total: {sum.toFixed(1)}%</Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead><TableHead>Fund</TableHead><TableHead>Asset class</TableHead>
                <TableHead>Region</TableHead><TableHead className="text-right">Target %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(holdings[sel.id] || []).map(h => (
                <TableRow key={h.id}>
                  <TableCell className="font-mono text-xs">{h.symbol}</TableCell>
                  <TableCell>{h.fund_name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{h.asset_class}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{h.region}</TableCell>
                  <TableCell className="text-right font-medium">{h.target_pct}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
