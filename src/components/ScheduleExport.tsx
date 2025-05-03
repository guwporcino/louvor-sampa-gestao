
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { FilePdf, Share } from "lucide-react";
import { Schedule, Member, Classroom } from "@/types";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf-html2canvas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';

interface ScheduleExportProps {
  schedule: Schedule;
  members: Member[];
  classroom?: Classroom;
}

const ScheduleExport: React.FC<ScheduleExportProps> = ({ 
  schedule, 
  members,
  classroom
}) => {
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  const handleGeneratePDF = async () => {
    if (!contentRef.current) return;
    
    try {
      toast({
        title: "Preparando PDF",
        description: "Aguarde enquanto geramos o documento...",
      });

      // Forçar renderização com estilos para PDF
      const container = contentRef.current;
      container.classList.add('pdf-mode');
      
      // Gerar canvas a partir do conteúdo
      const canvas = await html2canvas(container, {
        scale: 2, // Melhor qualidade
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });
      
      // Remover classe de estilo PDF
      container.classList.remove('pdf-mode');
      
      // Criar PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Adicionar a imagem do canvas ao PDF
      await pdf.html2canvas(canvas, {
        imageType: 'image/png',
        width: 210, // A4 width in mm
        height: 0, // Height auto
        margin: [10, 10, 10, 10], // top, right, bottom, left
      });

      // Salvar PDF com nome baseado no título da escala
      const filename = `${schedule.title.replace(/\s+/g, '_')}_${format(schedule.date, 'dd-MM-yyyy')}.pdf`;
      pdf.save(filename);
      
      toast({
        title: "PDF Gerado",
        description: `O arquivo ${filename} foi baixado com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button
          onClick={handleGeneratePDF}
          className="flex items-center gap-2"
          variant="outline"
        >
          <FilePdf className="h-4 w-4" />
          <span>Gerar PDF</span>
        </Button>
      </div>

      {/* Conteúdo que será exportado para PDF */}
      <div 
        ref={contentRef}
        className="bg-white p-6 border border-gray-200 rounded-md hidden md:block"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">{schedule.title}</h2>
            <p className="text-gray-600">
              {format(schedule.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            {schedule.description && (
              <p className="mt-2 text-gray-700">{schedule.description}</p>
            )}
          </div>
          <div className="text-right">
            <p className="font-bold">Escola Bíblica Dominical</p>
            {classroom && (
              <p className="text-gray-600">Sala: {classroom.name}</p>
            )}
          </div>
        </div>

        <hr className="my-4" />

        <h3 className="text-lg font-semibold mb-3">Professores</h3>
        <div className="space-y-2">
          {members
            .filter(member => schedule.members.includes(member.id))
            .map((member) => (
              <div
                key={member.id}
                className="p-2 border rounded-md"
              >
                <p className="font-medium">{member.name}</p>
                {member.phone && (
                  <p className="text-sm text-gray-500">Tel: {member.phone}</p>
                )}
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
            ))}
            
          {schedule.members.length === 0 && (
            <p className="text-gray-500">Nenhum professor selecionado</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleExport;
