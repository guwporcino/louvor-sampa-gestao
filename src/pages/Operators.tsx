
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
import { Plus, Search, Headphones, Edit, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useDepartment } from "@/contexts/DepartmentContext";
import { Label } from "@/components/ui/label";

interface Operator {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  active: boolean;
}

const Operators = () => {
  const { toast } = useToast();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentDepartment } = useDepartment();

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    active: true
  });

  useEffect(() => {
    fetchOperators();
  }, [currentDepartment]);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      // Busca operadores (usuários com associação ao departamento Sonoplastia)
      const soundDepartment = await supabase
        .from('departments')
        .select('id')
        .eq('name', 'Sonoplastia')
        .single();
        
      if (!soundDepartment.data) {
        throw new Error("Departamento de Sonoplastia não encontrado");
      }
      
      const { data: operatorData, error } = await supabase
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
        .eq('department_id', soundDepartment.data.id);
      
      if (error) throw error;
      
      const formattedOperators = operatorData
        .map((item) => item.profiles)
        .filter(Boolean);
      
      setOperators(formattedOperators as Operator[]);
    } catch (error: any) {
      console.error("Erro ao buscar operadores:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os operadores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredOperators = operators.filter(
    (operator) =>
      operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operator.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Open dialog for creating new operator
  const openNewOperatorDialog = () => {
    setEditingOperator(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      active: true
    });
    setIsDialogOpen(true);
  };

  // Open dialog for editing existing operator
  const openEditOperatorDialog = (operator: Operator) => {
    setEditingOperator(operator);
    setFormData({
      name: operator.name,
      email: operator.email,
      phone: operator.phone || "",
      active: operator.active
    });
    setIsDialogOpen(true);
  };

  // Submit form to create or update operator
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const soundDepartment = await supabase
        .from('departments')
        .select('id')
        .eq('name', 'Sonoplastia')
        .single();
        
      if (!soundDepartment.data) {
        throw new Error("Departamento de Sonoplastia não encontrado");
      }

      if (editingOperator) {
        // Update existing operator
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            active: formData.active
          })
          .eq('id', editingOperator.id);

        if (profileError) throw profileError;

        toast({
          title: "Sucesso",
          description: "Operador atualizado com sucesso"
        });
      } else {
        // First create the user in the auth service
        const { error: signUpError, data: authData } = await supabase.auth.admin.createUser({
          email: formData.email,
          email_confirm: true,
          user_metadata: { name: formData.name }
        });

        if (signUpError) {
          throw new Error(`Erro ao criar usuário: ${signUpError.message}`);
        }
        
        if (!authData?.user) {
          throw new Error("Falha ao criar usuário");
        }
        
        // The profile should be created automatically through the trigger
        // Now we just need to associate with Sonoplastia department
        const { error: deptError } = await supabase
          .from('user_departments')
          .insert({
            user_id: authData.user.id,
            department_id: soundDepartment.data.id,
            is_admin: false
          });

        if (deptError) throw deptError;
        
        // Update phone number if provided
        if (formData.phone) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ phone: formData.phone })
            .eq('id', authData.user.id);
            
          if (updateError) throw updateError;
        }
        
        toast({
          title: "Sucesso",
          description: "Novo operador cadastrado com sucesso"
        });
      }

      setIsDialogOpen(false);
      fetchOperators(); // Refresh the operators list
    } catch (error: any) {
      console.error("Erro ao salvar operador:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o operador",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Operadores</h1>
      <p className="text-gray-600 mb-8">
        Gerenciamento de operadores de som e mídia
      </p>

      <div className="flex items-center justify-between mb-6">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar operadores..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          className="bg-worship-purple hover:bg-worship-purple/80"
          onClick={openNewOperatorDialog}
        >
          <Plus className="mr-2 h-4 w-4" /> Adicionar Operador
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : operators.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-center">
              <Headphones className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-xl mb-2">Nenhum operador cadastrado</p>
              <p className="text-gray-500 mb-4 max-w-sm">
                Cadastre operadores para criar escalas de som e mídia
              </p>
              <Button 
                className="bg-worship-purple hover:bg-worship-purple/80"
                onClick={openNewOperatorDialog}
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar Operador
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
                {filteredOperators.map((operator) => (
                  <TableRow key={operator.id}>
                    <TableCell className="font-medium">{operator.name}</TableCell>
                    <TableCell>{operator.email}</TableCell>
                    <TableCell>{operator.phone || "-"}</TableCell>
                    <TableCell>
                      {operator.active ? (
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
                        onClick={() => openEditOperatorDialog(operator)}
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

      {/* Dialog for adding/editing operator */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingOperator ? 'Editar Operador' : 'Adicionar Operador'}
            </DialogTitle>
            <DialogDescription>
              {editingOperator 
                ? 'Atualize as informações do operador abaixo.'
                : 'Preencha as informações para adicionar um novo operador.'}
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
                  className="h-4 w-4 rounded border-gray-300 text-worship-purple focus:ring-worship-purple"
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
                className="bg-worship-purple hover:bg-worship-purple/80"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner /> <span className="ml-2">Salvando...</span>
                  </>
                ) : (
                  <>
                    {editingOperator ? <Check className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                    {editingOperator ? 'Salvar' : 'Adicionar'}
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

export default Operators;
