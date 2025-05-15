
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BankAccountsList } from "@/components/financial/BankAccountsList";
import { IncomeTransactions } from "@/components/financial/IncomeTransactions";
import { ExpenseTransactions } from "@/components/financial/ExpenseTransactions";
import { FinancialDashboard } from "@/components/financial/FinancialDashboard";
import { IncomeCategories } from "@/components/financial/IncomeCategories";
import { ExpenseCategories } from "@/components/financial/ExpenseCategories";
import { FinancialReports } from "@/components/financial/FinancialReports";
import { FinancialImport } from "@/components/financial/FinancialImport";
import { useToast } from "@/components/ui/use-toast";

const Financial = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Financeiro</h2>
          <p className="text-muted-foreground">
            Gerencie as finanças da igreja com controle de contas a pagar e receber.
          </p>
        </div>
        
        <Separator />

        <Tabs 
          defaultValue="dashboard" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="income">Recebimentos</TabsTrigger>
            <TabsTrigger value="expense">Pagamentos</TabsTrigger>
            <TabsTrigger value="accounts">Contas</TabsTrigger>
            <TabsTrigger value="incomeCategories">Cat. Receitas</TabsTrigger>
            <TabsTrigger value="expenseCategories">Cat. Despesas</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="import">Importação</TabsTrigger>
          </TabsList>
          
          <Card>
            <TabsContent value="dashboard">
              <CardHeader>
                <CardTitle>Dashboard Financeiro</CardTitle>
                <CardDescription>Visualize resumo e indicadores financeiros</CardDescription>
              </CardHeader>
              <CardContent>
                <FinancialDashboard />
              </CardContent>
            </TabsContent>
            
            <TabsContent value="income">
              <CardHeader>
                <CardTitle>Contas a Receber</CardTitle>
                <CardDescription>Gerencie recebimentos e entradas financeiras</CardDescription>
              </CardHeader>
              <CardContent>
                <IncomeTransactions />
              </CardContent>
            </TabsContent>
            
            <TabsContent value="expense">
              <CardHeader>
                <CardTitle>Contas a Pagar</CardTitle>
                <CardDescription>Gerencie pagamentos e despesas</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseTransactions />
              </CardContent>
            </TabsContent>
            
            <TabsContent value="accounts">
              <CardHeader>
                <CardTitle>Contas Bancárias</CardTitle>
                <CardDescription>Gerencie suas contas bancárias</CardDescription>
              </CardHeader>
              <CardContent>
                <BankAccountsList />
              </CardContent>
            </TabsContent>
            
            <TabsContent value="incomeCategories">
              <CardHeader>
                <CardTitle>Categorias de Receita</CardTitle>
                <CardDescription>Gerencie os tipos de entradas financeiras</CardDescription>
              </CardHeader>
              <CardContent>
                <IncomeCategories />
              </CardContent>
            </TabsContent>
            
            <TabsContent value="expenseCategories">
              <CardHeader>
                <CardTitle>Categorias de Despesa</CardTitle>
                <CardDescription>Gerencie os tipos de despesas</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseCategories />
              </CardContent>
            </TabsContent>
            
            <TabsContent value="reports">
              <CardHeader>
                <CardTitle>Relatórios</CardTitle>
                <CardDescription>Gere relatórios e exporte dados</CardDescription>
              </CardHeader>
              <CardContent>
                <FinancialReports />
              </CardContent>
            </TabsContent>
            
            <TabsContent value="import">
              <CardHeader>
                <CardTitle>Importação de Dados</CardTitle>
                <CardDescription>Importe dados financeiros de planilhas Excel</CardDescription>
              </CardHeader>
              <CardContent>
                <FinancialImport />
              </CardContent>
            </TabsContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default Financial;
