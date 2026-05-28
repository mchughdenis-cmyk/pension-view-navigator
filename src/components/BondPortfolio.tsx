import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/ui/back-button'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Globe2, Landmark, TrendingUp, ArrowUpFromLine, AlertCircle, FileDown,
  Calculator, Layers,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import BondWithdrawalDialog from './BondWithdrawalDialog'
import {
  applyWithdrawal, cumulativeFivePercentAllowance, policyYearsHeld,
  type BondPolicy, type ChargeableEvent, type BondType,
} from '@/lib/bonds'

interface Props { bondType: BondType }

const SEED: Record<BondType, BondPolicy[]> = {
  onshore: [
    {
      id: 'pru-1', name: 'Prudential Investment Bond', type: 'onshore', provider: 'Prudential',
      startDate: '2019-04-12', segments: 100, premium: 100000, currentValue: 137500,
      cumulativeWithdrawals: 12000,
    },
    {
      id: 'aviva-1', name: 'Aviva Investment Plan', type: 'onshore', provider: 'Aviva',
      startDate: '2021-09-01', segments: 50, premium: 50000, currentValue: 61200,
      cumulativeWithdrawals: 0,
    },
  ],
  offshore: [
    {
      id: 'utm-1', name: 'Utmost International Portfolio Bond', type: 'offshore', provider: 'Utmost (Isle of Man)',
      startDate: '2017-06-15', segments: 200, premium: 250000, currentValue: 348500,
      cumulativeWithdrawals: 45000,
    },
    {
      id: 'rl360-1', name: 'RL360 Quantum', type: 'offshore', provider: 'RL360 (Isle of Man)',
      startDate: '2020-01-20', segments: 100, premium: 75000, currentValue: 92800,
      cumulativeWithdrawals: 6000,
    },
  ],
}

export default function BondPortfolio({ bondType }: Props) {
  const { toast } = useToast()
  const [policies, setPolicies] = useState<BondPolicy[]>(SEED[bondType])
  const [events, setEvents] = useState<(ChargeableEvent & { bondName: string; bondId: string })[]>([])
  const [activeBondId, setActiveBondId] = useState<string | null>(null)

  const isOffshore = bondType === 'offshore'
  const Icon = isOffshore ? Globe2 : Landmark
  const title = isOffshore ? 'Offshore Investment Bonds' : 'Onshore Investment Bonds'
  const blurb = isOffshore
    ? 'Non-UK life-office bonds — gross roll-up, no internal UK tax. Gains taxed as savings income on encashment with no basic-rate credit.'
    : 'UK life-office bonds — insurer pays internal corporation tax. Gains carry a 20% basic-rate tax credit on chargeable events.'

  const activeBond = policies.find(p => p.id === activeBondId) ?? null

  const totals = useMemo(() => {
    const value = policies.reduce((s, p) => s + p.currentValue, 0)
    const premiums = policies.reduce((s, p) => s + p.premium, 0)
    const withdrawn = policies.reduce((s, p) => s + p.cumulativeWithdrawals, 0)
    const gain = value + withdrawn - premiums
    const taxYearGain = events
      .filter(e => e.date >= '2024-04-06' && e.date <= '2025-04-05')
      .reduce((s, e) => s + e.chargeableGain, 0)
    const taxYearTax = events
      .filter(e => e.date >= '2024-04-06' && e.date <= '2025-04-05')
      .reduce((s, e) => s + e.netTaxDue, 0)
    return { value, premiums, withdrawn, gain, taxYearGain, taxYearTax }
  }, [policies, events])

  function handleEvent(event: ChargeableEvent) {
    if (!activeBond) return
    setPolicies(prev => prev.map(p =>
      p.id === activeBond.id
        ? (event.kind === 'full-surrender'
            ? { ...p, currentValue: 0, cumulativeWithdrawals: p.cumulativeWithdrawals + event.withdrawal }
            : applyWithdrawal(p, event.withdrawal))
        : p,
    ))
    setEvents(prev => [{ ...event, bondName: activeBond.name, bondId: activeBond.id }, ...prev])
    toast({
      title: `${event.kind === 'full-surrender' ? 'Full surrender' : 'Part surrender'} processed`,
      description: `Chargeable gain £${event.chargeableGain.toFixed(2)} · net tax £${event.netTaxDue.toFixed(2)}`,
    })
  }

  async function downloadCertificate() {
    if (events.length === 0) {
      toast({ title: 'No chargeable events', description: 'Process a withdrawal first.', variant: 'destructive' })
      return
    }
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, AlignmentType } = await import('docx')
    const { saveAs } = await import('file-saver')
    const border = { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }
    const borders = { top: border, bottom: border, left: border, right: border }
    const cell = (t: string, opts: { bold?: boolean; shade?: string; align?: 'left' | 'right' } = {}) =>
      new TableCell({
        borders, width: { size: 1872, type: WidthType.DXA },
        shading: opts.shade ? { fill: opts.shade, type: ShadingType.CLEAR, color: 'auto' } : undefined,
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ alignment: opts.align === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT, children: [new TextRun({ text: t, bold: opts.bold })] })],
      })
    const headerRow = new TableRow({ tableHeader: true, children: ['Date','Bond','Kind','Withdrawal','Gain','Net Tax']
      .map(h => cell(h, { bold: true, shade: 'E8EEF5' })) })
    const rows = events.map(e => new TableRow({ children: [
      cell(e.date), cell(e.bondName), cell(e.kind),
      cell('£' + e.withdrawal.toFixed(2), { align: 'right' }),
      cell('£' + e.chargeableGain.toFixed(2), { align: 'right', bold: true }),
      cell('£' + e.netTaxDue.toFixed(2), { align: 'right' }),
    ]}))
    const doc = new Document({
      creator: 'Pension Navigator by Airgead',
      styles: { default: { document: { run: { font: 'Arial', size: 22 } } } },
      sections: [{
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
        children: [
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(`Chargeable Event Certificate — ${title}`)] }),
          new Paragraph({ children: [new TextRun({ text: 'Issued for inclusion in HMRC Self Assessment (SA101 — Additional Information).', italics: true })] }),
          new Paragraph({ children: [new TextRun('')] }),
          new Table({ width: { size: 11232, type: WidthType.DXA }, columnWidths: [1872,1872,1872,1872,1872,1872], rows: [headerRow, ...rows] }),
        ],
      }],
    })
    const blob = await Packer.toBlob(doc)
    saveAs(blob, `chargeable-event-cert-${bondType}-${new Date().toISOString().slice(0,10)}.docx`)
    toast({ title: 'Certificate downloaded' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-muted via-background to-secondary-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <BackButton label="Back to Dashboard" />

        <div className="mt-6 mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Icon className="w-6 h-6 text-primary" /></div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
              <p className="text-muted-foreground max-w-2xl">{blurb}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={downloadCertificate}>
            <FileDown className="w-4 h-4 mr-2" />Chargeable event certificate
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Value</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">£{totals.value.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-sm text-success">
                <TrendingUp className="w-3 h-3" />+£{totals.gain.toLocaleString()} lifetime
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Premium</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">£{totals.premiums.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across {policies.length} {policies.length === 1 ? 'policy' : 'policies'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Withdrawn to date</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">£{totals.withdrawn.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">5%-deferred + chargeable</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">2024/25 Tax Due</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totals.taxYearTax > 0 ? 'text-destructive' : 'text-foreground'}`}>
                £{totals.taxYearTax.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">On £{totals.taxYearGain.toFixed(0)} of gains</p>
            </CardContent>
          </Card>
        </div>

        {/* Per-policy cards with 5% allowance tracking */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {policies.map(p => {
            const years = Math.max(1, policyYearsHeld(p.startDate))
            const pool = cumulativeFivePercentAllowance(p.premium, years)
            const used = Math.min(p.cumulativeWithdrawals, pool)
            const pct = pool > 0 ? (used / pool) * 100 : 0
            const exceeded = p.cumulativeWithdrawals > pool
            return (
              <Card key={p.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <CardDescription>{p.provider} · {p.segments} segments · started {p.startDate}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="capitalize">{p.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-muted-foreground">Premium</p><p className="font-semibold">£{p.premium.toLocaleString()}</p></div>
                    <div><p className="text-muted-foreground">Current value</p><p className="font-semibold text-primary">£{p.currentValue.toLocaleString()}</p></div>
                    <div><p className="text-muted-foreground">Withdrawn</p><p className="font-semibold">£{p.cumulativeWithdrawals.toLocaleString()}</p></div>
                    <div><p className="text-muted-foreground">Years held</p><p className="font-semibold">{years}</p></div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground flex items-center gap-1"><Layers className="w-3 h-3" />5% allowance pool</span>
                      <span className={exceeded ? 'text-destructive font-medium' : ''}>
                        £{used.toLocaleString()} of £{pool.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={Math.min(100, pct)} className="h-2" />
                    {exceeded && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Excess withdrawals have triggered chargeable events
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => setActiveBondId(p.id)}>
                      <ArrowUpFromLine className="w-4 h-4 mr-2" />Withdraw
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setActiveBondId(p.id)}>
                      <Calculator className="w-4 h-4 mr-2" />Model chargeable event
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Chargeable event log */}
        <Card>
          <CardHeader>
            <CardTitle>Chargeable Event Log</CardTitle>
            <CardDescription>Withdrawals above the 5% pool and full surrenders are reported to HMRC.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {events.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No chargeable events recorded. Use the Withdraw button to model one.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Bond</TableHead>
                    <TableHead>Kind</TableHead>
                    <TableHead className="text-right">Withdrawal</TableHead>
                    <TableHead className="text-right">Chargeable gain</TableHead>
                    <TableHead className="text-right">Sliced/yr</TableHead>
                    <TableHead className="text-right">Net tax</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((e, i) => (
                    <TableRow key={i}>
                      <TableCell>{e.date}</TableCell>
                      <TableCell className="font-medium">{e.bondName}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{e.kind.replace('-', ' ')}</Badge></TableCell>
                      <TableCell className="text-right">£{e.withdrawal.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">£{e.chargeableGain.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">£{e.slicedGain.toFixed(2)} × {e.policyYears}y</TableCell>
                      <TableCell className={`text-right font-semibold ${e.netTaxDue > 0 ? 'text-destructive' : 'text-success'}`}>
                        £{e.netTaxDue.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {activeBond && (
        <BondWithdrawalDialog
          open={!!activeBondId}
          onOpenChange={(o) => !o && setActiveBondId(null)}
          bond={activeBond}
          onConfirm={handleEvent}
        />
      )}
    </div>
  )
}
