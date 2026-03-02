import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signIn, signUp, user } = useAuth()
  const { toast } = useToast()

  // Redirect if already authenticated
  if (user) {
    navigate('/dashboard', { replace: true })
    return null
  }

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({ title: 'Missing fields', description: 'Please enter email and password', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (error: any) {
      toast({ title: 'Sign in failed', description: error.message || 'Please check your credentials', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!email || !password) {
      toast({ title: 'Missing fields', description: 'Please enter email and password', variant: 'destructive' })
      return
    }
    if (password.length < 6) {
      toast({ title: 'Weak password', description: 'Password must be at least 6 characters', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      await signUp(email, password)
      toast({ title: 'Account created', description: 'Please check your email to verify your account' })
    } catch (error: any) {
      toast({ title: 'Sign up failed', description: error.message || 'Please try again', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-muted via-background to-secondary-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-full">
              <Shield className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Pension Navigator</h1>
          <p className="text-muted-foreground">Secure access to your financial future</p>
        </div>

        <Card className="border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to access your pension dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleSignIn}
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleSignUp}
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-4 border-t">
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground hover:text-foreground gap-2"
                onClick={() => navigate('/admin-login')}
              >
                <Lock className="w-4 h-4" />
                Admin System Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
