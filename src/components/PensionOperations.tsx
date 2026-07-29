import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Banknote, ArrowDownToLine, Receipt, FileText, HeartCrack, TrendingUp, Camera } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  useClients,
  useContributions, processContribution,
  useTransfersIn,
  useFeeCharges,
  useValuations,
  useDeathClaims,
  useStatements,
} from '@/hooks/useClientData'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

const fmt = (n: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n || 0)

export default function PensionOperations() {
  const navigate = useNavigate()
  const { clients } = useClients()
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [accounts, setAccounts] = useState<any[]>([])

  const onClientChange = async (id: string) => {
    setSelectedClient(id)
    if (id) {
      const { data } = await supabase.from('client_accounts').select('*').eq('client_id', id)
      setAccounts(data || [])
    } else setAccounts([])
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Pension Operations</h1>
            <p className="text-muted-foreground">Contributions · Transfers · Trading · Fees · Death Benefits · Statements</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Label>Select Client</Label>
            <Select value={selectedClient} onValueChange={onClientChange}>
              <SelectTrigger><SelectValue placeholder="Choose a client to operate on..." /></SelectTrigger>
              <SelectContent>
                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedClient && (
          <Tabs defaultValue="contributions">
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="contributions"><Banknote className="h-4 w-4 mr-1" />Contributions</TabsTrigger>
              <TabsTrigger value="transfers"><ArrowDownToLine className="h-4 w-4 mr-1" />Transfers In</TabsTrigger>
              <TabsTrigger value="fees"><Receipt className="h-4 w-4 mr-1" />Fees</TabsTrigger>
              <TabsTrigger value="valuations"><TrendingUp className="h-4 w-4 mr-1" />Valuations</TabsTrigger>
              <TabsTrigger value="death"><HeartCrack className="h-4 w-4 mr-1" />Death Benefits</TabsTrigger>
              <TabsTrigger value="statements"><FileText className="h-4 w-4 mr-1" />Statements</TabsTrigger>
            </TabsList>

            <TabsContent value="contributions"><ContributionsPanel clientId={selectedClient} accounts={accounts} /></TabsContent>
            <TabsContent value="transfers"><TransfersPanel clientId={selectedClient} accounts={accounts} /></TabsContent>
            <TabsContent value="fees"><FeesPanel clientId={selectedClient} accounts={accounts} /></TabsContent>
            <TabsContent value="valuations"><ValuationsPanel clientId={selectedClient} /></TabsContent>
            <TabsContent value="death"><DeathBenefitsPanel clientId={selectedClient} /></TabsContent>
            <TabsContent value="statements"><StatementsPanel clientId={selectedClient} /></TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

// --- Contributions ---
function ContributionsPanel({ clientId, accounts }: { clientId: string; accounts: any[] }) {
  const { contributions, fetch } = useContributions(clientId)
  const [accountId, setAccountId] = useState('')
  const [type, setType] = useState<'member' | 'employer' | 'third_party'>('member')
  const [amount, setAmount] = useState('1000')

  const submit = async () => {
    if (!accountId) { toast.error('Select an account'); return }
    const isMember = type === 'member'
    await processContribution({
      clientId, accountId, type,
      ...(isMember ? { netAmount: parseFloat(amount), reliefMethod: 'ras' } : { grossAmount: parseFloat(amount), reliefMethod: 'none' }),
    })
    fetch()
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Record Contribution</CardTitle><CardDescription>UK 2026/27 — RAS for member, gross for employer</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
              <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.account_type} — {fmt(a.total_value)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Type</Label>
            <Select value={type} onValueChange={v => setType(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member (net, RAS 20%)</SelectItem>
                <SelectItem value="employer">Employer (gross)</SelectItem>
                <SelectItem value="third_party">3rd-party (net)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>{type === 'employer' ? 'Gross' : 'Net'} amount (£)</Label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            {type === 'member' && <p className="text-xs text-muted-foreground mt-1">Gross: {fmt(parseFloat(amount || '0') / 0.8)} · Relief: {fmt(parseFloat(amount || '0') * 0.25)}</p>}
          </div>
          <Button onClick={submit} className="w-full">Process Contribution</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>History ({contributions.length})</CardTitle></CardHeader>
        <CardContent>
          <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Gross</TableHead><TableHead>Tax Yr</TableHead></TableRow></TableHeader>
            <TableBody>
              {contributions.map(c => (
                <TableRow key={c.id}>
                  <TableCell>{c.effective_date}</TableCell>
                  <TableCell><Badge variant="outline">{c.contribution_type}</Badge></TableCell>
                  <TableCell className="text-right">{fmt(c.gross_amount)}</TableCell>
                  <TableCell>{c.tax_year}</TableCell>
                </TableRow>
              ))}
              {!contributions.length && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No contributions yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Transfers In ---
function TransfersPanel({ clientId, accounts }: { clientId: string; accounts: any[] }) {
  const { transfers, createTransfer, updateStatus, completeTransfer, fetch } = useTransfersIn(clientId)
  const [form, setForm] = useState({
    ceding_scheme_name: '', ceding_provider: '', estimated_value: '0',
    transfer_type: 'cash', account_id: '', contains_safeguarded_benefits: false, contains_protected_tax_free_cash: false,
  })

  const submit = async () => {
    if (!form.ceding_scheme_name || !form.account_id) { toast.error('Scheme name + account required'); return }
    await createTransfer({
      client_id: clientId,
      account_id: form.account_id,
      ceding_scheme_name: form.ceding_scheme_name,
      ceding_provider: form.ceding_provider,
      transfer_type: form.transfer_type,
      estimated_value: parseFloat(form.estimated_value),
      contains_safeguarded_benefits: form.contains_safeguarded_benefits,
      contains_protected_tax_free_cash: form.contains_protected_tax_free_cash,
      status: 'requested',
    } as any)
    setForm({ ceding_scheme_name: '', ceding_provider: '', estimated_value: '0', transfer_type: 'cash', account_id: '', contains_safeguarded_benefits: false, contains_protected_tax_free_cash: false })
  }

  const onComplete = async (id: string, est: number) => {
    const value = prompt('Received value (£)?', est.toString())
    if (value) await completeTransfer(id, parseFloat(value))
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Request Transfer In</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Ceding scheme</Label><Input value={form.ceding_scheme_name} onChange={e => setForm({ ...form, ceding_scheme_name: e.target.value })} placeholder="e.g. Aviva Personal Pension" /></div>
          <div><Label>Ceding provider</Label><Input value={form.ceding_provider} onChange={e => setForm({ ...form, ceding_provider: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Estimated value (£)</Label><Input type="number" value={form.estimated_value} onChange={e => setForm({ ...form, estimated_value: e.target.value })} /></div>
            <div><Label>Type</Label>
              <Select value={form.transfer_type} onValueChange={v => setForm({ ...form, transfer_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="cash">Cash</SelectItem><SelectItem value="in_specie">In specie</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Receiving account</Label>
            <Select value={form.account_id} onValueChange={v => setForm({ ...form, account_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
              <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.account_type}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2"><Checkbox checked={form.contains_safeguarded_benefits} onCheckedChange={v => setForm({ ...form, contains_safeguarded_benefits: !!v })} /><Label>Contains safeguarded benefits (DB)</Label></div>
          <div className="flex items-center gap-2"><Checkbox checked={form.contains_protected_tax_free_cash} onCheckedChange={v => setForm({ ...form, contains_protected_tax_free_cash: !!v })} /><Label>Protected tax-free cash &gt;25%</Label></div>
          <Button onClick={submit} className="w-full">Create Transfer Request</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Transfers ({transfers.length})</CardTitle></CardHeader>
        <CardContent>
          <Table><TableHeader><TableRow><TableHead>Scheme</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Value</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {transfers.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.ceding_scheme_name}</TableCell>
                  <TableCell><Badge>{t.status}</Badge></TableCell>
                  <TableCell className="text-right">{fmt(t.received_value || t.estimated_value)}</TableCell>
                  <TableCell>
                    {t.status === 'requested' && <Button size="sm" variant="outline" onClick={() => updateStatus(t.id, 'in_progress')}>Mark In-Progress</Button>}
                    {t.status === 'in_progress' && <Button size="sm" onClick={() => onComplete(t.id, t.estimated_value)}>Complete</Button>}
                    {t.status === 'completed' && <span className="text-xs text-muted-foreground">{t.completed_date}</span>}
                  </TableCell>
                </TableRow>
              ))}
              {!transfers.length && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No transfers</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Fees ---
function FeesPanel({ clientId, accounts }: { clientId: string; accounts: any[] }) {
  const { charges, accrueFee, chargeFee } = useFeeCharges(clientId)
  const [accountId, setAccountId] = useState('')
  const [feeType, setFeeType] = useState('platform')
  const [basis, setBasis] = useState<'percent' | 'flat'>('percent')
  const [rate, setRate] = useState('0.30')
  const [vat, setVat] = useState(false)

  const submit = async () => {
    if (!accountId) { toast.error('Select account'); return }
    await accrueFee({ clientId, accountId, feeType, basis, rate: parseFloat(rate), applyVat: vat })
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Accrue Fee</CardTitle><CardDescription>Calculates from current AUM</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.account_type} — {fmt(a.total_value)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Type</Label>
              <Select value={feeType} onValueChange={setFeeType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="platform">Platform</SelectItem>
                  <SelectItem value="adviser">Adviser</SelectItem>
                  <SelectItem value="dealing">Dealing</SelectItem>
                  <SelectItem value="exit">Exit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Basis</Label>
              <Select value={basis} onValueChange={v => setBasis(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="percent">% of AUM</SelectItem><SelectItem value="flat">Flat £</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>{basis === 'percent' ? 'Rate (%)' : 'Amount (£)'}</Label><Input type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)} /></div>
          <div className="flex items-center gap-2"><Checkbox checked={vat} onCheckedChange={v => setVat(!!v)} /><Label>Apply VAT (20%)</Label></div>
          <Button onClick={submit} className="w-full">Accrue Fee</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Fees ({charges.length})</CardTitle></CardHeader>
        <CardContent>
          <Table><TableHeader><TableRow><TableHead>Type</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {charges.map(c => (
                <TableRow key={c.id}>
                  <TableCell>{c.fee_type}</TableCell>
                  <TableCell className="text-right">{fmt(c.total)}</TableCell>
                  <TableCell><Badge variant={c.status === 'charged' ? 'default' : 'outline'}>{c.status}</Badge></TableCell>
                  <TableCell>{c.status === 'accrued' && <Button size="sm" onClick={() => chargeFee(c.id)}>Charge</Button>}</TableCell>
                </TableRow>
              ))}
              {!charges.length && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No fees</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Valuations ---
function ValuationsPanel({ clientId }: { clientId: string }) {
  const { valuations, snapshot } = useValuations(clientId)
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div><CardTitle>Valuations</CardTitle><CardDescription>Historical snapshots of account values</CardDescription></div>
          <Button onClick={() => snapshot(clientId)}><Camera className="h-4 w-4 mr-1" />Take Snapshot Now</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead className="text-right">Cash</TableHead><TableHead className="text-right">Investments</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Source</TableHead></TableRow></TableHeader>
          <TableBody>
            {valuations.map((v: any) => (
              <TableRow key={v.id}>
                <TableCell>{v.valuation_date}</TableCell>
                <TableCell className="text-right">{fmt(v.cash_balance)}</TableCell>
                <TableCell className="text-right">{fmt(v.investments_value)}</TableCell>
                <TableCell className="text-right font-medium">{fmt(v.total_value)}</TableCell>
                <TableCell><Badge variant="outline">{v.source}</Badge></TableCell>
              </TableRow>
            ))}
            {!valuations.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No valuations yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// --- Death Benefits ---
function DeathBenefitsPanel({ clientId }: { clientId: string }) {
  const { claims, payments, openClaim, generatePayments, settlePayment, fetch } = useDeathClaims(clientId)
  const [dod, setDod] = useState(new Date().toISOString().slice(0, 10))
  const [cause, setCause] = useState('')

  return (
    <div className="space-y-6">
      {claims.length === 0 && (
        <Card>
          <CardHeader><CardTitle>Open Death Claim</CardTitle><CardDescription>Records date of death, computes pot, determines pre/post-75</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Date of death</Label><Input type="date" value={dod} onChange={e => setDod(e.target.value)} /></div>
            <div><Label>Cause (optional)</Label><Textarea value={cause} onChange={e => setCause(e.target.value)} /></div>
            <Button onClick={() => openClaim({ clientId, dateOfDeath: dod, cause })} variant="destructive">Open Claim</Button>
          </CardContent>
        </Card>
      )}

      {claims.map((claim: any) => {
        const claimPayments = payments.filter(p => p.death_claim_id === claim.id)
        return (
          <Card key={claim.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Claim — {claim.date_of_death}</CardTitle>
                  <CardDescription>Pot: {fmt(claim.total_pot_value)} · {claim.pre_75 ? 'Pre-75 (tax-free)' : 'Post-75 (taxable)'} · <Badge>{claim.status}</Badge></CardDescription>
                </div>
                {claimPayments.length === 0 && <Button onClick={() => generatePayments(claim.id)}>Generate Beneficiary Payments</Button>}
              </div>
            </CardHeader>
            {claimPayments.length > 0 && (
              <CardContent>
                <Table><TableHeader><TableRow><TableHead>Beneficiary</TableHead><TableHead className="text-right">Gross</TableHead><TableHead className="text-right">Tax</TableHead><TableHead className="text-right">Net</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {claimPayments.map(p => (
                      <TableRow key={p.id}>
                        <TableCell>{p.beneficiary_name}</TableCell>
                        <TableCell className="text-right">{fmt(p.gross_amount)}</TableCell>
                        <TableCell className="text-right">{fmt(p.tax_amount)}</TableCell>
                        <TableCell className="text-right font-medium">{fmt(p.net_amount)}</TableCell>
                        <TableCell><Badge variant={p.status === 'paid' ? 'default' : 'outline'}>{p.status}</Badge></TableCell>
                        <TableCell>{p.status !== 'paid' && <Button size="sm" onClick={() => settlePayment(p.id)}>Settle</Button>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}

// --- Statements ---
function StatementsPanel({ clientId }: { clientId: string }) {
  const { statements, generateAnnual } = useStatements(clientId)
  const [taxYear, setTaxYear] = useState(2024)

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Generate Annual Statement</CardTitle><CardDescription>UK tax year (6 Apr → 5 Apr)</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Tax year start</Label>
            <Select value={taxYear.toString()} onValueChange={v => setTaxYear(parseInt(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2026/27</SelectItem>
                <SelectItem value="2023">2023/24</SelectItem>
                <SelectItem value="2022">2022/23</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => generateAnnual(clientId, taxYear)} className="w-full">Generate</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Statements ({statements.length})</CardTitle></CardHeader>
        <CardContent>
          <Table><TableHeader><TableRow><TableHead>Period</TableHead><TableHead className="text-right">Closing</TableHead><TableHead className="text-right">Contribs</TableHead><TableHead className="text-right">Withdrawals</TableHead></TableRow></TableHeader>
            <TableBody>
              {statements.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell>{s.period_start} → {s.period_end}</TableCell>
                  <TableCell className="text-right">{fmt(s.closing_value)}</TableCell>
                  <TableCell className="text-right">{fmt(s.contributions_total)}</TableCell>
                  <TableCell className="text-right">{fmt(s.withdrawals_total)}</TableCell>
                </TableRow>
              ))}
              {!statements.length && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No statements</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
