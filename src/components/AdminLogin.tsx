import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useNavigate } from 'react-router-dom'
import { Shield, Lock, User, Eye, EyeOff, Building2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [twoFactorRequired, setTwoFactorRequired] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate authentication
    setTimeout(() => {
      if (email && password) {
        if (!twoFactorRequired) {
          setTwoFactorRequired(true)
          setIsLoading(false)
          toast({
            title: "2FA Required",
            description: "Please enter your authentication code",
          })
        } else if (twoFactorCode.length === 6) {
          toast({
            title: "Login Successful",
            description: "Welcome to the Pension Admin Portal",
          })
          navigate('/admin')
        } else {
          setIsLoading(false)
          toast({
            title: "Invalid Code",
            description: "Please enter a valid 6-digit code",
            variant: "destructive"
          })
        }
      } else {
        setIsLoading(false)
        toast({
          title: "Login Failed",
          description: "Please check your credentials",
          variant: "destructive"
        })
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Pension Admin Portal</h1>
          <p className="text-slate-400 mt-1">Secure Administration Access</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600/20 mx-auto mb-2">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <CardTitle className="text-white">
              {twoFactorRequired ? 'Two-Factor Authentication' : 'Administrator Login'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {twoFactorRequired 
                ? 'Enter the 6-digit code from your authenticator app'
                : 'Enter your credentials to access the admin portal'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {!twoFactorRequired ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@pension-provider.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-slate-400">
                      <input type="checkbox" className="rounded border-slate-600 bg-slate-700" />
                      Remember this device
                    </label>
                    <a href="#" className="text-blue-400 hover:text-blue-300">Forgot password?</a>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="2fa" className="text-slate-300">Authentication Code</Label>
                    <Input
                      id="2fa"
                      type="text"
                      placeholder="000000"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center text-2xl tracking-widest bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    Don't have access to your authenticator?{' '}
                    <a href="#" className="text-blue-400 hover:text-blue-300">Use backup code</a>
                  </p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {twoFactorRequired ? 'Verifying...' : 'Authenticating...'}
                  </span>
                ) : (
                  twoFactorRequired ? 'Verify & Login' : 'Sign In'
                )}
              </Button>

              {twoFactorRequired && (
                <Button 
                  type="button"
                  variant="ghost"
                  className="w-full text-slate-400 hover:text-white"
                  onClick={() => setTwoFactorRequired(false)}
                >
                  Back to Login
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            🔒 This is a secure portal. All access attempts are logged and monitored.
          </p>
          <p className="text-xs text-slate-600 mt-2">
            © 2024 Pension Administration System. FCA Regulated.
          </p>
        </div>

        {/* Quick Access for Demo */}
        <div className="mt-4 text-center">
          <Button 
            variant="link" 
            className="text-slate-500 hover:text-slate-300 text-xs"
            onClick={() => navigate('/')}
          >
            Return to Client Portal
          </Button>
        </div>
      </div>
    </div>
  )
}
