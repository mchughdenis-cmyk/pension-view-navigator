import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command'
import { Sun, ArrowRight, Clock, Users, Pin } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useRole } from '@/contexts/RoleContext'
import { NAV_BY_ROLE } from '@/components/nav/navConfig'
import { useRecents } from '@/hooks/useFavourites'
import { useActiveClient } from '@/hooks/useActiveClient'
import { supabase } from '@/integrations/supabase/client'

interface Client { id: string; name: string; email?: string | null }

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const navigate = useNavigate()
  const { toggle } = useTheme()
  const { role } = useRole()
  const { recents } = useRecents()
  const { pin } = useActiveClient()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Lazy-load clients only when opened
  useEffect(() => {
    if (!open || clients.length) return
    (async () => {
      try {
        const { data } = await (supabase as any)
          .from('clients')
          .select('id, first_name, last_name, email')
          .limit(100)
        if (data) {
          setClients((data as any[]).map((c) => ({
            id: c.id,
            name: `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() || 'Unnamed client',
            email: c.email,
          })))
        }
      } catch { /* ignore */ }
    })()
  }, [open, clients.length])

  const go = (path: string) => { navigate(path); setOpen(false); setQuery('') }

  const navItems = NAV_BY_ROLE[role].flatMap((g) =>
    g.items.map((i) => ({ ...i, group: g.label }))
  )
  const findItem = (url: string) => navItems.find((i) => i.url === url)
  const recentItems = recents.map(findItem).filter(Boolean).slice(0, 5) as typeof navItems

  const q = query.trim().toLowerCase()
  const filteredClients = q
    ? clients.filter((c) =>
        (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q)
      ).slice(0, 8)
    : []

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search pages, clients, actions…  (⌘K)"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {recentItems.length > 0 && !q && (
          <>
            <CommandGroup heading="Recent">
              {recentItems.map((i) => (
                <CommandItem key={`r-${i.url}`} onSelect={() => go(i.url)}>
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  {i.title}
                  <span className="ml-auto text-xs text-muted-foreground">{i.group}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {filteredClients.length > 0 && (
          <>
            <CommandGroup heading="Clients">
              {filteredClients.map((c) => (
                <div key={c.id} className="flex items-center">
                  <CommandItem className="flex-1" onSelect={() => go(`/client/${c.id}`)}>
                    <Users className="mr-2 h-4 w-4" />
                    {c.name}
                    {c.email && <span className="ml-2 text-xs text-muted-foreground">{c.email}</span>}
                  </CommandItem>
                  <button
                    className="mr-2 inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-accent"
                    onClick={() => { pin({ id: c.id, name: c.name }); setOpen(false) }}
                    title="Pin as active client"
                  >
                    <Pin className="h-3 w-3" /> Pin
                  </button>
                </div>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => go('/admin/console')}><ArrowRight className="mr-2 h-4 w-4" />Open operator console</CommandItem>
          <CommandItem onSelect={() => go('/payroll-processing')}><ArrowRight className="mr-2 h-4 w-4" />Start payroll run</CommandItem>
          <CommandItem onSelect={() => go('/bank-upload')}><ArrowRight className="mr-2 h-4 w-4" />Upload bank file</CommandItem>
          <CommandItem onSelect={() => go('/cases')}><ArrowRight className="mr-2 h-4 w-4" />Open case inbox</CommandItem>
          <CommandItem onSelect={() => go('/drawdown')}><ArrowRight className="mr-2 h-4 w-4" />Process drawdown</CommandItem>
          <CommandItem onSelect={() => go('/transfer')}><ArrowRight className="mr-2 h-4 w-4" />New transfer in</CommandItem>
        </CommandGroup>
        <CommandSeparator />

        {NAV_BY_ROLE[role].map((g) => (
          <CommandGroup key={g.label} heading={g.label}>
            {g.items.map((i) => (
              <CommandItem key={i.url} onSelect={() => go(i.url)} keywords={[i.title, g.label]}>
                <i.icon className="mr-2 h-4 w-4" />
                {i.title}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => { toggle(); setOpen(false) }}>
            <Sun className="mr-2 h-4 w-4" /> Toggle dark / light mode
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
