
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight, DollarSign, Wallet, 
  PieChart as PieChartIcon, BarChart as BarChartIcon, 
  TrendingUp, CalendarRange 
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { IncomeTransaction, ExpenseTransaction } from '@/types/financial';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#F87171', '#60A5FA', '#34D399', '#A78BFA'];

export const FinancialDashboard = () => {
  const [income, setIncome] = useState<IncomeTransaction[]>([]);
  const [expenses, setExpenses] = useState<ExpenseTransaction[]>([]);
  const [todayIncome, setTodayIncome] = useState<IncomeTransaction[]>([]);
  const [todayExpenses, setTodayExpenses] = useState<ExpenseTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get today's date in YYYY-MM-DD format for filtering
      const today = new Date().toISOString().split('T')[0];

      // Fetch all income transactions
      const { data: incomeData, error: incomeError } = await supabase
        .from('income_transactions')
        .select('*, category:category_id(name, type)');

      if (incomeError) throw incomeError;

      // Fetch all expense transactions
      const { data: expensesData, error: expensesError } = await supabase
        .from('expense_transactions')
        .select('*, category:category_id(name, type)');

      if (expensesError) throw expensesError;
      
      // Cast data to the expected types
      const typedIncomeData = incomeData as unknown as IncomeTransaction[];
      const typedExpensesData = expensesData as unknown as ExpenseTransaction[];

      // Calculate today's transactions
      const todayIncomeData = typedIncomeData.filter(item => 
        item.date === today || (item.payment_date && item.payment_date.split('T')[0] === today)
      );
      
      const todayExpensesData = typedExpensesData.filter(item => 
        item.due_date === today || (item.payment_date && item.payment_date.split('T')[0] === today)
      );

      // Set state with data
      setIncome(typedIncomeData);
      setExpenses(typedExpensesData);
      setTodayIncome(todayIncomeData);
      setTodayExpenses(todayExpensesData);

      // Generate daily data for the past 30 days
      generateDailyData(typedIncomeData, typedExpensesData);

    } catch (error: any) {
      console.error("Erro ao carregar dados:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate daily financial data for charts
  const generateDailyData = (incomeData: IncomeTransaction[], expenseData: ExpenseTransaction[]) => {
    // Generate data for the last 30 days
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayIncome = incomeData
        .filter(item => item.date === dateStr || (item.payment_date && item.payment_date.split('T')[0] === dateStr))
        .reduce((sum, item) => sum + Number(item.amount), 0);
      
      const dayExpense = expenseData
        .filter(item => item.due_date === dateStr || (item.payment_date && item.payment_date.split('T')[0] === dateStr))
        .reduce((sum, item) => sum + Number(item.amount), 0);
      
      data.push({
        date: dateStr,
        income: dayIncome,
        expense: dayExpense,
        balance: dayIncome - dayExpense
      });
    }
    
    setDailyData(data);
  };

  // Calculate total income and expenses
  const totalIncome = income.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const totalExpenses = expenses.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const netBalance = totalIncome - totalExpenses;

  // Calculate today's totals
  const totalTodayIncome = todayIncome.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const totalTodayExpenses = todayExpenses.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const todayNetBalance = totalTodayIncome - totalTodayExpenses;

  // Prepare data for charts
  const incomeByCategory = income.reduce((acc: any, transaction) => {
    const categoryName = transaction.category?.name || 'Sem Categoria';
    acc[categoryName] = (acc[categoryName] || 0) + Number(transaction.amount);
    return acc;
  }, {});

  const expensesByCategory = expenses.reduce((acc: any, transaction) => {
    const categoryName = transaction.category?.name || 'Sem Categoria';
    acc[categoryName] = (acc[categoryName] || 0) + Number(transaction.amount);
    return acc;
  }, {});

  const incomeChartData = Object.entries(incomeByCategory).map(([category, amount]) => ({
    name: category,
    value: amount as number,
  }));

  const expensesChartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount as number,
  }));

  // Today's transactions by category
  const todayIncomeByCategory = todayIncome.reduce((acc: any, transaction) => {
    const categoryName = transaction.category?.name || 'Sem Categoria';
    acc[categoryName] = (acc[categoryName] || 0) + Number(transaction.amount);
    return acc;
  }, {});

  const todayExpensesByCategory = todayExpenses.reduce((acc: any, transaction) => {
    const categoryName = transaction.category?.name || 'Sem Categoria';
    acc[categoryName] = (acc[categoryName] || 0) + Number(transaction.amount);
    return acc;
  }, {});

  const todayIncomeChartData = Object.entries(todayIncomeByCategory).map(([category, amount]) => ({
    name: category,
    value: amount as number,
  }));

  const todayExpensesChartData = Object.entries(todayExpensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount as number,
  }));

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Dashboard Financeiro</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Receita Total</CardTitle>
            <CardDescription>Todas as receitas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <ArrowUpRight className="h-4 w-4 mr-2 text-green-500" />
              <span>Receita acumulada</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesa Total</CardTitle>
            <CardDescription>Todas as despesas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <ArrowDownRight className="h-4 w-4 mr-2 text-red-500" />
              <span>Despesa acumulada</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saldo Líquido</CardTitle>
            <CardDescription>Receitas - Despesas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netBalance)}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-2" />
              <span>Balanço geral</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contas a Pagar</CardTitle>
            <CardDescription>Total pendente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(expenses.filter(e => !e.is_paid).reduce((sum, transaction) => sum + Number(transaction.amount), 0))}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Wallet className="h-4 w-4 mr-2" />
              <span>Pagamentos pendentes</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Summary */}
      <Card className="border-t-4 border-t-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarRange className="mr-2 h-5 w-5 text-blue-500" />
            Transações de Hoje
          </CardTitle>
          <CardDescription>Resumo das transações do dia atual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 p-4 rounded-md">
              <div className="text-sm text-green-700 mb-1">Receitas de Hoje</div>
              <div className="text-2xl font-semibold text-green-700">{formatCurrency(totalTodayIncome)}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-md">
              <div className="text-sm text-red-700 mb-1">Despesas de Hoje</div>
              <div className="text-2xl font-semibold text-red-700">{formatCurrency(totalTodayExpenses)}</div>
            </div>
            <div className={`${todayNetBalance >= 0 ? 'bg-blue-50' : 'bg-amber-50'} p-4 rounded-md`}>
              <div className={`text-sm ${todayNetBalance >= 0 ? 'text-blue-700' : 'text-amber-700'} mb-1`}>Balanço de Hoje</div>
              <div className={`text-2xl font-semibold ${todayNetBalance >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
                {formatCurrency(todayNetBalance)}
              </div>
            </div>
          </div>

          {todayIncome.length === 0 && todayExpenses.length === 0 ? (
            <Alert className="bg-slate-50 mt-4">
              <AlertTitle>Nenhuma transação hoje</AlertTitle>
              <AlertDescription>
                Não foram encontradas transações para o dia de hoje.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {todayIncome.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-green-700">Receitas por Categoria</h4>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={todayIncomeChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {todayIncomeChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              
              {todayExpenses.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-red-700">Despesas por Categoria</h4>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={todayExpensesChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#82ca9d"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {todayExpensesChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="visao-geral" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visao-geral"><PieChartIcon className="h-4 w-4 mr-2" /> Visão Geral</TabsTrigger>
          <TabsTrigger value="tendencias"><TrendingUp className="h-4 w-4 mr-2" /> Tendências</TabsTrigger>
          <TabsTrigger value="relatorios"><BarChartIcon className="h-4 w-4 mr-2" /> Relatórios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visao-geral" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Receitas por Categoria</CardTitle>
                <CardDescription>Distribuição das receitas por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={incomeChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {
                        incomeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))
                      }
                    </Pie>
                    <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
                <CardDescription>Distribuição das despesas por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expensesChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#82ca9d"
                      label
                    >
                      {
                        expensesChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))
                      }
                    </Pie>
                    <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tendencias">
          <Card>
            <CardHeader>
              <CardTitle>Evolução Financeira</CardTitle>
              <CardDescription>Receitas e despesas dos últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    income: { color: '#22c55e' },
                    expense: { color: '#ef4444' },
                    balance: { color: '#3b82f6' }
                  }}
                >
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                      }}
                    />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <RechartsTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Data
                                  </span>
                                  <span className="font-bold text-muted-foreground">
                                    {payload[0].payload.date}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Receitas
                                  </span>
                                  <span className="font-bold text-green-500">
                                    {formatCurrency(payload[0].payload.income)}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Despesas
                                  </span>
                                  <span className="font-bold text-red-500">
                                    {formatCurrency(payload[0].payload.expense)}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Saldo
                                  </span>
                                  <span className={`font-bold ${payload[0].payload.balance >= 0 ? 'text-blue-500' : 'text-amber-500'}`}>
                                    {formatCurrency(payload[0].payload.balance)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#22c55e" 
                      name="Receitas" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expense" 
                      stroke="#ef4444" 
                      name="Despesas" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#3b82f6" 
                      name="Saldo" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="relatorios">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Detalhados</CardTitle>
              <CardDescription>Análises financeiras avançadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="bg-blue-50">
                  <AlertTitle>Em desenvolvimento</AlertTitle>
                  <AlertDescription>
                    Os relatórios detalhados estão em desenvolvimento e estarão disponíveis em breve.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
