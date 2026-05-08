import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ShowcaseWebsite from "./components/ShowcaseWebsite";
import { FloatingBackButton } from "./components/ui/floating-back-button";
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
import LearningCentre from "./components/LearningCentre";
import InstrumentTransfer from "./components/InstrumentTransfer";
import SystemDemo from "./components/SystemDemo";
import KYCVerification from "./components/KYCVerification";
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

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <BrowserRouter>
      <FloatingBackButton />
      <CommandPalette />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/overview" element={<ShowcaseWebsite />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/admin-login" element={<Navigate to="/auth" replace />} />
        <Route path="/pitch" element={<PensionSystemPitch />} />
        <Route path="/demo" element={<SystemDemo />} />
        <Route path="/documentation" element={<SystemDocumentation />} />
        <Route path="/api-directory" element={<APIDirectory />} />
        <Route path="/system-overview" element={<SystemOverview />} />

        {/* All routes - no login required */}
        <Route path="/dashboard" element={<ClientProductsDashboard />} />
        <Route path="/portfolio" element={<Index />} />
        <Route path="/admin" element={<Admin />} />
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
        <Route path="/learning" element={<LearningCentre />} />
        <Route path="/instrument-transfer" element={<InstrumentTransfer />} />
        <Route path="/kyc" element={<KYCVerification />} />
        <Route path="/payments" element={<PaymentProvider />} />
        <Route path="/isa" element={<ISAPortfolio />} />
        <Route path="/gia" element={<GIAPortfolio />} />
        <Route path="/client-admin/:clientId" element={<ClientAdminView />} />
        <Route path="/operations" element={<PensionOperations />} />
        <Route path="/cockpit" element={<OperationsCockpit />} />
        <Route path="/mi" element={<MIDashboard />} />
        <Route path="/models" element={<ModelPortfolios />} />
        <Route path="/cass" element={<CASSReconciliation />} />
        <Route path="/projection" element={<MonteCarloProjection />} />
        <Route path="/firms" element={<FirmHierarchy />} />
        <Route path="/enterprise" element={<EnterpriseSuite />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
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
