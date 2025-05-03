
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { mockSchedules, mockMembers, mockSongs } from "../data/mockData";
import ScheduleList from "../components/ScheduleList";
import ScheduleForm from "../components/ScheduleForm";
import { Schedule } from "../types";

const Schedules = () => {
  const [schedules, setSchedules] = useState(mockSchedules);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleCreateNew = () => {
    setEditingSchedule(undefined);
    setShowForm(true);
  };
  
  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowForm(true);
  };
  
  const handleView = (schedule: Schedule) => {
    // Por enquanto, apenas abrirá o formulário em modo de visualização
    setEditingSchedule(schedule);
    setShowForm(true);
  };
  
  const handleCancel = () => {
    setShowForm(false);
    setEditingSchedule(undefined);
  };
  
  const handleSubmit = (formData: Partial<Schedule>) => {
    setIsSubmitting(true);
    
    // Simulação de delay de API
    setTimeout(() => {
      if (editingSchedule) {
        // Edição
        setSchedules(schedules.map(schedule => 
          schedule.id === editingSchedule.id ? { ...schedule, ...formData } as Schedule : schedule
        ));
      } else {
        // Criação
        const newSchedule: Schedule = {
          id: String(Date.now()),
          date: formData.date || new Date(),
          title: formData.title || "",
          description: formData.description || "",
          members: formData.members || [],
          songs: formData.songs || [],
          isPublished: formData.isPublished || false,
          createdAt: new Date()
        };
        setSchedules([...schedules, newSchedule]);
      }
      
      setIsSubmitting(false);
      setShowForm(false);
      setEditingSchedule(undefined);
    }, 500);
  };
  
  return (
    <div className="animate-fade-in">
      {showForm ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">
              {editingSchedule ? "Editar Escala" : "Nova Escala"}
            </h1>
          </div>
          <ScheduleForm 
            schedule={editingSchedule}
            members={mockMembers}
            songs={mockSongs}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Escalas</h1>
              <p className="text-gray-600">Gerenciamento de escalas de ministração</p>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-1" /> Nova Escala
            </Button>
          </div>
          
          <ScheduleList 
            schedules={schedules} 
            onView={handleView}
            onEdit={handleEdit} 
          />
        </div>
      )}
    </div>
  );
};

export default Schedules;
