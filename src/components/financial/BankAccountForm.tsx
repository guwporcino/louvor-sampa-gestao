
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { BankAccount } from '@/types/financial';
import { getBrazilianBanks, getAccountTypes } from '@/utils/formatters';

interface BankAccountFormProps {
  account?: BankAccount | null;
  onSubmit: (data: Partial<BankAccount>) => void;
  onCancel: () => void;
}

const BankAccountForm = ({ account, onSubmit, onCancel }: BankAccountFormProps) => {
  const banks = getBrazilianBanks();
  const accountTypes = getAccountTypes();
  
  const form = useForm<Partial<BankAccount>>({
    defaultValues: {
      name: account?.name || '',
      bank: account?.bank || '',
      agency: account?.agency || '',
      account_number: account?.account_number || '',
      account_type: account?.account_type || 'corrente',
      active: account?.active !== undefined ? account.active : true,
    }
  });
  
  const handleSubmit = (data: Partial<BankAccount>) => {
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
              <FormLabel>Nome da Conta</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Conta Principal" {...field} />
              </FormControl>
              <FormDescription>
                Nome para identificar a conta
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bank"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banco</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o banco" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.value} value={bank.value}>
                      {bank.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="agency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agência</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 1234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="account_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número da Conta</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 12345-6" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="account_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Conta</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
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
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Conta Ativa</FormLabel>
                <FormDescription>
                  Contas inativas não aparecem nas transações
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
            {account ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BankAccountForm;
