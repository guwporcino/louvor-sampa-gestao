
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { ExpenseCategory } from '@/types/financial';
import CategoryForm from './CategoryForm';

export const ExpenseCategories = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name');

      if (error) throw error;

      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar categorias',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (category: ExpenseCategory) => {
    if (!window.confirm(`Deseja realmente excluir a categoria ${category.name}?`)) {
      return;
    }

    try {
      // Check if category is in use
      const { count, error: countError } = await supabase
        .from('expense_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id);
      
      if (countError) throw countError;
      
      if (count && count > 0) {
        toast({
          title: 'Não é possível excluir esta categoria',
          description: `Existem ${count} transações vinculadas a esta categoria`,
          variant: 'destructive',
        });
        return;
      }
      
      // Delete the category
      const { error } = await supabase
        .from('expense_categories')
        .delete()
        .eq('id', category.id);

      if (error) throw error;

      toast({
        title: 'Categoria excluída com sucesso',
      });
      
      fetchCategories();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir categoria',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleFormSubmit = async (data: Partial<ExpenseCategory>) => {
    try {
      let result;
      
      if (selectedCategory) {
        // Update
        result = await supabase
          .from('expense_categories')
          .update(data)
          .eq('id', selectedCategory.id);
      } else {
        // Insert
        result = await supabase
          .from('expense_categories')
          .insert({
            ...data,
            type: 'expense'
          });
      }

      const { error } = result;
      
      if (error) throw error;

      toast({
        title: selectedCategory 
          ? 'Categoria atualizada com sucesso'
          : 'Categoria cadastrada com sucesso',
      });
      
      setIsFormOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar categoria',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const addNewCategory = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Categorias de Despesa</h3>
        <Button variant="default" onClick={addNewCategory}>
          <Plus className="mr-2 h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>
            {selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
          <CategoryForm 
            category={selectedCategory} 
            onSubmit={handleFormSubmit} 
            onCancel={() => setIsFormOpen(false)} 
            categoryType="expense"
          />
        </DialogContent>
      </Dialog>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed">
          <p className="mb-4 text-muted-foreground">Nenhuma categoria cadastrada.</p>
          <Button variant="outline" onClick={addNewCategory}>
            <Plus className="mr-2 h-4 w-4" /> Cadastrar Nova Categoria
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={category.active ? "success" : "outline"}>
                      {category.active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => handleDelete(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
