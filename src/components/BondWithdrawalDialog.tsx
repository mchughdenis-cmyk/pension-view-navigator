import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, AlertTriangle } from 'lucide-react'
import {
  calculatePartSurrender, calculateFullSurrender, cumulativeFivePercentAllowance,
  policyYearsHeld, type BondPolicy, type ChargeableEvent, type TaxBand,
} from '@/lib/bonds'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  bond: BondPolicy
  onConfirm: (event: ChargeableEvent) => void
}

export default function BondWithdrawalDialog({ open, onOpenChange, bond, onConfirm }: Props) {
  const [mode, setMode] = useState<'part' | 'full'>('part')
  const [amount, setAmount] = useState('5000')
  const [band, setBand] = useState<TaxBand>('higher')

  const years = useMemo(() => Math.max(1, policyYearsHeld(bond.startDate)), [bond.startDate])
  const allowancePool = cumulativeFivePercentAllowance(bond.premium, years)
  const allowanceRemaining = Math.max(0, allowancePool - bond.cumulativeWithdrawals)

  const event: ChargeableEvent = useMemo(() => {
    if (mode === 'full') return calculateFullSurrender({ bond, investorBand: band })
    const w = Math.max(0, parseFloat(amount) || 0)
    return calculatePartSurrender({ bond, withdrawal: w, investorBand: band })
  }, [mode, amount, band, bond])

  const withdrawalAmount = mode === 'full' ? bond.currentValue : (parseFloat(amount) || 0)
  const exceedsValue = withdrawalAmount > bond.currentValue
  const error = exceedsValue ? `Withdrawal exceeds policy value (£${bond.currentValue.toLocaleString()})` : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Withdrawal — {bond.name}</DialogTitle>
          <DialogDescription>
            {bond.type === 'onshore' ? 'Onshore bond — 20% basic-rate tax credit applies.' : 'Offshore bond — gross roll-up; no basic-rate credit.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'part' | 'full')}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="part">Part surrender</TabsTrigger>
            <TabsTrigger value="full">Full surrender</TabsTrigger>
          </TabsList>

          <TabsContent value="part" className="space-y-3 pt-4">
            <div>
              <Label>Amount (£)</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                5% cumulative allowance pool: £{allowancePool.toLocaleString()} ({years} yrs × 5%).
                Already withdrawn: £{bond.cumulativeWithdrawals.toLocaleString()}.
                <strong> Remaining tax-deferred: £{allowanceRemaining.toLocaleString()}.</strong>
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="full" className="space-y-3 pt-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Full surrender closes the policy. Gain = current value (£{bond.currentValue.toLocaleString()})
                plus prior withdrawals (£{bond.cumulativeWithdrawals.toLocaleString()}) minus premium
                (£{bond.premium.toLocaleString()}).
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <div className="space-y-3 pt-2">
          <div>
            <Label>Investor tax band</Label>
            <Select value={band} onValueChange={(v) => setBand(v as TaxBand)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic rate (20%)</SelectItem>
                <SelectItem value="higher">Higher rate (40%)</SelectItem>
                <SelectItem value="additional">Additional rate (45%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border p-3 bg-muted/30 text-sm space-y-1">
            <div className="flex justify-between"><span>Withdrawal</span><span>£{event.withdrawal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
            <div className="flex justify-between text-success"><span>Within 5% allowance (deferred)</span><span>£{event.deferredPortion.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
            <div className="flex justify-between font-medium"><span>Chargeable event gain</span><span>£{event.chargeableGain.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
            <div className="flex justify-between"><span>Top-sliced over</span><span>{event.policyYears} yrs → £{event.slicedGain.toLocaleString(undefined, { maximumFractionDigits: 2 })}/yr</span></div>
            <div className="flex justify-between"><span>Gross tax @ {(100 * (band === 'basic' ? 0.20 : band === 'higher' ? 0.40 : 0.45)).toFixed(0)}%</span><span>£{event.estimatedTax.toFixed(2)}</span></div>
            {bond.type === 'onshore' && (
              <div className="flex justify-between text-success"><span>Less 20% basic-rate credit</span><span>−£{event.basicRateCredit.toFixed(2)}</span></div>
            )}
            <div className="flex justify-between font-semibold pt-1 border-t mt-1">
              <span>Net tax due</span>
              <span className={event.netTaxDue > 0 ? 'text-destructive' : 'text-success'}>£{event.netTaxDue.toFixed(2)}</span>
            </div>
          </div>

          {event.chargeableGain > 0 && (
            <Badge variant="outline" className="w-full justify-center py-2">
              Chargeable event — must be reported on Self Assessment
            </Badge>
          )}
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!!error || event.withdrawal <= 0} onClick={() => { onConfirm(event); onOpenChange(false) }}>
            Confirm withdrawal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
