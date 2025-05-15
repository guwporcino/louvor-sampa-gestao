import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatDate } from '@/utils/formatters';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ExportData } from './ExportData';
import { IncomeTransaction, ExpenseTransaction } from '@/types/financial';
import { FileText, Filter, LineChart, PieChart } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Pie,
  Cell
} from 'recharts';

interface ReportFilter {
  startDate: string;
  endDate: string;
  category: string;
  bankAccount: string;
}

export const FinancialReports = () => {
  const [filter, setFilter] = useState<ReportFilter>({
    startDate: '',
    endDate: '',
    category: '',
    bankAccount: '',
  });
  const [incomeTransactions, setIncomeTransactions] = useState<IncomeTransaction[]>([]);
  const [expenseTransactions, setExpenseTransactions] = useState<ExpenseTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [reportType, setReportType] = useState('table'); // 'table' | 'chart'
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'pie'

  useEffect(() => {
    fetchData();
    fetchCategories();
    fetchBankAccounts();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: incomeData, error: incomeError } = await supabase
        .from('income_transactions')
        .select(`
          *,
          category:category_id(*),
          bank_account:bank_account_id(*)
        `)
        .gte('date', filter.startDate || '1970-01-01')
        .lte('date', filter.endDate || '2100-01-01');

      if (incomeError) throw incomeError;
      setIncomeTransactions(incomeData || []);

      const { data: expenseData, error: expenseError } = await supabase
        .from('expense_transactions')
        .select(`
          *,
          category:category_id(*),
          bank_account:bank_account_id(*)
        `)
        .gte('due_date', filter.startDate || '1970-01-01')
        .lte('due_date', filter.endDate || '2100-01-01');

      if (expenseError) throw expenseError;
      setExpenseTransactions(expenseData || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('income_categories')
        .select('*');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*');

      if (error) throw error;
      setBankAccounts(data || []);
    } catch (error: any) {
      console.error("Error fetching bank accounts:", error);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchData();
  };

  const totalIncome = incomeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalExpenses = expenseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Prepare chart data
  const chartData = () => {
    if (chartType === 'bar') {
      const incomeByCategory: { [key: string]: number } = {};
      incomeTransactions.forEach(transaction => {
        const categoryName = transaction.category?.name || 'Sem Categoria';
        incomeByCategory[categoryName] = (incomeByCategory[categoryName] || 0) + transaction.amount;
      });

      const expenseByCategory: { [key: string]: number } = {};
      expenseTransactions.forEach(transaction => {
        const categoryName = transaction.category?.name || 'Sem Categoria';
        expenseByCategory[categoryName] = (expenseByCategory[categoryName] || 0) + transaction.amount;
      });

      const barData = Object.keys(incomeByCategory).map(category => ({
        name: category,
        Receitas: incomeByCategory[category],
        Despesas: expenseByCategory[category] || 0,
      }));
      
      return barData;
    } else if (chartType === 'pie') {
      const totalIncome = incomeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
      const totalExpenses = expenseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
      
      return [
        { name: 'Receitas', value: totalIncome },
        { name: 'Despesas', value: totalExpenses },
      ];
    }
    return [];
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Relatórios Financeiros</h3>
        <ExportData 
          data={[...incomeTransactions, ...expenseTransactions]} 
          filename="relatorio-financeiro" 
          title="Exportar Relatório" 
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
            <div>
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input type="date" id="startDate" name="startDate" onChange={handleFilterChange} />
            </div>
            <div>
              <Label htmlFor="endDate">Data Final</Label>
              <Input type="date" id="endDate" name="endDate" onChange={handleFilterChange} />
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select name="category" onValueChange={(value) => setFilter(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bankAccount">Conta Bancária</Label>
              <Select name="bankAccount" onValueChange={(value) => setFilter(prev => ({ ...prev, bankAccount: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {bankAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="mt-4" onClick={applyFilters}>
            <Filter className="mr-2 h-4 w-4" /> Aplicar Filtros
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="visao-geral" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="tabela">Tabela</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
        </TabsList>
        <TabsContent value="visao-geral" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total de Receitas</CardTitle>
                <CardDescription>Todas as receitas no período</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total de Despesas</CardTitle>
                <CardDescription>Todas as despesas no período</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Saldo</CardTitle>
                <CardDescription>Receitas - Despesas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={balance >= 0 ? "text-green-500 text-2xl font-bold" : "text-red-500 text-2xl font-bold"}>
                  {formatCurrency(balance)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="tabela" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transações</CardTitle>
              <CardDescription>Lista de todas as transações</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Conta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomeTransactions.map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>Receita</TableCell>
                      <TableCell>{transaction.category?.name}</TableCell>
                      <TableCell>{transaction.bank_account?.name}</TableCell>
                    </TableRow>
                  ))}
                  {expenseTransactions.map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{formatDate(transaction.due_date)}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>Despesa</TableCell>
                      <TableCell>{transaction.category?.name}</TableCell>
                      <TableCell>{transaction.bank_account?.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="graficos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gráficos</CardTitle>
              <CardDescription>Visualização de dados em gráficos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Select value={chartType} onValueChange={(value) => setChartType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de Gráfico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Barras</SelectItem>
                    <SelectItem value="pie">Pizza</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {chartType === 'bar' && (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Receitas" fill="#82ca9d" />
                    <Bar dataKey="Despesas" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {chartType === 'pie' && (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={chartData()}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={160}
                      fill="#8884d8"
                      label
                    >
                      {chartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
