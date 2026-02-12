import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  PiggyBank,
  Banknote,
  AlertTriangle,
  RefreshCw,
  Activity,
  Calendar,
  Target,
} from 'lucide-react'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0 }).format(amount)

const schemeMetrics = {
  totalAUM: 42750000,
  aumChange: 2.4,
  netFlows: 1250000,
  grossInflows: 3450000,
  grossOutflows: 2200000,
  totalClients: 1247,
  newClients: 23,
  leavingClients: 5,
  avgPortfolioSize: 34266,
  clientsInDrawdown: 187,
  clientsAccumulating: 1060,
  totalFeeIncome: 156400,
  complianceScore: 98.5,
}

const monthlyFlows = [
  { month: 'Aug', inflows: 2800000, outflows: 1900000 },
  { month: 'Sep', inflows: 3100000, outflows: 2100000 },
  { month: 'Oct', inflows: 2900000, outflows: 2300000 },
  { month: 'Nov', inflows: 3200000, outflows: 1800000 },
  { month: 'Dec', inflows: 2600000, outflows: 2500000 },
  { month: 'Jan', inflows: 3450000, outflows: 2200000 },
]

const productBreakdown = [
  { product: 'SIPP', aum: 28500000, clients: 1247, pct: 66.7 },
  { product: 'S&S ISA', aum: 8750000, clients: 890, pct: 20.5 },
  { product: 'GIA', aum: 5500000, clients: 534, pct: 12.8 },
]

const topHoldings = [
  { name: 'Vanguard FTSE All-World ETF', value: 8500000, pct: 19.9 },
  { name: 'iShares Core MSCI World', value: 6200000, pct: 14.5 },
  { name: 'L&G UK Index Trust', value: 4800000, pct: 11.2 },
  { name: 'Fundsmith Equity Fund', value: 3900000, pct: 9.1 },
  { name: 'Vanguard LifeStrategy 60', value: 3200000, pct: 7.5 },
]

export default function SchemeDashboard() {
  return (
    <div className="space-y-6">
      {/* Hero Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total AUM</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(schemeMetrics.totalAUM)}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="text-xs text-success">+{schemeMetrics.aumChange}% this month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Net Flows (Month)</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(schemeMetrics.netFlows)}</p>
            <p className="text-xs text-muted-foreground mt-1">In: {formatCurrency(schemeMetrics.grossInflows)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Members</p>
            <p className="text-2xl font-bold text-foreground">{schemeMetrics.totalClients.toLocaleString()}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-success">+{schemeMetrics.newClients} new</span>
              <span className="text-xs text-destructive">-{schemeMetrics.leavingClients} left</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Fee Income (Month)</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(schemeMetrics.totalFeeIncome)}</p>
            <p className="text-xs text-muted-foreground mt-1">Avg: {formatCurrency(schemeMetrics.totalFeeIncome / schemeMetrics.totalClients)}/client</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fund Flows */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> Monthly Fund Flows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyFlows.map(m => {
                const net = m.inflows - m.outflows
                return (
                  <div key={m.month} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{m.month}</span>
                      <span className={`font-bold ${net >= 0 ? 'text-success' : 'text-destructive'}`}>
                        Net: {net >= 0 ? '+' : ''}{formatCurrency(net)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <ArrowDownLeft className="w-3 h-3 text-success" />
                        <span className="text-muted-foreground">In:</span>
                        <span className="font-medium">{formatCurrency(m.inflows)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-destructive" />
                        <span className="text-muted-foreground">Out:</span>
                        <span className="font-medium">{formatCurrency(m.outflows)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Product & Holdings Breakdown */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Product Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productBreakdown.map(p => (
                  <div key={p.product} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{p.product}</span>
                      <span>{formatCurrency(p.aum)} ({p.pct}%)</span>
                    </div>
                    <Progress value={p.pct} className="h-2" />
                    <p className="text-xs text-muted-foreground">{p.clients} clients</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" /> Top Holdings</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topHoldings.map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                      <span className="text-sm font-medium">{h.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold">{formatCurrency(h.value)}</span>
                      <span className="text-xs text-muted-foreground ml-2">({h.pct}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><PiggyBank className="w-4 h-4 text-success" /><span className="text-sm font-medium">Accumulation</span></div>
            <p className="text-2xl font-bold mt-1">{schemeMetrics.clientsAccumulating}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><Banknote className="w-4 h-4 text-warning" /><span className="text-sm font-medium">In Drawdown</span></div>
            <p className="text-2xl font-bold mt-1">{schemeMetrics.clientsInDrawdown}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /><span className="text-sm font-medium">Avg Portfolio</span></div>
            <p className="text-2xl font-bold mt-1">{formatCurrency(schemeMetrics.avgPortfolioSize)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-success" /><span className="text-sm font-medium">Compliance</span></div>
            <p className="text-2xl font-bold mt-1">{schemeMetrics.complianceScore}%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
