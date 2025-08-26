import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

// Code splitting: Load pages dynamically
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Placeholder = lazy(() => import("./pages/Placeholder"));
import AuthWrapper from "./components/AuthWrapper";
import { ThemeProvider } from "./components/ThemeProvider";
import { LanguageProvider } from "./lib/language-context";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingSpinner } from "./components/LoadingSpinner";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LanguageProvider>
            <AuthWrapper>
              <Suspense fallback={<LoadingSpinner />}>
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
              </Suspense>
            </AuthWrapper>
          </LanguageProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

createRoot(document.getElementById("root")!).render(<App />);
