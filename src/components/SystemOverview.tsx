import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useNavigate } from 'react-router-dom'
import {
  Users, Shield, Briefcase, PieChart, ArrowRight, Landmark,
  FileText, CreditCard, RefreshCw, BarChart3, Bell, Settings,
  BookOpen, Upload, Scale, Wallet, TrendingUp, Globe,
  Lock, ClipboardCheck, Layers, ArrowLeftRight, Receipt,
  UserCheck, Building2, Workflow, Gavel, Database
} from 'lucide-react'

const roleCards = [
  {
    role: 'Client',
    icon: Users,
    description: 'Self-service portal for scheme members to view balances, request drawdowns, and manage beneficiaries.',
    features: ['Portfolio dashboard', 'Drawdown requests', 'Contribution history', 'Beneficiary management', 'Annual statements', 'Welcome pack'],
    color: 'bg-primary/10 text-primary',
  },
  {
    role: 'Adviser',
    icon: Briefcase,
    description: 'Practice management tools for financial advisers overseeing client portfolios and pension transfers.',
    features: ['Client book overview', 'Fee management', 'Transfer initiation', 'Risk profiling', 'Illustration generator', 'Bulk operations'],
    color: 'bg-secondary/10 text-secondary',
  },
  {
    role: 'Administrator',
    icon: Shield,
    description: 'Full platform control for pension scheme operators, trustees, and compliance teams.',
    features: ['Scheme dashboard', 'Trade management', 'Regulatory reporting', 'Fee engine', 'Workflow automation', 'Audit trail'],
    color: 'bg-warning/10 text-warning-foreground',
  },
]

const modules = [
  { icon: PieChart, name: 'Portfolio Management', desc: 'Real-time fund valuations, asset allocation, and drift monitoring across SIPP, ISA, and GIA wrappers.' },
  { icon: Wallet, name: 'Benefits & Crystallisation', desc: 'PCLS calculator, UFPLS processing, crystallisation segments, and death benefit rules engine.' },
  { icon: TrendingUp, name: 'Drawdown Processing', desc: 'FAD and UFPLS drawdown flows with automated tax-free/taxable splitting and MPAA tracking.' },
  { icon: ArrowLeftRight, name: 'Transfers In/Out', desc: 'Origo-integrated pension transfers with real-time status tracking and automated ceding scheme comms.' },
  { icon: Receipt, name: 'Fee Engine', desc: 'Flat, tiered, and ad valorem fee schedules with automated collection and adviser charging splits.' },
  { icon: Scale, name: 'Regulatory Compliance', desc: 'BCE event logging, LTA tracking, annual allowance monitoring, and FCA regulatory reporting.' },
  { icon: ClipboardCheck, name: 'KYC & Onboarding', desc: 'Digital client onboarding with identity verification, risk assessment, and consent management.' },
  { icon: FileText, name: 'Document Generation', desc: 'Branded Word & HTML exports for illustrations, welcome packs, benefit statements, and annual summaries.' },
  { icon: Workflow, name: 'Workflow Automation', desc: 'Configurable triggers for review reminders, contribution alerts, fee collection, and compliance checks.' },
  { icon: Database, name: 'Custody & Reconciliation', desc: 'Daily cash and stock reconciliation, bank file upload matching, and settlement tracking.' },
  { icon: CreditCard, name: 'Payment Processing', desc: 'Contribution collection, drawdown payments, and pooled account management with audit trails.' },
  { icon: BarChart3, name: 'Reporting & Analytics', desc: 'Scheme-level AUM dashboards, transaction ledgers, adviser MI, and exportable compliance reports.' },
  { icon: BookOpen, name: 'Learning Centre', desc: 'Educational resources for members covering pension basics, tax rules, and investment principles.' },
  { icon: Globe, name: 'API Directory', desc: 'RESTful API documentation for third-party integrations including pricing feeds and CRM connectors.' },
  { icon: Lock, name: 'Security & Access', desc: 'Role-based access control, MFA enforcement, session management, and IP whitelisting.' },
  { icon: Building2, name: 'System Configuration', desc: 'Platform settings, notification preferences, automated processing schedules, and maintenance mode.' },
]

const techCapabilities = [
  'Real-time database with row-level security',
  'Responsive design — desktop, tablet, mobile',
  'Role-based access control (Client / Adviser / Admin)',
  'Audit trail on all data mutations',
  'Export to Word (.docx) and HTML',
  'Origo transfer integration ready',
  'Morningstar pricing feed ready',
  'FCA regulatory reporting templates',
]

export default function SystemOverview() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-4">System Overview</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Pension Navigator by Airgead
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            A comprehensive pension administration platform covering the full member lifecycle — from onboarding and contributions through crystallisation, drawdown, and death benefits.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button onClick={() => navigate('/demo')}><Layers className="w-4 h-4 mr-2" />Live Demo</Button>
            <Button variant="outline" onClick={() => navigate('/documentation')}><FileText className="w-4 h-4 mr-2" />Technical Docs</Button>
            <Button variant="outline" onClick={() => navigate('/api-directory')}><Globe className="w-4 h-4 mr-2" />API Directory</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-12">
        {/* User Roles */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-1">User Roles</h2>
          <p className="text-muted-foreground mb-6">Three distinct portals tailored to each stakeholder's needs.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roleCards.map(r => (
              <Card key={r.role} className="flex flex-col">
                <CardHeader>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${r.color}`}>
                    <r.icon className="w-5 h-5" />
                  </div>
                  <CardTitle>{r.role} Portal</CardTitle>
                  <CardDescription>{r.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-1.5">
                    {r.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ArrowRight className="w-3 h-3 text-primary shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* Platform Modules */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-1">Platform Modules</h2>
          <p className="text-muted-foreground mb-6">End-to-end functionality across {modules.length} integrated modules.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {modules.map(m => (
              <Card key={m.name} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <m.icon className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* Technical Capabilities */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-1">Technical Capabilities</h2>
          <p className="text-muted-foreground mb-6">Built on a modern, secure, and scalable architecture.</p>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {techCapabilities.map(c => (
                  <div key={c} className="flex items-center gap-2 text-sm text-foreground">
                    <UserCheck className="w-4 h-4 text-secondary shrink-0" />
                    {c}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">Ready to explore?</h2>
          <p className="text-muted-foreground mb-4">Jump into the live demo or contact our team for a guided walkthrough.</p>
          <div className="flex gap-3 justify-center">
            <Button size="lg" onClick={() => navigate('/demo')}>Launch Demo</Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        </section>
      </main>
    </div>
  )
}
