
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatters';
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell } from 'recharts';
import { IncomeTransaction, ExpenseTransaction } from '@/types/financial';

export const FinancialDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [incomeByCategoryData, setIncomeByCategoryData] = useState<any[]>([]);
  const [expenseByCategoryData, setExpenseByCategoryData] = useState<any[]>([]);

  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Carregar dados de receitas
      const { data: incomeData, error: incomeError } = await supabase
        .from('income_transactions')
        .select(`
          *,
          category:category_id(name)
        `)
        .gte('date', new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString());
      
      // Carregar dados de despesas
      const { data: expenseData, error: expenseError } = await supabase
        .from('expense_transactions')
        .select(`
          *,
          category:category_id(name)
        `)
        .gte('due_date', new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString());
      
      if (incomeError || expenseError) {
        console.error('Erro ao carregar dados:', incomeError || expenseError);
        setLoading(false);
        return;
      }
      
      // Calcular totais
      const totalInc = incomeData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const totalExp = expenseData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      
      setTotalIncome(totalInc);
      setTotalExpense(totalExp);
      
      // Preparar dados mensais
      const monthlyStats = prepareMonthlyData(incomeData as IncomeTransaction[], expenseData as ExpenseTransaction[]);
      setMonthlyData(monthlyStats);
      
      // Dados por categoria
      const incomeByCategory = prepareIncomeByCategory(incomeData as IncomeTransaction[]);
      const expenseByCategory = prepareExpenseByCategory(expenseData as ExpenseTransaction[]);
      
      setIncomeByCategoryData(incomeByCategory);
      setExpenseByCategoryData(expenseByCategory);
      
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  const prepareMonthlyData = (incomeData: IncomeTransaction[], expenseData: ExpenseTransaction[]) => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleString('pt-BR', { month: 'short' }),
        year: date.getFullYear(),
        date: date
      };
    }).reverse();
    
    return months.map(monthItem => {
      const monthIncome = incomeData
        .filter(item => {
          const itemDate = new Date(item.date);
          return itemDate.getMonth() === monthItem.date.getMonth() && 
                 itemDate.getFullYear() === monthItem.date.getFullYear();
        })
        .reduce((sum, item) => sum + Number(item.amount), 0);
        
      const monthExpense = expenseData
        .filter(item => {
          const itemDate = new Date(item.due_date);
          return itemDate.getMonth() === monthItem.date.getMonth() && 
                 itemDate.getFullYear() === monthItem.date.getFullYear();
        })
        .reduce((sum, item) => sum + Number(item.amount), 0);
        
      return {
        name: `${monthItem.month}/${monthItem.year.toString().substr(2, 2)}`,
        receitas: monthIncome,
        despesas: monthExpense,
        saldo: monthIncome - monthExpense
      };
    });
  };
  
  const prepareIncomeByCategory = (incomeData: IncomeTransaction[]) => {
    const categoryMap = new Map();
    
    incomeData.forEach(item => {
      const categoryName = item.category?.name || 'Sem categoria';
      const currentAmount = categoryMap.get(categoryName) || 0;
      categoryMap.set(categoryName, currentAmount + Number(item.amount));
    });
    
    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  const prepareExpenseByCategory = (expenseData: ExpenseTransaction[]) => {
    const categoryMap = new Map();
    
    expenseData.forEach(item => {
      const categoryName = item.category?.name || 'Sem categoria';
      const currentAmount = categoryMap.get(categoryName) || 0;
      categoryMap.set(categoryName, currentAmount + Number(item.amount));
    });
    
    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Carregando...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Carregando...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Carregando...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
        <Skeleton className="h-[300px] w-full col-span-3" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpense)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo do Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(totalIncome - totalExpense) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalIncome - totalExpense)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de receitas e despesas por mês */}
      <Card>
        <CardHeader>
          <CardTitle>Receitas e Despesas (Últimos 6 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="receitas" fill="#4ade80" name="Receitas" />
                <Bar dataKey="despesas" fill="#f87171" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gráfico de receitas por categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Receitas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
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
          </CardContent>
        </Card>

        {/* Gráfico de despesas por categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
