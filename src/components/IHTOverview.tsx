import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/nav/PageHeader'
import { useRole } from '@/contexts/RoleContext'
import { formatGBP } from '@/lib/pensionCalculations'
import { Plus, Trash2, AlertTriangle, Info, ScrollText, Home, PiggyBank, Briefcase, Building2 } from 'lucide-react'

// IHT 2024/25 → post-April 2027 reform
// From 6 April 2027, most unused pension funds and death benefits will be included
// in the deceased's estate for IHT purposes (HM Treasury, Oct 2024 / consultation 2025).
const NRB = 325_000          // Nil-Rate Band
const RNRB = 175_000         // Residence Nil-Rate Band (when home passes to direct descendants)
const RNRB_TAPER_THRESHOLD = 2_000_000
const IHT_RATE = 0.40
const IHT_RATE_REDUCED = 0.36 // 10%+ to charity
const REFORM_DATE = '6 April 2027'

interface Asset {
  id: string
  label: string
  category: 'sipp' | 'isa' | 'gia' | 'property-main' | 'property-other' | 'cash' | 'business' | 'life-policy-trust' | 'other'
  value: number
}

const CATEGORY_META: Record<Asset['category'], { label: string; icon: typeof Home; ihtPre2027: boolean; note: string }> = {
  sipp: { label: 'SIPP / pension', icon: PiggyBank, ihtPre2027: false, note: 'Outside estate pre-2027; in estate from Apr 2027' },
  isa: { label: 'ISA', icon: Briefcase, ihtPre2027: true, note: 'Always in the estate (AIM ISAs may qualify for BR)' },
  gia: { label: 'General investment account', icon: Briefcase, ihtPre2027: true, note: 'Fully chargeable to IHT' },
  'property-main': { label: 'Main residence', icon: Home, ihtPre2027: true, note: 'May qualify for RNRB if passed to direct descendants' },
  'property-other': { label: 'Other property', icon: Building2, ihtPre2027: true, note: 'No RNRB; full IHT exposure' },
  cash: { label: 'Cash & deposits', icon: PiggyBank, ihtPre2027: true, note: 'Fully chargeable' },
  business: { label: 'Business / AIM (BR)', icon: Briefcase, ihtPre2027: false, note: '100% Business Relief if held 2+ yrs (subject to 2026 reforms capping BR at £1m of combined APR/BR)' },
  'life-policy-trust': { label: 'Life policy in trust', icon: ScrollText, ihtPre2027: false, note: 'Outside the estate when written in trust' },
  other: { label: 'Other assets', icon: Briefcase, ihtPre2027: true, note: 'Treated as fully chargeable' },
}

const seed: Asset[] = [
  { id: '1', label: 'SIPP — Airgead', category: 'sipp', value: 287_450 },
  { id: '2', label: 'Stocks & Shares ISA', category: 'isa', value: 87_650 },
  { id: '3', label: 'GIA', category: 'gia', value: 145_200 },
  { id: '4', label: 'Family home', category: 'property-main', value: 650_000 },
  { id: '5', label: 'Cash savings', category: 'cash', value: 45_000 },
]

export default function IHTOverview() {
  const { role } = useRole()
  const [assets, setAssets] = useState<Asset[]>(seed)
  const [marriedSpouse, setMarriedSpouse] = useState(true)
  const [transferableNRB, setTransferableNRB] = useState(0) // % from late spouse 0-100
  const [passesToDescendants, setPassesToDescendants] = useState(true)
  const [charityPctOfEstate, setCharityPctOfEstate] = useState(0)
  const [sippToSpouse, setSippToSpouse] = useState(false) // spouse exemption on SIPP at first death

  const addAsset = () =>
    setAssets((a) => [...a, { id: crypto.randomUUID(), label: 'New asset', category: 'other', value: 0 }])
  const updateAsset = (id: string, patch: Partial<Asset>) =>
    setAssets((a) => a.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  const removeAsset = (id: string) => setAssets((a) => a.filter((x) => x.id !== id))

  const calc = useMemo(() => {
    const sum = (filter: (a: Asset) => boolean) => assets.filter(filter).reduce((s, a) => s + (a.value || 0), 0)
    const total = sum(() => true)
    const sippTotal = sum((a) => a.category === 'sipp')
    const businessRelief = sum((a) => a.category === 'business')
    const lifeInTrust = sum((a) => a.category === 'life-policy-trust')
    const mainResidence = sum((a) => a.category === 'property-main')

    const grossEstate = total - lifeInTrust // life policies in trust never form part of estate
    const chargeable = (estateForIHT: number) => Math.max(0, estateForIHT - businessRelief)

    // Estate for IHT pre-2027: excludes SIPP
    const estatePre = grossEstate - sippTotal
    // Estate post-2027: includes SIPP
    const estatePost = grossEstate

    const tnrbExtra = (transferableNRB / 100) * NRB
    const baseNRB = NRB + (marriedSpouse ? tnrbExtra : 0)

    const computeRNRB = (estate: number) => {
      if (!passesToDescendants) return 0
      const rnrbCap = Math.min(RNRB, mainResidence)
      if (estate <= RNRB_TAPER_THRESHOLD) return rnrbCap
      const taper = (estate - RNRB_TAPER_THRESHOLD) / 2
      return Math.max(0, rnrbCap - taper)
    }

    const computeIHT = (estateForIHT: number) => {
      const charge = chargeable(estateForIHT)
      const rnrb = computeRNRB(estateForIHT)
      const allowances = baseNRB + rnrb
      const taxable = Math.max(0, charge - allowances)
      const charityAmount = (charityPctOfEstate / 100) * charge
      const charityQualifies = charge > 0 && charityAmount / Math.max(1, charge - allowances) >= 0.10
      const rate = charityQualifies ? IHT_RATE_REDUCED : IHT_RATE
      const taxableAfterCharity = Math.max(0, taxable - charityAmount)
      const iht = taxableAfterCharity * rate
      return { charge, rnrb, allowances, taxable: taxableAfterCharity, rate, iht }
    }

    const pre = computeIHT(estatePre)
    const post = computeIHT(estatePost)
    const delta = post.iht - pre.iht

    return { total, sippTotal, businessRelief, lifeInTrust, mainResidence, grossEstate, estatePre, estatePost, baseNRB, pre, post, delta }
  }, [assets, marriedSpouse, transferableNRB, passesToDescendants, charityPctOfEstate])

  const isAdviser = role !== 'client'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <PageHeader
        title="Inheritance Tax overview"
        description={`Modelling the impact of pension inclusion in the estate from ${REFORM_DATE}`}
      />

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>From {REFORM_DATE}: pensions enter the estate for IHT</AlertTitle>
        <AlertDescription>
          HM Treasury has confirmed that most unused pension funds and death benefits will fall within the
          deceased's estate for Inheritance Tax from 6 April 2027. Charity exemptions and the spouse exemption
          remain. This calculator compares your position before and after the reform.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-3 gap-4">
        <SummaryCard label="Gross estate" value={calc.grossEstate} hint="All assets except life policies in trust" />
        <SummaryCard label="IHT today (pre-2027)" value={calc.pre.iht} variant="default" />
        <SummaryCard
          label={`IHT from ${REFORM_DATE}`}
          value={calc.post.iht}
          variant={calc.delta > 0 ? 'destructive' : 'default'}
          hint={calc.delta > 0 ? `+${formatGBP(calc.delta)} additional IHT` : 'No change'}
        />
      </div>

      <Tabs defaultValue="assets">
        <TabsList>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="assumptions">Estate assumptions</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          {isAdviser && <TabsTrigger value="adviser">Adviser notes</TabsTrigger>}
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Asset register</CardTitle>
                <CardDescription>Add or edit each asset to build a full picture</CardDescription>
              </div>
              <Button size="sm" onClick={addAsset}><Plus className="w-4 h-4 mr-1" /> Add asset</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {assets.map((a) => {
                const meta = CATEGORY_META[a.category]
                const Icon = meta.icon
                return (
                  <div key={a.id} className="grid grid-cols-12 gap-2 items-center p-3 rounded-md border">
                    <div className="col-span-12 md:col-span-4 flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <Input value={a.label} onChange={(e) => updateAsset(a.id, { label: e.target.value })} />
                    </div>
                    <div className="col-span-7 md:col-span-4">
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={a.category}
                        onChange={(e) => updateAsset(a.id, { category: e.target.value as Asset['category'] })}
                      >
                        {Object.entries(CATEGORY_META).map(([k, m]) => (
                          <option key={k} value={k}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-4 md:col-span-3">
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={a.value}
                        onChange={(e) => updateAsset(a.id, { value: Number(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button variant="ghost" size="icon" onClick={() => removeAsset(a.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="col-span-12 text-xs text-muted-foreground pl-6">{meta.note}</p>
                  </div>
                )
              })}
              <div className="flex justify-between pt-2 text-sm">
                <span className="text-muted-foreground">Total declared</span>
                <span className="font-semibold">{formatGBP(calc.total)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assumptions">
          <Card>
            <CardHeader>
              <CardTitle>Estate assumptions</CardTitle>
              <CardDescription>Allowances and reliefs applied to the calculation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Married / civil partnership</Label>
                  <p className="text-xs text-muted-foreground">Allows transferable NRB & spouse exemption</p>
                </div>
                <Switch checked={marriedSpouse} onCheckedChange={setMarriedSpouse} />
              </div>
              <div>
                <Label>Transferable NRB from late spouse (%)</Label>
                <Input
                  type="number" min={0} max={100}
                  value={transferableNRB}
                  onChange={(e) => setTransferableNRB(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                  disabled={!marriedSpouse}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Effective NRB: {formatGBP(NRB + (marriedSpouse ? (transferableNRB / 100) * NRB : 0))}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Home passes to direct descendants</Label>
                  <p className="text-xs text-muted-foreground">Required to claim Residence NRB ({formatGBP(RNRB)})</p>
                </div>
                <Switch checked={passesToDescendants} onCheckedChange={setPassesToDescendants} />
              </div>
              <div>
                <Label>Charitable legacy (% of chargeable estate)</Label>
                <Input
                  type="number" min={0} max={100}
                  value={charityPctOfEstate}
                  onChange={(e) => setCharityPctOfEstate(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                />
                <p className="text-xs text-muted-foreground mt-1">10%+ of net estate to charity reduces IHT rate to 36%</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <div className="grid md:grid-cols-2 gap-4">
            <BreakdownCard title="Pre-6 April 2027" data={calc.pre} estate={calc.estatePre} sippIncluded={false} />
            <BreakdownCard title={`From ${REFORM_DATE}`} data={calc.post} estate={calc.estatePost} sippIncluded={true} highlight />
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Info className="w-4 h-4" /> What changes for your SIPP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>SIPP value modelled: <strong>{formatGBP(calc.sippTotal)}</strong></p>
              <p>Additional IHT exposure from inclusion of pensions: <strong className={calc.delta > 0 ? 'text-destructive' : ''}>{formatGBP(calc.delta)}</strong></p>
              <Separator className="my-2" />
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Spouse exemption still applies — pension passing to a surviving spouse remains IHT-free.</li>
                <li>Beneficiaries inheriting taxable pensions before age 75 retain the income-tax-free status; from age 75, recipients pay marginal income tax on drawdowns (this is in addition to IHT).</li>
                <li>Consider gifting strategies, life cover written in trust, and accelerated drawdown into ISAs/gifted out of income.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdviser && (
          <TabsContent value="adviser">
            <Card>
              <CardHeader>
                <CardTitle>Adviser planning notes</CardTitle>
                <CardDescription>Talking points for the next review</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 rounded-md bg-muted">
                  <p className="font-medium mb-1">Key client metrics</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>SIPP: {formatGBP(calc.sippTotal)} ({((calc.sippTotal / Math.max(1, calc.total)) * 100).toFixed(0)}% of wealth)</li>
                    <li>Effective NRB + RNRB (post-2027): {formatGBP(calc.post.allowances)}</li>
                    <li>Marginal IHT on next £1 of pension: {(calc.post.rate * 100).toFixed(0)}%</li>
                    <li>Compound stack on death after 75: up to {(calc.post.rate * 100 + 45 * (1 - calc.post.rate)).toFixed(0)}% effective</li>
                  </ul>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Spend pension first?</strong> Re-evaluate the historic "ISA first" guidance — drawing pension and gifting from surplus income may be more efficient post-2027.</li>
                  <li><strong>Whole-of-life cover in trust</strong> to fund the IHT bill on the SIPP at second death.</li>
                  <li><strong>BR/AIM portfolios</strong> — note 2026 cap of £1m combined APR/BR at 100% relief, 50% above.</li>
                  <li><strong>Bypass trusts</strong> for death-benefit nominations — may need redesign post-reform.</li>
                  <li><strong>Annuity vs drawdown</strong> — annuities cease on death (or after guarantee period) so reduce estate exposure.</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

function SummaryCard({ label, value, hint, variant = 'default' }: { label: string; value: number; hint?: string; variant?: 'default' | 'destructive' }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${variant === 'destructive' ? 'text-destructive' : 'text-foreground'}`}>
          {formatGBP(value)}
        </div>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </CardContent>
    </Card>
  )
}

function BreakdownCard({ title, data, estate, sippIncluded, highlight }: {
  title: string
  data: { charge: number; rnrb: number; allowances: number; taxable: number; rate: number; iht: number }
  estate: number
  sippIncluded: boolean
  highlight?: boolean
}) {
  return (
    <Card className={highlight ? 'border-primary' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant={sippIncluded ? 'destructive' : 'secondary'}>
            {sippIncluded ? 'Pension included' : 'Pension excluded'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <Row k="Estate value" v={formatGBP(estate)} />
        <Row k="Chargeable (after BR)" v={formatGBP(data.charge)} />
        <Row k="NRB + RNRB" v={`- ${formatGBP(data.allowances)}`} />
        <Row k="Taxable estate" v={formatGBP(data.taxable)} />
        <Row k="IHT rate" v={`${(data.rate * 100).toFixed(0)}%`} />
        <Separator />
        <Row k="IHT due" v={formatGBP(data.iht)} bold />
      </CardContent>
    </Card>
  )
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className={bold ? 'font-semibold' : ''}>{v}</span>
    </div>
  )
}
