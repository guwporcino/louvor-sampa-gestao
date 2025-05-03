
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Department, UserDepartment } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface DepartmentContextType {
  departments: Department[];
  userDepartments: UserDepartment[];
  currentDepartment: Department | null;
  setCurrentDepartment: (department: Department) => void;
  isLoading: boolean;
  hasAccess: (departmentId: string) => boolean;
  isAdmin: (departmentId: string) => boolean;
  refetchDepartments: () => Promise<void>;
  associateUserWithDepartment: (userId: string, departmentId: string, isAdmin?: boolean) => Promise<void>;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

export const DepartmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [userDepartments, setUserDepartments] = useState<UserDepartment[]>([]);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDepartments = async () => {
    try {
      console.log("DepartmentContext: Fetching departments for user:", user?.id);
      setIsLoading(true);
      
      // Fetch all departments
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (departmentsError) {
        throw departmentsError;
      }
      
      // Map to our Department type
      const fetchedDepartments: Department[] = departmentsData.map((dept) => ({
        id: dept.id,
        name: dept.name,
        description: dept.description,
        active: dept.active,
        createdAt: new Date(dept.created_at)
      }));
      
      console.log("DepartmentContext: Fetched departments:", fetchedDepartments);
      setDepartments(fetchedDepartments);
      
      if (user) {
        // Fetch user department permissions
        const { data: userDeptData, error: userDeptError } = await supabase
          .from('user_departments')
          .select(`
            id,
            user_id,
            department_id,
            is_admin,
            created_at,
            departments:department_id (
              id,
              name,
              description
            )
          `)
          .eq('user_id', user.id);
        
        if (userDeptError) {
          throw userDeptError;
        }
        
        console.log("DepartmentContext: Fetched user departments:", userDeptData);
        
        // Map to our UserDepartment type
        const fetchedUserDepartments: UserDepartment[] = userDeptData.map((ud) => ({
          id: ud.id,
          userId: ud.user_id,
          departmentId: ud.department_id,
          isAdmin: ud.is_admin,
          createdAt: new Date(ud.created_at),
          department: ud.departments ? {
            id: ud.departments.id,
            name: ud.departments.name,
            description: ud.departments.description
          } : undefined
        }));
        
        setUserDepartments(fetchedUserDepartments);
        
        // Set current department to first available or first in the list
        if (fetchedUserDepartments.length > 0 && !currentDepartment) {
          const deptId = fetchedUserDepartments[0].departmentId;
          const dept = fetchedDepartments.find(d => d.id === deptId);
          
          console.log("DepartmentContext: Setting initial department", dept);
          
          if (dept) {
            setCurrentDepartment(dept);
          } else if (fetchedDepartments.length > 0) {
            setCurrentDepartment(fetchedDepartments[0]);
          }
        } else if (!currentDepartment && fetchedDepartments.length > 0) {
          console.log("DepartmentContext: Setting default department", fetchedDepartments[0]);
          setCurrentDepartment(fetchedDepartments[0]);
        }
      }
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      toast({
        title: 'Erro ao carregar departamentos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Associate a user with a department
  const associateUserWithDepartment = async (userId: string, departmentId: string, isAdmin: boolean = false) => {
    try {
      console.log(`DepartmentContext: Associating user ${userId} with department ${departmentId}, isAdmin: ${isAdmin}`);
      
      const { data, error } = await supabase
        .from('user_departments')
        .insert({
          user_id: userId,
          department_id: departmentId,
          is_admin: isAdmin
        });
      
      if (error) {
        console.error("Error associating user with department:", error);
        throw error;
      }
      
      console.log("DepartmentContext: User associated with department successfully");
      return data;
    } catch (error: any) {
      console.error("DepartmentContext: Failed to associate user with department", error);
      toast({
        title: 'Erro',
        description: `Falha ao associar usuário ao departamento: ${error.message}`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchDepartments();
    }
  }, [user]);

  // Check if user has access to department
  const hasAccess = (departmentId: string): boolean => {
    if (!user) return false;
    if (userDepartments.length === 0) return true; // Temporary for development
    return userDepartments.some(ud => ud.departmentId === departmentId);
  };
  
  // Check if user is admin of department
  const isAdmin = (departmentId: string): boolean => {
    if (!user) return false;
    return userDepartments.some(ud => ud.departmentId === departmentId && ud.isAdmin);
  };

  // Add debug logging when current department changes
  const handleSetCurrentDepartment = (department: Department) => {
    console.log("DepartmentContext: Setting current department:", department);
    setCurrentDepartment(department);
  };

  return (
    <DepartmentContext.Provider
      value={{
        departments,
        userDepartments,
        currentDepartment,
        setCurrentDepartment: handleSetCurrentDepartment,
        isLoading,
        hasAccess,
        isAdmin,
        refetchDepartments: fetchDepartments,
        associateUserWithDepartment
      }}
    >
      {children}
    </DepartmentContext.Provider>
  );
};

export const useDepartment = () => {
  const context = useContext(DepartmentContext);
  if (context === undefined) {
    throw new Error('useDepartment must be used within a DepartmentProvider');
  }
  return context;
};
