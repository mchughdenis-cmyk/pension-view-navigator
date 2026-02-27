import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  Activity,
  Target,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSchemeStats } from '@/hooks/useClientData'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0 }).format(amount)

export default function SchemeDashboard() {
  const { stats, loading, fetchStats } = useSchemeStats()

  const totalAUM = stats.totalAUM
  const productEntries = Object.entries(stats.accountsByType).map(([type, data]) => ({
    product: type, aum: data.aum, clients: data.count, pct: totalAUM > 0 ? (data.aum / totalAUM) * 100 : 0,
  })).sort((a, b) => b.aum - a.aum)

  // Derive flows from recent transactions
  const inflows = stats.recentTransactions.filter(t => ['contribution', 'transfer_in'].includes(t.transaction_type)).reduce((s: number, t: any) => s + Math.abs(Number(t.amount)), 0)
  const outflows = stats.recentTransactions.filter(t => ['withdrawal', 'drawdown', 'transfer_out'].includes(t.transaction_type)).reduce((s: number, t: any) => s + Math.abs(Number(t.amount)), 0)
  const netFlows = inflows - outflows

  if (loading) return <p className="text-center text-muted-foreground py-8">Loading scheme data...</p>

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={fetchStats}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
      </div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total AUM</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalAUM)}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.totalAccounts} accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Net Flows (Recent)</p>
            <p className={`text-2xl font-bold ${netFlows >= 0 ? 'text-success' : 'text-destructive'}`}>{netFlows >= 0 ? '+' : ''}{formatCurrency(netFlows)}</p>
            <p className="text-xs text-muted-foreground mt-1">In: {formatCurrency(inflows)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Members</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalClients}</p>
            <p className="text-xs text-muted-foreground mt-1">Active clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Avg Portfolio</p>
            <p className="text-2xl font-bold text-success">{stats.totalAccounts > 0 ? formatCurrency(totalAUM / stats.totalAccounts) : '£0'}</p>
            <p className="text-xs text-muted-foreground mt-1">Per account</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fund Flows */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> Recent Fund Flows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Inflows</span>
                  <span className="font-bold text-success">{formatCurrency(inflows)}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <ArrowDownLeft className="w-3 h-3 text-success" />
                  <span className="text-muted-foreground">Contributions & transfers in</span>
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Outflows</span>
                  <span className="font-bold text-destructive">{formatCurrency(outflows)}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <ArrowUpRight className="w-3 h-3 text-destructive" />
                  <span className="text-muted-foreground">Withdrawals & transfers out</span>
                </div>
              </div>
              <div className="p-3 border rounded-lg bg-accent/30">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Net Flows</span>
                  <span className={`font-bold ${netFlows >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {netFlows >= 0 ? '+' : ''}{formatCurrency(netFlows)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Breakdown */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Product Breakdown</CardTitle></CardHeader>
          <CardContent>
            {productEntries.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No accounts found</p>
            ) : (
              <div className="space-y-4">
                {productEntries.map(p => (
                  <div key={p.product} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{p.product}</span>
                      <span>{formatCurrency(p.aum)} ({p.pct.toFixed(1)}%)</span>
                    </div>
                    <Progress value={p.pct} className="h-2" />
                    <p className="text-xs text-muted-foreground">{p.clients} account{p.clients !== 1 ? 's' : ''}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" /> Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          {stats.recentTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No recent transactions</p>
          ) : (
            <div className="space-y-2">
              {stats.recentTransactions.slice(0, 10).map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">{t.transaction_type?.replace('_', ' ')}</Badge>
                    <Badge variant={t.status === 'settled' ? 'default' : 'secondary'} className="text-xs">{t.status}</Badge>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${Number(t.amount) >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(Math.abs(Number(t.amount)))}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
