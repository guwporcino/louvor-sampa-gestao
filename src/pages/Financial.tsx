
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { DollarSign, PieChart, Landmark, ArrowUpDown, FileText, ArrowLeft } from 'lucide-react';
import { FinancialDashboard } from '@/components/financial/FinancialDashboard';
import { IncomeTransactions } from '@/components/financial/IncomeTransactions';
import { IncomeCategories } from '@/components/financial/IncomeCategories';
import { ExpenseTransactions } from '@/components/financial/ExpenseTransactions';
import { ExpenseCategories } from '@/components/financial/ExpenseCategories';
import { BankAccountsList } from '@/components/financial/BankAccountsList';
import { FinancialReports } from '@/components/financial/FinancialReports';
import { ExportData } from '@/components/financial/ExportData';
import { FinancialImport } from '@/components/financial/FinancialImport';

const Financial = () => {
  // Sample empty data for ExportData component
  const emptyExportData = {
    data: [],
    filename: 'financial-data',
    title: 'Dados Financeiros'
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">
            Gerencie receitas, despesas e contas bancárias da igreja
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/home">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid grid-cols-3 md:grid-cols-9 max-w-full overflow-x-auto">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="income" className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            <span className="hidden sm:inline">Receitas</span>
          </TabsTrigger>
          <TabsTrigger value="expense" className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 rotate-180" />
            <span className="hidden sm:inline">Despesas</span>
          </TabsTrigger>
          <TabsTrigger value="income-categories" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Cat. Receitas</span>
          </TabsTrigger>
          <TabsTrigger value="expense-categories" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Cat. Despesas</span>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            <span className="hidden sm:inline">Contas</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Relatórios</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Importar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <FinancialDashboard />
        </TabsContent>
        
        <TabsContent value="income" className="space-y-4">
          <IncomeTransactions />
        </TabsContent>
        
        <TabsContent value="expense" className="space-y-4">
          <ExpenseTransactions />
        </TabsContent>
        
        <TabsContent value="income-categories" className="space-y-4">
          <IncomeCategories />
        </TabsContent>
        
        <TabsContent value="expense-categories" className="space-y-4">
          <ExpenseCategories />
        </TabsContent>
        
        <TabsContent value="accounts" className="space-y-4">
          <BankAccountsList />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <FinancialReports />
        </TabsContent>
        
        <TabsContent value="export" className="space-y-4">
          <ExportData 
            data={emptyExportData.data} 
            filename={emptyExportData.filename} 
            title={emptyExportData.title} 
          />
        </TabsContent>
        
        <TabsContent value="import" className="space-y-4">
          <FinancialImport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financial;
