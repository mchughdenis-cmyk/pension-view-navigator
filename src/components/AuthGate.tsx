import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Loader2 } from 'lucide-react'

/**
 * Gates Pension Navigator app routes behind a registered account.
 * Visitors without a Supabase session are bounced to /auth.
 * Marketing site (/site), /auth, /overview remain public.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'in' | 'out'>('loading')
  const location = useLocation()

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setStatus(data.session ? 'in' : 'out')
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setStatus(session ? 'in' : 'out')
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] grid place-items-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    )
  }
  if (status === 'out') {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}
