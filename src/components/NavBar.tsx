
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarFooter } from "@/components/ui/sidebar";
import { FileText, Music, Calendar, User, FileMusic, LogOut, BookOpen, Headphones, Settings, Home, DollarSign } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useDepartment } from "../contexts/DepartmentContext";
import DepartmentSelector from "./DepartmentSelector";

const NavBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    profile,
    signOut
  } = useAuth();
  const { currentDepartment, isAdmin } = useDepartment();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (profile?.name) {
      return profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };
  
  // Get department-specific menu items based on current department
  const getDepartmentMenuItems = () => {
    if (!currentDepartment) return [];
    
    switch (currentDepartment.name.toLowerCase()) {
      case 'louvor':
        return [
          {
            path: "/dashboard/membros",
            icon: <User className="mr-2 h-5 w-5" />,
            label: "Membros"
          },
          {
            path: "/dashboard/escalas",
            icon: <Calendar className="mr-2 h-5 w-5" />,
            label: "Escalas"
          },
          {
            path: "/dashboard/repertorio",
            icon: <FileMusic className="mr-2 h-5 w-5" />,
            label: "Repertório"
          }
        ];
      case 'escola bíblica':
        return [
          {
            path: "/dashboard/professores",
            icon: <User className="mr-2 h-5 w-5" />,
            label: "Professores"
          },
          {
            path: "/dashboard/turmas",
            icon: <BookOpen className="mr-2 h-5 w-5" />,
            label: "Turmas"
          },
          {
            path: "/dashboard/escalas-ebd",
            icon: <Calendar className="mr-2 h-5 w-5" />,
            label: "Escalas"
          }
        ];
      case 'sonoplastia':
        return [
          {
            path: "/dashboard/operadores",
            icon: <User className="mr-2 h-5 w-5" />,
            label: "Operadores"
          },
          {
            path: "/dashboard/escalas-som",
            icon: <Calendar className="mr-2 h-5 w-5" />,
            label: "Escalas"
          }
        ];
      default:
        return [];
    }
  };
  
  const menuItems = getDepartmentMenuItems();
  
  return <>
      <Sidebar>
        <SidebarHeader className="px-4 py-6">
          <div className="flex items-center space-x-2">
            {currentDepartment?.name.toLowerCase() === 'louvor' && <Music className="h-8 w-8 text-worship-gold" />}
            {currentDepartment?.name.toLowerCase() === 'escola bíblica' && <BookOpen className="h-8 w-8 text-worship-blue" />}
            {currentDepartment?.name.toLowerCase() === 'sonoplastia' && <Headphones className="h-8 w-8 text-worship-purple" />}
            <div>
              <h1 className="text-lg font-bold leading-none text-white">IbrCaue</h1>
              <p className="text-xs text-gray-200">Gestão de Equipes</p>
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

          <DepartmentSelector />
          
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => navigate("/home")} 
                className="flex items-center"
              >
                <Home className="mr-2 h-5 w-5" />
                <span>Página Inicial</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild className={isActive("/dashboard") ? "bg-sidebar-accent" : ""}>
                <Link to="/dashboard" className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild className={isActive("/financeiro") ? "bg-sidebar-accent" : ""}>
                <Link to="/financeiro" className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  <span>Financeiro</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            {menuItems.map((item, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuButton asChild className={isActive(item.path) ? "bg-sidebar-accent" : ""}>
                  <Link to={item.path} className="flex items-center">
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            
            {isAdmin(currentDepartment?.id || '') && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={isActive("/dashboard/configuracoes") ? "bg-sidebar-accent" : ""}>
                  <Link to="/dashboard/configuracoes" className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={signOut} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                <div className="flex items-center">
                  <LogOut className="mr-2 h-5 w-5" />
                  <span>Sair</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <div className="block lg:hidden fixed top-4 left-4 z-30">
        <SidebarTrigger />
      </div>
    </>;
};
export default NavBar;
