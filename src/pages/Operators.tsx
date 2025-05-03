
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
import { Plus, Search, Headphones } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useDepartment } from "@/contexts/DepartmentContext";

const Operators = () => {
  const { toast } = useToast();
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentDepartment } = useDepartment();

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
      
      setOperators(formattedOperators);
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
        <Button className="bg-worship-purple hover:bg-worship-purple/80">
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
                Cadastre operadores para criar escalas de som e mídia para os cultos
              </p>
              <Button className="bg-worship-purple hover:bg-worship-purple/80">
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

export default Operators;
