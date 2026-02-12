import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ShowcaseWebsite from "./components/ShowcaseWebsite";
import { FloatingBackButton } from "./components/ui/floating-back-button";
import LoginScreen from "./components/LoginScreen";
import AdminLogin from "./components/AdminLogin";
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

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <BrowserRouter>
      <FloatingBackButton />
      <Routes>
        <Route path="/" element={<ShowcaseWebsite />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/dashboard" element={<ClientProductsDashboard />} />
        <Route path="/portfolio" element={<Index />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/illustration" element={<PensionIllustration />} />
        <Route path="/welcome-pack" element={<DigitalWelcomePack />} />
        <Route path="/transfer" element={<PensionTransferJourney />} />
        <Route path="/pitch" element={<PensionSystemPitch />} />
        <Route path="/onboarding" element={<ClientOnboarding />} />
        <Route path="/drawdown" element={<DrawdownJourney />} />
        <Route path="/drip-feed" element={<DripFeedDrawdown />} />
        <Route path="/transfer-out" element={<TransferOutJourney />} />
        <Route path="/annual-summary" element={<AnnualSummary />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/instant-withdrawal" element={<InstantWithdrawal />} />
        <Route path="/learning" element={<LearningCentre />} />
        <Route path="/instrument-transfer" element={<InstrumentTransfer />} />
        <Route path="/demo" element={<SystemDemo />} />
        <Route path="/kyc" element={<KYCVerification />} />
        <Route path="/payments" element={<PaymentProvider />} />
        <Route path="/documentation" element={<SystemDocumentation />} />
        <Route path="/isa" element={<ISAPortfolio />} />
        <Route path="/gia" element={<GIAPortfolio />} />
        <Route path="/client-admin/:clientId" element={<ClientAdminView />} />
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
