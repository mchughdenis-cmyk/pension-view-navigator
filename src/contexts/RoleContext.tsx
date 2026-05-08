import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Role = 'client' | 'adviser' | 'admin'

export interface DemoUser {
  id: string
  name: string
  email: string
  role: Role
}

interface RoleContextValue {
  role: Role
  user: DemoUser
  session: boolean
  setRole: (r: Role) => void
  switchRole: (r: Role, override?: Partial<DemoUser>) => void
  enterDemoMode: () => void
}

const STORAGE_KEY = 'pn_demo_role'
const USER_KEY = 'pn_demo_user'

const DEFAULTS: Record<Role, DemoUser> = {
  client: { id: 'demo-client', name: 'Sarah Thompson', email: 'sarah@example.com', role: 'client' },
  adviser: { id: 'demo-adviser', name: 'James Caldwell', email: 'james@airgead.co.uk', role: 'adviser' },
  admin: { id: 'demo-admin', name: 'System Admin', email: 'admin@airgead.co.uk', role: 'admin' },
}

const RoleContext = createContext<RoleContextValue>({
  role: 'admin', user: DEFAULTS.admin, session: true,
  setRole: () => {}, switchRole: () => {}, enterDemoMode: () => {},
})

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    if (typeof window === 'undefined') return 'admin'
    return ((localStorage.getItem(STORAGE_KEY) as Role) || 'admin')
  })
  const [user, setUser] = useState<DemoUser>(() => {
    if (typeof window === 'undefined') return DEFAULTS.admin
    try {
      const raw = localStorage.getItem(USER_KEY)
      if (raw) return JSON.parse(raw) as DemoUser
    } catch {}
    return DEFAULTS[((localStorage.getItem(STORAGE_KEY) as Role) || 'admin')]
  })

  useEffect(() => { localStorage.setItem(STORAGE_KEY, role) }, [role])
  useEffect(() => { localStorage.setItem(USER_KEY, JSON.stringify(user)) }, [user])

  const setRole = (r: Role) => {
    setRoleState(r)
    setUser({ ...DEFAULTS[r] })
  }

  const switchRole = (r: Role, override?: Partial<DemoUser>) => {
    setRoleState(r)
    setUser({ ...DEFAULTS[r], ...override, role: r })
  }

  const enterDemoMode = () => {
    setRoleState('admin')
    setUser({ ...DEFAULTS.admin })
  }

  return (
    <RoleContext.Provider value={{ role, user, session: true, setRole, switchRole, enterDemoMode }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => useContext(RoleContext)
