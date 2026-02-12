import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MobileHeader } from '@/components/ui/mobile-header'
import { 
  Wallet, 
  TrendingUp, 
  PiggyBank, 
  DollarSign, 
  FileText, 
  Settings,
  LogOut,
  Shield,
  ArrowRight,
  User,
  Banknote,
  BookOpen,
  ArrowLeftRight,
  CreditCard,
  Book,
  Briefcase,
  RefreshCw,
  GraduationCap,
  Building2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useRole } from '@/contexts/RoleContext'

export default function ClientView() {
  const navigate = useNavigate()
  const { user, switchRole } = useRole()

  const handleSignOut = () => {
    window.location.href = '/'
  }

  // Mock client data
  const clientData = {
    portfolioValue: 287450,
    monthlyIncome: 2850,
    regularPayments: 1200,
    lastContribution: 5000,
    riskProfile: 'Balanced',
    adviser: 'Sarah Johnson'
  }

  const productCategories = [
    {
      id: 'portfolio',
      title: 'Portfolio & Investments',
      icon: Briefcase,
      items: [
        {
          id: 'pension-portfolio',
          title: 'My Pension Portfolio',
          description: 'View your pension investments and performance',
          value: `£${clientData.portfolioValue.toLocaleString()}`,
          status: 'Active',
          icon: Wallet,
          route: '/portfolio',
          color: 'bg-primary text-primary-foreground'
        },
        {
          id: 'isa-portfolio',
          title: 'Stocks & Shares ISA',
          description: 'Tax-free investment account',
          value: '£87,650',
          status: 'Active',
          icon: Shield,
          route: '/isa',
          color: 'bg-success text-success-foreground'
        },
        {
          id: 'gia-portfolio',
          title: 'General Investment Account',
          description: 'Flexible investment account',
          value: '£145,200',
          status: 'Active',
          icon: Briefcase,
          route: '/gia',
          color: 'bg-accent text-accent-foreground'
        },
        {
          id: 'instrument-transfer',
          title: 'Instrument Transfers',
          description: 'Track individual stock and fund transfers',
          value: '5 Lines',
          status: 'In Progress',
          icon: ArrowLeftRight,
          route: '/instrument-transfer',
          color: 'bg-primary text-primary-foreground'
        }
      ]
    },
    {
      id: 'income',
      title: 'Income & Withdrawals',
      icon: Banknote,
      items: [
        {
          id: 'drawdown',
          title: 'Drawdown Planning',
          description: 'Manage your pension withdrawals',
          value: `£${clientData.monthlyIncome}/month`,
          status: 'Active',
          icon: TrendingUp,
          route: '/drawdown',
          color: 'bg-success text-success-foreground'
        },
        {
          id: 'instant-withdrawal',
          title: 'Instant Withdrawal',
          description: 'Withdraw funds directly to your bank account',
          value: 'Available',
          status: 'Ready',
          icon: Banknote,
          route: '/instant-withdrawal',
          color: 'bg-primary text-primary-foreground'
        },
        {
          id: 'drip-feed',
          title: 'Regular Income',
          description: 'Your automatic regular payments',
          value: `£${clientData.regularPayments}/month`,
          status: 'Scheduled',
          icon: PiggyBank,
          route: '/drip-feed',
          color: 'bg-secondary text-secondary-foreground'
        }
      ]
    },
    {
      id: 'transfers',
      title: 'Transfers & Payments',
      icon: RefreshCw,
      items: [
        {
          id: 'transfers',
          title: 'Pension Transfers',
          description: 'Move funds between pension schemes',
          value: 'Available',
          status: 'Ready',
          icon: DollarSign,
          route: '/transfer',
          color: 'bg-accent text-accent-foreground'
        },
        {
          id: 'payments',
          title: 'Payment Provider',
          description: 'Manage contributions and withdrawals',
          value: '2 Methods',
          status: 'Active',
          icon: CreditCard,
          route: '/payments',
          color: 'bg-secondary text-secondary-foreground'
        }
      ]
    },
    {
      id: 'documents',
      title: 'Documents & Reports',
      icon: FileText,
      items: [
        {
          id: 'annual-summary',
          title: 'Annual Summary',
          description: 'View your yearly pension statements',
          value: '2024 Report',
          status: 'Available',
          icon: FileText,
          route: '/annual-summary',
          color: 'bg-muted text-muted-foreground'
        },
        {
          id: 'documentation',
          title: 'System Documentation',
          description: 'Complete guide to all features and functionality',
          value: 'View Guide',
          status: 'Available',
          icon: Book,
          route: '/documentation',
          color: 'bg-accent text-accent-foreground'
        }
      ]
    },
    {
      id: 'onboarding',
      title: 'Getting Started',
      icon: GraduationCap,
      items: [
        {
          id: 'welcome-pack',
          title: 'Welcome Pack',
          description: 'Get started with your pension journey',
          value: 'Complete',
          status: 'Available',
          icon: Shield,
          route: '/welcome-pack',
          color: 'bg-warning text-warning-foreground'
        },
        {
          id: 'kyc-verification',
          title: 'KYC/AML Verification',
          description: 'Complete your identity and compliance checks',
          value: 'In Review',
          status: 'Pending',
          icon: Shield,
          route: '/kyc',
          color: 'bg-primary text-primary-foreground'
        },
        {
          id: 'learning',
          title: 'Learning Centre',
          description: 'Build your pension & investment knowledge',
          value: '12 Modules',
          status: 'Active',
          icon: BookOpen,
          route: '/learning',
          color: 'bg-success text-success-foreground'
        }
      ]
    }
  ]

  const headerActions = (
    <>
      <Button variant="outline" size="sm" onClick={() => switchRole('adviser')} className="w-full sm:w-auto justify-start">
        <User className="w-4 h-4 mr-2" />
        Switch to Adviser
      </Button>
      <Button variant="outline" size="sm" onClick={() => switchRole('admin')} className="w-full sm:w-auto justify-start">
        <Shield className="w-4 h-4 mr-2" />
        Switch to Admin
      </Button>
      <Button variant="outline" size="sm" onClick={() => navigate('/admin')} className="w-full sm:w-auto justify-start">
        <Building2 className="w-4 h-4 mr-2" />
        Admin Dashboard
      </Button>
      <Button variant="outline" size="sm" onClick={() => navigate('/settings')} className="w-full sm:w-auto justify-start">
        <Settings className="w-4 h-4 mr-2" />
        Settings
      </Button>
      <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full sm:w-auto justify-start">
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-muted via-background to-secondary-muted">
      {/* Header */}
      <MobileHeader
        title={`Welcome back, ${user?.name}`}
        subtitle={user?.email}
        badge={
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">Client View</Badge>
            <span className="text-sm text-muted-foreground">Adviser: {clientData.adviser}</span>
          </div>
        }
        actions={headerActions}
      />

      {/* Demo Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Card className="bg-gradient-to-r from-primary to-secondary text-primary-foreground border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-background/10 rounded-full">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Experience the Full System</h3>
                  <p className="text-primary-foreground/90">
                    Take an interactive tour from onboarding through drawdown
                  </p>
                </div>
              </div>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/demo')}
                className="whitespace-nowrap"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Launch System Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pension</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                £{clientData.portfolioValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">SIPP Portfolio</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">ISA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">£87,650</div>
              <p className="text-xs text-muted-foreground mt-1">S&S ISA</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">GIA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent-foreground">£145,200</div>
              <p className="text-xs text-muted-foreground mt-1">General Investment</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Drawdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                £{clientData.monthlyIncome.toLocaleString()}/mo
              </div>
              <p className="text-xs text-muted-foreground mt-1">Next: Feb 1st</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">£520,300</div>
              <p className="text-xs text-muted-foreground mt-1">All accounts</p>
            </CardContent>
          </Card>
        </div>

        {/* Products & Services */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">My Products & Services</h2>
          <p className="text-muted-foreground">Access your pension products and manage your investments</p>
        </div>

        <Accordion type="multiple" defaultValue={['portfolio', 'income']} className="space-y-4">
          {productCategories.map((category) => {
            const CategoryIcon = category.icon
            return (
              <AccordionItem 
                key={category.id} 
                value={category.id}
                className="bg-card border rounded-lg px-4 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <CategoryIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <span className="text-lg font-semibold">{category.title}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({category.items.length} items)
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 pb-2">
                    {category.items.map((product) => {
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
                              <div className="text-xl font-bold text-foreground">
                                {product.value}
                              </div>
                              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>

        {/* Quick Actions */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate('/illustration')}>
              View Pension Illustration
            </Button>
            <Button variant="outline" onClick={() => navigate('/onboarding')}>
              Update Personal Details
            </Button>
            <Button variant="outline" onClick={() => navigate('/transfer-out')}>
              Request Transfer Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}