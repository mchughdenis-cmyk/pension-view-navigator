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
import NotFound from "./pages/NotFound";
import PensionIllustration from "./components/PensionIllustration";
import DigitalWelcomePack from "./components/DigitalWelcomePack";
import PensionTransferJourney from "./components/PensionTransferJourney";
import PensionSystemPitch from "./components/PensionSystemPitch";
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
import OnboardingTracker from "./components/OnboardingTracker";
import PaymentProvider from "./components/PaymentProvider";
import SystemDocumentation from "./components/SystemDocumentation";
import ISAPortfolio from "./components/ISAPortfolio";
import GIAPortfolio from "./components/GIAPortfolio";
import ClientAdminView from "./components/ClientAdminView";
import APIDirectory from "./components/APIDirectory";
import SystemOverview from "./components/SystemOverview";
import PensionOperations from "./components/PensionOperations";
import AuthPage from "./pages/Auth";
import OperationsCockpit from "./components/OperationsCockpit";
import MIDashboard from "./components/MIDashboard";
import ModelPortfolios from "./components/ModelPortfolios";
import CASSReconciliation from "./components/CASSReconciliation";
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
import SSASModule from "./components/SSASModule";
import CommercialProperty from "./components/CommercialProperty";
import MarketLeaderHub from "./components/MarketLeaderHub";

const queryClient = new QueryClient();

import { RoleGate } from "./components/RoleGate";
import { RoleSwitcher } from "./components/RoleSwitcher";
import { useRole } from "./contexts/RoleContext";

const HomeRedirect = () => {
  const { role } = useRole();
  return <Navigate to={role === 'client' ? '/client-services' : '/dashboard'} replace />;
};

const DashboardRoute = () => {
  const { role } = useRole();
  if (role === 'client') return <Navigate to="/client-services" replace />;
  return <ClientProductsDashboard />;
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <FloatingBackButton />
      <CommandPalette />
      <Routes>
        {/* Public / full-screen routes — no shell */}
        <Route path="/overview" element={<ShowcaseWebsite />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/admin-login" element={<Navigate to="/auth" replace />} />
        <Route path="/pitch" element={<PensionSystemPitch />} />
        <Route path="/demo" element={<SystemDemo />} />

        {/* App routes — wrapped in shell */}
        <Route path="*" element={
          <AppShell>
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/documentation" element={<SystemDocumentation />} />
              <Route path="/api-directory" element={<APIDirectory />} />
              <Route path="/system-overview" element={<SystemOverview />} />
              <Route path="/dashboard" element={<DashboardRoute />} />
              <Route path="/portfolio" element={<Index />} />
              <Route path="/admin" element={<RoleGate allow={['admin']}><Admin /></RoleGate>} />
              <Route path="/illustration" element={<PensionIllustration />} />
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
              <Route path="/onboarding-progress" element={<OnboardingTracker />} />
              <Route path="/payments" element={<PaymentProvider />} />
              <Route path="/isa" element={<ISAPortfolio />} />
              <Route path="/gia" element={<GIAPortfolio />} />
              <Route path="/client-admin/:clientId" element={<RoleGate allow={['adviser', 'admin']}><ClientAdminView /></RoleGate>} />
              <Route path="/operations" element={<RoleGate allow={['adviser', 'admin']}><PensionOperations /></RoleGate>} />
              <Route path="/cockpit" element={<RoleGate allow={['adviser', 'admin']}><OperationsCockpit /></RoleGate>} />
              <Route path="/mi" element={<RoleGate allow={['adviser', 'admin']}><MIDashboard /></RoleGate>} />
              <Route path="/models" element={<RoleGate allow={['adviser', 'admin']}><ModelPortfolios /></RoleGate>} />
              <Route path="/cass" element={<RoleGate allow={['admin']}><CASSReconciliation /></RoleGate>} />
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
              <Route path="/ssas" element={<RoleGate allow={['adviser', 'admin']}><SSASModule /></RoleGate>} />
              <Route path="/property" element={<RoleGate allow={['adviser', 'admin']}><CommercialProperty /></RoleGate>} />
              <Route path="/advanced" element={<RoleGate allow={['adviser', 'admin']}><MarketLeaderHub /></RoleGate>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppShell>
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
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
