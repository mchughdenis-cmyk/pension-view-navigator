import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { Briefcase, Users, FileText, TrendingUp, PoundSterling, Settings as SettingsIcon, Activity, Building2, Layers, ShieldCheck, Calculator, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface CommandItem {
  label: string
  icon: any
  action: () => void
  group: string
  keywords?: string
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { toggle } = useTheme()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const go = (path: string) => () => { navigate(path); setOpen(false) }

  const items: CommandItem[] = [
    { label: 'Dashboard', icon: Briefcase, action: go('/dashboard'), group: 'Navigate' },
    { label: 'Admin', icon: Users, action: go('/admin'), group: 'Navigate' },
    { label: 'Operations Cockpit', icon: Layers, action: go('/cockpit'), group: 'Navigate' },
    { label: 'Pension Operations', icon: FileText, action: go('/operations'), group: 'Navigate' },
    { label: 'MI Dashboard', icon: TrendingUp, action: go('/mi'), group: 'Navigate' },
    { label: 'Model Portfolios', icon: Layers, action: go('/models'), group: 'Navigate' },
    { label: 'CASS Reconciliation', icon: ShieldCheck, action: go('/cass'), group: 'Navigate' },
    { label: 'Settings', icon: SettingsIcon, action: go('/settings'), group: 'Navigate' },

    { label: 'New transfer in', icon: Building2, action: go('/transfer'), group: 'Actions' },
    { label: 'Process drawdown', icon: PoundSterling, action: go('/drawdown'), group: 'Actions' },
    { label: 'Run Monte Carlo projection', icon: Calculator, action: go('/projection'), group: 'Actions' },
    { label: 'View activity log', icon: Activity, action: go('/admin'), group: 'Actions' },

    { label: 'Toggle dark / light mode', icon: Sun, action: () => { toggle(); setOpen(false) }, group: 'Theme' },
  ]

  const groups = Array.from(new Set(items.map(i => i.group)))

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search clients, actions, pages... (⌘K)" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {groups.map((g, gi) => (
          <div key={g}>
            {gi > 0 && <CommandSeparator />}
            <CommandGroup heading={g}>
              {items.filter(i => i.group === g).map(i => (
                <CommandItem key={i.label} onSelect={i.action}>
                  <i.icon className="mr-2 h-4 w-4" />
                  {i.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
