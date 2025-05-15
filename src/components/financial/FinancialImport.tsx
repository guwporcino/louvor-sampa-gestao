import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, Check, FileSpreadsheet, Upload, X } from "lucide-react";
import LoadingSpinner from '@/components/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { read, utils } from 'xlsx';
import { ExpenseTransaction, IncomeTransaction } from '@/types/financial';

interface CSVData {
  [key: string]: string | number | boolean | null;
}

export const FinancialImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [json, setJson] = useState<CSVData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files ? e.target.files[0] : null);
    setJson([]);
    setErrors([]);
    setSuccess(false);
  };

  const handleImport = async () => {
    if (!file) {
      setErrors(['Por favor, selecione um arquivo.']);
      return;
    }

    setLoading(true);
    setErrors([]);
    setSuccess(false);

    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const workbook = read(e.target?.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData: CSVData[] = utils.sheet_to_json(worksheet);

          setJson(jsonData);
        } catch (parseError: any) {
          setErrors(['Erro ao processar o arquivo: ' + parseError.message]);
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setErrors(['Erro ao ler o arquivo.']);
        setLoading(false);
      };

      reader.readAsBinaryString(file);
    } catch (error: any) {
      setErrors(['Erro desconhecido: ' + error.message]);
      setLoading(false);
    }
  };

  const handleSave = async (type: 'income' | 'expense') => {
    if (json.length === 0) {
      setErrors(['Nenhum dado para salvar.']);
      return;
    }

    setLoading(true);
    setErrors([]);
    setSuccess(false);

    try {
      const importPromises = json.map(async (item) => {
        try {
          if (type === 'income') {
            const { error } = await supabase
              .from('income_transactions')
              .insert([
                {
                  description: item.description as string,
                  amount: item.amount as number,
                  date: item.date as string,
                  category_id: item.category_id as string,
                  bank_account_id: item.bank_account_id as string,
                  is_paid: item.is_paid as boolean,
                  payment_date: item.payment_date as string,
                  notes: item.notes as string,
                  reference_number: item.reference_number as string,
                },
              ]);

            if (error) {
              console.error('Erro ao inserir receita:', error);
              return `Erro ao inserir receita: ${error.message}`;
            }
          } else if (type === 'expense') {
            const { error } = await supabase
              .from('expense_transactions')
              .insert([
                {
                  description: item.description as string,
                  amount: item.amount as number,
                  due_date: item.due_date as string,
                  category_id: item.category_id as string,
                  bank_account_id: item.bank_account_id as string,
                  is_paid: item.is_paid as boolean,
                  payment_date: item.payment_date as string,
                  notes: item.notes as string,
                  reference_number: item.reference_number as string,
                },
              ]);

            if (error) {
              console.error('Erro ao inserir despesa:', error);
              return `Erro ao inserir despesa: ${error.message}`;
            }
          }
          return null;
        } catch (itemError: any) {
          console.error('Erro ao processar item:', itemError);
          return `Erro ao processar item: ${itemError.message}`;
        }
      });

      const results = await Promise.all(importPromises);
      const itemErrors = results.filter((result) => result !== null) as string[];

      if (itemErrors.length > 0) {
        setErrors(itemErrors);
        toast({
          title: 'Importação com erros',
          description: 'Alguns itens não foram importados. Verifique os erros abaixo.',
          variant: 'destructive',
        });
      } else {
        setSuccess(true);
        toast({
          title: 'Importação concluída',
          description: 'Todos os dados foram importados com sucesso.',
        });
      }
    } catch (error: any) {
      setErrors(['Erro ao salvar dados: ' + error.message]);
      toast({
        title: 'Erro ao salvar dados',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const hasData = json.length > 0;
  const hasErrors = errors.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Dados</CardTitle>
        <CardDescription>
          Importe dados financeiros a partir de arquivos CSV ou Excel.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-4 pr-4">
        <Tabs defaultValue="receitas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="receitas">Receitas</TabsTrigger>
            <TabsTrigger value="despesas">Despesas</TabsTrigger>
          </TabsList>
          <TabsContent value="receitas" className="space-y-4">
            <div>
              <Label htmlFor="income-file">Arquivo de Receitas</Label>
              <Input
                type="file"
                id="income-file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                disabled={loading}
              />
            </div>
            <CardFooter className="justify-between">
              <Button
                variant="secondary"
                onClick={handleImport}
                disabled={loading || !file}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Processar Arquivo
              </Button>
              <Button
                onClick={() => handleSave('income')}
                disabled={loading || !hasData}
              >
                <Upload className="mr-2 h-4 w-4" />
                Salvar Receitas
              </Button>
            </CardFooter>
          </TabsContent>
          <TabsContent value="despesas" className="space-y-4">
            <div>
              <Label htmlFor="expense-file">Arquivo de Despesas</Label>
              <Input
                type="file"
                id="expense-file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                disabled={loading}
              />
            </div>
            <CardFooter className="justify-between">
              <Button
                variant="secondary"
                onClick={handleImport}
                disabled={loading || !file}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Processar Arquivo
              </Button>
              <Button
                onClick={() => handleSave('expense')}
                disabled={loading || !hasData}
              >
                <Upload className="mr-2 h-4 w-4" />
                Salvar Despesas
              </Button>
            </CardFooter>
          </TabsContent>
        </Tabs>

        {loading && <LoadingSpinner />}

        {hasErrors && (
          <div className="space-y-2">
            {errors.map((error, index) => (
              <ErrorAlert key={index}>{error}</ErrorAlert>
            ))}
          </div>
        )}

        {success && (
          <SuccessAlert>
            Dados importados com sucesso!
          </SuccessAlert>
        )}

        {hasData && (
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-medium">Dados Processados:</h4>
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(json[0]).map((key) => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {json.map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, i) => (
                        <TableCell key={i}>{String(value)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Fix this component issue with the text prop in FinancialImport.tsx
const ErrorAlert = ({ children }: { children: React.ReactNode }) => (
  <Alert variant="destructive" className="mt-4">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Erro</AlertTitle>
    <AlertDescription>{children}</AlertDescription>
  </Alert>
);

const SuccessAlert = ({ children }: { children: React.ReactNode }) => (
  <Alert variant="default" className="mt-4 bg-green-50 border-green-200">
    <Check className="h-4 w-4 text-green-600" />
    <AlertTitle>Sucesso</AlertTitle>
    <AlertDescription>{children}</AlertDescription>
  </Alert>
);
