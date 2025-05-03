
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ScheduleForm from "./ScheduleForm";
import { Schedule, Member, Song } from "@/types";
import { useMediaQuery } from "@/hooks/use-media-query";

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

  const handleCancel = () => {
    onOpenChange(false);
    onCancel();
  };

  const handleSubmit = (formData: Partial<Schedule>) => {
    onSubmit(formData);
    onOpenChange(false);
  };

  const modalTitle = title || (schedule 
    ? viewMode ? "Visualizar Escala" : "Editar Escala" 
    : "Nova Escala");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4 overflow-y-auto">
            <ScheduleForm
              schedule={schedule}
              members={members}
              songs={songs}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
              viewMode={viewMode}
            />
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
          <ScheduleForm
            schedule={schedule}
            members={members}
            songs={songs}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            viewMode={viewMode}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ScheduleFormModal;
