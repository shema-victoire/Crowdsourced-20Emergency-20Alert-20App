import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Placeholder from "./pages/Placeholder";
import AuthWrapper from "./components/AuthWrapper";
import { ThemeProvider } from "./components/ThemeProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthWrapper>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/report"
              element={
                <Placeholder
                  title="Report Emergency"
                  description="Submit detailed emergency reports and track their status."
                />
              }
            />
            <Route
              path="/alerts"
              element={
                <Placeholder
                  title="Alert History"
                  description="View and manage your emergency alerts and notifications."
                />
              }
            />
            <Route
              path="/settings"
              element={
                <Placeholder
                  title="Settings"
                  description="Manage your emergency contacts, notification preferences, and account settings."
                />
              }
            />
            <Route
              path="/volunteers"
              element={
                <Placeholder
                  title="Emergency Volunteers"
                  description="Connect with nearby volunteers and emergency responders in your area."
                />
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthWrapper>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
