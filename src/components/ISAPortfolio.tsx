import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/ui/back-button'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Shield, 
  Calendar,
  ArrowRight,
  Plus,
  FileText,
  BarChart3
} from 'lucide-react'

export default function ISAPortfolio() {
  const currentTaxYear = '2025/26'
  const annualAllowance = 20000
  const usedAllowance = 12500
  const remainingAllowance = annualAllowance - usedAllowance
  const allowancePercentage = (usedAllowance / annualAllowance) * 100

  const isaData = {
    totalValue: 87650,
    totalGain: 12340,
    totalGainPercent: 16.4,
    cashBalance: 2150,
    yearContributions: usedAllowance,
    dividendsReceived: 1245,
    holdings: [
      { name: 'Vanguard FTSE Global All Cap Index', units: 450.23, price: 78.45, value: 35320, gain: 5200, gainPercent: 17.3, allocation: 40.3 },
      { name: 'iShares Core MSCI World ETF', units: 120.50, price: 148.20, value: 17858, gain: 2100, gainPercent: 13.3, allocation: 20.4 },
      { name: 'L&G UK Index', units: 380.00, price: 42.30, value: 16074, gain: 1850, gainPercent: 13.0, allocation: 18.3 },
      { name: 'Vanguard LifeStrategy 60%', units: 200.00, price: 52.10, value: 10420, gain: 1940, gainPercent: 22.9, allocation: 11.9 },
      { name: 'Royal London Short Duration Credit', units: 150.00, price: 35.68, value: 5352, gain: 450, gainPercent: 9.2, allocation: 6.1 },
      { name: 'Cash', units: 1, price: 2150, value: 2150, gain: 0, gainPercent: 0, allocation: 2.5 },
    ],
    transactions: [
      { date: '2025-02-01', type: 'Contribution', amount: 1000, description: 'Monthly standing order' },
      { date: '2025-01-15', type: 'Dividend', amount: 145.20, description: 'Vanguard FTSE Global All Cap' },
      { date: '2025-01-01', type: 'Contribution', amount: 1000, description: 'Monthly standing order' },
      { date: '2024-12-20', type: 'Buy', amount: -2000, description: 'iShares Core MSCI World ETF' },
      { date: '2024-12-01', type: 'Contribution', amount: 1000, description: 'Monthly standing order' },
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-muted via-background to-secondary-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <BackButton label="Back to Dashboard" />
        
        <div className="mt-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Stocks & Shares ISA</h1>
              <p className="text-muted-foreground">Tax-free investment account • {currentTaxYear}</p>
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
              <div className="text-2xl font-bold text-primary">£{isaData.totalValue.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-sm text-success">
                <TrendingUp className="w-3 h-3" />
                +£{isaData.totalGain.toLocaleString()} ({isaData.totalGainPercent}%)
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">£{isaData.cashBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Available to invest</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Dividends (YTD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">£{isaData.dividendsReceived.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Tax-free income</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">ISA Allowance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">£{remainingAllowance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Remaining this year</p>
            </CardContent>
          </Card>
        </div>

        {/* ISA Allowance Progress */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">ISA Allowance Usage {currentTaxYear}</CardTitle>
              <Badge variant="secondary">£{annualAllowance.toLocaleString()} limit</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={allowancePercentage} className="h-3 mb-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>£{usedAllowance.toLocaleString()} used ({allowancePercentage.toFixed(0)}%)</span>
              <span>£{remainingAllowance.toLocaleString()} remaining</span>
            </div>
          </CardContent>
        </Card>

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
                  {isaData.holdings.map((holding, i) => (
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
              {isaData.transactions.map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${tx.type === 'Contribution' ? 'bg-success/10' : tx.type === 'Dividend' ? 'bg-primary/10' : 'bg-muted'}`}>
                      {tx.type === 'Contribution' ? <Plus className="w-4 h-4 text-success" /> :
                       tx.type === 'Dividend' ? <PiggyBank className="w-4 h-4 text-primary" /> :
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
