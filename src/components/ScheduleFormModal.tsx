
import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ScheduleForm from "./ScheduleForm";
import { Schedule, Member, Song, Classroom } from "@/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScheduleExport from "./ScheduleExport";
import SocialShare from "./SocialShare";
import { supabase } from "@/integrations/supabase/client";

interface ScheduleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: Schedule;
  members: Member[];
  songs: Song[];
  onSubmit: (schedule: Partial<Schedule>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  viewMode?: boolean;
  title?: string;
}

const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({
  open,
  onOpenChange,
  schedule,
  members,
  songs,
  onSubmit,
  onCancel,
  isSubmitting = false,
  viewMode = false,
  title
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [activeTab, setActiveTab] = useState("form");
  const [classroom, setClassroom] = useState<Classroom | undefined>(undefined);

  // Buscar sala para EBD quando for visualização
  useEffect(() => {
    if (viewMode && schedule?.classroomId) {
      const fetchClassroom = async () => {
        const { data, error } = await supabase
          .from('classrooms')
          .select('*')
          .eq('id', schedule.classroomId)
          .single();
          
        if (!error && data) {
          setClassroom({
            id: data.id,
            name: data.name,
            description: data.description || '',
            ageGroup: data.age_group || '',
            capacity: data.capacity || 0,
            location: data.location || '',
            active: data.active,
            createdAt: new Date(data.created_at),
          });
        }
      };
      
      fetchClassroom();
    }
  }, [viewMode, schedule]);

  const handleCancel = () => {
    onOpenChange(false);
    onCancel();
  };

  const handleSubmit = (formData: Partial<Schedule>) => {
    // Validação de departamento
    if (!formData.departmentId) {
      console.error("Department ID is required");
      return;
    }
    
    // Para EBD, validar sala de aula
    if (formData.departmentId && !formData.classroomId) {
      console.error("Classroom ID is required for EBD schedules");
      return;
    }
    
    // Validar se tem membros selecionados
    if (!formData.members || formData.members.length === 0) {
      console.error("At least one member must be selected");
      return;
    }
    
    onSubmit(formData);
  };

  const modalTitle = title || (schedule 
    ? viewMode ? "Visualizar Escala" : "Editar Escala" 
    : "Nova Escala");

  const renderContent = () => {
    if (viewMode && schedule) {
      return (
        <Tabs defaultValue="form" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="form">Detalhes</TabsTrigger>
            <TabsTrigger value="export">Exportar</TabsTrigger>
            <TabsTrigger value="share">Compartilhar</TabsTrigger>
          </TabsList>
          <TabsContent value="form">
            <ScheduleForm
              schedule={schedule}
              members={members}
              songs={songs}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
              viewMode={viewMode}
            />
          </TabsContent>
          <TabsContent value="export">
            <ScheduleExport 
              schedule={schedule}
              members={members.filter(m => schedule.members.includes(m.id))}
              classroom={classroom}
            />
          </TabsContent>
          <TabsContent value="share">
            <div className="py-4">
              <h3 className="text-lg font-semibold mb-4">Compartilhar Escala</h3>
              <SocialShare schedule={schedule} />
            </div>
          </TabsContent>
        </Tabs>
      );
    }

    return (
      <ScheduleForm
        schedule={schedule}
        members={members}
        songs={songs}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        viewMode={viewMode}
      />
    );
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="sm:max-w-[700px] p-0 overflow-y-auto max-h-[90vh]"
          showFullScreenOnMobile={true}
        >
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4 overflow-y-auto">
            {renderContent()}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90%] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>{modalTitle}</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto">
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ScheduleFormModal;
