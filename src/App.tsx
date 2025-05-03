
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import MainLayout from "./layout/MainLayout";
import Index from "./pages/Index";
import Members from "./pages/Members";
import Schedules from "./pages/Schedules";
import Songs from "./pages/Songs";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

const App = () => {
  // Create a client
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Index />} />
                  <Route path="membros" element={<Members />} />
                  <Route path="membros/:id" element={<Members />} />
                  <Route path="membros/novo" element={<Members />} />
                  <Route path="escalas" element={<Schedules />} />
                  <Route path="escalas/:id" element={<Schedules />} />
                  <Route path="escalas/novo" element={<Schedules />} />
                  <Route path="repertorio" element={<Songs />} />
                  <Route path="repertorio/:id" element={<Songs />} />
                  <Route path="repertorio/novo" element={<Songs />} />
                </Route>
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
