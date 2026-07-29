import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRightLeft, Info } from 'lucide-react'
import type { Holding } from './BuySellDialog'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  giaHoldings: Holding[]
  isaAllowanceRemaining: number
  /** Called with the sell-then-buy instructions to execute on each wrapper. */
  onConfirm: (plan: {
    fundName: string
    units: number
    pricePerUnit: number
    proceeds: number
    isaSubscription: number
  }) => void
}

export default function BedAndISADialog({
  open, onOpenChange, giaHoldings, isaAllowanceRemaining, onConfirm,
}: Props) {
  const sellable = giaHoldings.filter(h => h.name !== 'Cash')
  const [fundName, setFundName] = useState(sellable[0]?.name ?? '')
  const [amount, setAmount] = useState('5000')

  const holding = sellable.find(h => h.name === fundName)
  const amountNum = parseFloat(amount) || 0
  const units = holding ? amountNum / holding.price : 0
  const proceeds = amountNum
  const isaSubscription = Math.min(proceeds, isaAllowanceRemaining)

  let error: string | null = null
  if (!holding) error = 'Select a GIA holding'
  else if (units > holding.units) error = `Only £${(holding.units * holding.price).toLocaleString()} available in this holding`
  else if (isaAllowanceRemaining <= 0) error = 'No ISA allowance remaining'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ArrowRightLeft className="w-5 h-5" /> Bed &amp; ISA</DialogTitle>
          <DialogDescription>
            Sell from your GIA and immediately re-buy the same fund inside your ISA, using your remaining 2026/27 allowance.
            This crystallises any CGT but shelters the holding from future tax.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>GIA holding to move</Label>
            <Select value={fundName} onValueChange={setFundName}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {sellable.map(h => (
                  <SelectItem key={h.name} value={h.name}>
                    {h.name} — £{h.value.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Amount to transfer (£)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <p className="text-xs text-muted-foreground mt-1">
              ISA allowance remaining: £{isaAllowanceRemaining.toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg border p-3 bg-muted/30 text-sm space-y-1">
            <div className="flex justify-between"><span>Sell from GIA</span><span>£{proceeds.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Units</span><span>{units.toFixed(4)}</span></div>
            <div className="flex justify-between"><span>Subscribe to ISA</span><span>£{isaSubscription.toLocaleString()}</span></div>
            {proceeds > isaSubscription && (
              <div className="flex justify-between text-warning"><span>Excess held as GIA cash</span><span>£{(proceeds - isaSubscription).toLocaleString()}</span></div>
            )}
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              The 30-day bed-and-breakfast rule does not apply when re-purchasing inside an ISA wrapper — the disposal is treated
              against the s104 pool. Any realised gain counts toward your £3,000 CGT annual exempt amount.
            </AlertDescription>
          </Alert>

          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!!error}
            onClick={() => {
              if (error || !holding) return
              onConfirm({
                fundName,
                units: +units.toFixed(4),
                pricePerUnit: holding.price,
                proceeds,
                isaSubscription,
              })
              onOpenChange(false)
            }}
          >
            Execute Bed &amp; ISA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
