import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Role = 'client' | 'adviser' | 'admin'

interface RoleContextValue {
  role: Role
  setRole: (r: Role) => void
}

const RoleContext = createContext<RoleContextValue>({ role: 'admin', setRole: () => {} })

const STORAGE_KEY = 'pn_demo_role'

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    if (typeof window === 'undefined') return 'admin'
    return (localStorage.getItem(STORAGE_KEY) as Role) || 'admin'
  })

  useEffect(() => { localStorage.setItem(STORAGE_KEY, role) }, [role])

  return <RoleContext.Provider value={{ role, setRole: setRoleState }}>{children}</RoleContext.Provider>
}

export const useRole = () => useContext(RoleContext)
