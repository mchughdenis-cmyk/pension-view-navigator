import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import airgeadLogo from '@/assets/airgead-logo.png'
import {
  Shield, Users, TrendingUp, Wallet, PiggyBank, FileText,
  ArrowRight, CheckCircle, BarChart3, Settings, Lock,
  Briefcase, CreditCard, BookOpen, UserPlus, ClipboardList,
  RefreshCw, Eye, Bell, Banknote, GraduationCap,
  ArrowLeftRight, Building2, ChevronRight, Layers, Zap,
  Globe, Server, Smartphone
} from 'lucide-react'

const features = [
  {
    category: 'Client Portal',
    icon: Users,
    color: 'bg-primary/10 text-primary',
    description: 'Empower clients with full visibility into their pension, ISA, and GIA portfolios.',
    items: [
      { icon: Wallet, label: 'Multi-wrapper portfolio view (SIPP, ISA, GIA)' },
      { icon: TrendingUp, label: 'Real-time performance tracking & analytics' },
      { icon: Banknote, label: 'Drawdown planning & instant withdrawals' },
      { icon: PiggyBank, label: 'Regular income (drip-feed) management' },
      { icon: CreditCard, label: 'Integrated payment provider' },
      { icon: FileText, label: 'Annual statements & document library' },
      { icon: GraduationCap, label: 'Learning centre with guided modules' },
      { icon: Shield, label: 'Digital welcome pack & KYC/AML verification' },
    ]
  },
  {
    category: 'Adviser Dashboard',
    icon: Briefcase,
    color: 'bg-secondary/10 text-secondary',
    description: 'Give advisers the tools to manage clients efficiently with full operational oversight.',
    items: [
      { icon: Users, label: 'Client book management with search & filters' },
      { icon: Eye, label: 'Deep client drill-down with admin actions' },
      { icon: BarChart3, label: 'Portfolio analytics & performance reporting' },
      { icon: Bell, label: 'Alerts, tasks & workflow notifications' },
      { icon: UserPlus, label: 'New client onboarding & transfers' },
      { icon: ClipboardList, label: 'Compliance & regulatory tools' },
      { icon: ArrowLeftRight, label: 'Instrument & pension transfer tracking' },
      { icon: BookOpen, label: 'Fee management & adviser charging' },
    ]
  },
  {
    category: 'Administration Platform',
    icon: Building2,
    color: 'bg-warning/10 text-warning',
    description: 'Enterprise-grade back-office with scheme management, reconciliation, and reporting.',
    items: [
      { icon: Layers, label: 'Scheme dashboard with multi-entity support' },
      { icon: RefreshCw, label: 'Trade order management & execution' },
      { icon: BarChart3, label: 'Custody reconciliation & audit trail' },
      { icon: FileText, label: 'Regulatory reporting (FCA, HMRC)' },
      { icon: Settings, label: 'Fee engine & bulk operations' },
      { icon: ClipboardList, label: 'Workflow engine with approval chains' },
      { icon: CreditCard, label: 'Transaction ledger & pooled accounts' },
      { icon: FileText, label: 'Document generation & Origo transfers' },
    ]
  },
]

const highlights = [
  { icon: Zap, title: 'End-to-End', description: 'From onboarding to drawdown, every step is covered in one unified platform.' },
  { icon: Lock, title: 'Secure by Design', description: 'Enterprise-grade security with KYC/AML verification and full audit trails.' },
  { icon: Globe, title: 'Multi-Wrapper', description: 'SIPP, ISA, and GIA in a single view with cross-product analytics.' },
  { icon: Smartphone, title: 'Mobile-First', description: 'Responsive design with bottom-sheet navigation for seamless mobile use.' },
  { icon: Server, title: 'Real-Time', description: 'Live portfolio valuations, trade tracking, and instant withdrawal processing.' },
  { icon: Layers, title: 'Role-Based', description: 'Client, Adviser, and Admin views with contextual navigation and permissions.' },
]

export default function ShowcaseWebsite() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={airgeadLogo} alt="Airgead" className="w-9 h-9 rounded-lg" />
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold text-foreground">Pension Navigator</span>
              <span className="text-[10px] text-muted-foreground tracking-wider uppercase">by Airgead</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#platform" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Platform</a>
            <a href="#capabilities" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Capabilities</a>
            <a href="/api-directory" className="text-sm text-muted-foreground hover:text-foreground transition-colors">APIs</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
              Admin Area
            </Button>
            <Button size="sm" onClick={() => navigate('/dashboard')}>
              Open System
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
              Enterprise Pension Administration Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-tight mb-6">
              The Complete Platform for{' '}
              <span className="text-primary">Pension & Investment</span>{' '}
              Management
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              A unified system connecting clients, advisers, and administrators — from onboarding and KYC through portfolio management to drawdown and reporting.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/dashboard')} className="text-base px-8">
                Open Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/demo')} className="text-base px-8">
                <Eye className="w-5 h-5 mr-2" />
                Interactive Demo
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
            {[
              { value: '3', label: 'Role-Based Views' },
              { value: '25+', label: 'Feature Modules' },
              { value: '100%', label: 'Mobile Responsive' },
              { value: 'Real-Time', label: 'Data Processing' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section id="platform" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Built for the Modern Pension Industry</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every component designed to streamline operations, reduce risk, and deliver exceptional client experiences.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((h) => {
              const Icon = h.icon
              return (
                <Card key={h.title} className="border bg-card hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="p-3 rounded-lg bg-primary/10 w-fit mb-2">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{h.title}</CardTitle>
                    <CardDescription className="text-sm">{h.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Three Powerful Views, One Platform</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Each role gets a purpose-built interface with contextual navigation, breadcrumbs, and mobile-optimised drawers.
            </p>
          </div>

          <div className="space-y-12">
            {features.map((section) => {
              const SectionIcon = section.icon
              return (
                <Card key={section.category} className="overflow-hidden border">
                  <CardHeader className="bg-muted/30 border-b">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${section.color}`}>
                        <SectionIcon className="w-7 h-7" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{section.category}</CardTitle>
                        <CardDescription className="text-base mt-1">{section.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.items.map((item) => {
                        const ItemIcon = item.icon
                        return (
                          <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="p-1.5 rounded-md bg-primary/5 mt-0.5">
                              <ItemIcon className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm text-foreground leading-snug">{item.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section id="capabilities" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Complete Feature Set</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every module you need to run a pension administration business, built in and ready to go.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Pension Illustration Engine', route: '/illustration' },
              { label: 'Digital Welcome Pack', route: '/welcome-pack' },
              { label: 'Pension Transfer Journey', route: '/transfer' },
              { label: 'Client Onboarding', route: '/onboarding' },
              { label: 'Drawdown Planning', route: '/drawdown' },
              { label: 'Drip-Feed Drawdown', route: '/drip-feed' },
              { label: 'Transfer Out Processing', route: '/transfer-out' },
              { label: 'Annual Summary Reports', route: '/annual-summary' },
              { label: 'Instant Withdrawal', route: '/instant-withdrawal' },
              { label: 'Instrument Transfers', route: '/instrument-transfer' },
              { label: 'KYC/AML Verification', route: '/kyc' },
              { label: 'Payment Provider Integration', route: '/payments' },
              { label: 'Stocks & Shares ISA', route: '/isa' },
              { label: 'General Investment Account', route: '/gia' },
              { label: 'Learning Centre', route: '/learning' },
              { label: 'System Documentation', route: '/documentation' },
              { label: 'Integrations Hub', route: '/demo' },
              { label: 'Full System Demo', route: '/demo' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.route)}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-primary/5 hover:border-primary/20 transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-success shrink-0" />
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-12 md:p-16 text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Explore?</h2>
            <p className="text-primary-foreground/90 text-lg mb-8 max-w-xl mx-auto">
              Access the full test system with client, adviser, and admin views — no setup required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary" onClick={() => navigate('/dashboard')} className="text-base px-8">
                Open Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/demo')} className="text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                View Interactive Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={airgeadLogo} alt="Airgead" className="w-8 h-8 rounded-lg" />
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-foreground">Pension Navigator</span>
                <span className="text-[9px] text-muted-foreground tracking-wider uppercase">by Airgead</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <button onClick={() => navigate('/dashboard')} className="hover:text-foreground transition-colors">Client Dashboard</button>
              <button onClick={() => navigate('/admin')} className="hover:text-foreground transition-colors">Admin Dashboard</button>
              <button onClick={() => navigate('/documentation')} className="hover:text-foreground transition-colors">Documentation</button>
              <button onClick={() => navigate('/demo')} className="hover:text-foreground transition-colors">Demo</button>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            © 2026 Airgead. Pension Navigator — Enterprise Pension Administration Platform.
          </div>
        </div>
      </footer>
    </div>
  )
}
