
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, School, Edit, X, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useDepartment } from "@/contexts/DepartmentContext";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  active: boolean;
}

const Teachers = () => {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentDepartment } = useDepartment();
  const { user } = useAuth();

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    active: true
  });

  useEffect(() => {
    fetchTeachers();
  }, [currentDepartment]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      // Busca professores (usuários com associação ao departamento Escola Bíblica)
      const schoolDepartment = await supabase
        .from('departments')
        .select('id')
        .eq('name', 'Escola Bíblica')
        .single();
        
      if (!schoolDepartment.data) {
        throw new Error("Departamento de Escola Bíblica não encontrado");
      }
      
      const { data: teacherData, error } = await supabase
        .from('user_departments')
        .select(`
          profiles:user_id (
            id,
            name,
            email,
            phone,
            active
          )
        `)
        .eq('department_id', schoolDepartment.data.id);
      
      if (error) throw error;
      
      const formattedTeachers = teacherData
        .map((item) => item.profiles)
        .filter(Boolean);
      
      setTeachers(formattedTeachers as Teacher[]);
    } catch (error: any) {
      console.error("Erro ao buscar professores:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os professores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Open dialog for creating new teacher
  const openNewTeacherDialog = () => {
    setEditingTeacher(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      active: true
    });
    setIsDialogOpen(true);
  };

  // Open dialog for editing existing teacher
  const openEditTeacherDialog = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || "",
      active: teacher.active
    });
    setIsDialogOpen(true);
  };

  // Submit form to create or update teacher
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Buscar o departamento de Escola Bíblica
      const schoolDepartment = await supabase
        .from('departments')
        .select('id')
        .eq('name', 'Escola Bíblica')
        .single();
        
      if (!schoolDepartment.data) {
        throw new Error("Departamento de Escola Bíblica não encontrado");
      }

      if (editingTeacher) {
        // Update existing teacher
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            active: formData.active
          })
          .eq('id', editingTeacher.id);

        if (profileError) throw profileError;

        toast({
          title: "Sucesso",
          description: "Professor atualizado com sucesso"
        });
      } else {
        // Generate a UUID for the new profile
        const newProfileId = crypto.randomUUID();
        
        // Criar o perfil com o UUID gerado
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: newProfileId,
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            active: formData.active
          })
          .select('id')
          .single();

        if (profileError) {
          throw new Error(`Erro ao criar perfil: ${profileError.message}`);
        }
        
        if (!profileData) {
          throw new Error("Falha ao criar perfil");
        }
        
        // Associar ao departamento Escola Bíblica
        const { error: deptError } = await supabase
          .from('user_departments')
          .insert({
            user_id: profileData.id,
            department_id: schoolDepartment.data.id,
            is_admin: false
          });

        if (deptError) throw deptError;
        
        toast({
          title: "Sucesso",
          description: "Novo professor cadastrado com sucesso"
        });
      }

      setIsDialogOpen(false);
      fetchTeachers(); // Refresh the teachers list
    } catch (error: any) {
      console.error("Erro ao salvar professor:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o professor",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Professores</h1>
      <p className="text-gray-600 mb-8">
        Gerenciamento de professores da Escola Bíblica
      </p>

      <div className="flex items-center justify-between mb-6">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar professores..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          className="bg-worship-blue hover:bg-worship-blue/80"
          onClick={openNewTeacherDialog}
        >
          <Plus className="mr-2 h-4 w-4" /> Adicionar Professor
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : teachers.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-center">
              <School className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-xl mb-2">Nenhum professor cadastrado</p>
              <p className="text-gray-500 mb-4 max-w-sm">
                Cadastre professores para criar escalas para as aulas da escola bíblica
              </p>
              <Button 
                className="bg-worship-blue hover:bg-worship-blue/80"
                onClick={openNewTeacherDialog}
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar Professor
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>{teacher.phone || "-"}</TableCell>
                    <TableCell>
                      {teacher.active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inativo
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditTeacherDialog(teacher)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog for adding/editing teacher */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingTeacher ? 'Editar Professor' : 'Adicionar Professor'}
            </DialogTitle>
            <DialogDescription>
              {editingTeacher 
                ? 'Atualize as informações do professor abaixo.'
                : 'Preencha as informações para adicionar um novo professor.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="active"
                  name="active"
                  type="checkbox"
                  checked={formData.active}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-worship-blue focus:ring-worship-blue"
                />
                <Label htmlFor="active">Ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-worship-blue hover:bg-worship-blue/80"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner /> <span className="ml-2">Salvando...</span>
                  </>
                ) : (
                  <>
                    {editingTeacher ? <Check className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                    {editingTeacher ? 'Salvar' : 'Adicionar'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Teachers;
