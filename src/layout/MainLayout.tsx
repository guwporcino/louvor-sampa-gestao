
import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

const MainLayout: React.FC = () => {
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
