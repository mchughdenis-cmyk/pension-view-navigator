import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { Session } from '@supabase/supabase-js'

export type UserRole = 'client' | 'adviser' | 'admin' | 'demo'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  adviserId?: string
  isDemo?: boolean
}

interface RoleContextType {
  user: User | null
  session: Session | null
  loading: boolean
  setUser: (user: User | null) => void
  switchRole: (role: UserRole, userData?: Partial<User>) => void
  signOut: () => Promise<void>
  enterDemoMode: () => void
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

const DEFAULT_DEMO_USER: User = {
  id: 'demo-guest',
  name: 'Demo Guest',
  email: 'demo@pension-navigator.local',
  role: 'admin', // Demo guests get admin view of the showcase
  isDemo: true,
}

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1) Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession?.user) {
        loadUserProfile(newSession.user.id, newSession.user.email || '')
      } else {
        // No session — fall back to demo if previously in demo, otherwise null
        const stored = localStorage.getItem('current-user')
        if (stored) {
          try { setUser(JSON.parse(stored)) } catch { setUser(null) }
        } else {
          setUser(null)
        }
      }
    })

    // 2) THEN check existing session
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing)
      if (existing?.user) {
        loadUserProfile(existing.user.id, existing.user.email || '')
      } else {
        // No real session — load demo from storage if present
        const stored = localStorage.getItem('current-user')
        if (stored) {
          try { setUser(JSON.parse(stored)) } catch {}
        }
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string, email: string) => {
    // Defer to avoid Supabase deadlock in onAuthStateChange
    setTimeout(async () => {
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id', userId),
      ])
      const roleSet = new Set((roles || []).map(r => r.role))
      const role: UserRole = roleSet.has('admin') ? 'admin' : roleSet.has('adviser') ? 'adviser' : 'client'
      setUser({
        id: userId,
        name: profile?.display_name || email.split('@')[0],
        email,
        role,
        isDemo: false,
      })
    }, 0)
  }

  const switchRole = (role: UserRole, userData: Partial<User> = {}) => {
    // Only available in demo mode (real users get role from user_roles table)
    if (user && !user.isDemo && session) {
      console.warn('switchRole disabled for authenticated users')
      return
    }
    const newUser: User = {
      ...DEFAULT_DEMO_USER,
      ...userData,
      role,
      id: userData.id || `demo-${role}`,
      name: userData.name || (role === 'admin' ? 'Demo Admin' : role === 'adviser' ? 'Demo Adviser' : 'Demo Client'),
      isDemo: true,
    }
    setUser(newUser)
    localStorage.setItem('current-user', JSON.stringify(newUser))
  }

  const enterDemoMode = () => {
    setUser(DEFAULT_DEMO_USER)
    localStorage.setItem('current-user', JSON.stringify(DEFAULT_DEMO_USER))
  }

  const signOut = async () => {
    if (session) await supabase.auth.signOut()
    localStorage.removeItem('current-user')
    setUser(null)
    setSession(null)
  }

  return (
    <RoleContext.Provider value={{ user, session, loading, setUser, switchRole, signOut, enterDemoMode }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => {
  const context = useContext(RoleContext)
  if (context === undefined) throw new Error('useRole must be used within a RoleProvider')
  return context
}
