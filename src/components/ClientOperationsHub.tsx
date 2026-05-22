import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Building2, Search, Eye, ChevronDown, PoundSterling, ArrowDownToLine, ArrowUpFromLine,
  Workflow, HandCoins, Heart, ShieldCheck, FileText, Calculator, Send, History, ArrowRightLeft,
  ScrollText, Users,
} from 'lucide-react'
import { toast } from 'sonner'

interface Client {
  id: string
  first_name: string
  last_name: string
  email: string | null
  status: string
  risk_profile: string | null
  firm_id: string | null
  adviser: string | null
}
interface Firm { id: string; name: string; fca_ref: string | null; status: string }

const QUICK_ACTIONS = [
  { label: 'Create drawdown event', icon: PoundSterling, path: '/drawdown' },
  { label: 'Drip-feed drawdown', icon: Workflow, path: '/drip-feed' },
  { label: 'Add money (deposit)', icon: ArrowDownToLine, path: '/instant-deposit' },
  { label: 'Instant withdrawal', icon: Send, path: '/instant-withdrawal' },
  { label: 'Transfer in', icon: ArrowDownToLine, path: '/transfer' },
  { label: 'Transfer out', icon: ArrowUpFromLine, path: '/transfer-out' },
  { label: 'Instrument transfer', icon: ArrowRightLeft, path: '/instrument-transfer' },
  { label: 'Contribution manager', icon: HandCoins, path: '/contributions' },
  { label: 'Cash onboarding', icon: ArrowDownToLine, path: '/cash-onboarding' },
  { label: 'Illustration', icon: Calculator, path: '/illustration' },
  { label: 'Beneficiaries', icon: Heart, path: '/beneficiaries' },
  { label: 'KYC review', icon: ShieldCheck, path: '/kyc-review' },
  { label: 'Annual review pack', icon: FileText, path: '/annual-review' },
  { label: 'Transaction history', icon: History, path: '/transactions' },
  { label: 'Audit trail', icon: ScrollText, path: '/audit' },
] as const

export default function ClientOperationsHub() {
  const navigate = useNavigate()
  const [firms, setFirms] = useState<Firm[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      supabase.from('firms').select('id,name,fca_ref,status').order('name'),
      supabase.from('clients').select('id,first_name,last_name,email,status,risk_profile,firm_id,adviser').order('last_name'),
    ]).then(([f, c]) => {
      setFirms((f.data || []) as Firm[])
      setClients((c.data || []) as Client[])
      setLoading(false)
    })
  }, [])

  const grouped = useMemo(() => {
    const q = search.toLowerCase()
    const matches = (c: Client) =>
      !q ||
      `${c.first_name} ${c.last_name} ${c.email ?? ''} ${c.adviser ?? ''}`.toLowerCase().includes(q)
    const byFirm = new Map<string, Client[]>()
    for (const c of clients.filter(matches)) {
      const key = c.firm_id ?? '__unassigned__'
      if (!byFirm.has(key)) byFirm.set(key, [])
      byFirm.get(key)!.push(c)
    }
    return byFirm
  }, [clients, search])

  const act = (clientId: string, path: string, label: string) => {
    const search = new URLSearchParams({ clientId, onBehalf: '1' }).toString()
    toast.success(`Opening "${label}" on behalf of client`)
    navigate(`${path}?${search}`)
  }

  const totalClients = clients.length
  const totalFirms = firms.length

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Client Operations Hub
          </h1>
          <p className="text-sm text-muted-foreground">
            Perform any client action on behalf of a client — grouped by adviser firm.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant="secondary"><Building2 className="h-3 w-3 mr-1" />{totalFirms} firms</Badge>
          <Badge variant="secondary"><Users className="h-3 w-3 mr-1" />{totalClients} clients</Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by client name, email or adviser…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading clients…</div>
          ) : (
            <Accordion type="multiple" defaultValue={firms.slice(0, 3).map(f => f.id)} className="w-full">
              {firms.map((firm) => {
                const list = grouped.get(firm.id) ?? []
                if (search && list.length === 0) return null
                return (
                  <AccordionItem key={firm.id} value={firm.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <Building2 className="h-4 w-4 text-primary" />
                        <div>
                          <div className="font-medium">{firm.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {firm.fca_ref ? `FCA ${firm.fca_ref} · ` : ''}{list.length} client{list.length === 1 ? '' : 's'}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {list.length === 0 ? (
                        <div className="text-xs text-muted-foreground py-2 px-3">No clients in this firm.</div>
                      ) : (
                        <ClientGrid list={list} onView={(id) => navigate(`/client-admin/${id}`)} onAct={act} />
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
              {(() => {
                const orphans = grouped.get('__unassigned__') ?? []
                if (orphans.length === 0) return null
                return (
                  <AccordionItem value="__unassigned__">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Unassigned</div>
                          <div className="text-xs text-muted-foreground">{orphans.length} clients without a firm</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ClientGrid list={orphans} onView={(id) => navigate(`/client-admin/${id}`)} onAct={act} />
                    </AccordionContent>
                  </AccordionItem>
                )
              })()}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How this works</CardTitle>
          <CardDescription>
            Every client module is available here from an operations standpoint. Pick a client, then choose an action —
            the relevant tool opens with the client context applied (<code>?clientId=…&onBehalf=1</code>). All actions are
            written to the audit trail.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

function ClientGrid({
  list, onView, onAct,
}: {
  list: Client[]
  onView: (id: string) => void
  onAct: (clientId: string, path: string, label: string) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pt-2">
      {list.map((c) => (
        <Card key={c.id} className="border-border/60">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{c.first_name} {c.last_name}</div>
                <div className="text-xs text-muted-foreground truncate">{c.email ?? '—'}</div>
                <div className="text-xs text-muted-foreground truncate">
                  Adviser: {c.adviser || '—'}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={c.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">{c.status}</Badge>
                {c.risk_profile && <Badge variant="outline" className="text-[10px]">{c.risk_profile}</Badge>}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => onView(c.id)}>
                <Eye className="h-3.5 w-3.5 mr-1.5" />Open client
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm">
                    Quick action <ChevronDown className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
                  <DropdownMenuLabel className="text-xs">Act on behalf of {c.first_name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {QUICK_ACTIONS.map((a) => {
                    const I = a.icon
                    return (
                      <DropdownMenuItem key={a.path} onClick={() => onAct(c.id, a.path, a.label)}>
                        <I className="h-4 w-4 mr-2" />{a.label}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
