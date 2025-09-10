import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BackButton } from '@/components/ui/back-button'
import { Badge } from '@/components/ui/badge'
import { Upload, Palette, Save, RotateCcw, User, Shield, Users, GitBranch, ArrowRight, CheckCircle, AlertCircle, Clock, TrendingUp, PiggyBank, Wallet, FileText, Calculator, UserCheck, Building, CreditCard, Banknote } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRole } from '@/contexts/RoleContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const colorThemes = [
  {
    name: 'Ocean Blue',
    primary: '220 91% 57%',
    secondary: '210 100% 98%',
    accent: '213 92% 95%',
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%'
  },
  {
    name: 'Forest Green',
    primary: '142 76% 36%',
    secondary: '138 62% 96%',
    accent: '138 76% 97%',
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%'
  },
  {
    name: 'Royal Purple',
    primary: '262 83% 58%',
    secondary: '270 95% 98%',
    accent: '270 95% 96%',
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%'
  },
  {
    name: 'Sunset Orange',
    primary: '25 95% 53%',
    secondary: '25 100% 97%',
    accent: '25 100% 95%',
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%'
  },
  {
    name: 'Corporate Gray',
    primary: '210 11% 15%',
    secondary: '210 40% 98%',
    accent: '210 40% 96%',
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%'
  }
]

export default function Settings() {
  const [logo, setLogo] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState(0)
  const { toast } = useToast()
  const { user, switchRole } = useRole()

  useEffect(() => {
    // Load saved settings from localStorage
    const savedLogo = localStorage.getItem('company-logo')
    const savedTheme = localStorage.getItem('color-theme')
    
    if (savedLogo) {
      setLogo(savedLogo)
    }
    
    if (savedTheme) {
      setSelectedTheme(parseInt(savedTheme))
      applyTheme(colorThemes[parseInt(savedTheme)])
    }
  }, [])

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 2MB",
          variant: "destructive"
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLogo(result)
        localStorage.setItem('company-logo', result)
        toast({
          title: "Logo uploaded",
          description: "Your company logo has been updated successfully"
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const applyTheme = (theme: typeof colorThemes[0]) => {
    const root = document.documentElement
    root.style.setProperty('--primary', theme.primary)
    root.style.setProperty('--secondary', theme.secondary)
    root.style.setProperty('--accent', theme.accent)
    root.style.setProperty('--background', theme.background)
    root.style.setProperty('--foreground', theme.foreground)
  }

  const handleThemeChange = (themeIndex: number) => {
    setSelectedTheme(themeIndex)
    applyTheme(colorThemes[themeIndex])
    localStorage.setItem('color-theme', themeIndex.toString())
    toast({
      title: "Theme updated",
      description: `Applied ${colorThemes[themeIndex].name} theme`
    })
  }

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "All your customizations have been saved successfully"
    })
  }

  const handleResetSettings = () => {
    setLogo(null)
    setSelectedTheme(0)
    localStorage.removeItem('company-logo')
    localStorage.removeItem('color-theme')
    
    // Reset to default theme
    applyTheme(colorThemes[0])
    
    toast({
      title: "Settings reset",
      description: "All customizations have been reset to defaults"
    })
  }

  const removeLogo = () => {
    setLogo(null)
    localStorage.removeItem('company-logo')
    toast({
      title: "Logo removed",
      description: "Company logo has been removed"
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-muted via-background to-secondary-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
              <p className="text-muted-foreground">Customize your application appearance and branding</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{user?.role} View</Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Role Switching Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                View Switching
              </CardTitle>
              <CardDescription>
                Switch between different user perspectives to test functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant={user?.role === 'client' ? 'default' : 'outline'}
                  onClick={() => switchRole('client')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Client View
                </Button>
                <Button 
                  variant={user?.role === 'adviser' ? 'default' : 'outline'}
                  onClick={() => switchRole('adviser')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Adviser View
                </Button>
                <Button 
                  variant={user?.role === 'admin' ? 'default' : 'outline'}
                  onClick={() => switchRole('admin')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Admin View
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Current role: <strong>{user?.role}</strong> - {user?.name} ({user?.email})
              </p>
            </CardContent>
          </Card>

          {/* Company Logo Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Company Logo
              </CardTitle>
              <CardDescription>
                Upload your company logo to personalize the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {logo && (
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <img 
                    src={logo} 
                    alt="Company Logo" 
                    className="h-16 w-auto object-contain"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Current Logo</p>
                    <p className="text-xs text-muted-foreground">Click upload to replace</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={removeLogo}>
                    Remove
                  </Button>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Upload Logo</Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: PNG or SVG format, max 2MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Color Theme Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Color Theme
              </CardTitle>
              <CardDescription>
                Choose a color palette that matches your brand
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {colorThemes.map((theme, index) => (
                  <div
                    key={theme.name}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedTheme === index ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleThemeChange(index)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-6 h-6 rounded-full border border-border"
                        style={{ backgroundColor: `hsl(${theme.primary})` }}
                      />
                      <span className="font-medium text-sm">{theme.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: `hsl(${theme.primary})` }}
                      />
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: `hsl(${theme.secondary})` }}
                      />
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: `hsl(${theme.accent})` }}
                      />
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: `hsl(${theme.background})` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Workflow Journey Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Workflow Journeys
              </CardTitle>
              <CardDescription>
                Visual representation of the accumulation and drawdown processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="accumulation" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="accumulation">
                    <PiggyBank className="w-4 h-4 mr-2" />
                    Accumulation Phase
                  </TabsTrigger>
                  <TabsTrigger value="drawdown">
                    <Wallet className="w-4 h-4 mr-2" />
                    Drawdown Phase
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="accumulation" className="space-y-4 mt-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg mb-4">Accumulation Journey</h3>
                    
                    {/* Accumulation Steps */}
                    <div className="relative">
                      <div className="absolute left-5 top-8 bottom-0 w-0.5 bg-border"></div>
                      
                      <div className="space-y-6">
                        <div className="flex gap-4">
                          <div className="relative z-10 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">1. Client Onboarding</h4>
                            <p className="text-sm text-muted-foreground mt-1">Initial registration and KYC verification</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">Identity Verification</Badge>
                              <Badge variant="outline">Risk Assessment</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <div className="relative z-10 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <Calculator className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">2. Pension Planning</h4>
                            <p className="text-sm text-muted-foreground mt-1">Setting retirement goals and contribution strategies</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">Goal Setting</Badge>
                              <Badge variant="outline">Projection Models</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <div className="relative z-10 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">3. Regular Contributions</h4>
                            <p className="text-sm text-muted-foreground mt-1">Monthly deposits and employer matching</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">Auto-deposits</Badge>
                              <Badge variant="outline">Tax Relief</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <div className="relative z-10 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">4. Annual Reviews</h4>
                            <p className="text-sm text-muted-foreground mt-1">Performance tracking and portfolio rebalancing</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">Performance Reports</Badge>
                              <Badge variant="outline">Adjustments</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <div className="relative z-10 w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">5. Retirement Ready</h4>
                            <p className="text-sm text-muted-foreground mt-1">Transition to drawdown phase when eligible</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary">Age 55+</Badge>
                              <Badge variant="secondary">Full Benefits</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="drawdown" className="space-y-4 mt-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg mb-4">Drawdown Journey</h3>
                    
                    {/* Drawdown Steps */}
                    <div className="relative">
                      <div className="absolute left-5 top-8 bottom-0 w-0.5 bg-border"></div>
                      
                      <div className="space-y-6">
                        <div className="flex gap-4">
                          <div className="relative z-10 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">1. Drawdown Request</h4>
                            <p className="text-sm text-muted-foreground mt-1">Client initiates withdrawal request</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">Eligibility Check</Badge>
                              <Badge variant="outline">Options Review</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <div className="relative z-10 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <Calculator className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">2. Tax-Free Cash</h4>
                            <p className="text-sm text-muted-foreground mt-1">Option to take 25% tax-free lump sum</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">25% Tax-Free</Badge>
                              <Badge variant="outline">Calculation</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <div className="relative z-10 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <Building className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">3. Bank Account Setup</h4>
                            <p className="text-sm text-muted-foreground mt-1">Nominate and verify bank details</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">Account Verification</Badge>
                              <Badge variant="outline">Security Checks</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <div className="relative z-10 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <Clock className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">4. Regular Income</h4>
                            <p className="text-sm text-muted-foreground mt-1">Set up regular or ad-hoc withdrawals</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">Monthly Income</Badge>
                              <Badge variant="outline">Instant Access</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <div className="relative z-10 w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">5. Instant Withdrawal</h4>
                            <p className="text-sm text-muted-foreground mt-1">Quick access to funds already in drawdown</p>
                            <div className="flex gap-2 mt-2">
                              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">Fast Track</Badge>
                              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">Same Day</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <div className="relative z-10 w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                            <Banknote className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">6. Payment Complete</h4>
                            <p className="text-sm text-muted-foreground mt-1">Funds transferred to nominated account</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary">Confirmation</Badge>
                              <Badge variant="secondary">Tax Statement</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-900 dark:text-orange-200">Fast Track Option Available</p>
                          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                            Clients with funds already in drawdown can use the instant withdrawal feature for same-day transfers to their nominated bank account, bypassing the full drawdown journey.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleSaveSettings} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
            <Button variant="outline" onClick={handleResetSettings}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}