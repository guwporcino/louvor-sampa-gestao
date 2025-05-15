
import React, { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { IncomeTransaction, IncomeCategory, BankAccount } from '@/types/financial';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ptBR } from 'date-fns/locale';

interface IncomeTransactionFormProps {
  transaction?: IncomeTransaction | null;
  onSubmit: (data: Partial<IncomeTransaction>) => void;
  onCancel: () => void;
}

const IncomeTransactionForm = ({ transaction, onSubmit, onCancel }: IncomeTransactionFormProps) => {
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(true);
  const { toast } = useToast();
  
  const form = useForm<Partial<IncomeTransaction>>({
    defaultValues: {
      description: transaction?.description || '',
      amount: transaction ? transaction.amount : 0,
      date: transaction?.date || format(new Date(), 'yyyy-MM-dd'),
      category_id: transaction?.category_id || '',
      bank_account_id: transaction?.bank_account_id || '',
      is_paid: transaction?.is_paid ?? false,
      payment_date: transaction?.payment_date || undefined,
      notes: transaction?.notes || '',
      reference_number: transaction?.reference_number || '',
    }
  });
  
  useEffect(() => {
    fetchCategories();
    fetchBankAccounts();
  }, []);
  
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const { data, error } = await supabase
        .from('income_categories')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar categorias',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoadingCategories(false);
    }
  };
  
  const fetchBankAccounts = async () => {
    try {
      setLoadingBankAccounts(true);
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      
      setBankAccounts(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar contas bancárias',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoadingBankAccounts(false);
    }
  };

  const handleSubmit = (data: Partial<IncomeTransaction>) => {
    // Convert string amount to number
    if (typeof data.amount === 'string') {
      data.amount = parseFloat(data.amount);
    }
    
    onSubmit(data);
  };
  
  const watchIsPaid = form.watch('is_paid');
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Dízimos - Mês Janeiro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    placeholder="0,00" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(format(date, 'yyyy-MM-dd'));
                        }
                      }}
                      disabled={(date) => false}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={loadingCategories}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="bank_account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conta Bancária</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ''}
                disabled={loadingBankAccounts}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma conta (opcional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Opcional - selecione a conta onde o valor foi depositado
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="is_paid"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Já Recebido</FormLabel>
                <FormDescription>
                  Marque se este valor já foi recebido
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
        
        {watchIsPaid && (
          <FormField
            control={form.control}
            name="payment_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Recebimento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(format(date, 'yyyy-MM-dd'));
                        }
                      }}
                      disabled={(date) => false}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Data em que o valor foi efetivamente recebido
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="reference_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Referência</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Transação #12345 (opcional)" {...field} />
              </FormControl>
              <FormDescription>
                Opcional - número de documento, protocolo ou referência
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observações sobre esta receita (opcional)" 
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {transaction ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default IncomeTransactionForm;
