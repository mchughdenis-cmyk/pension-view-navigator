import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ThemeToggle } from './ThemeToggle'
import { toast } from 'sonner'
import { AlertCircle, Clock, CheckCircle2, ArrowRight, MessageSquarePlus, Search } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface OpsCase {
  id: string
  case_ref: string
  case_type: string
  client_id: string | null
  priority: string
  status: string
  queue: string
  assigned_to: string | null
  sla_due_at: string | null
  title: string
  description: string | null
  created_at: string
}

const QUEUES = ['all', 'onboarding', 'transfers', 'drawdown', 'investments', 'compliance', 'general']
const STATUSES = ['open', 'in_progress', 'awaiting', 'blocked', 'resolved']

const priorityColor = (p: string) =>
  p === 'urgent' ? 'destructive' : p === 'high' ? 'default' : p === 'low' ? 'outline' : 'secondary'

export default function OperationsCockpit() {
  const [cases, setCases] = useState<OpsCase[]>([])
  const [selected, setSelected] = useState<OpsCase | null>(null)
  const [notes, setNotes] = useState<any[]>([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [queueFilter, setQueueFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('ops_cases').select('*').order('created_at', { ascending: false }).limit(200)
    setCases((data || []) as OpsCase[])
    setLoading(false)
  }

  const [searchParams] = useSearchParams()

  useEffect(() => {
    load()
    const ch = supabase
      .channel('ops_cases_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ops_cases' }, load)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  // Deep-link: ?case=<id> auto-selects the case once cases have loaded
  useEffect(() => {
    const id = searchParams.get('case')
    if (!id || cases.length === 0) return
    const found = cases.find(c => c.id === id)
    if (found && (!selected || selected.id !== id)) setSelected(found)
  }, [searchParams, cases, selected])

  useEffect(() => {
    if (!selected) { setNotes([]); return }
    supabase.from('ops_case_notes').select('*').eq('case_id', selected.id).order('created_at', { ascending: false })
      .then(({ data }) => setNotes(data || []))
  }, [selected])

  const filtered = useMemo(() => cases.filter(c => {
    if (queueFilter !== 'all' && c.queue !== queueFilter) return false
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (search && !`${c.case_ref} ${c.title} ${c.description ?? ''}`.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [cases, queueFilter, statusFilter, search])

  const stats = useMemo(() => {
    const open = cases.filter(c => !['resolved', 'closed'].includes(c.status)).length
    const breached = cases.filter(c => c.sla_due_at && new Date(c.sla_due_at) < new Date() && !['resolved', 'closed'].includes(c.status)).length
    const urgent = cases.filter(c => c.priority === 'urgent' && !['resolved', 'closed'].includes(c.status)).length
    return { open, breached, urgent }
  }, [cases])

  const updateStatus = async (status: string) => {
    if (!selected) return
    await supabase.from('ops_cases').update({ status, resolved_at: status === 'resolved' ? new Date().toISOString() : null }).eq('id', selected.id)
    toast.success(`Case ${selected.case_ref} → ${status}`)
    setSelected({ ...selected, status })
    load()
  }

  const addNote = async () => {
    if (!selected || !newNote.trim()) return
    await supabase.from('ops_case_notes').insert({ case_id: selected.id, note: newNote, author: 'You' })
    setNewNote('')
    const { data } = await supabase.from('ops_case_notes').select('*').eq('case_id', selected.id).order('created_at', { ascending: false })
    setNotes(data || [])
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Top bar */}
      <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-semibold">Operations Cockpit</h1>
          <div className="flex gap-2 text-xs">
            <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{stats.open} open</Badge>
            <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />{stats.breached} SLA breached</Badge>
            <Badge variant="default">{stats.urgent} urgent</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden md:inline">Press ⌘K</span>
          <ThemeToggle />
        </div>
      </header>

      {/* 3-pane layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Pane 1: Queue + filters */}
        <aside className="w-80 border-r border-border bg-card flex flex-col">
          <div className="p-3 space-y-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search cases..." className="pl-8 h-8" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={queueFilter} onValueChange={setQueueFilter}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{QUEUES.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">all status</SelectItem>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ScrollArea className="flex-1">
            {loading && <div className="p-4 text-sm text-muted-foreground">Loading...</div>}
            {!loading && filtered.length === 0 && <div className="p-4 text-sm text-muted-foreground">No cases match.</div>}
            {filtered.map(c => {
              const breached = c.sla_due_at && new Date(c.sla_due_at) < new Date() && !['resolved', 'closed'].includes(c.status)
              return (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`w-full text-left px-3 py-2.5 border-b border-border hover:bg-accent transition-colors ${selected?.id === c.id ? 'bg-accent' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{c.case_ref}</span>
                    <Badge variant={priorityColor(c.priority) as any} className="text-[10px] py-0 px-1.5">{c.priority}</Badge>
                  </div>
                  <div className="text-sm font-medium line-clamp-2">{c.title}</div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
                    <span>{c.queue}</span>
                    {breached ? (
                      <span className="text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />SLA breached</span>
                    ) : c.sla_due_at ? (
                      <span>SLA in {formatDistanceToNow(new Date(c.sla_due_at))}</span>
                    ) : null}
                  </div>
                </button>
              )
            })}
          </ScrollArea>
        </aside>

        {/* Pane 2: Case detail */}
        <main className="flex-1 overflow-auto p-6">
          {!selected ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Select a case from the queue to view details
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">{selected.case_ref}</span>
                  <Badge variant={priorityColor(selected.priority) as any}>{selected.priority}</Badge>
                  <Badge variant="outline">{selected.queue}</Badge>
                  <Badge>{selected.status}</Badge>
                </div>
                <h2 className="text-2xl font-semibold">{selected.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
              </div>

              <Card className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div><div className="text-xs text-muted-foreground">Type</div><div>{selected.case_type}</div></div>
                  <div><div className="text-xs text-muted-foreground">Created</div><div>{formatDistanceToNow(new Date(selected.created_at))} ago</div></div>
                  <div><div className="text-xs text-muted-foreground">SLA due</div><div>{selected.sla_due_at ? formatDistanceToNow(new Date(selected.sla_due_at)) : '—'}</div></div>
                  <div><div className="text-xs text-muted-foreground">Assigned</div><div>{selected.assigned_to || 'Unassigned'}</div></div>
                </div>
              </Card>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => updateStatus('in_progress')} disabled={selected.status === 'in_progress'}>
                  <ArrowRight className="h-3 w-3 mr-1" />Start work
                </Button>
                <Button size="sm" variant="secondary" onClick={() => updateStatus('awaiting')}>Mark awaiting</Button>
                <Button size="sm" variant="default" onClick={() => updateStatus('resolved')}>
                  <CheckCircle2 className="h-3 w-3 mr-1" />Resolve
                </Button>
              </div>

              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <MessageSquarePlus className="h-4 w-4" />Case notes
                </h3>
                <Textarea placeholder="Add a note..." value={newNote} onChange={e => setNewNote(e.target.value)} rows={2} />
                <Button size="sm" className="mt-2" onClick={addNote} disabled={!newNote.trim()}>Add note</Button>
                <div className="mt-4 space-y-2">
                  {notes.map(n => (
                    <div key={n.id} className="text-sm border-l-2 border-primary pl-3">
                      <div className="text-xs text-muted-foreground">{n.author} · {formatDistanceToNow(new Date(n.created_at))} ago</div>
                      <div>{n.note}</div>
                    </div>
                  ))}
                  {notes.length === 0 && <div className="text-xs text-muted-foreground">No notes yet</div>}
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
