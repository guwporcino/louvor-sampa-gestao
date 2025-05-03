
import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useDepartment } from "../contexts/DepartmentContext";

const MainLayout: React.FC = () => {
  const { currentDepartment } = useDepartment();
  const location = useLocation();

  // Update document title based on current department
  useEffect(() => {
    if (currentDepartment) {
      document.title = `IbrCaue - ${currentDepartment.name}`;
    } else {
      document.title = 'IbrCaue - Gestão de Equipes';
    }
  }, [currentDepartment, location]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
        <NavBar />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
        <Toaster />
        <Sonner />
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
