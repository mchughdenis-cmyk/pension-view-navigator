import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Shield, Server, Globe, CreditCard, Users, FileText,
  BarChart3, Lock, RefreshCw, Banknote, BookOpen, Bell, Zap,
  Database, Mail, Phone, Eye, ClipboardList, ArrowLeftRight,
  Building2, Layers, CheckCircle, Settings, Smartphone, Key,
  Cloud, Cpu, Receipt, Scale, UserPlus, Search
} from 'lucide-react'

interface APIEntry {
  name: string
  description: string
  category: string
  icon: any
  status: 'live' | 'planned' | 'beta'
  methods?: string[]
  details?: string
}

const apiCategories = [
  {
    id: 'payments',
    title: 'Payments & Banking',
    icon: CreditCard,
    color: 'bg-primary/10 text-primary',
    apis: [
      { name: 'Card Payments API', description: 'Process debit/credit card contributions and one-off payments', icon: CreditCard, status: 'live' as const, methods: ['POST /payments/card', 'GET /payments/card/:id', 'POST /payments/card/refund'], details: 'PCI-DSS compliant card processing with 3D Secure authentication support.' },
      { name: 'EFT / Bank Transfer API', description: 'Electronic fund transfers for contributions and withdrawals', icon: Banknote, status: 'live' as const, methods: ['POST /payments/eft/initiate', 'GET /payments/eft/status/:id', 'POST /payments/eft/batch'], details: 'Supports BACS, Faster Payments, and CHAPS transfer methods.' },
      { name: 'Direct Debit API', description: 'Set up and manage recurring contribution mandates', icon: RefreshCw, status: 'live' as const, methods: ['POST /direct-debit/mandate', 'PUT /direct-debit/mandate/:id', 'DELETE /direct-debit/mandate/:id', 'GET /direct-debit/collections'], details: 'Direct Debit mandate management with automatic collection scheduling.' },
      { name: 'Instant Withdrawal API', description: 'Process same-day withdrawal requests to client bank accounts', icon: Zap, status: 'live' as const, methods: ['POST /withdrawals/instant', 'GET /withdrawals/instant/:id', 'GET /withdrawals/limits'], details: 'Real-time withdrawal processing with anti-fraud checks and daily limits.' },
      { name: 'Pooled Account Ledger', description: 'Track pooled account balances and reconcile client money', icon: Database, status: 'live' as const, methods: ['GET /pooled-account/balance', 'GET /pooled-account/transactions', 'POST /pooled-account/reconcile'], details: 'CASS-compliant client money segregation and reconciliation.' },
    ]
  },
  {
    id: 'investments',
    title: 'Investment & Trading',
    icon: BarChart3,
    color: 'bg-secondary/10 text-secondary',
    apis: [
      { name: 'Trade Order Management API', description: 'Submit, amend, and cancel trade orders across all wrappers', icon: ArrowLeftRight, status: 'live' as const, methods: ['POST /trades/order', 'PUT /trades/order/:id', 'DELETE /trades/order/:id', 'GET /trades/orders'], details: 'Supports market, limit, and stop orders across SIPP, ISA, and GIA wrappers.' },
      { name: 'Portfolio Valuation API', description: 'Real-time and end-of-day portfolio valuations', icon: BarChart3, status: 'live' as const, methods: ['GET /portfolio/:clientId/valuation', 'GET /portfolio/:clientId/holdings', 'GET /portfolio/:clientId/performance'], details: 'Live pricing from market data feeds with historical performance calculation.' },
      { name: 'Morningstar Data API', description: 'Fund research, ratings, risk metrics, and factsheets', icon: Search, status: 'live' as const, methods: ['GET /morningstar/fund/:isin', 'GET /morningstar/search', 'GET /morningstar/factsheet/:isin'], details: 'Morningstar fund data integration for research, screening, and client reporting.' },
      { name: 'Portfolio Rebalancing API', description: 'Model portfolio rebalancing with drift detection', icon: Scale, status: 'live' as const, methods: ['GET /rebalancing/drift/:portfolioId', 'POST /rebalancing/execute', 'GET /rebalancing/models'], details: 'Automatic drift detection with configurable thresholds and bulk rebalancing.' },
      { name: 'Instrument Transfer API', description: 'In-specie transfers of individual holdings between providers', icon: ArrowLeftRight, status: 'live' as const, methods: ['POST /transfers/instrument', 'GET /transfers/instrument/:id', 'GET /transfers/instrument/status'], details: 'Stock-level transfer tracking with CREST settlement integration.' },
    ]
  },
  {
    id: 'pensions',
    title: 'Pension & Transfers',
    icon: Shield,
    color: 'bg-warning/10 text-warning',
    apis: [
      { name: 'Origo Transfer API', description: 'Electronic pension transfer requests via Origo Options', icon: RefreshCw, status: 'live' as const, methods: ['POST /origo/transfer-in', 'POST /origo/transfer-out', 'GET /origo/transfer/:id/status'], details: 'Fully integrated with Origo Options for automated pension transfer processing.' },
      { name: 'Pension Illustration API', description: 'Generate SMPI-compliant pension illustrations', icon: FileText, status: 'live' as const, methods: ['POST /illustrations/generate', 'GET /illustrations/:id', 'GET /illustrations/assumptions'], details: 'Statutory Money Purchase Illustration generation with configurable assumptions.' },
      { name: 'Drawdown API', description: 'Manage flexi-access drawdown, UFPLS, and tax-free cash', icon: Banknote, status: 'live' as const, methods: ['POST /drawdown/request', 'GET /drawdown/schedule/:clientId', 'PUT /drawdown/schedule/:id', 'GET /drawdown/tax-free-cash/:clientId'], details: 'Flexible drawdown management with automatic tax calculation and HMRC reporting.' },
      { name: 'Drip-Feed Income API', description: 'Schedule and manage regular income payments from drawdown', icon: RefreshCw, status: 'live' as const, methods: ['POST /drip-feed/schedule', 'PUT /drip-feed/schedule/:id', 'GET /drip-feed/projections'], details: 'Natural yield and capital drawdown scheduling with sustainability projections.' },
      { name: 'Transfer Out API', description: 'Process outbound pension transfers with safeguarding checks', icon: ArrowLeftRight, status: 'live' as const, methods: ['POST /transfer-out/initiate', 'GET /transfer-out/:id', 'POST /transfer-out/safeguarding-check'], details: 'FCA-compliant transfer-out process with scam warning checks and cooling-off periods.' },
    ]
  },
  {
    id: 'compliance',
    title: 'Compliance & Regulatory',
    icon: Lock,
    color: 'bg-destructive/10 text-destructive',
    apis: [
      { name: 'KYC/AML Verification API', description: 'Identity verification, PEP/sanctions screening, and document checks', icon: Eye, status: 'live' as const, methods: ['POST /kyc/verify', 'GET /kyc/status/:clientId', 'POST /kyc/document-upload', 'GET /kyc/screening/:clientId'], details: 'Automated ID&V with PEP, sanctions, and adverse media screening. Supports passport, driving licence, and utility bill verification.' },
      { name: 'HMRC Integration API', description: 'Real-time tax relief claims and event reporting', icon: Building2, status: 'live' as const, methods: ['POST /hmrc/relief-at-source', 'POST /hmrc/event-report', 'GET /hmrc/tax-year-summary'], details: 'Automated Relief at Source claims, Annual Allowance monitoring, and Lifetime Allowance tracking.' },
      { name: 'Regulatory Reporting API', description: 'Generate FCA returns, RegData submissions, and compliance reports', icon: ClipboardList, status: 'live' as const, methods: ['POST /regulatory/fca-return', 'GET /regulatory/reports', 'POST /regulatory/gabriel-submit'], details: 'Automated generation of FCA regulatory returns including client money reports and complaints data.' },
      { name: 'Audit Trail API', description: 'Immutable audit logging for all system actions', icon: Database, status: 'live' as const, methods: ['GET /audit/trail', 'GET /audit/trail/:entityId', 'GET /audit/search'], details: 'Complete audit trail with user attribution, timestamps, and before/after state capture.' },
      { name: 'Suitability & Risk Profiling API', description: 'Capture and assess client risk tolerance and suitability', icon: Scale, status: 'beta' as const, methods: ['POST /suitability/assessment', 'GET /suitability/profile/:clientId', 'PUT /suitability/review/:clientId'], details: 'Questionnaire-driven risk profiling with automatic fund range matching.' },
    ]
  },
  {
    id: 'client',
    title: 'Client & Adviser Management',
    icon: Users,
    color: 'bg-success/10 text-success',
    apis: [
      { name: 'Client Onboarding API', description: 'Digital onboarding with e-signature and document collection', icon: UserPlus, status: 'live' as const, methods: ['POST /onboarding/start', 'PUT /onboarding/:id/step', 'GET /onboarding/:id/status', 'POST /onboarding/:id/complete'], details: 'Multi-step onboarding with document upload, e-signature, and automatic account creation.' },
      { name: 'Client Management API', description: 'CRUD operations for client records, contacts, and relationships', icon: Users, status: 'live' as const, methods: ['GET /clients', 'GET /clients/:id', 'PUT /clients/:id', 'GET /clients/:id/accounts'], details: 'Full client lifecycle management with relationship mapping and adviser assignment.' },
      { name: 'Adviser Charging API', description: 'Configure and apply adviser fees across client portfolios', icon: Receipt, status: 'live' as const, methods: ['POST /adviser-charging/setup', 'GET /adviser-charging/:adviserId', 'PUT /adviser-charging/fee-schedule'], details: 'Flexible fee structures: percentage, fixed, tiered, and ad-hoc charging with automatic collection.' },
      { name: 'Notifications & Alerts API', description: 'Push notifications, email alerts, and in-app messaging', icon: Bell, status: 'live' as const, methods: ['POST /notifications/send', 'GET /notifications/:userId', 'PUT /notifications/preferences'], details: 'Multi-channel notification delivery with configurable preferences and escalation rules.' },
      { name: 'Document Generation API', description: 'Generate statements, contract notes, and client correspondence', icon: FileText, status: 'live' as const, methods: ['POST /documents/generate', 'GET /documents/:id', 'GET /documents/templates'], details: 'Template-driven document generation with PDF output and digital delivery.' },
    ]
  },
  {
    id: 'platform',
    title: 'Platform & Infrastructure',
    icon: Server,
    color: 'bg-muted text-muted-foreground',
    apis: [
      { name: 'Authentication & SSO API', description: 'OAuth 2.0, SAML SSO, and multi-factor authentication', icon: Key, status: 'live' as const, methods: ['POST /auth/login', 'POST /auth/mfa/verify', 'POST /auth/sso/saml', 'POST /auth/token/refresh'], details: 'Enterprise SSO with SAML 2.0, OAuth 2.0, and TOTP-based MFA.' },
      { name: 'Workflow Engine API', description: 'Configurable business process workflows with approval chains', icon: Settings, status: 'live' as const, methods: ['POST /workflows/create', 'GET /workflows/:id', 'POST /workflows/:id/approve', 'POST /workflows/:id/reject'], details: 'Visual workflow designer with conditional routing, parallel tasks, and SLA monitoring.' },
      { name: 'Fee Engine API', description: 'Calculate and apply platform, wrapper, and fund-level fees', icon: Cpu, status: 'live' as const, methods: ['GET /fees/calculate/:accountId', 'POST /fees/apply', 'GET /fees/schedule', 'PUT /fees/override'], details: 'Multi-tier fee calculation engine with ad-valorem, flat, and tiered pricing support.' },
      { name: 'Bulk Operations API', description: 'Batch processing for valuations, fee collections, and reporting', icon: Layers, status: 'live' as const, methods: ['POST /bulk/valuations', 'POST /bulk/fees', 'POST /bulk/rebalance', 'GET /bulk/jobs/:id'], details: 'Asynchronous batch processing with progress tracking and error handling.' },
      { name: 'Webhooks & Events API', description: 'Real-time event streaming for system integrations', icon: Globe, status: 'live' as const, methods: ['POST /webhooks/register', 'GET /webhooks', 'DELETE /webhooks/:id', 'GET /events/stream'], details: 'Event-driven architecture with webhook delivery, retry logic, and dead-letter queuing.' },
    ]
  }
]

const statusColors = {
  live: 'bg-success/10 text-success border-success/20',
  beta: 'bg-warning/10 text-warning border-warning/20',
  planned: 'bg-muted text-muted-foreground border-border',
}

const statusLabels = {
  live: 'Live',
  beta: 'Beta',
  planned: 'Planned',
}

export default function APIDirectory() {
  const navigate = useNavigate()

  const totalAPIs = apiCategories.reduce((sum, cat) => sum + cat.apis.length, 0)
  const liveAPIs = apiCategories.reduce((sum, cat) => sum + cat.apis.filter(a => a.status === 'live').length, 0)
  const totalEndpoints = apiCategories.reduce((sum, cat) => sum + cat.apis.reduce((s, a) => s + (a.methods?.length || 0), 0), 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1 as any)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Server className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-foreground">API Directory</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/overview')}>
              <Globe className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Button size="sm" onClick={() => navigate('/dashboard')}>
              Open System
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4">Developer Reference</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              APIs & System Capabilities
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              A comprehensive directory of every API endpoint and integration powering the platform — from payments and trading through to compliance and regulatory reporting.
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{totalAPIs}</div>
                <div className="text-sm text-muted-foreground">APIs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{totalEndpoints}</div>
                <div className="text-sm text-muted-foreground">Endpoints</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">{liveAPIs}</div>
                <div className="text-sm text-muted-foreground">Live</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{apiCategories.length}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-16">
          {apiCategories.map((category) => {
            const CategoryIcon = category.icon
            return (
              <div key={category.id} id={category.id}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-xl ${category.color}`}>
                    <CategoryIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{category.title}</h2>
                    <p className="text-sm text-muted-foreground">{category.apis.length} APIs</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {category.apis.map((api) => {
                    const ApiIcon = api.icon
                    return (
                      <Card key={api.name} className="group hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${category.color}`}>
                                <ApiIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <CardTitle className="text-base">{api.name}</CardTitle>
                              </div>
                            </div>
                            <Badge variant="outline" className={statusColors[api.status]}>
                              {api.status === 'live' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {statusLabels[api.status]}
                            </Badge>
                          </div>
                          <CardDescription className="mt-2">{api.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {api.details && (
                            <p className="text-sm text-muted-foreground">{api.details}</p>
                          )}
                          {api.methods && api.methods.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Endpoints</p>
                              <div className="flex flex-wrap gap-1.5">
                                {api.methods.map((method) => {
                                  const verb = method.split(' ')[0]
                                  const verbColor = verb === 'GET' ? 'bg-success/10 text-success' :
                                    verb === 'POST' ? 'bg-primary/10 text-primary' :
                                    verb === 'PUT' ? 'bg-warning/10 text-warning' :
                                    verb === 'DELETE' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                                  return (
                                    <code key={method} className={`text-xs px-2 py-1 rounded-md font-mono ${verbColor}`}>
                                      {method}
                                    </code>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Explore?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            See every API in action within the live demo system. Switch between Client, Adviser, and Admin views to experience the full platform.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/dashboard')}>
              Open Dashboard
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/overview')}>
              Back to Overview
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
