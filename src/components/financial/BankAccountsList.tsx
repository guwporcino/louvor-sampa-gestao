
import React, { useEffect, useState } from 'react';
import { BankAccount } from '@/types/financial';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import BankAccountForm from './BankAccountForm';

export const BankAccountsList = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setAccounts(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar contas bancárias',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (account: BankAccount) => {
    setSelectedAccount(account);
    setIsFormOpen(true);
  };

  const handleDelete = async (account: BankAccount) => {
    if (!window.confirm(`Deseja realmente excluir a conta ${account.name}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', account.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Conta excluída com sucesso',
      });
      fetchAccounts();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir conta',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleFormSubmit = async (data: Partial<BankAccount>) => {
    try {
      let result;
      
      if (selectedAccount) {
        // Update
        result = await supabase
          .from('bank_accounts')
          .update(data)
          .eq('id', selectedAccount.id);
      } else {
        // Insert
        result = await supabase
          .from('bank_accounts')
          .insert(data);
      }

      const { error } = result;
      
      if (error) {
        throw error;
      }

      toast({
        title: selectedAccount 
          ? 'Conta bancária atualizada com sucesso'
          : 'Conta bancária cadastrada com sucesso',
      });
      
      setIsFormOpen(false);
      setSelectedAccount(null);
      fetchAccounts();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar conta bancária',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const addNewAccount = () => {
    setSelectedAccount(null);
    setIsFormOpen(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Contas Bancárias</h3>
        <Button variant="default" onClick={addNewAccount}>
          <Plus className="mr-2 h-4 w-4" /> Nova Conta
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>
            {selectedAccount ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}
          </DialogTitle>
          <BankAccountForm 
            account={selectedAccount} 
            onSubmit={handleFormSubmit} 
            onCancel={() => setIsFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed">
          <p className="mb-4 text-muted-foreground">Nenhuma conta bancária cadastrada.</p>
          <Button variant="outline" onClick={addNewAccount}>
            <Plus className="mr-2 h-4 w-4" /> Cadastrar Nova Conta
          </Button>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Banco</TableHead>
                <TableHead>Agência</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>{account.bank}</TableCell>
                  <TableCell>{account.agency}</TableCell>
                  <TableCell>{account.account_number}</TableCell>
                  <TableCell>{account.account_type}</TableCell>
                  <TableCell>
                    <Badge variant={account.active ? "default" : "outline"}>
                      {account.active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(account)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => handleDelete(account)}
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
