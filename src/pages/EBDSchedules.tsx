
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, BookOpen } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Schedule, Member, Classroom } from "../types";
import LoadingSpinner from "@/components/LoadingSpinner";
import ScheduleList from "@/components/ScheduleList";
import { useDepartment } from "@/contexts/DepartmentContext";
import ScheduleFormModal from "@/components/ScheduleFormModal";

const EBDSchedules = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentDepartment } = useDepartment();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [teachers, setTeachers] = useState<Member[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");

  useEffect(() => {
    console.log('EBDSchedules useEffect - ID:', id);
    
    if (id === "novo") {
      console.log('Setting up modal for new schedule');
      handleNewSchedule();
    } else if (id) {
      console.log('Setting up modal for existing schedule:', id);
      fetchScheduleById(id);
    } else {
      console.log('Loading schedule list');
      fetchSchedulesAndTeachers();
    }
  }, [id, currentDepartment]);

  const fetchSchedulesAndTeachers = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchSchedules(), fetchTeachers(), fetchClassrooms()]);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClassrooms = async () => {
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .eq('active', true)
        .order('name');
        
      if (error) throw error;
      
      const formattedClassrooms: Classroom[] = (data || []).map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        ageGroup: c.age_group,
        capacity: c.capacity,
        location: c.location,
        active: c.active,
        createdAt: new Date(c.created_at)
      }));
      
      setClassrooms(formattedClassrooms);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as salas de aula",
        variant: "destructive",
      });
    }
  };

  const fetchSchedules = async () => {
    try {
      // Buscar o departamento de Escola Bíblica primeiro
      const { data: ebdDept, error: deptError } = await supabase
        .from('departments')
        .select('id')
        .eq('name', 'Escola Bíblica')
        .single();

      if (deptError) throw deptError;
      
      // Buscar as escalas da EBD
      const { data, error } = await supabase
        .from("schedules")
        .select(`
          id, 
          title, 
          description, 
          date, 
          is_published,
          classroom_id,
          created_at,
          classrooms:classroom_id (name)
        `)
        .eq("department_id", ebdDept.id)
        .order("date", { ascending: false });

      if (error) throw error;

      const formattedSchedules: Schedule[] = (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description || "",
        date: new Date(item.date),
        isPublished: item.is_published || false,
        members: [],  // Será preenchido depois
        songs: [],    // Não usado para EBD
        departmentId: ebdDept.id,
        classroomId: item.classroom_id,
        createdAt: new Date(item.created_at),
      }));

      // Para cada escala, buscar os professores associados
      for (const schedule of formattedSchedules) {
        const { data: memberData, error: memberError } = await supabase
          .from("schedule_members")
          .select("member_id")
          .eq("schedule_id", schedule.id);

        if (!memberError && memberData) {
          schedule.members = memberData.map((m) => m.member_id);
        }
      }

      setSchedules(formattedSchedules);
    } catch (error) {
      console.error("Erro ao buscar escalas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as escalas",
        variant: "destructive",
      });
    }
  };

  const fetchTeachers = async () => {
    try {
      // Buscar o departamento de Escola Bíblica primeiro
      const { data: ebdDept, error: deptError } = await supabase
        .from('departments')
        .select('id')
        .eq('name', 'Escola Bíblica')
        .single();

      if (deptError) throw deptError;
      
      // Buscar os professores associados ao departamento
      const { data, error } = await supabase
        .from('user_departments')
        .select(`
          profiles:user_id (
            id,
            name,
            email,
            phone,
            active
          )
        `)
        .eq('department_id', ebdDept.id);
      
      if (error) throw error;
      
      const formattedTeachers: Member[] = data
        .map((item) => {
          const profile = item.profiles;
          if (!profile) return null;
          
          return {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            phone: profile.phone || "",
            categories: [], // Não usado para professores
            active: profile.active || true,
            createdAt: new Date(),
          };
        })
        .filter(Boolean) as Member[];
      
      setTeachers(formattedTeachers);
    } catch (error) {
      console.error("Erro ao buscar professores:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os professores",
        variant: "destructive",
      });
    }
  };

  const fetchScheduleById = async (scheduleId: string) => {
    try {
      setIsLoading(true);
      await Promise.all([fetchTeachers(), fetchClassrooms()]); // Carrega os professores e salas

      const { data, error } = await supabase
        .from("schedules")
        .select(`
          id, 
          title, 
          description, 
          date, 
          is_published,
          department_id,
          classroom_id,
          created_at
        `)
        .eq("id", scheduleId)
        .single();

      if (error) throw error;

      // Buscar professores associados
      const { data: memberData, error: memberError } = await supabase
        .from("schedule_members")
        .select("member_id")
        .eq("schedule_id", scheduleId);

      if (memberError) throw memberError;

      const schedule: Schedule = {
        id: data.id,
        title: data.title,
        description: data.description || "",
        date: new Date(data.date),
        isPublished: data.is_published || false,
        members: memberData.map((m) => m.member_id),
        songs: [],  // Não usado para EBD
        departmentId: data.department_id,
        classroomId: data.classroom_id,
        createdAt: new Date(data.created_at),
      };

      setSelectedSchedule(schedule);
      setModalMode("edit");
      setModalOpen(true);
      
      // Redirecionar para a URL base
      navigate("/escalas-ebd", { replace: true });
    } catch (error) {
      console.error("Erro ao buscar escala:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da escala",
        variant: "destructive",
      });
      navigate("/escalas-ebd");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: Partial<Schedule>) => {
    try {
      setIsSubmitting(true);
      
      // Buscar o departamento de Escola Bíblica se não estiver definido
      if (!formData.departmentId) {
        const { data: ebdDept, error: deptError } = await supabase
          .from('departments')
          .select('id')
          .eq('name', 'Escola Bíblica')
          .single();
  
        if (deptError) throw deptError;
        formData.departmentId = ebdDept.id;
      }

      if (selectedSchedule) {
        // Atualização
        const { error } = await supabase
          .from("schedules")
          .update({
            title: formData.title,
            description: formData.description,
            date: formData.date?.toISOString(),
            is_published: formData.isPublished,
            department_id: formData.departmentId,
            classroom_id: formData.classroomId,
          })
          .eq("id", selectedSchedule.id);

        if (error) throw error;

        // Remover associações antigas
        await supabase
          .from("schedule_members")
          .delete()
          .eq("schedule_id", selectedSchedule.id);

        // Adicionar novas associações de professores
        if (formData.members && formData.members.length > 0) {
          const memberInserts = formData.members.map((memberId) => ({
            schedule_id: selectedSchedule.id,
            member_id: memberId,
          }));

          const { error: memberError } = await supabase
            .from("schedule_members")
            .insert(memberInserts);

          if (memberError) throw memberError;
        }

        toast({
          title: "Sucesso",
          description: "Escala atualizada com sucesso",
        });
      } else {
        // Criação
        const { data, error } = await supabase
          .from("schedules")
          .insert({
            title: formData.title,
            description: formData.description,
            date: formData.date?.toISOString(),
            is_published: formData.isPublished,
            department_id: formData.departmentId,
            classroom_id: formData.classroomId,
          })
          .select("id")
          .single();

        if (error) throw error;

        // Adicionar associações de professores
        if (formData.members && formData.members.length > 0) {
          const memberInserts = formData.members.map((memberId) => ({
            schedule_id: data.id,
            member_id: memberId,
          }));

          const { error: memberError } = await supabase
            .from("schedule_members")
            .insert(memberInserts);

          if (memberError) throw memberError;
        }

        toast({
          title: "Sucesso",
          description: "Nova escala criada com sucesso",
        });
      }

      // Recarregar a lista de escalas
      fetchSchedules();
      
      // Fechar o modal
      setModalOpen(false);
      setSelectedSchedule(null);
      
    } catch (error: any) {
      console.error("Erro ao salvar escala:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar a escala",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewSchedule = () => {
    // Preparar o formulário para uma nova escala
    setSelectedSchedule(null);
    setModalMode("create");
    setModalOpen(true);
    
    // Garantir que os dados necessários estão carregados
    if (teachers.length === 0 || classrooms.length === 0) {
      Promise.all([fetchTeachers(), fetchClassrooms()]);
    }
    
    // Redirecionar para a URL base
    navigate("/escalas-ebd", { replace: true });
  };

  const handleViewSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedSchedule(null);
  };

  // Functions for replication and random generation
  const handleReplicateSchedule = async (newSchedule: Omit<Schedule, 'id' | 'createdAt'>) => {
    try {
      setIsSubmitting(true);
      
      // Create the new schedule
      const { data, error } = await supabase
        .from("schedules")
        .insert({
          title: newSchedule.title,
          description: newSchedule.description,
          date: newSchedule.date?.toISOString(),
          is_published: newSchedule.isPublished,
          department_id: newSchedule.departmentId,
          classroom_id: newSchedule.classroomId,
        })
        .select("id")
        .single();

      if (error) throw error;

      // Add member associations if any
      if (newSchedule.members && newSchedule.members.length > 0) {
        const memberInserts = newSchedule.members.map((memberId) => ({
          schedule_id: data.id,
          member_id: memberId,
        }));

        const { error: memberError } = await supabase
          .from("schedule_members")
          .insert(memberInserts);

        if (memberError) throw memberError;
      }

      toast({
        title: "Sucesso",
        description: "Escala replicada com sucesso",
      });
      
      // Recarregar a lista de escalas
      fetchSchedules();
      
      // Fechar o modal
      setModalOpen(false);
      setSelectedSchedule(null);
      
    } catch (error: any) {
      console.error("Erro ao replicar escala:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível replicar a escala",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateSchedule = async (newSchedule: Omit<Schedule, 'id' | 'createdAt'>) => {
    try {
      setIsSubmitting(true);
      
      // Create the new schedule
      const { data, error } = await supabase
        .from("schedules")
        .insert({
          title: newSchedule.title,
          description: newSchedule.description,
          date: newSchedule.date?.toISOString(),
          is_published: newSchedule.isPublished,
          department_id: newSchedule.departmentId,
          classroom_id: newSchedule.classroomId,
        })
        .select("id")
        .single();

      if (error) throw error;

      // Add member associations if any
      if (newSchedule.members && newSchedule.members.length > 0) {
        const memberInserts = newSchedule.members.map((memberId) => ({
          schedule_id: data.id,
          member_id: memberId,
        }));

        const { error: memberError } = await supabase
          .from("schedule_members")
          .insert(memberInserts);

        if (memberError) throw memberError;
      }

      toast({
        title: "Sucesso",
        description: "Escala aleatória gerada com sucesso",
      });
      
      // Recarregar a lista de escalas
      fetchSchedules();
      
      // Fechar o modal
      setModalOpen(false);
      setSelectedSchedule(null);
      
    } catch (error: any) {
      console.error("Erro ao gerar escala aleatória:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar a escala aleatória",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Escalas da EBD</h1>
      <p className="text-gray-600 mb-8">
        Gerenciamento de escalas para a Escola Bíblica
      </p>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Escalas</h2>
          <p className="text-sm text-gray-500">
            {schedules.length} {schedules.length === 1 ? "escala" : "escalas"} encontrada
            {schedules.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          onClick={handleNewSchedule}
          className="bg-worship-blue hover:bg-worship-blue/80"
        >
          <Plus className="mr-2 h-4 w-4" /> Nova Escala
        </Button>
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col justify-center items-center h-64 text-center p-6">
            <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-xl mb-2">Nenhuma escala encontrada</p>
            <p className="text-gray-500 mb-4 max-w-md">
              Crie sua primeira escala para professores da Escola Bíblica
            </p>
            <Button
              onClick={handleNewSchedule}
              className="bg-worship-blue hover:bg-worship-blue/80"
            >
              <Plus className="mr-2 h-4 w-4" /> Nova Escala
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ScheduleList
          schedules={schedules}
          onView={handleViewSchedule}
          onEdit={handleEditSchedule}
        />
      )}

      <ScheduleFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        schedule={selectedSchedule || undefined}
        members={teachers}
        songs={[]}
        onSubmit={handleSubmit}
        onCancel={handleCloseModal}
        isSubmitting={isSubmitting}
        viewMode={modalMode === "view"}
        title={
          modalMode === "create" 
            ? "Nova Escala de Professores" 
            : modalMode === "edit"
            ? "Editar Escala de Professores"
            : "Visualizar Escala de Professores"
        }
      />
    </div>
  );
};

export default EBDSchedules;
