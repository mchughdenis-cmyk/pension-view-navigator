import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  RefreshCw,
  Plus,
  Edit,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  TrendingUp,
  Play,
  Eye,
} from 'lucide-react'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0 }).format(amount)

const modelPortfolios = [
  {
    id: 1,
    name: 'Cautious Growth',
    riskLevel: 3,
    description: 'Low-risk diversified portfolio',
    clientCount: 312,
    aum: 8750000,
    driftStatus: 'in_tolerance',
    holdings: [
      { asset: 'UK Gilts', target: 40, actual: 41.2, diff: 1.2 },
      { asset: 'Investment Grade Bonds', target: 25, actual: 24.1, diff: -0.9 },
      { asset: 'UK Equity', target: 15, actual: 15.8, diff: 0.8 },
      { asset: 'Global Equity', target: 10, actual: 9.5, diff: -0.5 },
      { asset: 'Property', target: 5, actual: 4.8, diff: -0.2 },
      { asset: 'Cash', target: 5, actual: 4.6, diff: -0.4 },
    ]
  },
  {
    id: 2,
    name: 'Balanced',
    riskLevel: 5,
    description: 'Medium-risk growth and income portfolio',
    clientCount: 487,
    aum: 18500000,
    driftStatus: 'drift_warning',
    holdings: [
      { asset: 'UK Equity', target: 25, actual: 27.8, diff: 2.8 },
      { asset: 'Global Equity', target: 25, actual: 23.1, diff: -1.9 },
      { asset: 'Investment Grade Bonds', target: 20, actual: 19.5, diff: -0.5 },
      { asset: 'UK Gilts', target: 15, actual: 14.2, diff: -0.8 },
      { asset: 'Property', target: 10, actual: 10.8, diff: 0.8 },
      { asset: 'Cash', target: 5, actual: 4.6, diff: -0.4 },
    ]
  },
  {
    id: 3,
    name: 'Aggressive Growth',
    riskLevel: 8,
    description: 'High-risk equity-focused portfolio',
    clientCount: 198,
    aum: 12400000,
    driftStatus: 'needs_rebalance',
    holdings: [
      { asset: 'Global Equity', target: 40, actual: 44.5, diff: 4.5 },
      { asset: 'UK Equity', target: 25, actual: 22.1, diff: -2.9 },
      { asset: 'Emerging Markets', target: 15, actual: 13.8, diff: -1.2 },
      { asset: 'Property', target: 10, actual: 10.2, diff: 0.2 },
      { asset: 'Alternative Assets', target: 5, actual: 5.1, diff: 0.1 },
      { asset: 'Cash', target: 5, actual: 4.3, diff: -0.7 },
    ]
  },
  {
    id: 4,
    name: 'Income Focus',
    riskLevel: 4,
    description: 'Designed for drawdown clients seeking stable income',
    clientCount: 134,
    aum: 9200000,
    driftStatus: 'in_tolerance',
    holdings: [
      { asset: 'UK Equity Income', target: 30, actual: 30.5, diff: 0.5 },
      { asset: 'Investment Grade Bonds', target: 30, actual: 29.2, diff: -0.8 },
      { asset: 'UK Gilts', target: 15, actual: 15.3, diff: 0.3 },
      { asset: 'Global High Yield', target: 10, actual: 10.1, diff: 0.1 },
      { asset: 'Property REITs', target: 10, actual: 10.4, diff: 0.4 },
      { asset: 'Cash', target: 5, actual: 4.5, diff: -0.5 },
    ]
  },
]

const rebalanceHistory = [
  { id: 1, date: '2024-01-10', portfolio: 'Aggressive Growth', clientsAffected: 198, tradesGenerated: 594, status: 'completed', value: 1250000 },
  { id: 2, date: '2024-01-03', portfolio: 'Balanced', clientsAffected: 487, tradesGenerated: 1461, status: 'completed', value: 3200000 },
  { id: 3, date: '2023-12-28', portfolio: 'Income Focus', clientsAffected: 134, tradesGenerated: 268, status: 'completed', value: 890000 },
  { id: 4, date: '2023-12-15', portfolio: 'Cautious Growth', clientsAffected: 312, tradesGenerated: 624, status: 'completed', value: 1100000 },
]

const driftConfig: Record<string, { label: string; variant: string; icon: React.ElementType }> = {
  in_tolerance: { label: 'In Tolerance', variant: 'default', icon: CheckCircle },
  drift_warning: { label: 'Drift Warning', variant: 'secondary', icon: AlertTriangle },
  needs_rebalance: { label: 'Needs Rebalance', variant: 'destructive', icon: RefreshCw },
}

export default function PortfolioRebalancing() {
  const [selectedPortfolio, setSelectedPortfolio] = useState<number | null>(null)
  const selected = modelPortfolios.find(p => p.id === selectedPortfolio)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Model Portfolios</p>
            <p className="text-2xl font-bold text-foreground">{modelPortfolios.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Clients</p>
            <p className="text-2xl font-bold text-primary">{modelPortfolios.reduce((s, p) => s + p.clientCount, 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">AUM in Models</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(modelPortfolios.reduce((s, p) => s + p.aum, 0))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Needing Rebalance</p>
            <p className="text-2xl font-bold text-destructive">{modelPortfolios.filter(p => p.driftStatus === 'needs_rebalance').length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Portfolios */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" /> Model Portfolios</CardTitle>
                <CardDescription>Select a portfolio to view allocation and drift</CardDescription>
              </div>
              <Button size="sm"><Plus className="w-4 h-4 mr-2" /> New Model</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {modelPortfolios.map(portfolio => {
                const drift = driftConfig[portfolio.driftStatus]
                const DriftIcon = drift.icon
                return (
                  <div
                    key={portfolio.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-accent/50 ${selectedPortfolio === portfolio.id ? 'ring-2 ring-primary bg-accent/30' : ''}`}
                    onClick={() => setSelectedPortfolio(portfolio.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{portfolio.name}</h4>
                        <p className="text-xs text-muted-foreground">{portfolio.description}</p>
                      </div>
                      <Badge variant={drift.variant as any}>
                        <DriftIcon className="w-3 h-3 mr-1" />{drift.label}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Risk:</span> <strong>{portfolio.riskLevel}/10</strong></div>
                      <div><span className="text-muted-foreground">Clients:</span> <strong>{portfolio.clientCount}</strong></div>
                      <div><span className="text-muted-foreground">AUM:</span> <strong>{formatCurrency(portfolio.aum)}</strong></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Allocation Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {selected ? `${selected.name} - Allocation` : 'Select a Portfolio'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selected ? (
              <div className="space-y-4">
                {selected.holdings.map((h, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{h.asset}</span>
                      <span className="text-muted-foreground">
                        Target: {h.target}% | Actual: {h.actual}% |
                        <span className={Math.abs(h.diff) > 2 ? ' text-destructive font-semibold' : Math.abs(h.diff) > 1 ? ' text-warning' : ' text-success'}>
                          {' '}{h.diff > 0 ? '+' : ''}{h.diff}%
                        </span>
                      </span>
                    </div>
                    <div className="relative">
                      <Progress value={h.actual} className="h-3" />
                      <div className="absolute top-0 h-3 border-l-2 border-foreground" style={{ left: `${h.target}%` }} />
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 mt-4">
                  <Button className="flex-1"><Play className="w-4 h-4 mr-2" /> Rebalance Now</Button>
                  <Button variant="outline" className="flex-1"><Eye className="w-4 h-4 mr-2" /> Preview Trades</Button>
                  <Button variant="outline"><Edit className="w-4 h-4" /></Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Click a model portfolio to view its allocation and drift analysis</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rebalance History */}
      <Card>
        <CardHeader>
          <CardTitle>Rebalance History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Portfolio</TableHead>
                <TableHead className="text-right">Clients Affected</TableHead>
                <TableHead className="text-right">Trades Generated</TableHead>
                <TableHead className="text-right">Trade Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rebalanceHistory.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.date}</TableCell>
                  <TableCell className="font-medium">{r.portfolio}</TableCell>
                  <TableCell className="text-right">{r.clientsAffected}</TableCell>
                  <TableCell className="text-right">{r.tradesGenerated.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(r.value)}</TableCell>
                  <TableCell><Badge variant="default">{r.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
