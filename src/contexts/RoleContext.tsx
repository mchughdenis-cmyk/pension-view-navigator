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

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>('client')
  const [user, setUser] = useState<DemoUser>(DEFAULTS.client)
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
      setRoleState('client')
    } else {
      const roles = (data ?? []).map(r => r.role as Role)
      const resolved = ROLE_PRECEDENCE.find(r => roles.includes(r)) ?? 'client'
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
    // Subscribe to auth changes synchronously, then fetch state.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (sess?.user) {
        setSession(true)
        // Defer DB call to avoid deadlocks inside the callback
        setTimeout(() => {
          loadRoleFor(
            sess.user.id,
            sess.user.email ?? null,
            (sess.user.user_metadata?.display_name as string | undefined) ?? null,
          )
        }, 0)
      } else {
        setSession(false)
        setRoleState('client')
        setUser(DEFAULTS.client)
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

  // Role mutation helpers are kept for backward compatibility but are now
  // local-only UI hints; the real role is enforced server-side via RLS.
  const setRole = (r: Role) => setRoleState(r)
  const switchRole = (r: Role, override?: Partial<DemoUser>) => {
    setRoleState(r)
    setUser(prev => ({ ...prev, ...override, role: r }))
  }
  const enterDemoMode = () => {} // no-op: demo mode no longer bypasses auth

  return (
    <RoleContext.Provider value={{ role, user, session, loading, setRole, switchRole, enterDemoMode }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => useContext(RoleContext)
