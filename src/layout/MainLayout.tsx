
import React, { useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useDepartment } from "../contexts/DepartmentContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Dove } from "lucide-react";

const MainLayout: React.FC = () => {
  const { currentDepartment } = useDepartment();
  const location = useLocation();

  // Update document title based on current department
  useEffect(() => {
    if (currentDepartment) {
      document.title = `DivinusGest - ${currentDepartment.name}`;
    } else {
      document.title = 'DivinusGest - Gestão de Equipes';
    }
  }, [currentDepartment, location]);

  // Check if we're on a subpage to show the back button
  const showBackButton = location.pathname !== "/dashboard" && 
                        !location.pathname.endsWith("/financeiro") && 
                        !location.pathname.endsWith("/projetos-sociais");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
        <NavBar />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {showBackButton && (
            <div className="mb-4">
              <Link to="/home">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar para Home</span>
                </Button>
              </Link>
            </div>
          )}
          <Outlet />
        </main>
        <Toaster />
        <Sonner />
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
