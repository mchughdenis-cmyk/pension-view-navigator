import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/ui/back-button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  TrendingUp, 
  Landmark,
  Plus,
  PiggyBank,
  BarChart3,
  AlertCircle,
  FileText
} from 'lucide-react'

export default function GIAPortfolio() {
  const giaData = {
    totalValue: 145200,
    totalGain: 18750,
    totalGainPercent: 14.8,
    cashBalance: 5400,
    realisedGains: 3200,
    cgtAllowance: 3000,
    cgtUsed: 3200,
    dividendsReceived: 2180,
    holdings: [
      { name: 'Fundsmith Equity', units: 320.00, price: 165.50, value: 52960, gain: 7200, gainPercent: 15.7, allocation: 36.5 },
      { name: 'Baillie Gifford Actual Income', units: 800.00, price: 45.20, value: 36160, gain: 4100, gainPercent: 12.8, allocation: 24.9 },
      { name: 'Vanguard US Equity Index', units: 150.00, price: 185.40, value: 27810, gain: 3950, gainPercent: 16.6, allocation: 19.1 },
      { name: 'iShares UK Property ETF', units: 400.00, price: 47.18, value: 18872, gain: 2100, gainPercent: 12.5, allocation: 13.0 },
      { name: 'Cash', units: 1, price: 5400, value: 5400, gain: 0, gainPercent: 0, allocation: 3.7 },
    ],
    transactions: [
      { date: '2025-02-05', type: 'Deposit', amount: 5000, description: 'Lump sum investment' },
      { date: '2025-01-20', type: 'Dividend', amount: 320.50, description: 'Baillie Gifford Actual Income' },
      { date: '2025-01-10', type: 'Sell', amount: 3200, description: 'iShares UK Property ETF (partial)' },
      { date: '2024-12-15', type: 'Buy', amount: -4000, description: 'Fundsmith Equity' },
      { date: '2024-12-01', type: 'Deposit', amount: 2000, description: 'Monthly contribution' },
    ]
  }

  const cgtExceeded = giaData.cgtUsed > giaData.cgtAllowance

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-muted via-background to-secondary-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <BackButton label="Back to Dashboard" />
        
        <div className="mt-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-accent/50">
              <Landmark className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">General Investment Account</h1>
              <p className="text-muted-foreground">Flexible investment account • No contribution limits</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">£{giaData.totalValue.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-sm text-success">
                <TrendingUp className="w-3 h-3" />
                +£{giaData.totalGain.toLocaleString()} ({giaData.totalGainPercent}%)
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">£{giaData.cashBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Available to invest</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Dividends (YTD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">£{giaData.dividendsReceived.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Taxable income</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">CGT Position</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${cgtExceeded ? 'text-destructive' : 'text-foreground'}`}>
                £{giaData.realisedGains.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {cgtExceeded ? 'Exceeds £3,000 allowance' : `£${(giaData.cgtAllowance - giaData.cgtUsed).toLocaleString()} remaining`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CGT Warning */}
        {cgtExceeded && (
          <Card className="mb-8 border-destructive/50 bg-destructive/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <div>
                <p className="font-medium text-destructive">Capital Gains Tax Allowance Exceeded</p>
                <p className="text-sm text-muted-foreground">
                  Realised gains of £{giaData.realisedGains.toLocaleString()} exceed the £{giaData.cgtAllowance.toLocaleString()} annual allowance. 
                  Estimated CGT liability: £{((giaData.realisedGains - giaData.cgtAllowance) * 0.20).toLocaleString()} (at 20% rate)
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Holdings */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Holdings</CardTitle>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Buy / Invest
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Holding</TableHead>
                    <TableHead className="hidden md:table-cell text-right">Units</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="hidden sm:table-cell text-right">Gain/Loss</TableHead>
                    <TableHead className="hidden lg:table-cell text-right">Allocation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {giaData.holdings.map((holding, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{holding.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-right">{holding.units.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">£{holding.value.toLocaleString()}</TableCell>
                      <TableCell className="hidden sm:table-cell text-right">
                        <span className={holding.gain >= 0 ? 'text-success' : 'text-destructive'}>
                          {holding.gain >= 0 ? '+' : ''}£{holding.gain.toLocaleString()} ({holding.gainPercent}%)
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-right">{holding.allocation}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {giaData.transactions.map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${tx.type === 'Deposit' ? 'bg-success/10' : tx.type === 'Dividend' ? 'bg-primary/10' : tx.type === 'Sell' ? 'bg-warning/10' : 'bg-muted'}`}>
                      {tx.type === 'Deposit' ? <Plus className="w-4 h-4 text-success" /> :
                       tx.type === 'Dividend' ? <PiggyBank className="w-4 h-4 text-primary" /> :
                       tx.type === 'Sell' ? <TrendingUp className="w-4 h-4 text-warning" /> :
                       <BarChart3 className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.type}</p>
                      <p className="text-xs text-muted-foreground">{tx.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.amount >= 0 ? 'text-success' : 'text-foreground'}`}>
                      {tx.amount >= 0 ? '+' : ''}£{Math.abs(tx.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
