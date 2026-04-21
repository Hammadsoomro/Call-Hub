import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Auth Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TelnyxConnect from "./pages/TelnyxConnect";

// Dashboard Pages
import DialPad from "./pages/DialPad";
import BoughtNumbers from "./pages/BoughtNumbers";
import BuyNumber from "./pages/BuyNumber";
import Settings from "./pages/Settings";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/telnyx-connect" element={<TelnyxConnect />} />

            {/* Protected Routes */}
            <Route
              path="/dialpad"
              element={
                <ProtectedRoute>
                  <DialPad />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bought-numbers"
              element={
                <ProtectedRoute>
                  <BoughtNumbers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buy-number"
              element={
                <ProtectedRoute>
                  <BuyNumber />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Redirect root to login or dialpad */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
