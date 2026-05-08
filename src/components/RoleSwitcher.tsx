import { useRole, Role } from '@/contexts/RoleContext'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { User, Briefcase, Shield, ChevronDown } from 'lucide-react'

const ICONS: Record<Role, any> = { client: User, adviser: Briefcase, admin: Shield }
const LABELS: Record<Role, string> = { client: 'Client', adviser: 'Adviser', admin: 'Admin' }

export function RoleSwitcher() {
  const { role, setRole } = useRole()
  const Icon = ICONS[role]

  return (
    <div className="fixed top-3 right-3 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="shadow-md bg-background/90 backdrop-blur">
            <Icon className="h-4 w-4 mr-2" />
            <span className="text-xs font-medium">{LABELS[role]}</span>
            <ChevronDown className="h-3 w-3 ml-1 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel className="text-xs">Demo role</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(['client', 'adviser', 'admin'] as Role[]).map((r) => {
            const I = ICONS[r]
            return (
              <DropdownMenuItem key={r} onClick={() => setRole(r)} className={role === r ? 'bg-accent' : ''}>
                <I className="h-4 w-4 mr-2" />
                {LABELS[r]}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
