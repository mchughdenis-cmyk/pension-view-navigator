import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import { toast } from 'sonner'
import { Calculator, Sparkles } from 'lucide-react'

const fmtGBP = (n: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)

export default function MonteCarloProjection() {
  const [initial, setInitial] = useState('250000')
  const [contribution, setContribution] = useState('5000')
  const [withdrawal, setWithdrawal] = useState('0')
  const [years, setYears] = useState('30')
  const [meanReturn, setMeanReturn] = useState('5.5')
  const [volatility, setVolatility] = useState('12')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    try {
      const url = `https://hzmkgkgrelxwmkswdkyw.supabase.co/functions/v1/monte-carlo-projection`
      const res = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initial: Number(initial), annual_contribution: Number(contribution),
          annual_withdrawal: Number(withdrawal), years: Number(years),
          mean_return: Number(meanReturn) / 100, volatility: Number(volatility) / 100,
          simulations: 1000,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Simulation failed')

      const chartData = json.paths.p10.map((v: number, i: number) => ({
        year: i, p10: Math.round(v), p50: Math.round(json.paths.p50[i]), p90: Math.round(json.paths.p90[i]),
      }))
      setResult({ ...json, chartData })
      toast.success(`${json.simulations} simulations complete`)
    } catch (e: any) { toast.error(e.message) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-4">
      <header>
        <h1 className="text-2xl font-semibold flex items-center gap-2"><Calculator className="h-6 w-6" />Monte Carlo Retirement Projection</h1>
        <p className="text-sm text-muted-foreground">1,000 simulated paths — explore the range of likely outcomes for your pension pot</p>
      </header>

      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div><Label className="text-xs">Initial pot (£)</Label><Input value={initial} onChange={e => setInitial(e.target.value)} /></div>
          <div><Label className="text-xs">Annual contribution (£)</Label><Input value={contribution} onChange={e => setContribution(e.target.value)} /></div>
          <div><Label className="text-xs">Annual withdrawal (£)</Label><Input value={withdrawal} onChange={e => setWithdrawal(e.target.value)} /></div>
          <div><Label className="text-xs">Years</Label><Input value={years} onChange={e => setYears(e.target.value)} /></div>
          <div><Label className="text-xs">Expected return (%)</Label><Input value={meanReturn} onChange={e => setMeanReturn(e.target.value)} /></div>
          <div><Label className="text-xs">Volatility (%)</Label><Input value={volatility} onChange={e => setVolatility(e.target.value)} /></div>
        </div>
        <Button className="mt-3" onClick={run} disabled={loading}>
          <Sparkles className="h-4 w-4 mr-2" />{loading ? 'Running 1,000 simulations...' : 'Run simulation'}
        </Button>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4"><div className="text-xs text-muted-foreground">Pessimistic (10th %ile)</div><div className="text-xl font-semibold mt-1">{fmtGBP(result.final_p10)}</div></Card>
            <Card className="p-4"><div className="text-xs text-muted-foreground">Median (50th %ile)</div><div className="text-xl font-semibold mt-1">{fmtGBP(result.final_p50)}</div></Card>
            <Card className="p-4"><div className="text-xs text-muted-foreground">Optimistic (90th %ile)</div><div className="text-xl font-semibold mt-1">{fmtGBP(result.final_p90)}</div></Card>
            <Card className="p-4"><div className="text-xs text-muted-foreground">Success rate</div>
              <div className="text-xl font-semibold mt-1 flex items-center gap-2">{(result.success_rate * 100).toFixed(0)}%
                <Badge variant={result.success_rate > 0.85 ? 'secondary' : result.success_rate > 0.6 ? 'default' : 'destructive'}>
                  {result.success_rate > 0.85 ? 'Strong' : result.success_rate > 0.6 ? 'Moderate' : 'At risk'}
                </Badge>
              </div></Card>
          </div>

          <Card className="p-4">
            <h2 className="font-semibold mb-3">Projected pot over {result.years} years</h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={result.chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => fmtGBP(Number(v))} />
                <Legend />
                <Line type="monotone" dataKey="p90" name="Optimistic (90%)" stroke="hsl(var(--secondary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="p50" name="Median (50%)" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="p10" name="Pessimistic (10%)" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  )
}
