
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { IncomeCategory, ExpenseCategory } from '@/types/financial';

interface CategoryFormProps {
  category?: IncomeCategory | ExpenseCategory | null;
  onSubmit: (data: Partial<IncomeCategory | ExpenseCategory>) => void;
  onCancel: () => void;
  categoryType: 'income' | 'expense';
}

const CategoryForm = ({ category, onSubmit, onCancel, categoryType }: CategoryFormProps) => {
  const form = useForm<Partial<IncomeCategory | ExpenseCategory>>({
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      active: category?.active !== undefined ? category.active : true,
    }
  });
  
  const handleSubmit = (data: Partial<IncomeCategory | ExpenseCategory>) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Categoria</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Dízimos" {...field} />
              </FormControl>
              <FormDescription>
                Nome para identificar a categoria
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descrição da categoria (opcional)" 
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Categoria Ativa</FormLabel>
                <FormDescription>
                  Categorias inativas não aparecem nas transações
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {category ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CategoryForm;
