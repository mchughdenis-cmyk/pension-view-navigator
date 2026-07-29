import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/ui/back-button'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  TrendingUp, PiggyBank, Shield, Plus, BarChart3,
  CheckCircle, Clock, History, FileDown, ArrowDownToLine,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import BuySellDialog, { type Holding, type DealResult } from './BuySellDialog'
import TransferInDialog, { applyTransferToHoldings, type TransferInResult } from './TransferInDialog'
import { exportAnnualTaxPack } from '@/lib/taxPackExport'

interface Tx { date: string; type: string; amount: number; description: string }

export default function ISAPortfolio() {
  const { toast } = useToast()
  const [selectedYear, setSelectedYear] = useState('2026/27')
  const [dealOpen, setDealOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)

  const [holdings, setHoldings] = useState<Holding[]>([
    { name: 'Vanguard FTSE Global All Cap Index', units: 450.23, price: 78.45, value: 35320, gain: 5200, gainPercent: 17.3, allocation: 40.3 },
    { name: 'iShares Core MSCI World UCITS', units: 120.50, price: 148.20, value: 17858, gain: 2100, gainPercent: 13.3, allocation: 20.4 },
    { name: 'L&G UK Index Trust', units: 380.00, price: 42.30, value: 16074, gain: 1850, gainPercent: 13.0, allocation: 18.3 },
    { name: 'Vanguard LifeStrategy 60% Equity', units: 200.00, price: 52.10, value: 10420, gain: 1940, gainPercent: 22.9, allocation: 11.9 },
    { name: 'L&G Short Dated Sterling Corp Bond', units: 150.00, price: 35.68, value: 5352, gain: 450, gainPercent: 9.2, allocation: 6.1 },
    { name: 'Cash', units: 1, price: 2150, value: 2150, gain: 0, gainPercent: 0, allocation: 2.5 },
  ])
  const [transactions, setTransactions] = useState<Tx[]>([
    { date: '2025-02-01', type: 'Contribution', amount: 1000, description: 'Monthly standing order' },
    { date: '2025-01-15', type: 'Dividend', amount: 145.20, description: 'Vanguard FTSE Global All Cap' },
    { date: '2025-01-01', type: 'Contribution', amount: 1000, description: 'Monthly standing order' },
    { date: '2026-12-20', type: 'Buy', amount: -2000, description: 'iShares Core MSCI World UCITS' },
    { date: '2026-12-01', type: 'Contribution', amount: 1000, description: 'Monthly standing order' },
  ])
  const [yearSubscribed, setYearSubscribed] = useState(12500)

  const taxYearHistory = [
    { year: '2026/27', allowance: 20000, subscribed: yearSubscribed, status: 'current' as const },
    { year: '2026/27', allowance: 20000, subscribed: 20000, status: 'complete' as const },
    { year: '2026/27', allowance: 20000, subscribed: 18200, status: 'complete' as const },
    { year: '2026/27', allowance: 20000, subscribed: 15000, status: 'complete' as const },
    { year: '2021/22', allowance: 20000, subscribed: 20000, status: 'complete' as const },
    { year: '2020/21', allowance: 20000, subscribed: 9500, status: 'complete' as const },
  ]
  const currentYearData = taxYearHistory.find(y => y.year === selectedYear) ?? taxYearHistory[0]
  const annualAllowance = currentYearData.allowance
  const usedAllowance = currentYearData.subscribed
  const remainingAllowance = annualAllowance - usedAllowance
  const allowancePercentage = (usedAllowance / annualAllowance) * 100
  const totalSubscribed = taxYearHistory.reduce((s, y) => s + y.subscribed, 0)

  const totals = useMemo(() => {
    const totalValue = holdings.reduce((s, h) => s + h.value, 0)
    const totalGain = holdings.reduce((s, h) => s + h.gain, 0)
    const cash = holdings.find(h => h.name === 'Cash')?.value ?? 0
    return {
      totalValue, totalGain, cashBalance: cash,
      totalGainPercent: totalValue ? +(totalGain / (totalValue - totalGain) * 100).toFixed(1) : 0,
    }
  }, [holdings])

  const ytdDividends = transactions.filter(t => t.type === 'Dividend' && t.date.startsWith('2025')).reduce((s, t) => s + t.amount, 0)

  function applyDeal(d: DealResult) {
    setHoldings(prev => {
      const next = prev.map(h => ({ ...h }))
      const cash = next.find(h => h.name === 'Cash')!
      const existing = next.find(h => h.name === d.holdingName)
      const value = d.units * d.pricePerUnit
      if (d.side === 'buy') {
        cash.value -= d.amount; cash.price = cash.value
        if (existing) {
          const newUnits = existing.units + d.units
          const newValue = existing.value + value
          existing.units = newUnits; existing.value = newValue
          existing.gain = newValue - (newUnits * d.pricePerUnit) + existing.gain
        } else {
          next.splice(next.length - 1, 0, {
            name: d.holdingName, units: d.units, price: d.pricePerUnit,
            value, gain: 0, gainPercent: 0, allocation: 0,
          })
        }
      } else {
        cash.value += d.amount; cash.price = cash.value
        if (existing) {
          existing.units -= d.units
          existing.value -= value
          if (existing.units < 0.0001) {
            return next.filter(h => h.name !== existing.name)
          }
        }
      }
      // Recalc allocations
      const total = next.reduce((s, h) => s + h.value, 0)
      next.forEach(h => { h.allocation = +(h.value / total * 100).toFixed(1) })
      return next
    })
    setTransactions(prev => [{
      date: d.date,
      type: d.side === 'buy' ? 'Buy' : 'Sell',
      amount: d.side === 'buy' ? -d.amount : d.amount,
      description: d.holdingName,
    }, ...prev])
    toast({ title: `${d.side === 'buy' ? 'Bought' : 'Sold'} ${d.holdingName}`, description: `${d.units.toFixed(2)} units · £${d.amount.toLocaleString()}` })
  }

  function addContribution() {
    const amount = Math.min(1000, remainingAllowance)
    if (amount <= 0) { toast({ title: 'Allowance fully used', variant: 'destructive' }); return }
    setYearSubscribed(s => s + amount)
    setHoldings(prev => prev.map(h => h.name === 'Cash' ? { ...h, value: h.value + amount, price: h.value + amount } : h))
    setTransactions(prev => [{ date: new Date().toISOString().slice(0, 10), type: 'Contribution', amount, description: 'Lump sum contribution' }, ...prev])
    toast({ title: 'Contribution added', description: `£${amount.toLocaleString()} subscribed` })
  }

  function handleTransferIn(r: TransferInResult) {
    setHoldings(prev => applyTransferToHoldings(prev, r))
    setTransactions(prev => [{
      date: r.receivedDate,
      type: 'Transfer In',
      amount: r.totalValue,
      description: `${r.cedingProvider} (${r.transferType === 'cash' ? 'cash' : 'in-specie'}) · ${r.trackingRef}`,
    }, ...prev])
    toast({
      title: 'ISA transfer request submitted',
      description: `£${r.totalValue.toLocaleString()} from ${r.cedingProvider} · ${r.trackingRef}. Does not affect this year's allowance.`,
    })
  }

  async function downloadTaxPack() {
    await exportAnnualTaxPack({
      clientName: 'Demo Client', taxYear: '2026/27', band: 'higher',
      giaDisposals: [], giaDividends: 0,
      isaDividends: ytdDividends, isaSubscription: usedAllowance, isaAllowance: annualAllowance,
    })
    toast({ title: 'Tax pack downloaded', description: 'Word document saved' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-muted via-background to-secondary-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <BackButton label="Back to Dashboard" />

        <div className="mt-6 mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Stocks &amp; Shares ISA</h1>
              <p className="text-muted-foreground">Tax-free investment account · {currentYearData.year}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setTransferOpen(true)}>
              <ArrowDownToLine className="w-4 h-4 mr-2" />Transfer in
            </Button>
            <Button variant="outline" size="sm" onClick={addContribution}><Plus className="w-4 h-4 mr-2" />Contribute</Button>
            <Button variant="outline" size="sm" onClick={downloadTaxPack}><FileDown className="w-4 h-4 mr-2" />Tax pack</Button>
            <Button size="sm" onClick={() => setDealOpen(true)}>Deal</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Value</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">£{totals.totalValue.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-sm text-success">
                <TrendingUp className="w-3 h-3" />+£{totals.totalGain.toLocaleString()} ({totals.totalGainPercent}%)
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Cash Balance</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">£{totals.cashBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Available to invest</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Dividends (YTD)</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">£{ytdDividends.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">Tax-free income</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">ISA Allowance</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">£{remainingAllowance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Remaining this year</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">ISA Allowance Usage</CardTitle>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {taxYearHistory.map(y => <SelectItem key={y.year} value={y.year}>{y.year}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={allowancePercentage} className="h-3 mb-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>£{usedAllowance.toLocaleString()} subscribed ({allowancePercentage.toFixed(0)}%)</span>
              <span>£{remainingAllowance.toLocaleString()} remaining</span>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Subscription History</CardTitle>
            </div>
            <CardDescription>Total subscribed across all years: £{totalSubscribed.toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tax Year</TableHead>
                  <TableHead className="text-right">Allowance</TableHead>
                  <TableHead className="text-right">Subscribed</TableHead>
                  <TableHead className="text-right">Unused</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxYearHistory.map(year => (
                  <TableRow key={year.year} className={year.year === selectedYear ? 'bg-primary/5' : ''}>
                    <TableCell className="font-medium">{year.year}</TableCell>
                    <TableCell className="text-right">£{year.allowance.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">£{year.subscribed.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-muted-foreground">£{(year.allowance - year.subscribed).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {year.status === 'current' ? (
                        <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" /> In Progress</Badge>
                      ) : year.subscribed === year.allowance ? (
                        <Badge className="gap-1 bg-success/10 text-success border-success/20"><CheckCircle className="w-3 h-3" /> Maxed</Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1"><CheckCircle className="w-3 h-3" /> Closed</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Holdings</CardTitle>
              <Button size="sm" onClick={() => setDealOpen(true)}><Plus className="w-4 h-4 mr-2" />Buy / Sell</Button>
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
                  {holdings.map((h, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{h.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-right">{h.units.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">£{Math.round(h.value).toLocaleString()}</TableCell>
                      <TableCell className="hidden sm:table-cell text-right">
                        <span className={h.gain >= 0 ? 'text-success' : 'text-destructive'}>
                          {h.gain >= 0 ? '+' : ''}£{Math.round(h.gain).toLocaleString()} ({h.gainPercent}%)
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-right">{h.allocation}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 10).map((tx, i) => (
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

      <BuySellDialog
        open={dealOpen}
        onOpenChange={setDealOpen}
        wrapper="ISA"
        cashAvailable={totals.cashBalance}
        holdings={holdings}
        onConfirm={applyDeal}
        allowanceRemaining={remainingAllowance}
      />
      <TransferInDialog open={transferOpen} onOpenChange={setTransferOpen} wrapper="ISA" onConfirm={handleTransferIn} />
    </div>
  )
}
