
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";
import { FileText, Music, Calendar, Bell, FileMusic } from "lucide-react";

const NavBar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader className="px-4 py-6">
          <div className="flex items-center space-x-2">
            <Music className="h-8 w-8 text-worship-gold" />
            <div>
              <h1 className="text-lg font-bold leading-none text-white">Louvor Sampa</h1>
              <p className="text-xs text-gray-200">Gestão de Equipe</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className={isActive("/") ? "bg-sidebar-accent" : ""}>
                <Link to="/" className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className={isActive("/membros") ? "bg-sidebar-accent" : ""}>
                <Link to="/membros" className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  <span>Membros</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className={isActive("/escalas") ? "bg-sidebar-accent" : ""}>
                <Link to="/escalas" className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  <span>Escalas</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className={isActive("/repertorio") ? "bg-sidebar-accent" : ""}>
                <Link to="/repertorio" className="flex items-center">
                  <FileMusic className="mr-2 h-5 w-5" />
                  <span>Repertório</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <div className="block lg:hidden fixed top-4 left-4 z-30">
        <SidebarTrigger />
      </div>
    </>
  );
};

export default NavBar;
