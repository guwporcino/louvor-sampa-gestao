import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";
import { FileText, Music, Calendar, User, FileMusic, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
const NavBar: React.FC = () => {
  const location = useLocation();
  const {
    user,
    profile,
    signOut
  } = useAuth();
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (profile?.name) {
      return profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };
  return <>
      <Sidebar>
        <SidebarHeader className="px-4 py-6">
          <div className="flex items-center space-x-2">
            <Music className="h-8 w-8 text-worship-gold" />
            <div>
              <h1 className="text-lg font-bold leading-none text-white">IbrCaue</h1>
              <p className="text-xs text-gray-200">Gestão de Equipe</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="px-4 py-2 mb-4">
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-sidebar-accent/30">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {profile?.name || user?.email}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
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
                  <User className="mr-2 h-5 w-5" />
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
            <SidebarMenuItem>
              <SidebarMenuButton onClick={signOut} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                <div className="flex items-center">
                  <LogOut className="mr-2 h-5 w-5" />
                  <span>Sair</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <div className="block lg:hidden fixed top-4 left-4 z-30">
        <SidebarTrigger />
      </div>
    </>;
};
export default NavBar;