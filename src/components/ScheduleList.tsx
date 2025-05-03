
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Schedule } from "../types";
import { Calendar, FileText } from "lucide-react";

interface ScheduleListProps {
  schedules: Schedule[];
  onView: (schedule: Schedule) => void;
  onEdit: (schedule: Schedule) => void;
}

const ScheduleList: React.FC<ScheduleListProps> = ({ schedules, onView, onEdit }) => {
  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                Nenhuma escala encontrada
              </TableCell>
            </TableRow>
          ) : (
            schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-worship-blue" />
                    {formatDate(schedule.date)}
                  </div>
                </TableCell>
                <TableCell>{schedule.title}</TableCell>
                <TableCell>{schedule.description}</TableCell>
                <TableCell>
                  <Badge variant={schedule.isPublished ? "success" : "secondary"}>
                    {schedule.isPublished ? "Publicada" : "Rascunho"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(schedule)}
                    >
                      <FileText className="h-3.5 w-3.5 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(schedule)}
                    >
                      <FileText className="h-3.5 w-3.5 mr-1" />
                      Editar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ScheduleList;
