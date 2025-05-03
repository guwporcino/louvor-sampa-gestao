
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import LoadingSpinner from "../components/LoadingSpinner";

const Classrooms = () => {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('classrooms')
          .select('*')
          .order('name');
          
        if (error) throw error;
        setClassrooms(data || []);
      } catch (error: any) {
        console.error('Error fetching classrooms:', error);
        toast({
          title: 'Erro ao carregar salas',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassrooms();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Salas de Aula</h1>
          <p className="text-gray-600">Gerenciamento de salas para a Escola Bíblica</p>
        </div>
        <Button>
          Nova Sala
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Faixa Etária</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classrooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Nenhuma sala encontrada
                  </TableCell>
                </TableRow>
              ) : (
                classrooms.map(classroom => (
                  <TableRow key={classroom.id}>
                    <TableCell className="font-medium">{classroom.name}</TableCell>
                    <TableCell>{classroom.age_group || 'Todas as idades'}</TableCell>
                    <TableCell>{classroom.capacity || '-'}</TableCell>
                    <TableCell>{classroom.location || '-'}</TableCell>
                    <TableCell>
                      {classroom.active ? (
                        <span className="text-green-600">Ativa</span>
                      ) : (
                        <span className="text-red-600">Inativa</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Editar</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default Classrooms;
