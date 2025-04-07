
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { initializeEncoder } from "./lib/ai";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import JobsPage from "./pages/JobsPage";

const queryClient = new QueryClient();

const App = () => {
  // Initialize the AI encoder when the app loads
  useEffect(() => {
    initializeEncoder();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/jobs" element={<JobsPage />} />
            
            {/* User routes */}
            {/* These would be implemented as protected routes in a full app */}
            {/* <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/dashboard" element={<UserDashboardPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/jobs/:jobId" element={<JobDetailPage />} /> */}
            
            {/* Admin routes */}
            {/* These would be implemented as protected admin routes in a full app */}
            {/* <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/jobs" element={<AdminJobsPage />} />
            <Route path="/admin/jobs/new" element={<AdminNewJobPage />} />
            <Route path="/admin/jobs/:jobId" element={<AdminJobDetailPage />} />
            <Route path="/admin/jobs/:jobId/applications" element={<AdminJobApplicationsPage />} /> */}
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
