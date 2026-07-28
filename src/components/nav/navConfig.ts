import {
  LayoutDashboard, PoundSterling, Wallet, PiggyBank, FileText, GraduationCap, Briefcase,
  Users, Building2, ClipboardList, TrendingUp, Layers, Calculator, ShieldCheck,
  MessageSquare, BarChart3, Settings as SettingsIcon, BookOpen, Workflow, Send,
  ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, RefreshCw, FileSignature, ScrollText, Receipt,
  Sparkles, Database, Network, Cog, History, FolderArchive, Bell, Smartphone, Timer, Palette,
  HeartPulse, Gift, Plane, Lock, UserCog, Heart, Crown, HandCoins, Accessibility,
  Landmark, Globe2, FileSpreadsheet, Upload, AlertTriangle,
} from "lucide-react";
import type { Role } from "@/contexts/RoleContext";
import type { LucideIcon } from "lucide-react";

export interface NavItem { title: string; url: string; icon: LucideIcon; }
export interface NavGroup { label: string; items: NavItem[]; }

export const NAV_BY_ROLE: Record<Role, NavGroup[]> = {
  client: [
    {
      label: "My pension",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { title: "Portfolio", url: "/portfolio", icon: TrendingUp },
        { title: "ISA", url: "/isa", icon: PiggyBank },
        { title: "GIA", url: "/gia", icon: Wallet },
        { title: "Onshore bond", url: "/onshore-bond", icon: Landmark },
        { title: "Offshore bond", url: "/offshore-bond", icon: Globe2 },
        { title: "Annual summary", url: "/annual-summary", icon: FileText },
        { title: "Inheritance Tax", url: "/iht", icon: ScrollText },
      ],
    },
    {
      label: "Service",
      items: [
        { title: "Ask Navigator (AI)", url: "/assistant", icon: Sparkles },
        { title: "Client services", url: "/client-services", icon: PoundSterling },
        { title: "Learning centre", url: "/learning", icon: GraduationCap },
      ],
    },
    {
      label: "Money in & out",
      items: [
        { title: "Add money (deposit)", url: "/instant-deposit", icon: ArrowDownToLine },
        { title: "Transfer in", url: "/transfer", icon: ArrowDownToLine },
        { title: "Illustration", url: "/illustration", icon: Calculator },
        { title: "Drawdown", url: "/drawdown", icon: PoundSterling },
        { title: "Drip-feed drawdown", url: "/drip-feed", icon: Workflow },
        { title: "Instant withdrawal", url: "/instant-withdrawal", icon: Send },
        { title: "Transaction history", url: "/transactions", icon: History },
        { title: "Transfer out", url: "/transfer-out", icon: ArrowUpFromLine },
        { title: "Instrument transfer", url: "/instrument-transfer", icon: RefreshCw },
      ],
    },
    {
      label: "Get started",
      items: [
        { title: "Onboarding progress", url: "/onboarding-progress", icon: ClipboardList },
        { title: "Onboarding", url: "/onboarding", icon: ClipboardList },
        { title: "Welcome pack", url: "/welcome-pack", icon: BookOpen },
        { title: "Identity check (KYC)", url: "/kyc", icon: ShieldCheck },
        { title: "Cash onboarding", url: "/cash-onboarding", icon: ArrowDownToLine },
        { title: "Illustration", url: "/illustration", icon: Calculator },
        { title: "Payments", url: "/payments", icon: Receipt },
      ],
    },
    {
      label: "Life & planning",
      items: [
        { title: "Pension health score", url: "/health-score", icon: HeartPulse },
        { title: "Life events", url: "/life-events", icon: HeartPulse },
        { title: "Employer matching", url: "/employer-match", icon: Gift },
        { title: "Contribution manager", url: "/contributions", icon: HandCoins },
        { title: "State Pension forecast", url: "/state-pension", icon: Crown },
        { title: "Beneficiaries", url: "/beneficiaries", icon: Heart },
        { title: "Cost & charges", url: "/costs", icon: Calculator },
      ],
    },
    {
      label: "Account",
      items: [
        { title: "Mobile app view", url: "/m", icon: Smartphone },
        { title: "Mobile security", url: "/mobile-security", icon: Lock },
        { title: "Notifications", url: "/notifications", icon: Bell },
        { title: "Documents", url: "/documents", icon: FolderArchive },
        { title: "Privacy centre", url: "/privacy", icon: Lock },
        { title: "Settings", url: "/settings", icon: SettingsIcon },
      ],
    },
  ],

  adviser: [
    {
      label: "Workspace",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { title: "Adviser workbench", url: "/workbench", icon: Briefcase },
      ],
    },
    {
      label: "Client service",
      items: [
        { title: "Client onboarding journey", url: "/onboarding", icon: ClipboardList },
        { title: "Onboarding progress tracker", url: "/onboarding-progress", icon: ClipboardList },
        { title: "Client services hub", url: "/client-services", icon: PoundSterling },
        { title: "Pension health score", url: "/health-score", icon: HeartPulse },
        { title: "Employer portal", url: "/employer-portal", icon: Building2 },
        { title: "Annual review pack", url: "/annual-review", icon: FileSignature },
        { title: "Pension passport", url: "/passport", icon: Plane },
        { title: "Beneficiaries", url: "/beneficiaries", icon: Heart },
        { title: "Vulnerable register", url: "/vulnerable", icon: Accessibility },
        { title: "Suitability assessment", url: "/suitability", icon: ClipboardList },
        { title: "Cost & charges", url: "/costs", icon: Calculator },
        { title: "Reporting suite", url: "/reporting", icon: FileText },
        { title: "Communications", url: "/comms", icon: MessageSquare },
        { title: "IHT planning", url: "/iht", icon: ScrollText },
      ],
    },
    {
      label: "Operations",
      items: [
        { title: "Client operations hub", url: "/client-ops", icon: Users },
        { title: "Operations cockpit", url: "/cockpit", icon: Layers },
        { title: "Pension operations", url: "/operations", icon: Workflow },
        { title: "Dealing desk", url: "/dealing", icon: TrendingUp },
        { title: "HMRC reporting", url: "/hmrc", icon: FileSignature },
        { title: "Pensions Dashboards (PDP)", url: "/pdp", icon: Network },
        { title: "PAYE / RTI", url: "/paye", icon: Receipt },
        { title: "Origo messages", url: "/origo", icon: Send },
        { title: "Origo transfers", url: "/origo-transfers", icon: ArrowRightLeft },
        { title: "Equisoft in-specie", url: "/equisoft", icon: RefreshCw },
        { title: "SSAS", url: "/ssas", icon: Building2 },
        { title: "Commercial property", url: "/property", icon: Building2 },
        { title: "Advanced capabilities", url: "/advanced", icon: Sparkles },
        { title: "LSA / LSDBA", url: "/lsa", icon: ShieldCheck },
        { title: "Cash warnings", url: "/cash-warnings", icon: Bell },
        { title: "SLA tracker", url: "/sla-tracker", icon: Timer },
        { title: "KYC review queue", url: "/kyc-review", icon: ShieldCheck },
        { title: "SMPI runner", url: "/smpi", icon: Calculator },
      ],
    },
    {
      label: "Money in & out",
      items: [
        { title: "Cash onboarding", url: "/cash-onboarding", icon: ArrowDownToLine },
        { title: "Add money (deposit)", url: "/instant-deposit", icon: ArrowDownToLine },
        { title: "Instant withdrawal", url: "/instant-withdrawal", icon: Send },
        { title: "Transaction history", url: "/transactions", icon: History },
        { title: "Drawdown journey", url: "/drawdown", icon: PoundSterling },
        { title: "Illustration", url: "/illustration", icon: Calculator },
      ],
    },
    {
      label: "Investments",
      items: [
        { title: "Model portfolios", url: "/models", icon: Layers },
        { title: "Monte Carlo", url: "/projection", icon: Calculator },
      ],
    },
    {
      label: "Insights",
      items: [{ title: "MI dashboard", url: "/mi", icon: BarChart3 }],
    },
    {
      label: "Account",
      items: [
        { title: "Documents", url: "/documents", icon: FolderArchive },
        { title: "Settings", url: "/settings", icon: SettingsIcon },
      ],
    },
  ],

  admin: [
    {
      label: "Workspace",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { title: "Admin console", url: "/admin", icon: Users },
        { title: "Registration log", url: "/admin/registrations", icon: UserCog },
        { title: "Roadmap & known gaps", url: "/admin/roadmap", icon: ClipboardList },
      ],
    },
    {
      label: "Registers",
      items: [
        { title: "Scheme register", url: "/schemes", icon: Building2 },
        { title: "Employer register", url: "/employers", icon: Briefcase },
        { title: "Case inbox (all work)", url: "/cases", icon: ClipboardList },
      ],
    },
    {
      label: "Governance & compliance",
      items: [
        { title: "TPR breach register (s.70)", url: "/breach-register", icon: ShieldCheck },
        { title: "Trustee meetings & actions", url: "/trustee-meetings", icon: Users },
        { title: "Data quality (TPR)", url: "/data-quality", icon: ClipboardList },
      ],
    },
    {
      label: "Book-of-business daily desk",
      items: [
        { title: "Bank statement upload", url: "/bank-upload", icon: Upload },
        { title: "Bank reconciliation (CASS 7/8)", url: "/cass", icon: ShieldCheck },
        { title: "Cash breaks & CASS breaches", url: "/cass-engine", icon: AlertTriangle },
        { title: "Cash warnings (book)", url: "/cash-warnings", icon: Bell },
        { title: "Payroll processing", url: "/payroll-processing", icon: Receipt },
        { title: "Contribution schedules", url: "/contributions", icon: HandCoins },
        { title: "Contribution chaser (overdue)", url: "/contribution-chaser", icon: AlertTriangle },
        { title: "Unallocated cash / suspense", url: "/unallocated-cash", icon: Wallet },
        { title: "RAS reclaim (monthly)", url: "/paye", icon: HandCoins },
        { title: "HMRC — payroll (RTI) submission", url: "/paye", icon: Receipt },
        { title: "HMRC — pension events (AFT/BCE)", url: "/hmrc", icon: FileSignature },
        { title: "Dealing desk (bulked orders)", url: "/dealing", icon: TrendingUp },
        { title: "Direct debit collections", url: "/direct-debit-collections", icon: ArrowDownToLine },
        { title: "Unit pricing / valuation run", url: "/models", icon: TrendingUp },
        { title: "Corporate actions", url: "/admin?tab=corporate-actions", icon: RefreshCw },
        { title: "Rebalance runs", url: "/admin?tab=rebalancing", icon: RefreshCw },
        { title: "Fee run (monthly)", url: "/admin?tab=fees", icon: Calculator },
        { title: "Statement production run", url: "/benefit-statements", icon: FileText },
        { title: "Regulator returns (TPR/FCA)", url: "/admin?tab=regulatory", icon: FileSignature },
        { title: "Four-eyes approvals queue", url: "/admin?tab=approvals", icon: ShieldCheck },
        { title: "Origo Options transfer tracker", url: "/origo", icon: Send },
        { title: "SLA tracker (scheme-wide)", url: "/sla-tracker", icon: Timer },
        { title: "Audit support", url: "/audit", icon: ScrollText },
      ],
    },
    {
      label: "Client-level daily desk",
      items: [
        { title: "Client onboarding journey", url: "/onboarding", icon: ClipboardList },
        { title: "Onboarding progress tracker", url: "/onboarding-progress", icon: ClipboardList },
        { title: "Initial cash funding", url: "/cash-onboarding", icon: ArrowDownToLine },
        { title: "Ad-hoc top-up", url: "/instant-deposit", icon: ArrowDownToLine },
        { title: "CETV quotations", url: "/cetv", icon: ArrowRightLeft },
        { title: "Retirement quotes & wake-up packs", url: "/retirement-quotes", icon: PoundSterling },
        { title: "Joiners & leavers", url: "/joiners-leavers", icon: UserCog },
        { title: "Member details (address / bank / GDPR)", url: "/member-details", icon: UserCog },
        { title: "Tax code / P45 / P46 changes", url: "/member-details", icon: Receipt },
        { title: "Member queries", url: "/member-queries", icon: MessageSquare },
        { title: "Complaints handling", url: "/member-queries", icon: AlertTriangle },
        { title: "Vulnerable customer flags", url: "/vulnerable", icon: Accessibility },
        { title: "Benefit statements", url: "/benefit-statements", icon: FileText },
        { title: "Beneficiary nominations / EoW", url: "/beneficiaries", icon: Heart },
        { title: "Death claims / bereavement", url: "/death-claims", icon: Heart },
        { title: "Pension sharing orders (divorce)", url: "/pension-sharing", icon: ArrowRightLeft },
        { title: "Refunds of contributions", url: "/contributions", icon: ArrowUpFromLine },
        { title: "Annual allowance / carry-forward", url: "/contributions", icon: Calculator },
        { title: "Electronic transfer (Origo)", url: "/origo-transfers", icon: ArrowRightLeft },
        { title: "Manual transfer in", url: "/transfer", icon: ArrowDownToLine },
        { title: "Transfer out", url: "/transfer-out", icon: ArrowUpFromLine },
        { title: "Re-registration (in-specie)", url: "/equisoft", icon: RefreshCw },
        { title: "Drawdown — fund designation (FAD)", url: "/drawdown", icon: PoundSterling },
        { title: "Drawdown — regular payments", url: "/drip-feed", icon: Workflow },
        { title: "Drawdown — UFPLS", url: "/instant-withdrawal", icon: Send },
        { title: "Instrument transfer", url: "/instrument-transfer", icon: RefreshCw },
        { title: "KYC review queue", url: "/kyc-review", icon: ShieldCheck },
        { title: "LSA / LSDBA / BCE checks", url: "/lsa", icon: ShieldCheck },
        { title: "Transaction history", url: "/transactions", icon: History },
      ],
    },
    {
      label: "Member outputs",
      items: [
        { title: "Illustration", url: "/illustration", icon: Calculator },
        { title: "SMPI runner", url: "/smpi", icon: Calculator },
      ],
    },
    {
      label: "Operations (oversight)",
      items: [
        { title: "Client operations hub", url: "/client-ops", icon: Users },
        { title: "Operations cockpit", url: "/cockpit", icon: Layers },
        { title: "Pension operations", url: "/operations", icon: Workflow },
        { title: "Pensions Dashboards (PDP)", url: "/pdp", icon: Network },
      ],
    },
    {
      label: "Compliance (periodic)",
      items: [
        { title: "Audit trail", url: "/audit", icon: ScrollText },
        { title: "Vulnerable register", url: "/vulnerable", icon: Accessibility },
        { title: "Cost & charges", url: "/costs", icon: Calculator },
        { title: "Firm hierarchy", url: "/firms", icon: Network },
      ],
    },
    {
      label: "Client modules (act on behalf)",
      items: [
        { title: "ISA portfolio", url: "/isa", icon: PiggyBank },
        { title: "GIA portfolio", url: "/gia", icon: Wallet },
        { title: "Onshore bond", url: "/onshore-bond", icon: Landmark },
        { title: "Offshore bond", url: "/offshore-bond", icon: Globe2 },
        { title: "Annual summary", url: "/annual-summary", icon: FileText },
        { title: "Pension passport", url: "/passport", icon: Plane },
        { title: "Beneficiaries", url: "/beneficiaries", icon: Heart },
        { title: "Pension health score", url: "/health-score", icon: HeartPulse },
        { title: "Life events", url: "/life-events", icon: HeartPulse },
        { title: "Employer matching", url: "/employer-match", icon: Gift },
        { title: "State Pension forecast", url: "/state-pension", icon: Crown },
        { title: "Onboarding", url: "/onboarding", icon: ClipboardList },
        { title: "Onboarding tracker", url: "/onboarding-progress", icon: ClipboardList },
        { title: "Identity check (KYC)", url: "/kyc", icon: ShieldCheck },
        { title: "Welcome pack", url: "/welcome-pack", icon: BookOpen },
        { title: "Learning centre", url: "/learning", icon: GraduationCap },
        { title: "Mobile app view", url: "/m", icon: Smartphone },
        { title: "Ask Navigator (AI)", url: "/assistant", icon: Sparkles },
        { title: "Privacy centre", url: "/privacy", icon: Lock },
      ],
    },
    {
      label: "Products",
      items: [
        { title: "SSAS", url: "/ssas", icon: Building2 },
        { title: "Commercial property", url: "/property", icon: Building2 },
        { title: "Advanced capabilities", url: "/advanced", icon: Sparkles },
      ],
    },

    {
      label: "Investments",
      items: [
        { title: "Model portfolios", url: "/models", icon: Layers },
        { title: "Monte Carlo", url: "/projection", icon: Calculator },
      ],
    },
    {
      label: "Insights",
      items: [
        { title: "MI dashboard", url: "/mi", icon: BarChart3 },
        { title: "Enterprise suite", url: "/enterprise", icon: Sparkles },
      ],
    },
    {
      label: "Client service",
      items: [
        { title: "Adviser workbench", url: "/workbench", icon: Briefcase },
        { title: "Client services hub", url: "/client-services", icon: PoundSterling },
        { title: "Annual review pack", url: "/annual-review", icon: FileSignature },
        { title: "Suitability assessment", url: "/suitability", icon: ClipboardList },
        { title: "Reporting suite", url: "/reporting", icon: FileText },
        { title: "Communications", url: "/comms", icon: MessageSquare },
      ],
    },
    {
      label: "Finance",
      items: [
        { title: "Fee schedules", url: "/admin?tab=fees", icon: Calculator },
        { title: "Invoicing (Xero/Sage)", url: "/invoicing", icon: Receipt },
      ],
    },
    {
      label: "System",
      items: [
        { title: "Administration", url: "/admin", icon: Users },
        { title: "System configuration", url: "/admin?tab=system-config", icon: Cog },
        { title: "White-label branding", url: "/branding", icon: Palette },
        { title: "Persona selector", url: "/personas", icon: UserCog },
        { title: "Audit log", url: "/audit-log", icon: History },
        { title: "Documents", url: "/documents", icon: FolderArchive },
        { title: "System overview", url: "/system-overview", icon: Building2 },
        { title: "API directory", url: "/api-directory", icon: Database },
        { title: "Documentation", url: "/documentation", icon: ScrollText },
        { title: "Webhook sandbox", url: "/webhook-sandbox", icon: Database },
        { title: "Settings", url: "/settings", icon: SettingsIcon },
      ],
    },
  ],
};

/** Flat lookup for breadcrumb labels */
export function findNavLabel(path: string): string | null {
  for (const groups of Object.values(NAV_BY_ROLE)) {
    for (const g of groups) {
      const hit = g.items.find((i) => i.url === path);
      if (hit) return hit.title;
    }
  }
  return null;
}
