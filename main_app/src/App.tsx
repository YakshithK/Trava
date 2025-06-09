
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react"
import { ThemeProvider } from "next-themes";
import Welcome from "./pages/welcome/Welcome";
import Onboarding from "./pages/onboarding/Onboarding";
import TripPosting from "./pages/tripposting/ManualTripPosting";
import TripSelection from "./pages/tripposting/TripSelection";
import { FileUpload } from "./pages/tripposting/FileUpload";
import Matches from "./pages/matches/Matches";
import Chat from "./pages/chat/Chat";
import NotFound from "./pages/notfound/NotFound";
import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Requests from "./pages/requests/Requests";
import Profile from "./pages/profile/Profile";
import Layout from "./components/layout/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider, useAuth } from "./context/authContext";
import ProtectedRoute from "./components/protectedRoute";
import Verify from "./pages/verify/Verify";
import { useToast } from "./hooks/use-toast";
import { useEffect, useState } from "react";
import { supabase } from "./config/supabase";
import { useLocation } from "react-router-dom";
import { GlobalMessageListener } from "./listeners/Messages";
import { GlobalRequestListener } from "./listeners/Requests";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        console.error("Query failed:", error);
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: (failureCount, error: any) => {
        console.error("Mutation failed:", error);
        return failureCount < 1;
      },
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <GlobalMessageListener />
              <GlobalRequestListener />
              <Routes>
                {/* Public Routes */}
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/login" element={<Login />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/" element={<Welcome />}/>

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trip-posting"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <TripSelection />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trip-posting/manual"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <TripPosting />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trip-posting/:page"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <FileUpload />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/matches"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Matches />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/requests"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Requests />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat/:matchId?"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Chat />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Profile />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <Analytics />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
