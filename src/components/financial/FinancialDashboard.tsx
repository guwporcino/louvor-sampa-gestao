import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, PieChart as PieChartIcon, BarChart as BarChartIcon } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { IncomeTransaction, ExpenseTransaction } from '@/types/financial';
import LoadingSpinner from '@/components/LoadingSpinner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const FinancialDashboard = () => {
  const [income, setIncome] = useState<IncomeTransaction[]>([]);
  const [expenses, setExpenses] = useState<ExpenseTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: incomeData, error: incomeError } = await supabase
        .from('income_transactions')
        .select('*');

      if (incomeError) throw incomeError;

      const { data: expensesData, error: expensesError } = await supabase
        .from('expense_transactions')
        .select('*');

      if (expensesError) throw expensesError;

      setIncome(incomeData || []);
      setExpenses(expensesData || []);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total income and expenses
  const totalIncome = income.reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalExpenses = expenses.reduce((sum, transaction) => sum + transaction.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  // Prepare data for charts
  const incomeByCategory = income.reduce((acc: any, transaction) => {
    const categoryName = transaction.category_id || 'Sem Categoria';
    acc[categoryName] = (acc[categoryName] || 0) + transaction.amount;
    return acc;
  }, {});

  const expensesByCategory = expenses.reduce((acc: any, transaction) => {
    const categoryName = transaction.category_id || 'Sem Categoria';
    acc[categoryName] = (acc[categoryName] || 0) + transaction.amount;
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
              {/* <span>{formatCurrency(incomePercentageChange)}</span> */}
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
              {/* <span>{formatCurrency(expensePercentageChange)}</span> */}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saldo Líquido</CardTitle>
            <CardDescription>Receitas - Despesas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netBalance)}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-2" />
              {/* <span>{formatCurrency(netBalancePercentageChange)}</span> */}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contas a Pagar</CardTitle>
            <CardDescription>Total pendente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(expenses.filter(e => !e.is_paid).reduce((sum, transaction) => sum + transaction.amount, 0))}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Wallet className="h-4 w-4 mr-2" />
              {/* <span>{formatCurrency(pendingBalancePercentageChange)}</span> */}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="visao-geral" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visao-geral"><PieChartIcon className="h-4 w-4 mr-2" /> Visão Geral</TabsTrigger>
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
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
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
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="relatorios">
          <div>Em construção...</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
