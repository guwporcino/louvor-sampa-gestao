import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, FileText, Download } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import { IncomeTransaction, ExpenseTransaction } from '@/types/financial';
import { formatCurrency, formatDate } from '@/utils/formatters';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ExportData } from './ExportData';

export const FinancialReports = () => {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(subMonths(new Date(), 1)));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(subMonths(new Date(), 0)));
  const [loading, setLoading] = useState(false);
  const [incomeData, setIncomeData] = useState<IncomeTransaction[]>([]);
  const [expenseData, setExpenseData] = useState<ExpenseTransaction[]>([]);
  const [incomeByCategoryData, setIncomeByCategoryData] = useState<any[]>([]);
  const [expenseByCategoryData, setExpenseByCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('general');
  const { toast } = useToast();

  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      // Fetch income data
      const { data: income, error: incomeError } = await supabase
        .from('income_transactions')
        .select(`
          *,
          category:category_id(*),
          bank_account:bank_account_id(*)
        `)
        .gte('date', formattedStartDate)
        .lte('date', formattedEndDate)
        .order('date', { ascending: false });
      
      if (incomeError) throw incomeError;
      
      // Fetch expense data
      const { data: expense, error: expenseError } = await supabase
        .from('expense_transactions')
        .select(`
          *,
          category:category_id(*),
          bank_account:bank_account_id(*)
        `)
        .gte('due_date', formattedStartDate)
        .lte('due_date', formattedEndDate)
        .order('due_date', { ascending: false });
      
      if (expenseError) throw expenseError;
      
      setIncomeData(income as unknown as IncomeTransaction[]);
      setExpenseData(expense as unknown as ExpenseTransaction[]);
      
      // Process data for charts
      const incomeByCategory = processIncomeByCategory(income as unknown as IncomeTransaction[]);
      const expenseByCategory = processExpenseByCategory(expense as unknown as ExpenseTransaction[]);
      const monthlyFinancialData = processMonthlyData(
        income as unknown as IncomeTransaction[], 
        expense as unknown as ExpenseTransaction[]
      );
      
      setIncomeByCategoryData(incomeByCategory);
      setExpenseByCategoryData(expenseByCategory);
      setMonthlyData(monthlyFinancialData);
      
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados do relatório',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const processIncomeByCategory = (data: IncomeTransaction[]) => {
    const categoryMap = new Map();
    
    data.forEach(item => {
      const categoryName = item.category?.name || 'Sem categoria';
      const currentAmount = categoryMap.get(categoryName) || 0;
      categoryMap.set(categoryName, currentAmount + Number(item.amount));
    });
    
    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  const processExpenseByCategory = (data: ExpenseTransaction[]) => {
    const categoryMap = new Map();
    
    data.forEach(item => {
      const categoryName = item.category?.name || 'Sem categoria';
      const currentAmount = categoryMap.get(categoryName) || 0;
      categoryMap.set(categoryName, currentAmount + Number(item.amount));
    });
    
    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  const processMonthlyData = (incomeData: IncomeTransaction[], expenseData: ExpenseTransaction[]) => {
    const monthlyMap = new Map();
    
    // Process income
    incomeData.forEach(item => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthLabel = format(date, 'MMM/yy', { locale: ptBR });
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { 
          key: monthKey,
          name: monthLabel,
          income: 0,
          expense: 0
        });
      }
      
      const monthData = monthlyMap.get(monthKey);
      monthData.income += Number(item.amount);
    });
    
    // Process expenses
    expenseData.forEach(item => {
      const date = new Date(item.due_date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthLabel = format(date, 'MMM/yy', { locale: ptBR });
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { 
          key: monthKey,
          name: monthLabel,
          income: 0,
          expense: 0
        });
      }
      
      const monthData = monthlyMap.get(monthKey);
      monthData.expense += Number(item.amount);
    });
    
    // Convert to array and sort by month
    return Array.from(monthlyMap.values())
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(item => ({
        ...item,
        balance: item.income - item.expense
      }));
  };

  const generateSummary = () => {
    const totalIncome = incomeData.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalExpense = expenseData.reduce((sum, item) => sum + Number(item.amount), 0);
    const balance = totalIncome - totalExpense;
    
    const paidIncome = incomeData
      .filter(item => item.is_paid)
      .reduce((sum, item) => sum + Number(item.amount), 0);
    
    const pendingIncome = incomeData
      .filter(item => !item.is_paid)
      .reduce((sum, item) => sum + Number(item.amount), 0);
    
    const paidExpense = expenseData
      .filter(item => item.is_paid)
      .reduce((sum, item) => sum + Number(item.amount), 0);
    
    const pendingExpense = expenseData
      .filter(item => item.is_paid)
      .reduce((sum, item) => sum + Number(item.amount), 0);
    
    return {
      totalIncome,
      totalExpense,
      balance,
      paidIncome,
      pendingIncome,
      paidExpense,
      pendingExpense
    };
  };

  const handleGenerateReport = () => {
    fetchReportData();
  };
  
  const summary = generateSummary();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Período do Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Data Inicial:</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(startDate, "dd/MM/yyyy", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Data Final:</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(endDate, "dd/MM/yyyy", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-end">
              <Button onClick={handleGenerateReport}>
                <FileText className="mr-2 h-4 w-4" />
                Gerar Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="text-xl font-medium">
              Período: {format(startDate, "dd/MM/yyyy", { locale: ptBR })} a {format(endDate, "dd/MM/yyyy", { locale: ptBR })}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.print()}>
                <Download className="mr-2 h-4 w-4" /> Imprimir
              </Button>
              <ExportData 
                data={[...incomeData, ...expenseData]} 
                filename="relatorio_financeiro" 
                title="Exportar Relatório" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={summary.balance >= 0 ? "border-green-500" : "border-red-500"}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Saldo do Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.balance)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalIncome)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.totalExpense)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Gráficos</TabsTrigger>
              <TabsTrigger value="income">Receitas</TabsTrigger>
              <TabsTrigger value="expense">Despesas</TabsTrigger>
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Receitas por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {incomeByCategoryData.length > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={incomeByCategoryData}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {incomeByCategoryData.map((entry, index) => (
                                <Cell key={`income-cell-${index}`} fill={colors[index % colors.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-[300px]">
                        <p className="text-muted-foreground">Nenhuma receita no período selecionado</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Despesas por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {expenseByCategoryData.length > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={expenseByCategoryData}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {expenseByCategoryData.map((entry, index) => (
                                <Cell key={`expense-cell-${index}`} fill={colors[index % colors.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-[300px]">
                        <p className="text-muted-foreground">Nenhuma despesa no período selecionado</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Receitas e Despesas por Mês</CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyData.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Legend />
                          <Bar dataKey="income" name="Receitas" fill="#4ade80" />
                          <Bar dataKey="expense" name="Despesas" fill="#f87171" />
                          <Bar dataKey="balance" name="Saldo" fill="#60a5fa" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-[300px]">
                      <p className="text-muted-foreground">Nenhum dado para o período selecionado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="income">
              <Card className="mt-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Receitas do Período</CardTitle>
                    <ExportData 
                      data={incomeData} 
                      filename="receitas_relatorio" 
                      title="Receitas" 
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {incomeData.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {incomeData.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{formatDate(item.date)}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{item.category?.name}</TableCell>
                            <TableCell>{formatCurrency(item.amount)}</TableCell>
                            <TableCell>
                              {item.is_paid ? "Recebido" : "A receber"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex justify-center items-center py-8">
                      <p className="text-muted-foreground">Nenhuma receita no período selecionado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="expense">
              <Card className="mt-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Despesas do Período</CardTitle>
                    <ExportData 
                      data={expenseData} 
                      filename="despesas_relatorio" 
                      title="Despesas" 
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {expenseData.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vencimento</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenseData.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{formatDate(item.due_date)}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{item.category?.name}</TableCell>
                            <TableCell>{formatCurrency(item.amount)}</TableCell>
                            <TableCell>
                              {item.is_paid ? "Pago" : "A pagar"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex justify-center items-center py-8">
                      <p className="text-muted-foreground">Nenhuma despesa no período selecionado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="monthly">
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Resumo Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyData.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mês</TableHead>
                          <TableHead>Receitas</TableHead>
                          <TableHead>Despesas</TableHead>
                          <TableHead>Saldo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monthlyData.map((item) => (
                          <TableRow key={item.key}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-green-600">
                              {formatCurrency(item.income)}
                            </TableCell>
                            <TableCell className="text-red-600">
                              {formatCurrency(item.expense)}
                            </TableCell>
                            <TableCell className={item.balance >= 0 ? "text-green-600" : "text-red-600"}>
                              {formatCurrency(item.balance)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-bold">
                          <TableCell>TOTAL</TableCell>
                          <TableCell className="text-green-600">
                            {formatCurrency(summary.totalIncome)}
                          </TableCell>
                          <TableCell className="text-red-600">
                            {formatCurrency(summary.totalExpense)}
                          </TableCell>
                          <TableCell className={summary.balance >= 0 ? "text-green-600" : "text-red-600"}>
                            {formatCurrency(summary.balance)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex justify-center items-center py-8">
                      <p className="text-muted-foreground">Nenhum dado para o período selecionado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};
