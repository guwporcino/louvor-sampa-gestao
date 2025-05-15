
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, FileText, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { IncomeTransaction } from '@/types/financial';
import IncomeTransactionForm from './IncomeTransactionForm';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { ExportData } from './ExportData';

export const IncomeTransactions = () => {
  const [transactions, setTransactions] = useState<IncomeTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<IncomeTransaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Count total for pagination
      const countQuery = supabase
        .from('income_transactions')
        .select('id', { count: 'exact', head: true });
      
      if (statusFilter !== 'all') {
        countQuery.eq('is_paid', statusFilter === 'paid');
      }
      
      if (searchTerm) {
        countQuery.ilike('description', `%${searchTerm}%`);
      }
      
      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      
      setTotalCount(count || 0);
      
      // Fetch data with pagination
      let query = supabase
        .from('income_transactions')
        .select(`
          *,
          category:category_id(*),
          bank_account:bank_account_id(*)
        `)
        .order('date', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);
      
      if (statusFilter !== 'all') {
        query = query.eq('is_paid', statusFilter === 'paid');
      }
      
      if (searchTerm) {
        query = query.ilike('description', `%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setTransactions(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar receitas',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransactions();
  };

  const handleEdit = (transaction: IncomeTransaction) => {
    setSelectedTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = async (transaction: IncomeTransaction) => {
    if (!window.confirm(`Deseja realmente excluir esta receita: ${transaction.description}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('income_transactions')
        .delete()
        .eq('id', transaction.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Receita excluída com sucesso',
      });
      fetchTransactions();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir receita',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleFormSubmit = async (data: Partial<IncomeTransaction>) => {
    try {
      let result;
      
      if (selectedTransaction) {
        // Update
        result = await supabase
          .from('income_transactions')
          .update(data)
          .eq('id', selectedTransaction.id);
      } else {
        // Insert
        result = await supabase
          .from('income_transactions')
          .insert(data);
      }

      const { error } = result;
      
      if (error) throw error;

      toast({
        title: selectedTransaction 
          ? 'Receita atualizada com sucesso'
          : 'Receita cadastrada com sucesso',
      });
      
      setIsFormOpen(false);
      setSelectedTransaction(null);
      fetchTransactions();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar receita',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const addNewTransaction = () => {
    setSelectedTransaction(null);
    setIsFormOpen(true);
  };

  const pageCount = Math.ceil(totalCount / itemsPerPage);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Contas a Receber</h3>
        <div className="flex gap-2">
          <ExportData 
            data={transactions} 
            filename="receitas" 
            title="Exportar Receitas" 
          />
          <Button variant="default" onClick={addNewTransaction}>
            <Plus className="mr-2 h-4 w-4" /> Nova Receita
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                placeholder="Pesquisar por descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-40">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Recebidos</SelectItem>
                  <SelectItem value="pending">A receber</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" /> Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>
            {selectedTransaction ? 'Editar Receita' : 'Nova Receita'}
          </DialogTitle>
          <IncomeTransactionForm 
            transaction={selectedTransaction} 
            onSubmit={handleFormSubmit} 
            onCancel={() => setIsFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {loading ? (
        <LoadingSpinner />
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed">
          <p className="mb-4 text-muted-foreground">Nenhuma receita encontrada.</p>
          <Button variant="outline" onClick={addNewTransaction}>
            <Plus className="mr-2 h-4 w-4" /> Cadastrar Nova Receita
          </Button>
        </div>
      ) : (
        <>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell>{transaction.category?.name}</TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>{transaction.bank_account?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.is_paid ? "success" : "outline"}>
                        {transaction.is_paid ? 'Recebido' : 'A receber'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500"
                          onClick={() => handleDelete(transaction)}
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

          {pageCount > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {[...Array(pageCount)].map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                      }}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < pageCount) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage >= pageCount ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};
