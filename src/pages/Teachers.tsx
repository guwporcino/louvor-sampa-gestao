
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
import { Plus, Search, School } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useDepartment } from "@/contexts/DepartmentContext";

const Teachers = () => {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentDepartment } = useDepartment();

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
      
      setTeachers(formattedTeachers);
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
        <Button className="bg-worship-blue hover:bg-worship-blue/80">
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
              <Button className="bg-worship-blue hover:bg-worship-blue/80">
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Teachers;
