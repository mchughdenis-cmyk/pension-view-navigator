import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'

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
  loading: boolean
  setRole: (r: Role) => void
  switchRole: (r: Role, override?: Partial<DemoUser>) => void
  enterDemoMode: () => void
}

// Role precedence when a user has multiple roles
const ROLE_PRECEDENCE: Role[] = ['admin', 'adviser', 'client']

const DEFAULTS: Record<Role, DemoUser> = {
  client: { id: 'demo-client', name: 'Sarah Thompson', email: 'sarah@example.com', role: 'client' },
  adviser: { id: 'demo-adviser', name: 'James Caldwell', email: 'james@airgead.co.uk', role: 'adviser' },
  admin: { id: 'demo-admin', name: 'System Admin', email: 'admin@airgead.co.uk', role: 'admin' },
}

const RoleContext = createContext<RoleContextValue>({
  role: 'client', user: DEFAULTS.client, session: false, loading: true,
  setRole: () => {}, switchRole: () => {}, enterDemoMode: () => {},
})

const DEMO_ROLE_KEY = 'airgead:demoRole'
function readDemoRole(): Role {
  try {
    const r = localStorage.getItem(DEMO_ROLE_KEY) as Role | null
    if (r === 'client' || r === 'adviser' || r === 'admin') return r
  } catch { /* ignore */ }
  // Default to admin so the operator console + all daily-desk pages
  // are reachable without signing in (auth wall is currently disabled).
  return 'admin'
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => readDemoRole())
  const [user, setUser] = useState<DemoUser>(() => DEFAULTS[readDemoRole()])
  const [session, setSession] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load the authoritative role for the current authenticated user
  async function loadRoleFor(userId: string, email: string | null, displayName: string | null) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
    if (error) {
      console.warn('Failed to load user_roles', error.message)
      setRoleState(readDemoRole())
    } else {
      const roles = (data ?? []).map(r => r.role as Role)
      const resolved = ROLE_PRECEDENCE.find(r => roles.includes(r)) ?? readDemoRole()
      setRoleState(resolved)
      setUser({
        id: userId,
        email: email ?? '',
        name: displayName ?? (email?.split('@')[0] ?? 'User'),
        role: resolved,
      })
    }
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (sess?.user) {
        setSession(true)
        setTimeout(() => {
          loadRoleFor(
            sess.user.id,
            sess.user.email ?? null,
            (sess.user.user_metadata?.display_name as string | undefined) ?? null,
          )
        }, 0)
      } else {
        setSession(false)
        const demo = readDemoRole()
        setRoleState(demo)
        setUser(DEFAULTS[demo])
      }
    })

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      if (sess?.user) {
        setSession(true)
        loadRoleFor(
          sess.user.id,
          sess.user.email ?? null,
          (sess.user.user_metadata?.display_name as string | undefined) ?? null,
        ).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    return () => { subscription.unsubscribe() }
  }, [])

  // Persist demo role so the sidebar/route gates stay stable across reloads.
  const persist = (r: Role) => { try { localStorage.setItem(DEMO_ROLE_KEY, r) } catch { /* ignore */ } }
  const setRole = (r: Role) => { persist(r); setRoleState(r) }
  const switchRole = (r: Role, override?: Partial<DemoUser>) => {
    persist(r)
    setRoleState(r)
    setUser(prev => ({ ...(DEFAULTS[r]), ...prev, ...override, role: r }))
  }
  const enterDemoMode = () => {} // no-op: demo mode no longer bypasses auth

  return (
    <RoleContext.Provider value={{ role, user, session, loading, setRole, switchRole, enterDemoMode }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => useContext(RoleContext)
