import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BackButton } from '@/components/ui/back-button'
import { Badge } from '@/components/ui/badge'
import { Upload, Palette, Save, RotateCcw, User, Shield, Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRole } from '@/contexts/RoleContext'

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