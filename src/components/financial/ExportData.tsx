
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { FileText, Download } from "lucide-react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';

interface ExportDataProps {
  data: any[];
  filename: string;
  title: string;
}

export const ExportData = ({ data, filename, title }: ExportDataProps) => {
  const { toast } = useToast();

  const exportToPDF = () => {
    try {
      if (data.length === 0) {
        toast({
          title: 'Nenhum dado para exportar',
          description: 'Não há registros para gerar o PDF',
          variant: 'destructive',
        });
        return;
      }

      const doc = new jsPDF();
      const currentDate = format(new Date(), 'dd/MM/yyyy HH:mm');

      // Title
      doc.setFontSize(18);
      doc.text(title, 105, 15, { align: 'center' });
      
      // Date
      doc.setFontSize(10);
      doc.text(`Gerado em: ${currentDate}`, 105, 22, { align: 'center' });

      // Table header
      const headers = Object.keys(data[0])
        .filter(key => !key.endsWith('_id') && key !== 'id' && !key.includes('url'))
        .map(key => {
          // Format headers for better readability
          return key
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        });

      const rows = data.map(item => {
        return Object.entries(item)
          .filter(([key]) => !key.endsWith('_id') && key !== 'id' && !key.includes('url'))
          .map(([key, value]) => {
            // Format values based on their types
            if (typeof value === 'boolean') {
              return value ? 'Sim' : 'Não';
            } else if (key === 'amount') {
              return formatCurrency(value as number);
            } else if (key.includes('date')) {
              return formatDate(value as string);
            } else if (key === 'category' || key === 'bank_account') {
              return (value as any)?.name || '-';
            } else if (value === null || value === undefined) {
              return '-';
            } else {
              return value as string;
            }
          });
      });

      // Create table using autoTable from jspdf-autotable
      (doc as any).autoTable({
        head: [headers],
        body: rows,
        startY: 30,
        headStyles: {
          fillColor: [66, 66, 66],
          textColor: [255, 255, 255]
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { top: 30 }
      });

      // Save PDF
      doc.save(`${filename}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      toast({
        title: 'PDF gerado com sucesso',
        description: 'O arquivo foi baixado para o seu computador',
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Ocorreu um erro ao exportar os dados',
        variant: 'destructive',
      });
    }
  };

  const exportToExcel = () => {
    try {
      if (data.length === 0) {
        toast({
          title: 'Nenhum dado para exportar',
          description: 'Não há registros para gerar a planilha',
          variant: 'destructive',
        });
        return;
      }
      
      // Process data to readable format
      const processedData = data.map(item => {
        const processed: Record<string, any> = {};
        
        Object.entries(item).forEach(([key, value]) => {
          // Skip ids and urls
          if (key === 'id' || key.endsWith('_id') || key.includes('url')) {
            return;
          }
          
          // Format key for better readability
          const formattedKey = key
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          // Format values based on their types
          if (key === 'category' || key === 'bank_account') {
            processed[formattedKey] = (value as any)?.name || '-';
          } else if (typeof value === 'boolean') {
            processed[formattedKey] = value ? 'Sim' : 'Não';
          } else if (key.includes('date') && value) {
            processed[formattedKey] = formatDate(value as string);
          } else if (key === 'amount') {
            processed[formattedKey] = (value as number).toFixed(2);
          } else {
            processed[formattedKey] = value || '-';
          }
        });
        
        return processed;
      });
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(processedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
      
      // Auto-adjust columns width
      const colWidths = processedData.reduce((acc: Record<string, number>, row) => {
        Object.keys(row).forEach(key => {
          const cellValue = String(row[key] || '');
          acc[key] = Math.max(acc[key] || 10, cellValue.length + 2);
        });
        return acc;
      }, {});
      
      worksheet['!cols'] = Object.keys(colWidths).map(key => ({ wch: colWidths[key] }));
      
      // Save file
      XLSX.writeFile(workbook, `${filename}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      
      toast({
        title: 'Planilha gerada com sucesso',
        description: 'O arquivo foi baixado para o seu computador',
      });
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      toast({
        title: 'Erro ao gerar planilha',
        description: 'Ocorreu um erro ao exportar os dados',
        variant: 'destructive',
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" /> Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="mr-2 h-4 w-4" /> Exportar como PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <Download className="mr-2 h-4 w-4" /> Exportar como Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
