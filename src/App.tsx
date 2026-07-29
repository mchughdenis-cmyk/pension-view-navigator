import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ShowcaseWebsite from "./components/ShowcaseWebsite";
import { FloatingBackButton } from "./components/ui/floating-back-button";
import { AppShell } from "./components/nav/AppShell";
import ClientProductsDashboard from "./components/ClientProductsDashboard";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import OperatorConsole from "./pages/admin/OperatorConsole";
import PaymentsHub from "./pages/admin/PaymentsHub";
import PaymentFiles from "./pages/admin/PaymentFiles";
import GeneralLedger from "./pages/admin/GeneralLedger";
import CaseWorkbench from "./pages/admin/CaseWorkbench";
import ReferenceData from "./pages/admin/ReferenceData";
import ExpectedReceipts from "./pages/admin/ExpectedReceipts";
import FeatureFlags from "./pages/admin/FeatureFlags";
import EventBus from "./pages/admin/EventBus";
import CorporateActions from "./pages/admin/CorporateActions";
import CassDailyRecon from "./pages/admin/CassDailyRecon";
import CashForecast from "./pages/admin/CashForecast";
import AdviserFeeRecon from "./pages/admin/AdviserFeeRecon";
import RegCalendar from "./pages/admin/RegCalendar";
import NotFound from "./pages/NotFound";
import PensionIllustration from "./components/PensionIllustration";
import DigitalWelcomePack from "./components/DigitalWelcomePack";
import PensionTransferJourney from "./components/PensionTransferJourney";

import ClientOnboarding from "./components/ClientOnboarding";
import DrawdownJourney from "./components/DrawdownJourney";
import DripFeedDrawdown from "./components/DripFeedDrawdown";
import TransferOutJourney from "./components/TransferOutJourney";
import AnnualSummary from "./components/AnnualSummary";
import Settings from "./components/Settings";
import InstantWithdrawal from "./components/InstantWithdrawal";
import InstantDeposit from "./components/InstantDeposit";
import TransactionHistory from "./components/TransactionHistory";
import LearningCentre from "./components/LearningCentre";
import InstrumentTransfer from "./components/InstrumentTransfer";
import SystemDemo from "./components/SystemDemo";
import KYCVerification from "./components/KYCVerification";
import KYCJourney from "./components/KYCJourney";
import KYCReview from "./components/KYCReview";
import CashOnboarding from "./components/CashOnboarding";
import WebhookSandbox from "./components/WebhookSandbox";
import NotificationsCenter from "./components/NotificationsCenter";
import AuditTrail from "./components/AuditTrail";
import AssistantPage from "./components/AssistantPage";
import OnboardingTracker from "./components/OnboardingTracker";
import PaymentProvider from "./components/PaymentProvider";
import SystemDocumentation from "./components/SystemDocumentation";
import ISAPortfolio from "./components/ISAPortfolio";
import GIAPortfolio from "./components/GIAPortfolio";
import BondPortfolio from "./components/BondPortfolio";
import ClientAdminView from "./components/ClientAdminView";
import APIDirectory from "./components/APIDirectory";
import SystemOverview from "./components/SystemOverview";
import PensionOperations from "./components/PensionOperations";
import AuthPage from "./pages/Auth";
import OperationsCockpit from "./components/OperationsCockpit";
import MIDashboard from "./components/MIDashboard";
import ModelPortfolios from "./components/ModelPortfolios";
import CASSReconciliation from "./components/CASSReconciliation";
import BankUpload from "./components/BankUpload";
import MonteCarloProjection from "./components/MonteCarloProjection";
import FirmHierarchy from "./components/FirmHierarchy";
import { CommandPalette } from "./components/CommandPalette";
import EnterpriseSuite from "./components/EnterpriseSuite";
import ClientServicesHub from "./components/ClientServicesHub";
import AdviserWorkbench from "./components/AdviserWorkbench";
import DealingDesk from "./components/DealingDesk";
import ReportingSuite from "./components/ReportingSuite";
import CommsHub from "./components/CommsHub";
import AuditLogViewer from "./components/AuditLogViewer";
import DocumentVault from "./components/DocumentVault";
import HMRCReporting from "./components/HMRCReporting";
import LSAAllowance from "./components/LSAAllowance";
import PAYEDashboard from "./components/PAYEDashboard";
import OrigoMessages from "./components/OrigoMessages";
import OrigoTransfers from "./components/OrigoTransfers";
import SSASModule from "./components/SSASModule";
import CommercialProperty from "./components/CommercialProperty";
import MarketLeaderHub from "./components/MarketLeaderHub";
import IHTOverview from "./components/IHTOverview";
import MobileClientApp from "./components/MobileClientApp";
import {
  MarketingLayout, MarketingHome, MarketingAbout, MarketingPlatform,
  MarketingExpertise, MarketingMarket, MarketingContact,
} from "./components/marketing/MarketingSite";

const queryClient = new QueryClient();

import { RoleGate } from "./components/RoleGate";
import { RoleSwitcher } from "./components/RoleSwitcher";
import { useRole } from "./contexts/RoleContext";
import { FirmProvider } from "./contexts/FirmContext";
import CASSReconEngine from "./components/admin/CASSReconEngine";
import RealisticKYC from "./components/RealisticKYC";
import SuitabilityAssessment from "./components/SuitabilityAssessment";
import AnnualReviewPack from "./components/AnnualReviewPack";
import WhiteLabelBranding from "./components/WhiteLabelBranding";
import CashWarnings from "./components/CashWarnings";
import SLATracker from "./components/SLATracker";
import LifeEventsEngine from "./components/LifeEventsEngine";
import EmployerMatchingVisualiser from "./components/EmployerMatchingVisualiser";
import PensionPassport from "./components/PensionPassport";
import PrivacyCentre from "./components/PrivacyCentre";
import PersonaSelector from "./components/PersonaSelector";
import BeneficiaryNominations from "./components/BeneficiaryNominations";
import ContributionManager from "./components/ContributionManager";
import CostCharges from "./components/CostCharges";
import StatePensionForecast from "./components/StatePensionForecast";
import VulnerableClientRegister from "./components/VulnerableClientRegister";
import PensionHealthScore from "./components/PensionHealthScore";
import EmployerPortal from "./components/EmployerPortal";
import MobileSecurityCentre from "./components/MobileSecurityCentre";

import ClientOperationsHub from "./components/ClientOperationsHub";
import EmployerSetupWizard from "./components/EmployerSetupWizard";
import AdviserMessaging from "./components/AdviserMessaging";
import NotificationRoutingRules from "./components/NotificationRoutingRules";
import EmployerBulkOps from "./components/EmployerBulkOps";
import AdminProductAnalytics from "./components/AdminProductAnalytics";
import MobileShowcase from "./components/MobileShowcase";
import PensionsDashboardIntegration from "./components/PensionsDashboardIntegration";
import EquisoftTransfers from "./components/EquisoftTransfers";
import SMPIRunner from "./components/SMPIRunner";
import IOSInstallSheet from "./components/pwa/IOSInstallSheet";
import OfflineBanner from "./components/pwa/OfflineBanner";
import { AuthGate } from "./components/AuthGate";
import RegistrationsLog from "./components/admin/RegistrationsLog";
import SavedIllustrations from "./components/SavedIllustrations";
import PayrollProcessing from "./pages/PayrollProcessing";
import JoinersLeavers from "./pages/admin/JoinersLeavers";
import MemberDetails from "./pages/admin/MemberDetails";
import MemberQueries from "./pages/admin/MemberQueries";
import BenefitStatements from "./pages/admin/BenefitStatements";
import ContributionChaser from "./pages/admin/ContributionChaser";
import UnallocatedCash from "./pages/admin/UnallocatedCash";
import DirectDebitCollections from "./pages/admin/DirectDebitCollections";
import SchemeRegister from "./pages/admin/SchemeRegister";
import EmployerRegister from "./pages/admin/EmployerRegister";
import CETVQuotes from "./pages/admin/CETVQuotes";
import RetirementQuotes from "./pages/admin/RetirementQuotes";
import BreachRegister from "./pages/admin/BreachRegister";
import DeathClaims from "./pages/admin/DeathClaims";
import PensionSharingOrders from "./pages/admin/PensionSharingOrders";
import TrusteeMeetings from "./pages/admin/TrusteeMeetings";
import DataQuality from "./pages/admin/DataQuality";
import CaseInbox from "./pages/admin/CaseInbox";
import Invoicing from "./pages/admin/Invoicing";
import Roadmap from "./pages/admin/Roadmap";
import Tour from "./pages/Tour";
import { FloatingHelpDock } from "./components/FloatingHelpDock";
import { useMarketingSiteEnabled } from "./hooks/useSiteSettings";


const HomeRedirect = () => {
  const { role, loading } = useRole();
  if (loading) return null;
  return <Navigate to={role === 'client' ? '/client-services' : '/dashboard'} replace />;
};

const DashboardRoute = () => {
  const { role, loading } = useRole();
  if (loading) return null;
  if (role === 'client') return <Navigate to="/client-services" replace />;
  return <ClientProductsDashboard />;
};

const MarketingGate = ({ children }: { children: React.ReactNode }) => {
  const { enabled, loading } = useMarketingSiteEnabled();
  if (loading) return null;
  if (!enabled) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const RootRedirect = () => {
  const { enabled, loading } = useMarketingSiteEnabled();
  if (loading) return null;
  return <Navigate to={enabled ? "/site" : "/dashboard"} replace />;
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <FloatingBackButton />
      <CommandPalette />
      <FloatingHelpDock />
      <OfflineBanner />
      <IOSInstallSheet />
      <Routes>
        {/* Public / full-screen routes — no shell */}
        <Route path="/overview" element={<ShowcaseWebsite />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/tour" element={<Tour />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/admin-login" element={<Navigate to="/auth" replace />} />
        <Route path="/pitch" element={<RootRedirect />} />
        <Route path="/" element={<RootRedirect />} />
        {/* Dedicated shareable entry points — skip marketing site */}
        <Route path="/app" element={<Navigate to="/dashboard" replace />} />
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        <Route path="/enter" element={<Navigate to="/dashboard" replace />} />
        <Route path="/demo" element={<SystemDemo />} />
        <Route path="/m" element={<MobileClientApp />} />
        <Route path="/mobile" element={<Navigate to="/m" replace />} />

        {/* Marketing site (admin-toggleable) */}
        <Route path="/site" element={<MarketingGate><MarketingLayout /></MarketingGate>}>
          <Route index element={<MarketingHome />} />
          <Route path="about" element={<MarketingAbout />} />
          <Route path="platform" element={<MarketingPlatform />} />
          <Route path="expertise" element={<MarketingExpertise />} />
          <Route path="market" element={<MarketingMarket />} />
          <Route path="contact" element={<MarketingContact />} />
        </Route>


        {/* App routes — wrapped in shell */}
        <Route path="*" element={
          <AuthGate>
            <AppShell>
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/documentation" element={<SystemDocumentation />} />
              <Route path="/api-directory" element={<APIDirectory />} />
              <Route path="/system-overview" element={<SystemOverview />} />
              <Route path="/dashboard" element={<DashboardRoute />} />
              <Route path="/portfolio" element={<Index />} />
              <Route path="/admin" element={<RoleGate allow={['admin']}><Admin /></RoleGate>} />
              <Route path="/admin/console" element={<RoleGate allow={['admin']}><OperatorConsole /></RoleGate>} />
              <Route path="/illustration" element={<PensionIllustration />} />
              <Route path="/saved-illustrations" element={<RoleGate allow={['adviser', 'admin']}><SavedIllustrations /></RoleGate>} />
              <Route path="/welcome-pack" element={<DigitalWelcomePack />} />
              <Route path="/transfer" element={<PensionTransferJourney />} />
              <Route path="/onboarding" element={<ClientOnboarding />} />
              <Route path="/drawdown" element={<DrawdownJourney />} />
              <Route path="/drip-feed" element={<DripFeedDrawdown />} />
              <Route path="/transfer-out" element={<TransferOutJourney />} />
              <Route path="/annual-summary" element={<AnnualSummary />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/instant-withdrawal" element={<InstantWithdrawal />} />
              <Route path="/instant-deposit" element={<InstantDeposit />} />
              <Route path="/transactions" element={<TransactionHistory />} />
              <Route path="/learning" element={<LearningCentre />} />
              <Route path="/instrument-transfer" element={<InstrumentTransfer />} />
              <Route path="/kyc" element={<KYCJourney />} />
              <Route path="/kyc-classic" element={<KYCVerification />} />
              <Route path="/kyc-review" element={<RoleGate allow={['adviser', 'admin']}><KYCReview /></RoleGate>} />
              <Route path="/cash-onboarding" element={<CashOnboarding />} />
              <Route path="/webhook-sandbox" element={<WebhookSandbox />} />
              <Route path="/notifications" element={<NotificationsCenter />} />
              <Route path="/audit" element={<AuditTrail />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/onboarding-progress" element={<OnboardingTracker />} />
              <Route path="/payments" element={<PaymentProvider />} />
              <Route path="/isa" element={<ISAPortfolio />} />
              <Route path="/gia" element={<GIAPortfolio />} />
              <Route path="/onshore-bond" element={<BondPortfolio bondType="onshore" />} />
              <Route path="/offshore-bond" element={<BondPortfolio bondType="offshore" />} />
              <Route path="/client-admin/:clientId" element={<RoleGate allow={['adviser', 'admin']}><ClientAdminView /></RoleGate>} />
              <Route path="/operations" element={<RoleGate allow={['adviser', 'admin']}><PensionOperations /></RoleGate>} />
              <Route path="/cockpit" element={<RoleGate allow={['adviser', 'admin']}><OperationsCockpit /></RoleGate>} />
              <Route path="/smpi" element={<RoleGate allow={['adviser', 'admin']}><SMPIRunner /></RoleGate>} />
              <Route path="/mi" element={<RoleGate allow={['adviser', 'admin']}><MIDashboard /></RoleGate>} />
              <Route path="/models" element={<RoleGate allow={['adviser', 'admin']}><ModelPortfolios /></RoleGate>} />
              <Route path="/cass" element={<RoleGate allow={['admin']}><CASSReconciliation /></RoleGate>} />
              <Route path="/cass-engine" element={<RoleGate allow={['admin']}><CASSReconEngine /></RoleGate>} />
              <Route path="/bank-upload" element={<RoleGate allow={['admin']}><BankUpload /></RoleGate>} />
              <Route path="/kyc-verify" element={<RealisticKYC />} />
              <Route path="/suitability" element={<RoleGate allow={['adviser', 'admin']}><SuitabilityAssessment /></RoleGate>} />
              <Route path="/annual-review" element={<RoleGate allow={['adviser', 'admin']}><AnnualReviewPack /></RoleGate>} />
              <Route path="/cash-warnings" element={<RoleGate allow={['adviser', 'admin']}><CashWarnings /></RoleGate>} />
              <Route path="/sla-tracker" element={<RoleGate allow={['adviser', 'admin']}><SLATracker /></RoleGate>} />
              <Route path="/projection" element={<MonteCarloProjection />} />
              <Route path="/firms" element={<RoleGate allow={['admin']}><FirmHierarchy /></RoleGate>} />
              <Route path="/enterprise" element={<RoleGate allow={['admin']}><EnterpriseSuite /></RoleGate>} />
              <Route path="/client-services" element={<RoleGate allow={['client', 'adviser', 'admin']}><ClientServicesHub /></RoleGate>} />
              <Route path="/workbench" element={<RoleGate allow={['adviser', 'admin']}><AdviserWorkbench /></RoleGate>} />
              <Route path="/dealing" element={<RoleGate allow={['adviser', 'admin']}><DealingDesk /></RoleGate>} />
              <Route path="/reporting" element={<RoleGate allow={['adviser', 'admin']}><ReportingSuite /></RoleGate>} />
              <Route path="/comms" element={<RoleGate allow={['adviser', 'admin']}><CommsHub /></RoleGate>} />
              <Route path="/audit-log" element={<RoleGate allow={['admin']}><AuditLogViewer /></RoleGate>} />
              <Route path="/documents" element={<DocumentVault />} />
              <Route path="/hmrc" element={<RoleGate allow={['adviser', 'admin']}><HMRCReporting /></RoleGate>} />
              <Route path="/lsa" element={<RoleGate allow={['adviser', 'admin']}><LSAAllowance /></RoleGate>} />
              <Route path="/paye" element={<RoleGate allow={['adviser', 'admin']}><PAYEDashboard /></RoleGate>} />
              <Route path="/origo" element={<RoleGate allow={['adviser', 'admin']}><OrigoMessages /></RoleGate>} />
              <Route path="/origo-transfers" element={<RoleGate allow={['adviser', 'admin']}><div className="container mx-auto p-6"><OrigoTransfers /></div></RoleGate>} />
              <Route path="/ssas" element={<RoleGate allow={['adviser', 'admin']}><SSASModule /></RoleGate>} />
              <Route path="/property" element={<RoleGate allow={['adviser', 'admin']}><CommercialProperty /></RoleGate>} />
              <Route path="/advanced" element={<RoleGate allow={['adviser', 'admin']}><MarketLeaderHub /></RoleGate>} />
              <Route path="/iht" element={<RoleGate allow={['client', 'adviser', 'admin']}><IHTOverview /></RoleGate>} />
              <Route path="/branding" element={<RoleGate allow={['admin']}><WhiteLabelBranding /></RoleGate>} />
              <Route path="/life-events" element={<LifeEventsEngine />} />
              <Route path="/employer-match" element={<EmployerMatchingVisualiser />} />
              <Route path="/passport" element={<RoleGate allow={['adviser', 'admin']}><PensionPassport /></RoleGate>} />
              <Route path="/privacy" element={<PrivacyCentre />} />
              <Route path="/personas" element={<PersonaSelector />} />
              <Route path="/beneficiaries" element={<RoleGate allow={['client', 'adviser', 'admin']}><BeneficiaryNominations /></RoleGate>} />
              <Route path="/contributions" element={<ContributionManager />} />
              <Route path="/payroll-processing" element={<RoleGate allow={['admin']}><PayrollProcessing /></RoleGate>} />
              <Route path="/joiners-leavers" element={<RoleGate allow={['admin']}><JoinersLeavers /></RoleGate>} />
              <Route path="/member-details" element={<RoleGate allow={['admin']}><MemberDetails /></RoleGate>} />
              <Route path="/member-queries" element={<RoleGate allow={['admin']}><MemberQueries /></RoleGate>} />
              <Route path="/benefit-statements" element={<RoleGate allow={['admin']}><BenefitStatements /></RoleGate>} />
              <Route path="/contribution-chaser" element={<RoleGate allow={['admin']}><ContributionChaser /></RoleGate>} />
              <Route path="/unallocated-cash" element={<RoleGate allow={['admin']}><UnallocatedCash /></RoleGate>} />
              <Route path="/direct-debit-collections" element={<RoleGate allow={['admin']}><DirectDebitCollections /></RoleGate>} />
              <Route path="/costs" element={<CostCharges />} />
              <Route path="/state-pension" element={<StatePensionForecast />} />
              <Route path="/vulnerable" element={<RoleGate allow={['adviser', 'admin']}><VulnerableClientRegister /></RoleGate>} />
              <Route path="/health-score" element={<PensionHealthScore />} />
              <Route path="/employer-portal" element={<RoleGate allow={['adviser', 'admin']}><EmployerPortal /></RoleGate>} />
              <Route path="/mobile-security" element={<MobileSecurityCentre />} />
              <Route path="/client-ops" element={<RoleGate allow={['adviser', 'admin']}><ClientOperationsHub /></RoleGate>} />
              <Route path="/employer/setup" element={<EmployerSetupWizard />} />
              <Route path="/adviser/messages" element={<RoleGate allow={['adviser', 'admin']}><AdviserMessaging /></RoleGate>} />
              <Route path="/admin/notifications/routing" element={<RoleGate allow={['admin']}><NotificationRoutingRules /></RoleGate>} />
              <Route path="/employer/bulk" element={<RoleGate allow={['adviser', 'admin']}><EmployerBulkOps /></RoleGate>} />
              <Route path="/admin/analytics" element={<RoleGate allow={['admin']}><AdminProductAnalytics /></RoleGate>} />
              <Route path="/admin/registrations" element={<RoleGate allow={['admin']}><RegistrationsLog /></RoleGate>} />
              <Route path="/admin/roadmap" element={<Roadmap />} />
              <Route path="/mobile-showcase" element={<MobileShowcase />} />
              <Route path="/pdp" element={<RoleGate allow={['adviser', 'admin']}><PensionsDashboardIntegration /></RoleGate>} />
              <Route path="/equisoft" element={<RoleGate allow={['adviser', 'admin']}><EquisoftTransfers /></RoleGate>} />
              <Route path="/schemes" element={<RoleGate allow={['adviser', 'admin']}><SchemeRegister /></RoleGate>} />
              <Route path="/employers" element={<RoleGate allow={['adviser', 'admin']}><EmployerRegister /></RoleGate>} />
              <Route path="/cetv" element={<RoleGate allow={['adviser', 'admin']}><CETVQuotes /></RoleGate>} />
              <Route path="/retirement-quotes" element={<RoleGate allow={['adviser', 'admin']}><RetirementQuotes /></RoleGate>} />
              <Route path="/breach-register" element={<RoleGate allow={['admin']}><BreachRegister /></RoleGate>} />
              <Route path="/trustee-meetings" element={<RoleGate allow={['adviser', 'admin']}><TrusteeMeetings /></RoleGate>} />
              <Route path="/data-quality" element={<RoleGate allow={['admin']}><DataQuality /></RoleGate>} />
              <Route path="/cases" element={<RoleGate allow={['adviser', 'admin']}><CaseInbox /></RoleGate>} />
              <Route path="/invoicing" element={<RoleGate allow={['admin']}><Invoicing /></RoleGate>} />
              <Route path="/death-claims" element={<RoleGate allow={['adviser', 'admin']}><DeathClaims /></RoleGate>} />
              <Route path="/pension-sharing" element={<RoleGate allow={['adviser', 'admin']}><PensionSharingOrders /></RoleGate>} />
              <Route path="/admin/payments" element={<RoleGate allow={['admin']}><PaymentsHub /></RoleGate>} />
              <Route path="/admin/payment-files" element={<RoleGate allow={['admin']}><PaymentFiles /></RoleGate>} />
              <Route path="/admin/ledger" element={<RoleGate allow={['admin']}><GeneralLedger /></RoleGate>} />
              <Route path="/admin/case-workbench" element={<RoleGate allow={['adviser','admin']}><CaseWorkbench /></RoleGate>} />
              <Route path="/admin/reference-data" element={<RoleGate allow={['admin']}><ReferenceData /></RoleGate>} />
              <Route path="/admin/expected-receipts" element={<RoleGate allow={['admin']}><ExpectedReceipts /></RoleGate>} />
              <Route path="/admin/feature-flags" element={<RoleGate allow={['admin']}><FeatureFlags /></RoleGate>} />
              <Route path="/admin/event-bus" element={<RoleGate allow={['admin']}><EventBus /></RoleGate>} />
              <Route path="/admin/corporate-actions" element={<RoleGate allow={['admin']}><CorporateActions /></RoleGate>} />
              <Route path="/admin/cass7-daily-recon" element={<RoleGate allow={['admin']}><CassDailyRecon /></RoleGate>} />
              <Route path="/admin/cash-forecast" element={<RoleGate allow={['admin']}><CashForecast /></RoleGate>} />
              <Route path="/admin/adviser-fees" element={<RoleGate allow={['admin']}><AdviserFeeRecon /></RoleGate>} />
              <Route path="/admin/reg-calendar" element={<RoleGate allow={['admin']}><RegCalendar /></RoleGate>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppShell>
          </AuthGate>
        } />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <FirmProvider>
        <AppContent />
      </FirmProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
