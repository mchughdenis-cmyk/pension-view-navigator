import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'

import { toast } from 'sonner'
import { Sparkles, Mail, Lock, User as UserIcon, Compass } from 'lucide-react'

export default function Auth() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)

  // Only redirect when there is an actual Supabase session — not a demo role
  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session) navigate('/dashboard', { replace: true })
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) navigate('/dashboard', { replace: true })
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [navigate])

  const resolveEmail = async (identifier: string): Promise<string | null> => {
    const id = identifier.trim()
    if (!id) return null
    if (id.includes('@')) return id
    const { data, error } = await (supabase.rpc as any)('email_for_identifier', { _identifier: id })
    if (error) { toast.error(error.message); return null }
    if (!data) { toast.error('No account found with that name'); return null }
    return data as string
  }

  const signIn = async () => {
    setLoading(true)
    const resolved = await resolveEmail(email)
    if (!resolved) { setLoading(false); return }
    const { error } = await supabase.auth.signInWithPassword({ email: resolved, password })
    setLoading(false)
    if (error) toast.error(error.message)
    else { toast.success('Welcome back'); navigate('/dashboard') }
  }

  const signUp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: displayName || email.split('@')[0] },
      },
    })
    setLoading(false)
    if (error) toast.error(error.message)
    else toast.success('Account created — check your email to verify')
  }

  const signInGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) toast.error(error.message)
  }

  const takeTour = () => {
    navigate('/tour')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Pension Navigator by Airgead</CardTitle>
          <CardDescription>Sign in to manage your pension</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="space-y-3 pt-4">
              <div><Label><Mail className="h-3 w-3 inline mr-1" />Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><Label><Lock className="h-3 w-3 inline mr-1" />Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
              <Button className="w-full" onClick={signIn} disabled={loading || !email || !password}>{loading ? 'Signing in...' : 'Sign In'}</Button>
            </TabsContent>
            <TabsContent value="signup" className="space-y-3 pt-4">
              <div><Label><UserIcon className="h-3 w-3 inline mr-1" />Name</Label><Input value={displayName} onChange={e => setDisplayName(e.target.value)} /></div>
              <div><Label><Mail className="h-3 w-3 inline mr-1" />Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><Label><Lock className="h-3 w-3 inline mr-1" />Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
              <Button className="w-full" onClick={signUp} disabled={loading || !email || !password}>{loading ? 'Creating...' : 'Create Account'}</Button>
            </TabsContent>
          </Tabs>

          <div className="relative my-4"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div></div>

          <Button variant="outline" className="w-full" onClick={signInGoogle}>Continue with Google</Button>

          <div className="relative my-4"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Just exploring?</span></div></div>

          <Button variant="secondary" className="w-full" onClick={takeTour}>
            <Compass className="h-4 w-4 mr-2" /> Take the guided tour
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">Preview only — read-only walkthrough, no account needed</p>
        </CardContent>
      </Card>
    </div>
  )
}
