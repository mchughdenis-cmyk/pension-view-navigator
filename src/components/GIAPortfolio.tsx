import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/ui/back-button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  TrendingUp, Landmark, Plus, PiggyBank, BarChart3, AlertCircle,
  FileDown, ArrowRightLeft, Calculator, ArrowDownToLine,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import BuySellDialog, { type Holding, type DealResult } from './BuySellDialog'
import BedAndISADialog from './BedAndISADialog'
import TransferInDialog, { applyTransferToHoldings, type TransferInResult } from './TransferInDialog'
import { matchDisposal, estimateCgt, addToPool, type Disposal, type S104Pool, CGT_ALLOWANCE_2024_25 } from '@/lib/cgt'
import { estimateDividendTax } from '@/lib/dividendTax'
import { exportAnnualTaxPack } from '@/lib/taxPackExport'

interface Tx { date: string; type: string; amount: number; description: string }

export default function GIAPortfolio() {
  const { toast } = useToast()
  const [dealOpen, setDealOpen] = useState(false)
  const [bedIsaOpen, setBedIsaOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)

  const [holdings, setHoldings] = useState<Holding[]>([
    { name: 'Fundsmith Equity', units: 320, price: 165.50, value: 52960, gain: 7200, gainPercent: 15.7, allocation: 36.5 },
    { name: 'Vanguard US Equity Index', units: 150, price: 185.40, value: 27810, gain: 3950, gainPercent: 16.6, allocation: 19.1 },
    { name: 'iShares Core MSCI World UCITS', units: 195, price: 148.20, value: 28899, gain: 2100, gainPercent: 7.8, allocation: 19.9 },
    { name: 'iShares MSCI World SRI UCITS', units: 400, price: 47.18, value: 18872, gain: 2100, gainPercent: 12.5, allocation: 13.0 },
    { name: 'Cash', units: 1, price: 5400, value: 5400, gain: 0, gainPercent: 0, allocation: 3.7 },
  ])

  // Seed s104 pools (cost basis = value - gain)
  const [pools, setPools] = useState<Record<string, S104Pool>>(() => {
    const map: Record<string, S104Pool> = {}
    holdings.filter(h => h.name !== 'Cash').forEach(h => {
      map[h.name] = { units: h.units, cost: h.value - h.gain }
    })
    return map
  })

  const [disposals, setDisposals] = useState<Disposal[]>([
    {
      id: 'seed-1', holdingName: 'iShares Core MSCI World UCITS', date: '2025-01-10',
      units: 21.59, proceeds: 3200, costAllocated: 0, gain: 3200, matchedAgainst: ['s104'],
    },
  ])

  const [transactions, setTransactions] = useState<Tx[]>([
    { date: '2025-02-05', type: 'Deposit', amount: 5000, description: 'Lump sum investment' },
    { date: '2025-01-20', type: 'Dividend', amount: 320.50, description: 'iShares MSCI World SRI dividend' },
    { date: '2025-01-10', type: 'Sell', amount: 3200, description: 'iShares Core MSCI World UCITS (partial)' },
    { date: '2024-12-15', type: 'Buy', amount: -4000, description: 'Fundsmith Equity' },
    { date: '2024-12-01', type: 'Deposit', amount: 2000, description: 'Monthly contribution' },
  ])

  const totals = useMemo(() => {
    const totalValue = holdings.reduce((s, h) => s + h.value, 0)
    const totalGain = holdings.reduce((s, h) => s + h.gain, 0)
    return { totalValue, totalGain, cashBalance: holdings.find(h => h.name === 'Cash')?.value ?? 0 }
  }, [holdings])

  const dividendsYtd = transactions.filter(t => t.type === 'Dividend' && t.date.startsWith('2025')).reduce((s, t) => s + t.amount, 0)
  const cgtSummary = useMemo(() => estimateCgt(disposals, 'higher'), [disposals])
  const dividendTax = useMemo(() => estimateDividendTax(dividendsYtd, 'higher'), [dividendsYtd])
  const cgtExceeded = cgtSummary.netGain > CGT_ALLOWANCE_2024_25

  function applyDeal(d: DealResult) {
    setHoldings(prev => {
      const next = prev.map(h => ({ ...h }))
      const cash = next.find(h => h.name === 'Cash')!
      const existing = next.find(h => h.name === d.holdingName)
      const value = d.units * d.pricePerUnit
      if (d.side === 'buy') {
        cash.value -= d.amount; cash.price = cash.value
        if (existing) { existing.units += d.units; existing.value += value }
        else next.splice(next.length - 1, 0, {
          name: d.holdingName, units: d.units, price: d.pricePerUnit,
          value, gain: 0, gainPercent: 0, allocation: 0,
        })
      } else {
        cash.value += d.amount; cash.price = cash.value
        if (existing) {
          existing.units -= d.units; existing.value -= value
          if (existing.units < 0.0001) return next.filter(h => h.name !== existing.name)
        }
      }
      const total = next.reduce((s, h) => s + h.value, 0)
      next.forEach(h => { h.allocation = +(h.value / total * 100).toFixed(1) })
      return next
    })

    // Maintain s104 pool + record disposal
    setPools(prev => {
      const next = { ...prev }
      const pool = next[d.holdingName] ?? { units: 0, cost: 0 }
      if (d.side === 'buy') {
        next[d.holdingName] = addToPool(pool, d.units, d.amount)
      } else {
        const result = matchDisposal({
          disposalDate: d.date, disposalUnits: d.units, disposalProceeds: d.amount,
          pool, sameDayAcquisitions: [], next30DayAcquisitions: [],
        })
        next[d.holdingName] = result.updatedPool
        setDisposals(prev2 => [{
          id: `d-${Date.now()}`, holdingName: d.holdingName, date: d.date,
          units: d.units, proceeds: d.amount, costAllocated: result.costAllocated,
          gain: d.amount - result.costAllocated, matchedAgainst: result.matched,
        }, ...prev2])
      }
      return next
    })

    setTransactions(prev => [{
      date: d.date, type: d.side === 'buy' ? 'Buy' : 'Sell',
      amount: d.side === 'buy' ? -d.amount : d.amount, description: d.holdingName,
    }, ...prev])
    toast({ title: `${d.side === 'buy' ? 'Bought' : 'Sold'} ${d.holdingName}`, description: `£${d.amount.toLocaleString()}` })
  }

  function executeBedAndIsa(plan: { fundName: string; units: number; pricePerUnit: number; proceeds: number; isaSubscription: number }) {
    applyDeal({ side: 'sell', holdingName: plan.fundName, units: plan.units, pricePerUnit: plan.pricePerUnit, amount: plan.proceeds, date: new Date().toISOString().slice(0, 10) })
    toast({
      title: 'Bed & ISA executed',
      description: `Sold £${plan.proceeds.toLocaleString()} from GIA; £${plan.isaSubscription.toLocaleString()} subscribed to ISA.`,
    })
  }

  async function downloadTaxPack() {
    await exportAnnualTaxPack({
      clientName: 'Demo Client', taxYear: '2024/25', band: 'higher',
      giaDisposals: disposals, giaDividends: dividendsYtd,
      isaDividends: 0, isaSubscription: 12500, isaAllowance: 20000,
    })
    toast({ title: 'Tax pack downloaded' })
  }

  function handleTransferIn(r: TransferInResult) {
    setHoldings(prev => applyTransferToHoldings(prev, r))
    // Seed s104 pools with in-specie holdings using estimated value as base cost
    setPools(prev => {
      const next = { ...prev }
      for (const line of r.lines) {
        const existing = next[line.fundName] ?? { units: 0, cost: 0 }
        next[line.fundName] = addToPool(existing, line.units, line.estimatedValue)
      }
      return next
    })
    setTransactions(prev => [{
      date: r.receivedDate,
      type: 'Transfer In',
      amount: r.totalValue,
      description: `${r.cedingProvider} (${r.transferType === 'cash' ? 'cash' : 'in-specie'}) · ${r.trackingRef}`,
    }, ...prev])
    toast({
      title: 'GIA transfer request submitted',
      description: `£${r.totalValue.toLocaleString()} from ${r.cedingProvider} · ${r.trackingRef}. In-specie cost basis carried over.`,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-muted via-background to-secondary-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <BackButton label="Back to Dashboard" />

        <div className="mt-6 mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/50"><Landmark className="w-6 h-6 text-accent-foreground" /></div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">General Investment Account</h1>
              <p className="text-muted-foreground">Flexible investment account · No contribution limits</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setTransferOpen(true)}>
              <ArrowDownToLine className="w-4 h-4 mr-2" />Transfer in
            </Button>
            <Button variant="outline" size="sm" onClick={() => setBedIsaOpen(true)}>
              <ArrowRightLeft className="w-4 h-4 mr-2" />Bed &amp; ISA
            </Button>
            <Button variant="outline" size="sm" onClick={downloadTaxPack}><FileDown className="w-4 h-4 mr-2" />Tax pack</Button>
            <Button size="sm" onClick={() => setDealOpen(true)}>Deal</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Value</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">£{Math.round(totals.totalValue).toLocaleString()}</div>
              <div className="flex items-center gap-1 text-sm text-success">
                <TrendingUp className="w-3 h-3" />+£{Math.round(totals.totalGain).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Cash Balance</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">£{Math.round(totals.cashBalance).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Available to invest</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Dividends (YTD)</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">£{dividendsYtd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">Est. tax £{dividendTax.liability.toFixed(0)} @ {(dividendTax.rate * 100).toFixed(2)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">CGT Position</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${cgtExceeded ? 'text-destructive' : 'text-foreground'}`}>
                £{Math.round(cgtSummary.netGain).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {cgtExceeded ? `Exceeds £${CGT_ALLOWANCE_2024_25.toLocaleString()} allowance` : `£${(CGT_ALLOWANCE_2024_25 - cgtSummary.netGain).toLocaleString()} remaining`}
              </p>
            </CardContent>
          </Card>
        </div>

        {cgtExceeded && (
          <Card className="mb-8 border-destructive/50 bg-destructive/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <div>
                <p className="font-medium text-destructive">Capital Gains Tax Allowance Exceeded</p>
                <p className="text-sm text-muted-foreground">
                  Net realised gain of £{Math.round(cgtSummary.netGain).toLocaleString()} exceeds the £{CGT_ALLOWANCE_2024_25.toLocaleString()} annual exempt amount.
                  Estimated CGT liability: £{cgtSummary.liability.toFixed(0)} (at {(cgtSummary.rate * 100).toFixed(0)}% higher rate)
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CGT realised disposals */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              <CardTitle>Realised Disposals (CGT)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {disposals.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No disposals recorded this tax year.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Holding</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                    <TableHead className="text-right">Proceeds</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Gain/Loss</TableHead>
                    <TableHead>Matched</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disposals.map(d => (
                    <TableRow key={d.id}>
                      <TableCell>{d.date}</TableCell>
                      <TableCell className="font-medium">{d.holdingName}</TableCell>
                      <TableCell className="text-right">{d.units.toFixed(2)}</TableCell>
                      <TableCell className="text-right">£{d.proceeds.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">£{d.costAllocated.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className={`text-right font-semibold ${d.gain >= 0 ? 'text-success' : 'text-destructive'}`}>
                        £{d.gain.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {d.matchedAgainst.map(m => <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
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

      <BuySellDialog
        open={dealOpen} onOpenChange={setDealOpen}
        wrapper="GIA" cashAvailable={totals.cashBalance}
        holdings={holdings} onConfirm={applyDeal}
      />
      <BedAndISADialog
        open={bedIsaOpen} onOpenChange={setBedIsaOpen}
        giaHoldings={holdings} isaAllowanceRemaining={7500}
        onConfirm={executeBedAndIsa}
      />
      <TransferInDialog open={transferOpen} onOpenChange={setTransferOpen} wrapper="GIA" onConfirm={handleTransferIn} />
    </div>
  )
}
