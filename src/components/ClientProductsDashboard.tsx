import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { 
  Wallet, 
  TrendingUp, 
  PiggyBank, 
  DollarSign, 
  FileText, 
  Settings,
  LogOut,
  Shield,
  ArrowRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ClientProductsDashboard() {
  const navigate = useNavigate()

  const handleSignOut = () => {
    // Mock sign out - navigate back to login
    window.location.href = '/'
  }

  const products = [
    {
      id: 'pension-portfolio',
      title: 'Pension Portfolio',
      description: 'View your pension investments and performance',
      value: '£287,450',
      status: 'Active',
      icon: Wallet,
      route: '/portfolio',
      color: 'bg-primary text-primary-foreground'
    },
    {
      id: 'drawdown',
      title: 'Drawdown Planning',
      description: 'Manage your pension withdrawals',
      value: '£2,850/month',
      status: 'Active',
      icon: TrendingUp,
      route: '/drawdown',
      color: 'bg-success text-success-foreground'
    },
    {
      id: 'drip-feed',
      title: 'Regular Income',
      description: 'Set up automatic regular payments',
      value: '£1,200/month',
      status: 'Scheduled',
      icon: PiggyBank,
      route: '/drip-feed',
      color: 'bg-secondary text-secondary-foreground'
    },
    {
      id: 'transfers',
      title: 'Transfers',
      description: 'Move funds between pension schemes',
      value: 'Available',
      status: 'Ready',
      icon: DollarSign,
      route: '/transfer',
      color: 'bg-accent text-accent-foreground'
    },
    {
      id: 'documents',
      title: 'Annual Summary',
      description: 'View your yearly pension statements',
      value: '2024 Report',
      status: 'Available',
      icon: FileText,
      route: '/annual-summary',
      color: 'bg-muted text-muted-foreground'
    },
    {
      id: 'welcome-pack',
      title: 'Welcome Pack',
      description: 'Get started with your pension journey',
      value: 'Complete',
      status: 'Available',
      icon: Shield,
      route: '/welcome-pack',
      color: 'bg-warning text-warning-foreground'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-muted via-background to-secondary-muted">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
              <p className="text-muted-foreground">demo@example.com</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Your Products & Services</h2>
          <p className="text-muted-foreground">Manage your pension and investment products from one place</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const IconComponent = product.icon
            return (
              <Card 
                key={product.id} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group border"
                onClick={() => navigate(product.route)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${product.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {product.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {product.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-foreground">
                      {product.value}
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate('/illustration')}>
              View Pension Illustration
            </Button>
            <Button variant="outline" onClick={() => navigate('/onboarding')}>
              Complete Onboarding
            </Button>
            <Button variant="outline" onClick={() => navigate('/transfer-out')}>
              Transfer Out Process
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}