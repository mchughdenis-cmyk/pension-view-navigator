import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FUND_UNIVERSE } from '@/data/fundUniverse'

export interface Holding {
  name: string
  units: number
  price: number
  value: number
  gain: number
  gainPercent: number
  allocation: number
  cost?: number // average cost (s104 pool)
}

export interface DealResult {
  side: 'buy' | 'sell'
  holdingName: string
  units: number
  pricePerUnit: number
  amount: number
  date: string
}

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  wrapper: 'ISA' | 'GIA'
  cashAvailable: number
  holdings: Holding[]
  onConfirm: (deal: DealResult) => void
  /** Optional remaining allowance for ISA (£). Used to block over-subscription. */
  allowanceRemaining?: number
}

export default function BuySellDialog({
  open, onOpenChange, wrapper, cashAvailable, holdings, onConfirm, allowanceRemaining,
}: Props) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [fundName, setFundName] = useState<string>('')
  const [amount, setAmount] = useState<string>('1000')
  const [units, setUnits] = useState<string>('')
  const [mode, setMode] = useState<'amount' | 'units'>('amount')

  // Fund picker source: buy = full universe + existing holdings; sell = existing holdings only
  const fundOptions = side === 'buy'
    ? Array.from(new Set([...holdings.filter(h => h.name !== 'Cash').map(h => h.name), ...FUND_UNIVERSE.map(f => f.name)]))
    : holdings.filter(h => h.name !== 'Cash').map(h => h.name)

  useEffect(() => {
    if (!fundName && fundOptions.length) setFundName(fundOptions[0])
  }, [side, open]) // eslint-disable-line

  const existing = holdings.find(h => h.name === fundName)
  // For buys, use existing market price if held, else a synthetic price from FUND_UNIVERSE position
  const pricePerUnit = existing?.price ?? 50 + (FUND_UNIVERSE.findIndex(f => f.name === fundName) % 10) * 7.5

  const amountNum = parseFloat(amount) || 0
  const unitsNum = parseFloat(units) || 0
  const dealUnits = mode === 'units' ? unitsNum : amountNum / pricePerUnit
  const dealAmount = mode === 'amount' ? amountNum : unitsNum * pricePerUnit

  let error: string | null = null
  if (side === 'buy') {
    if (dealAmount > cashAvailable) error = `Insufficient cash (£${cashAvailable.toLocaleString()} available)`
    if (wrapper === 'ISA' && allowanceRemaining !== undefined && dealAmount > allowanceRemaining) {
      error = `Exceeds remaining ISA allowance (£${allowanceRemaining.toLocaleString()})`
    }
  } else {
    if (!existing) error = 'Select a holding to sell'
    else if (dealUnits > existing.units) error = `Only ${existing.units.toFixed(2)} units held`
  }

  const handleConfirm = () => {
    if (error || !fundName || dealUnits <= 0) return
    onConfirm({
      side,
      holdingName: fundName,
      units: +dealUnits.toFixed(4),
      pricePerUnit: +pricePerUnit.toFixed(2),
      amount: +dealAmount.toFixed(2),
      date: new Date().toISOString().slice(0, 10),
    })
    onOpenChange(false)
    setAmount('1000'); setUnits('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Deal — {wrapper}</DialogTitle>
          <DialogDescription>
            Cash available: £{cashAvailable.toLocaleString()}
            {wrapper === 'ISA' && allowanceRemaining !== undefined && (
              <> · Allowance left: £{allowanceRemaining.toLocaleString()}</>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={side} onValueChange={(v) => setSide(v as 'buy' | 'sell')}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>

          <TabsContent value={side} className="space-y-4 pt-4">
            <div>
              <Label>Fund</Label>
              <Select value={fundName} onValueChange={setFundName}>
                <SelectTrigger><SelectValue placeholder="Choose fund" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {fundOptions.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              {existing && (
                <p className="text-xs text-muted-foreground mt-1">
                  Held: {existing.units.toFixed(2)} units · £{existing.value.toLocaleString()} · price £{existing.price.toFixed(2)}
                </p>
              )}
            </div>

            <Tabs value={mode} onValueChange={(v) => setMode(v as 'amount' | 'units')}>
              <TabsList className="grid grid-cols-2 w-full h-9">
                <TabsTrigger value="amount">£ amount</TabsTrigger>
                <TabsTrigger value="units">Units</TabsTrigger>
              </TabsList>
              <TabsContent value="amount" className="pt-3">
                <Label>Amount (£)</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </TabsContent>
              <TabsContent value="units" className="pt-3">
                <Label>Units</Label>
                <Input type="number" value={units} onChange={(e) => setUnits(e.target.value)} />
              </TabsContent>
            </Tabs>

            <div className="rounded-lg border p-3 bg-muted/30 text-sm space-y-1">
              <div className="flex justify-between"><span>Price per unit</span><span>£{pricePerUnit.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Units</span><span>{dealUnits.toFixed(4)}</span></div>
              <div className="flex justify-between font-semibold"><span>{side === 'buy' ? 'Cost' : 'Proceeds'}</span><span>£{dealAmount.toFixed(2)}</span></div>
            </div>

            {error && <Badge variant="destructive" className="w-full justify-center py-2">{error}</Badge>}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!!error || dealUnits <= 0}>
            Confirm {side}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
