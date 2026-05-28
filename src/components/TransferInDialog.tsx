import { useState } from 'react'
import { z } from 'zod'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowDownToLine, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Holding } from './BuySellDialog'

export interface TransferInLine {
  fundName: string
  units: number
  estimatedValue: number
}

export interface TransferInResult {
  wrapper: 'ISA' | 'GIA'
  cedingProvider: string
  cedingAccountRef: string
  transferType: 'cash' | 'in-specie'
  cashAmount: number
  lines: TransferInLine[]
  totalValue: number
  notes: string
  trackingRef: string
  receivedDate: string
}

const UK_PROVIDERS = [
  'Hargreaves Lansdown', 'AJ Bell', 'Interactive Investor', 'Fidelity',
  'Vanguard UK', 'Charles Stanley Direct', 'Aviva', 'Aegon',
  'Standard Life', 'Quilter', 'Nucleus', 'Transact', 'Other',
]

const schema = z.object({
  cedingProvider: z.string().trim().min(2).max(80),
  cedingAccountRef: z.string().trim().min(2).max(40),
  cashAmount: z.number().min(0).max(10_000_000),
  notes: z.string().max(500),
})

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  wrapper: 'ISA' | 'GIA'
  onConfirm: (r: TransferInResult) => void
}

function makeRef(wrapper: string) {
  return `TI-${wrapper}-${Date.now().toString(36).toUpperCase()}`
}

export default function TransferInDialog({ open, onOpenChange, wrapper, onConfirm }: Props) {
  const { toast } = useToast()
  const [cedingProvider, setCedingProvider] = useState('Hargreaves Lansdown')
  const [otherProvider, setOtherProvider] = useState('')
  const [cedingAccountRef, setCedingAccountRef] = useState('')
  const [transferType, setTransferType] = useState<'cash' | 'in-specie'>('cash')
  const [cashAmount, setCashAmount] = useState(10000)
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<TransferInLine[]>([
    { fundName: '', units: 0, estimatedValue: 0 },
  ])

  function updateLine(i: number, patch: Partial<TransferInLine>) {
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, ...patch } : l))
  }
  function addLine() { setLines(prev => [...prev, { fundName: '', units: 0, estimatedValue: 0 }]) }
  function removeLine(i: number) { setLines(prev => prev.filter((_, idx) => idx !== i)) }

  const inSpecieTotal = lines.reduce((s, l) => s + (l.estimatedValue || 0), 0)
  const totalValue = transferType === 'cash' ? cashAmount : cashAmount + inSpecieTotal

  function submit() {
    const provider = cedingProvider === 'Other' ? otherProvider : cedingProvider
    const parsed = schema.safeParse({ cedingProvider: provider, cedingAccountRef, cashAmount, notes })
    if (!parsed.success) {
      toast({ title: 'Check details', description: parsed.error.issues[0].message, variant: 'destructive' })
      return
    }
    if (transferType === 'in-specie') {
      const valid = lines.filter(l => l.fundName.trim() && l.units > 0 && l.estimatedValue > 0)
      if (valid.length === 0) {
        toast({ title: 'Add at least one holding', variant: 'destructive' })
        return
      }
    }
    const result: TransferInResult = {
      wrapper,
      cedingProvider: provider,
      cedingAccountRef,
      transferType,
      cashAmount,
      lines: transferType === 'in-specie' ? lines.filter(l => l.fundName && l.units > 0) : [],
      totalValue,
      notes,
      trackingRef: makeRef(wrapper),
      receivedDate: new Date().toISOString().slice(0, 10),
    }
    onConfirm(result)
    onOpenChange(false)
    // Reset
    setCedingAccountRef(''); setNotes(''); setCashAmount(10000)
    setLines([{ fundName: '', units: 0, estimatedValue: 0 }])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-primary" />
            Transfer In · {wrapper}
          </DialogTitle>
          <DialogDescription>
            Request a transfer from an external provider. Cash or in-specie (re-registration of holdings).
          </DialogDescription>
        </DialogHeader>

        {wrapper === 'ISA' && (
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              ISA transfers preserve tax-wrapper status and do <strong>not</strong> count against this year&apos;s £20,000 subscription allowance.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Ceding provider</Label>
              <Select value={cedingProvider} onValueChange={setCedingProvider}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UK_PROVIDERS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              {cedingProvider === 'Other' && (
                <Input className="mt-2" placeholder="Provider name" value={otherProvider} onChange={e => setOtherProvider(e.target.value)} />
              )}
            </div>
            <div>
              <Label>Ceding account reference</Label>
              <Input value={cedingAccountRef} onChange={e => setCedingAccountRef(e.target.value)} placeholder="e.g. HL-1234567" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Transfer type</Label>
              <Select value={transferType} onValueChange={v => setTransferType(v as 'cash' | 'in-specie')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash transfer</SelectItem>
                  <SelectItem value="in-specie">In-specie (re-registration)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{transferType === 'cash' ? 'Cash amount (£)' : 'Residual cash (£)'}</Label>
              <Input type="number" min={0} step={100} value={cashAmount}
                onChange={e => setCashAmount(parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          {transferType === 'in-specie' && (
            <div className="border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Holdings to re-register</Label>
                <Button type="button" size="sm" variant="outline" onClick={addLine}>Add holding</Button>
              </div>
              {lines.map((l, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-6">
                    <Label className="text-xs">Fund name</Label>
                    <Input value={l.fundName} onChange={e => updateLine(i, { fundName: e.target.value })} placeholder="e.g. Fundsmith Equity" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Units</Label>
                    <Input type="number" min={0} step={0.01} value={l.units}
                      onChange={e => updateLine(i, { units: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs">Est. value £</Label>
                    <Input type="number" min={0} step={1} value={l.estimatedValue}
                      onChange={e => updateLine(i, { estimatedValue: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="col-span-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeLine(i)}>×</Button>
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">In-specie subtotal: £{inSpecieTotal.toLocaleString()}</p>
            </div>
          )}

          <div>
            <Label>Notes (optional)</Label>
            <Textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} maxLength={500}
              placeholder="Any special instructions for the ceding provider" />
          </div>

          <div className="bg-muted/40 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total transfer value</p>
              <p className="text-xl font-bold">£{totalValue.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Indicative settlement</p>
              <p className="text-sm font-medium">{transferType === 'cash' ? '5–10 working days' : '4–8 weeks (in-specie)'}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Submit transfer request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function applyTransferToHoldings(holdings: Holding[], result: TransferInResult): Holding[] {
  const next = holdings.map(h => ({ ...h }))
  const cash = next.find(h => h.name === 'Cash')
  const totalCash = result.cashAmount
  if (cash) { cash.value += totalCash; cash.price = cash.value }
  else next.push({ name: 'Cash', units: 1, price: totalCash, value: totalCash, gain: 0, gainPercent: 0, allocation: 0 })

  for (const line of result.lines) {
    const price = line.units > 0 ? line.estimatedValue / line.units : 0
    const existing = next.find(h => h.name === line.fundName)
    if (existing) {
      existing.units += line.units
      existing.value += line.estimatedValue
    } else {
      const insertAt = next.findIndex(h => h.name === 'Cash')
      const newHolding: Holding = {
        name: line.fundName, units: line.units, price,
        value: line.estimatedValue, gain: 0, gainPercent: 0, allocation: 0,
      }
      if (insertAt >= 0) next.splice(insertAt, 0, newHolding)
      else next.push(newHolding)
    }
  }
  const total = next.reduce((s, h) => s + h.value, 0)
  next.forEach(h => { h.allocation = total ? +(h.value / total * 100).toFixed(1) : 0 })
  return next
}
