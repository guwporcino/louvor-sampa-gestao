
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";
import { useDepartment } from "../contexts/DepartmentContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserDepartment } from "../types";
import { CheckCircle, XCircle } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

const Settings = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { departments, userDepartments, isAdmin, refetchDepartments } = useDepartment();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserDepartment[]>([]);

  const fetchUsers = async () => {
    if (!user || !isAdmin(departments[0]?.id || '')) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erro ao carregar usuários',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPermissions = async () => {
    if (!user || !isAdmin(departments[0]?.id || '')) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_departments')
        .select(`
          *,
          profiles:user_id (name, email),
          departments:department_id (name)
        `);
        
      if (error) throw error;
      
      const permissions = (data || []).map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        departmentId: item.department_id,
        isAdmin: item.is_admin,
        createdAt: new Date(item.created_at),
        user: item.profiles,
        department: item.departments,
      }));
      
      setUserPermissions(permissions);
    } catch (error: any) {
      console.error('Error fetching user permissions:', error);
      toast({
        title: 'Erro ao carregar permissões',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchUserPermissions();
  }, [departments]);

  const handleTogglePermission = async (userId: string, departmentId: string, isCurrentlyAdmin: boolean) => {
    try {
      setLoading(true);
      
      // Check if permission already exists
      const existingPermission = userPermissions.find(
        p => p.userId === userId && p.departmentId === departmentId
      );
      
      if (existingPermission) {
        // Update existing permission
        const { error } = await supabase
          .from('user_departments')
          .update({ is_admin: !isCurrentlyAdmin })
          .eq('id', existingPermission.id);
          
        if (error) throw error;
      } else {
        // Create new permission
        const { error } = await supabase
          .from('user_departments')
          .insert({
            user_id: userId,
            department_id: departmentId,
            is_admin: true
          });
          
        if (error) throw error;
      }
      
      toast({
        title: 'Permissões atualizadas',
        description: 'As permissões do usuário foram atualizadas com sucesso.',
      });
      
      await fetchUserPermissions();
      await refetchDepartments();
    } catch (error: any) {
      console.error('Error updating permission:', error);
      toast({
        title: 'Erro ao atualizar permissões',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (userId: string, departmentId: string): boolean => {
    return userPermissions.some(
      p => p.userId === userId && p.departmentId === departmentId
    );
  };

  const isAdminForDepartment = (userId: string, departmentId: string): boolean => {
    return userPermissions.some(
      p => p.userId === userId && p.departmentId === departmentId && p.isAdmin
    );
  };

  // Check if current user has admin permission for any department
  const canAccessSettings = departments.some(dept => isAdmin(dept.id));

  if (!canAccessSettings) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>
      
      <Tabs defaultValue="permissions">
        <TabsList className="mb-6">
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
          <TabsTrigger value="departments">Departamentos</TabsTrigger>
          <TabsTrigger value="classrooms">Salas de Aula</TabsTrigger>
        </TabsList>
        
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Permissões de Usuários</CardTitle>
              <CardDescription>
                Gerencie quais usuários têm acesso a quais departamentos e suas permissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-10">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Usuário</TableHead>
                        {departments.map(dept => (
                          <TableHead key={dept.id}>{dept.name}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div>
                              <p>{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </TableCell>
                          {departments.map(dept => (
                            <TableCell key={`${user.id}-${dept.id}`}>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleTogglePermission(user.id, dept.id, isAdminForDepartment(user.id, dept.id))}
                                disabled={loading}
                              >
                                {hasPermission(user.id, dept.id) ? (
                                  isAdminForDepartment(user.id, dept.id) ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <CheckCircle className="h-5 w-5 text-blue-500" />
                                  )
                                ) : (
                                  <XCircle className="h-5 w-5 text-gray-300" />
                                )}
                              </Button>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Departamentos</CardTitle>
              <CardDescription>
                Visualize e edite os departamentos da igreja
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.map(department => (
                      <TableRow key={department.id}>
                        <TableCell className="font-medium">{department.name}</TableCell>
                        <TableCell>{department.description || '-'}</TableCell>
                        <TableCell>
                          {department.active ? (
                            <span className="text-green-600">Ativo</span>
                          ) : (
                            <span className="text-red-600">Inativo</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Editar</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="classrooms">
          <Card>
            <CardHeader>
              <CardTitle>Salas de Aula</CardTitle>
              <CardDescription>
                Gerenciar salas de aula para a Escola Bíblica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-10">Funcionalidade em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
