
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { DepartmentProvider } from "./contexts/DepartmentContext";
import Teachers from "./pages/Teachers";
import Classrooms from "./pages/Classrooms";
import EBDSchedules from "./pages/EBDSchedules";
import Operators from "./pages/Operators";
import SoundSchedules from "./pages/SoundSchedules";
import Settings from "./pages/Settings";

const App = () => {
  // Create a client
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DepartmentProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<Index />} />
                    
                    {/* Louvor routes */}
                    <Route path="membros" element={<Members />} />
                    <Route path="membros/:id" element={<Members />} />
                    <Route path="membros/novo" element={<Members />} />
                    <Route path="escalas" element={<Schedules />} />
                    <Route path="escalas/:id" element={<Schedules />} />
                    <Route path="escalas/novo" element={<Schedules />} />
                    <Route path="repertorio" element={<Songs />} />
                    <Route path="repertorio/:id" element={<Songs />} />
                    <Route path="repertorio/novo" element={<Songs />} />
                    
                    {/* Escola Bíblica routes */}
                    <Route path="professores" element={<Teachers />} />
                    <Route path="professores/:id" element={<Teachers />} />
                    <Route path="professores/novo" element={<Teachers />} />
                    <Route path="turmas" element={<Classrooms />} />
                    <Route path="turmas/:id" element={<Classrooms />} />
                    <Route path="turmas/novo" element={<Classrooms />} />
                    <Route path="escalas-ebd" element={<EBDSchedules />} />
                    <Route path="escalas-ebd/:id" element={<EBDSchedules />} />
                    <Route path="escalas-ebd/novo" element={<EBDSchedules />} />
                    
                    {/* Sonoplastia routes */}
                    <Route path="operadores" element={<Operators />} />
                    <Route path="operadores/:id" element={<Operators />} />
                    <Route path="operadores/novo" element={<Operators />} />
                    <Route path="escalas-som" element={<SoundSchedules />} />
                    <Route path="escalas-som/:id" element={<SoundSchedules />} />
                    <Route path="escalas-som/novo" element={<SoundSchedules />} />
                    
                    {/* Settings */}
                    <Route path="configuracoes" element={<Settings />} />
                    
                    {/* Specific department schedule redirects */}
                    <Route path="escalas-louvor" element={<Navigate to="/escalas" replace />} />
                  </Route>
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </DepartmentProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
