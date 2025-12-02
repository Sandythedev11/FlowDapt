import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { initializeSessionCleanup } from "@/lib/userStorage";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import SecurityPolicy from "./pages/SecurityPolicy";
import DashboardHome from "./pages/dashboard/DashboardHome";
import UploadData from "./pages/dashboard/UploadData";
import VisualAnalytics from "./pages/dashboard/VisualAnalytics";
import Insights from "./pages/dashboard/Insights";
import ReportBuilder from "./pages/dashboard/ReportBuilder";
import Settings from "./pages/dashboard/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Initialize session cleanup on app mount
  useEffect(() => {
    initializeSessionCleanup();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/security" element={<SecurityPolicy />} />
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/dashboard/upload" element={<UploadData />} />
            <Route path="/dashboard/analytics" element={<VisualAnalytics />} />
            <Route path="/dashboard/insights" element={<Insights />} />
            <Route path="/dashboard/report" element={<ReportBuilder />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
