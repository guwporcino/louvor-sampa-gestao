
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Schedule } from "../types";
import { Download, Share2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "@/components/ui/use-toast";

interface ScheduleActionsProps {
  schedule: Schedule;
  members: any[]; // TODO: Usar o tipo correto
  songs: any[]; // TODO: Usar o tipo correto
}

const ScheduleActions: React.FC<ScheduleActionsProps> = ({
  schedule,
  members,
  songs,
}) => {
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!contentRef.current) return;

    try {
      toast({
        title: "Gerando PDF...",
        description: "Por favor, aguarde enquanto geramos o PDF da escala."
      });

      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Escala_${schedule.title.replace(/\s+/g, '_')}.pdf`);

      toast({
        title: "PDF gerado com sucesso!",
        description: "O PDF da escala foi gerado e baixado.",
        variant: "default", // Changed from "success" to "default"
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o PDF da escala.",
        variant: "destructive",
      });
    }
  };

  const sharePDF = async () => {
    if (!contentRef.current) return;

    try {
      // Verifica se a Web Share API está disponível
      if (!navigator.share) {
        toast({
          title: "Compartilhamento não suportado",
          description: "Seu navegador não suporta compartilhamento. Por favor, baixe o PDF e compartilhe manualmente.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Preparando para compartilhar...",
        description: "Por favor, aguarde enquanto preparamos a escala."
      });

      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      // Converter para blob
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      const pdfBlob = pdf.output('blob');
      const pdfFile = new File([pdfBlob], `Escala_${schedule.title.replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' });

      await navigator.share({
        title: `Escala: ${schedule.title}`,
        text: `Compartilhando escala de ministração: ${schedule.title}`,
        files: [pdfFile]
      });

      toast({
        title: "Compartilhamento iniciado",
        description: "Escolha o aplicativo para compartilhar a escala.",
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      
      // Se for erro de cancelamento pelo usuário, não mostrar toast de erro
      if ((error as any).name === "AbortError") return;
      
      toast({
        title: "Erro ao compartilhar",
        description: "Não foi possível compartilhar a escala. Tente baixar o PDF e compartilhar manualmente.",
        variant: "destructive",
      });
    }
  };

  // Formatar data
  const formatDate = (date: Date) => {
    const options = { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      weekday: 'long'
    } as Intl.DateTimeFormatOptions;
    
    return new Date(date).toLocaleDateString('pt-BR', options);
  };

  // Buscar nomes dos membros selecionados
  const getSelectedMembers = () => {
    return members
      .filter(member => schedule.members.includes(member.id))
      .map(member => member.name);
  };

  // Buscar títulos das músicas selecionadas
  const getSelectedSongs = () => {
    return songs
      .filter(song => schedule.songs.includes(song.id))
      .map(song => song.title);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex space-x-2 justify-end">
        <Button
          onClick={generatePDF}
          variant="outline"
          className="flex items-center"
        >
          <Download className="mr-1 h-4 w-4" />
          Baixar PDF
        </Button>
        <Button
          onClick={sharePDF}
          variant="default"
          className="flex items-center"
        >
          <Share2 className="mr-1 h-4 w-4" />
          Compartilhar
        </Button>
      </div>

      {/* Conteúdo para exportar como PDF */}
      <div
        ref={contentRef}
        className="bg-white p-6 rounded-lg border shadow-sm"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-worship-blue">
            {schedule.title}
          </h1>
          <p className="text-gray-600 mt-1">{formatDate(schedule.date)}</p>
          {schedule.description && (
            <p className="text-gray-700 mt-2 italic">{schedule.description}</p>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-worship-blue">
            Músicos e Vocais
          </h2>
          <ul className="list-disc list-inside pl-2">
            {getSelectedMembers().map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2 text-worship-blue">
            Repertório
          </h2>
          <ol className="list-decimal list-inside pl-2">
            {getSelectedSongs().map((title, index) => (
              <li key={index}>{title}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ScheduleActions;
