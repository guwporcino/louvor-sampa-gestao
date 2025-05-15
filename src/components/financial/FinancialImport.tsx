import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { IncomeTransaction, ExpenseTransaction } from '@/types/financial';
import LoadingSpinner from '@/components/LoadingSpinner';

export const FinancialImport = () => {
  const [activeTab, setActiveTab] = useState('income');
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    errors: number;
    errorMessages: string[];
  } | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'income' | 'expense') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setImportResult(null);
      
      // Read the Excel file
      const data = await readExcelFile(file);
      
      if (data.length === 0) {
        throw new Error('Arquivo vazio ou sem dados válidos');
      }
      
      // Process and import data based on type
      if (type === 'income') {
        await importIncomeData(data);
      } else {
        await importExpenseData(data);
      }
      
      toast({
        title: 'Importação concluída',
        description: `Dados importados com sucesso.`,
      });
      
      // Reset the file input
      e.target.value = '';
      
    } catch (error: any) {
      console.error('Error importing file:', error);
      toast({
        title: 'Erro na importação',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Erro ao processar o arquivo Excel'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler o arquivo'));
      };
      
      reader.readAsBinaryString(file);
    });
  };

  const importIncomeData = async (data: any[]) => {
    // First, get categories for mapping
    const { data: categories, error: catError } = await supabase
      .from('income_categories')
      .select('id, name')
      .eq('active', true);
    
    if (catError) throw catError;
    
    // Get bank accounts for mapping
    const { data: accounts, error: accError } = await supabase
      .from('bank_accounts')
      .select('id, name')
      .eq('active', true);
    
    if (accError) throw accError;
    
    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));
    const accountMap = new Map(accounts.map(a => [a.name.toLowerCase(), a.id]));
    
    const results = {
      success: 0,
      errors: 0,
      errorMessages: [] as string[]
    };
    
    // Process each row
    for (const row of data) {
      try {
        // Expected columns in Excel: Descrição, Valor, Data, Categoria, Conta, Recebido
        if (!row.Descrição || !row.Valor || !row.Data) {
          throw new Error(`Linha sem dados obrigatórios: ${JSON.stringify(row)}`);
        }
        
        // Find category ID
        let categoryId = null;
        if (row.Categoria) {
          categoryId = categoryMap.get(row.Categoria.toLowerCase());
          if (!categoryId) {
            // Create new category if doesn't exist
            const { data: newCat, error: newCatError } = await supabase
              .from('income_categories')
              .insert({ name: row.Categoria, type: 'income' })
              .select('id')
              .single();
            
            if (newCatError) throw newCatError;
            
            categoryId = newCat.id;
            categoryMap.set(row.Categoria.toLowerCase(), categoryId);
          }
        } else {
          throw new Error(`Categoria não especificada para: ${row.Descrição}`);
        }
        
        // Find account ID if specified
        let accountId = null;
        if (row.Conta) {
          accountId = accountMap.get(row.Conta.toLowerCase());
          // We don't create new accounts automatically as they need additional details
        }
        
        // Parse date
        let date;
        if (typeof row.Data === 'number') {
          // Excel date serial number
          date = XLSX.SSF.parse_date_code(row.Data);
          date = new Date(Date.UTC(date.y, date.m - 1, date.d));
        } else if (typeof row.Data === 'string') {
          // Try to parse string date
          const parts = row.Data.split(/[\/\-\.]/);
          if (parts.length === 3) {
            // Assuming DD/MM/YYYY format
            date = new Date(parts[2], parts[1] - 1, parts[0]);
          } else {
            date = new Date(row.Data);
          }
        }
        
        if (isNaN(date)) {
          throw new Error(`Data inválida: ${row.Data}`);
        }
        
        // Create transaction object with explicit non-optional properties
        const transaction = {
          description: row.Descrição,
          amount: parseFloat(row.Valor),
          date: date.toISOString().split('T')[0],
          category_id: categoryId,
          bank_account_id: accountId,
          is_paid: row.Recebido === 'Sim' || row.Recebido === true || row.Recebido === 'true',
          reference_number: row.Referência || null,
          notes: row.Observações || null
        };
        
        // Insert transaction
        const { error: insertError } = await supabase
          .from('income_transactions')
          .insert(transaction);
        
        if (insertError) throw insertError;
        
        results.success++;
      } catch (error: any) {
        results.errors++;
        results.errorMessages.push(error.message);
      }
    }
    
    setImportResult(results);
  };

  const importExpenseData = async (data: any[]) => {
    // First, get categories for mapping
    const { data: categories, error: catError } = await supabase
      .from('expense_categories')
      .select('id, name')
      .eq('active', true);
    
    if (catError) throw catError;
    
    // Get bank accounts for mapping
    const { data: accounts, error: accError } = await supabase
      .from('bank_accounts')
      .select('id, name')
      .eq('active', true);
    
    if (accError) throw accError;
    
    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));
    const accountMap = new Map(accounts.map(a => [a.name.toLowerCase(), a.id]));
    
    const results = {
      success: 0,
      errors: 0,
      errorMessages: [] as string[]
    };
    
    // Process each row
    for (const row of data) {
      try {
        // Expected columns in Excel: Descrição, Valor, Vencimento, Categoria, Conta, Pago
        if (!row.Descrição || !row.Valor || !row.Vencimento) {
          throw new Error(`Linha sem dados obrigatórios: ${JSON.stringify(row)}`);
        }
        
        // Find category ID
        let categoryId = null;
        if (row.Categoria) {
          categoryId = categoryMap.get(row.Categoria.toLowerCase());
          if (!categoryId) {
            // Create new category if doesn't exist
            const { data: newCat, error: newCatError } = await supabase
              .from('expense_categories')
              .insert({ name: row.Categoria, type: 'expense' })
              .select('id')
              .single();
            
            if (newCatError) throw newCatError;
            
            categoryId = newCat.id;
            categoryMap.set(row.Categoria.toLowerCase(), categoryId);
          }
        } else {
          throw new Error(`Categoria não especificada para: ${row.Descrição}`);
        }
        
        // Find account ID if specified
        let accountId = null;
        if (row.Conta) {
          accountId = accountMap.get(row.Conta.toLowerCase());
          // We don't create new accounts automatically as they need additional details
        }
        
        // Parse date
        let dueDate;
        if (typeof row.Vencimento === 'number') {
          // Excel date serial number
          dueDate = XLSX.SSF.parse_date_code(row.Vencimento);
          dueDate = new Date(Date.UTC(dueDate.y, dueDate.m - 1, dueDate.d));
        } else if (typeof row.Vencimento === 'string') {
          // Try to parse string date
          const parts = row.Vencimento.split(/[\/\-\.]/);
          if (parts.length === 3) {
            // Assuming DD/MM/YYYY format
            dueDate = new Date(parts[2], parts[1] - 1, parts[0]);
          } else {
            dueDate = new Date(row.Vencimento);
          }
        }
        
        if (isNaN(dueDate)) {
          throw new Error(`Data inválida: ${row.Vencimento}`);
        }
        
        // Create transaction object with explicit non-optional properties
        const transaction = {
          description: row.Descrição,
          amount: parseFloat(row.Valor),
          due_date: dueDate.toISOString().split('T')[0],
          category_id: categoryId,
          bank_account_id: accountId,
          is_paid: row.Pago === 'Sim' || row.Pago === true || row.Pago === 'true',
          reference_number: row.Referência || null,
          notes: row.Observações || null
        };
        
        // Insert transaction
        const { error: insertError } = await supabase
          .from('expense_transactions')
          .insert(transaction);
        
        if (insertError) throw insertError;
        
        results.success++;
      } catch (error: any) {
        results.errors++;
        results.errorMessages.push(error.message);
      }
    }
    
    setImportResult(results);
  };
  
  const handleDownloadTemplate = (type: 'income' | 'expense') => {
    try {
      const workbook = XLSX.utils.book_new();
      let data: any[];
      
      if (type === 'income') {
        data = [
          {
            "Descrição": "Dízimos Janeiro",
            "Valor": 1000.00,
            "Data": "10/01/2022",
            "Categoria": "Dízimos",
            "Conta": "Conta principal",
            "Recebido": "Sim",
            "Referência": "Recibo #123",
            "Observações": "Exemplo de observação"
          }
        ];
      } else {
        data = [
          {
            "Descrição": "Conta de Energia",
            "Valor": 500.00,
            "Vencimento": "15/01/2022",
            "Categoria": "Luz",
            "Conta": "Conta principal",
            "Pago": "Sim",
            "Referência": "Fatura #456",
            "Observações": "Exemplo de observação"
          }
        ];
      }
      
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelo');
      
      // Auto-adjust columns width
      const colWidths: any = {};
      Object.keys(data[0]).forEach(key => colWidths[key] = key.length + 2);
      worksheet['!cols'] = Object.keys(colWidths).map(key => ({ wch: Math.max(15, colWidths[key]) }));
      
      // Save file
      XLSX.writeFile(workbook, `modelo_${type === 'income' ? 'receitas' : 'despesas'}.xlsx`);
      
      toast({
        title: 'Modelo baixado com sucesso',
        description: 'Use este modelo como base para importar seus dados',
      });
    } catch (error) {
      toast({
        title: 'Erro ao gerar modelo',
        description: 'Não foi possível gerar o arquivo',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="income">Importar Receitas</TabsTrigger>
          <TabsTrigger value="expense">Importar Despesas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>Importação de Receitas</CardTitle>
              <CardDescription>
                Importe suas receitas a partir de uma planilha Excel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <Button variant="outline" onClick={() => handleDownloadTemplate('income')}>
                    Download do Modelo Excel
                  </Button>
                  
                  <p className="text-sm text-muted-foreground">
                    Use este modelo como base para preparar seus dados para importação
                  </p>
                </div>
                
                <div className="border border-dashed rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium text-lg">Selecionar Arquivo</h3>
                      <p className="text-sm text-muted-foreground">
                        Clique para selecionar ou arraste o arquivo Excel
                      </p>
                    </div>
                    <div>
                      <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={(e) => handleFileUpload(e, 'income')}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary file:text-white
                          hover:file:bg-primary/90"
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                </div>

                {isUploading && (
                  <div className="flex justify-center">
                    <LoadingSpinner text="Importando dados..." />
                  </div>
                )}

                {importResult && (
                  <Alert variant={importResult.errors > 0 ? "destructive" : "default"}>
                    <div className="flex items-center gap-2">
                      {importResult.errors > 0 ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>Resultado da Importação</AlertTitle>
                    </div>
                    <AlertDescription className="mt-2">
                      <div className="space-y-2">
                        <p>Registros importados com sucesso: {importResult.success}</p>
                        <p>Registros com erro: {importResult.errors}</p>
                        
                        {importResult.errors > 0 && (
                          <div className="mt-2">
                            <p className="font-medium">Erros encontrados:</p>
                            <ul className="list-disc pl-5 mt-1 text-sm">
                              {importResult.errorMessages.slice(0, 5).map((msg, idx) => (
                                <li key={idx}>{msg}</li>
                              ))}
                              {importResult.errorMessages.length > 5 && (
                                <li>
                                  E mais {importResult.errorMessages.length - 5} erros...
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense">
          <Card>
            <CardHeader>
              <CardTitle>Importação de Despesas</CardTitle>
              <CardDescription>
                Importe suas despesas a partir de uma planilha Excel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <Button variant="outline" onClick={() => handleDownloadTemplate('expense')}>
                    Download do Modelo Excel
                  </Button>
                  
                  <p className="text-sm text-muted-foreground">
                    Use este modelo como base para preparar seus dados para importação
                  </p>
                </div>
                
                <div className="border border-dashed rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium text-lg">Selecionar Arquivo</h3>
                      <p className="text-sm text-muted-foreground">
                        Clique para selecionar ou arraste o arquivo Excel
                      </p>
                    </div>
                    <div>
                      <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={(e) => handleFileUpload(e, 'expense')}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary file:text-white
                          hover:file:bg-primary/90"
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                </div>

                {isUploading && (
                  <div className="flex justify-center">
                    <LoadingSpinner text="Importando dados..." />
                  </div>
                )}

                {importResult && (
                  <Alert variant={importResult.errors > 0 ? "destructive" : "default"}>
                    <div className="flex items-center gap-2">
                      {importResult.errors > 0 ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>Resultado da Importação</AlertTitle>
                    </div>
                    <AlertDescription className="mt-2">
                      <div className="space-y-2">
                        <p>Registros importados com sucesso: {importResult.success}</p>
                        <p>Registros com erro: {importResult.errors}</p>
                        
                        {importResult.errors > 0 && (
                          <div className="mt-2">
                            <p className="font-medium">Erros encontrados:</p>
                            <ul className="list-disc pl-5 mt-1 text-sm">
                              {importResult.errorMessages.slice(0, 5).map((msg, idx) => (
                                <li key={idx}>{msg}</li>
                              ))}
                              {importResult.errorMessages.length > 5 && (
                                <li>
                                  E mais {importResult.errorMessages.length - 5} erros...
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
