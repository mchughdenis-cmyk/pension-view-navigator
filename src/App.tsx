import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import APIDirectory from "./components/APIDirectory";
import SystemOverview from "./components/SystemOverview";

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <BrowserRouter>
      <FloatingBackButton />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<ShowcaseWebsite />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/pitch" element={<PensionSystemPitch />} />
        <Route path="/demo" element={<SystemDemo />} />
        <Route path="/documentation" element={<SystemDocumentation />} />
        <Route path="/api-directory" element={<APIDirectory />} />
        <Route path="/system-overview" element={<SystemOverview />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><ClientProductsDashboard /></ProtectedRoute>} />
        <Route path="/portfolio" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/illustration" element={<ProtectedRoute><PensionIllustration /></ProtectedRoute>} />
        <Route path="/welcome-pack" element={<ProtectedRoute><DigitalWelcomePack /></ProtectedRoute>} />
        <Route path="/transfer" element={<ProtectedRoute><PensionTransferJourney /></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><ClientOnboarding /></ProtectedRoute>} />
        <Route path="/drawdown" element={<ProtectedRoute><DrawdownJourney /></ProtectedRoute>} />
        <Route path="/drip-feed" element={<ProtectedRoute><DripFeedDrawdown /></ProtectedRoute>} />
        <Route path="/transfer-out" element={<ProtectedRoute><TransferOutJourney /></ProtectedRoute>} />
        <Route path="/annual-summary" element={<ProtectedRoute><AnnualSummary /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/instant-withdrawal" element={<ProtectedRoute><InstantWithdrawal /></ProtectedRoute>} />
        <Route path="/learning" element={<ProtectedRoute><LearningCentre /></ProtectedRoute>} />
        <Route path="/instrument-transfer" element={<ProtectedRoute><InstrumentTransfer /></ProtectedRoute>} />
        <Route path="/kyc" element={<ProtectedRoute><KYCVerification /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><PaymentProvider /></ProtectedRoute>} />
        <Route path="/isa" element={<ProtectedRoute><ISAPortfolio /></ProtectedRoute>} />
        <Route path="/gia" element={<ProtectedRoute><GIAPortfolio /></ProtectedRoute>} />
        <Route path="/client-admin/:clientId" element={<ProtectedRoute><ClientAdminView /></ProtectedRoute>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
