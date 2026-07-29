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
      label: "Operator console",
      items: [
        { title: "Operator console", url: "/admin/console", icon: LayoutDashboard },
        { title: "Case workbench", url: "/admin/case-workbench", icon: ClipboardList },
        { title: "Payments hub", url: "/admin/payments", icon: Send },
        { title: "General ledger", url: "/admin/ledger", icon: Calculator },
        { title: "Expected receipts", url: "/admin/expected-receipts", icon: ArrowDownToLine },
        { title: "Work queue (all cases)", url: "/admin", icon: ClipboardList },
        { title: "Four-eyes approvals", url: "/admin?tab=approvals", icon: ShieldCheck },
        { title: "SLA tracker", url: "/sla-tracker", icon: Timer },
        { title: "Cash warnings", url: "/cash-warnings", icon: Bell },
        { title: "Case inbox", url: "/cases", icon: ClipboardList },
        { title: "Roadmap & known gaps", url: "/admin/roadmap", icon: ClipboardList },
      ],
    },
    {
      label: "Book-of-business (daily)",
      items: [
        { title: "Bank statement upload", url: "/bank-upload", icon: Upload },
        { title: "Bank recon (CASS 7/8)", url: "/cass", icon: ShieldCheck },
        { title: "Cash breaks & breaches", url: "/cass-engine", icon: AlertTriangle },
        { title: "Unallocated cash / suspense", url: "/unallocated-cash", icon: Wallet },
        { title: "Direct debit collections", url: "/direct-debit-collections", icon: ArrowDownToLine },
        { title: "Payroll processing", url: "/payroll-processing", icon: Receipt },
        { title: "Contribution schedules", url: "/contributions", icon: HandCoins },
        { title: "Contribution chaser", url: "/contribution-chaser", icon: AlertTriangle },
        { title: "Dealing desk", url: "/dealing", icon: TrendingUp },
        { title: "Unit pricing / valuation", url: "/models", icon: TrendingUp },
        { title: "Rebalance runs", url: "/admin?tab=rebalancing", icon: RefreshCw },
        { title: "Corporate actions", url: "/admin/corporate-actions", icon: RefreshCw },
        { title: "Fee run (monthly)", url: "/admin?tab=fees", icon: Calculator },
        { title: "Statement production", url: "/benefit-statements", icon: FileText },
      ],
    },
    {
      label: "Client-level (daily)",
      items: [
        { title: "Onboarding journey", url: "/onboarding", icon: ClipboardList },
        { title: "Onboarding tracker", url: "/onboarding-progress", icon: ClipboardList },
        { title: "KYC review queue", url: "/kyc-review", icon: ShieldCheck },
        { title: "Joiners & leavers", url: "/joiners-leavers", icon: UserCog },
        { title: "Member details", url: "/member-details", icon: UserCog },
        { title: "Member queries & complaints", url: "/member-queries", icon: MessageSquare },
        { title: "Vulnerable customers", url: "/vulnerable", icon: Accessibility },
        { title: "Initial cash funding", url: "/cash-onboarding", icon: ArrowDownToLine },
        { title: "Ad-hoc top-up", url: "/instant-deposit", icon: ArrowDownToLine },
        { title: "Manual transfer in", url: "/transfer", icon: ArrowDownToLine },
        { title: "Electronic transfer (Origo)", url: "/origo-transfers", icon: ArrowRightLeft },
        { title: "Transfer out", url: "/transfer-out", icon: ArrowUpFromLine },
        { title: "Re-registration (in-specie)", url: "/equisoft", icon: RefreshCw },
        { title: "CETV quotations", url: "/cetv", icon: ArrowRightLeft },
        { title: "Retirement quotes", url: "/retirement-quotes", icon: PoundSterling },
        { title: "Drawdown (FAD)", url: "/drawdown", icon: PoundSterling },
        { title: "Drip-feed / regular", url: "/drip-feed", icon: Workflow },
        { title: "UFPLS", url: "/instant-withdrawal", icon: Send },
        { title: "Illustration / KFI", url: "/illustration", icon: Calculator },
        { title: "SMPI runner", url: "/smpi", icon: Calculator },
        { title: "Benefit statements", url: "/benefit-statements", icon: FileText },
        { title: "Beneficiary nominations", url: "/beneficiaries", icon: Heart },
        { title: "Death claims", url: "/death-claims", icon: Heart },
        { title: "Pension sharing (divorce)", url: "/pension-sharing", icon: ArrowRightLeft },
        { title: "AA / carry-forward", url: "/contributions", icon: Calculator },
        { title: "LSA / LSDBA / BCE", url: "/lsa", icon: ShieldCheck },
        { title: "IHT planning", url: "/iht", icon: ScrollText },
        { title: "Transaction history", url: "/transactions", icon: History },
      ],
    },
    {
      label: "HMRC & regulatory",
      items: [
        { title: "RAS reclaim (monthly)", url: "/paye", icon: HandCoins },
        { title: "RTI submission", url: "/paye", icon: Receipt },
        { title: "Pension events (AFT/BCE)", url: "/hmrc", icon: FileSignature },
        { title: "Regulator returns (TPR/FCA)", url: "/admin?tab=regulatory", icon: FileSignature },
        { title: "TPR breach register (s.70)", url: "/breach-register", icon: ShieldCheck },
        { title: "Trustee meetings", url: "/trustee-meetings", icon: Users },
        { title: "Data quality (TPR)", url: "/data-quality", icon: ClipboardList },
        { title: "Pensions Dashboards (PDP)", url: "/pdp", icon: Network },
        { title: "Origo message tracker", url: "/origo", icon: Send },
        { title: "Audit trail", url: "/audit", icon: ScrollText },
        { title: "Cost & charges", url: "/costs", icon: Calculator },
      ],
    },
    {
      label: "Registers & schemes",
      items: [
        { title: "Scheme register", url: "/schemes", icon: Building2 },
        { title: "Employer register", url: "/employers", icon: Briefcase },
        { title: "Firm hierarchy", url: "/firms", icon: Network },
        { title: "Registration log", url: "/admin/registrations", icon: UserCog },
        { title: "SSAS", url: "/ssas", icon: Building2 },
        { title: "Commercial property", url: "/property", icon: Building2 },
        { title: "Model portfolios", url: "/models", icon: Layers },
      ],
    },
    {
      label: "Insights & oversight",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { title: "MI dashboard", url: "/mi", icon: BarChart3 },
        { title: "Operations cockpit", url: "/cockpit", icon: Layers },
        { title: "Client operations hub", url: "/client-ops", icon: Users },
        { title: "Pension operations", url: "/operations", icon: Workflow },
        { title: "Monte Carlo", url: "/projection", icon: Calculator },
        { title: "Enterprise suite", url: "/enterprise", icon: Sparkles },
        { title: "Reporting suite", url: "/reporting", icon: FileText },
        { title: "Communications", url: "/comms", icon: MessageSquare },
        { title: "Adviser workbench", url: "/workbench", icon: Briefcase },
        { title: "Annual review pack", url: "/annual-review", icon: FileSignature },
      ],
    },
    {
      label: "System & finance",
      items: [
        { title: "Feature flags", url: "/admin/feature-flags", icon: Cog },
        { title: "Reference data (HMRC)", url: "/admin/reference-data", icon: Database },
        { title: "Domain event bus", url: "/admin/event-bus", icon: Network },
        { title: "System configuration", url: "/admin?tab=system-config", icon: Cog },
        { title: "White-label branding", url: "/branding", icon: Palette },
        { title: "Persona selector", url: "/personas", icon: UserCog },
        { title: "Fee schedules", url: "/admin?tab=fees", icon: Calculator },
        { title: "Invoicing (Xero/Sage)", url: "/invoicing", icon: Receipt },
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
