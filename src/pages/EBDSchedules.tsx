import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, BookOpen } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Schedule, Member, Song } from "../types";
import LoadingSpinner from "@/components/LoadingSpinner";
import ScheduleList from "@/components/ScheduleList";
import ScheduleForm from "@/components/ScheduleForm";
import { useDepartment } from "@/contexts/DepartmentContext";
import { format } from "date-fns";
import ScheduleActions from "@/components/ScheduleActions";

const EBDSchedules = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentDepartment } = useDepartment();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [teachers, setTeachers] = useState<Member[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [view, setView] = useState<"list" | "form" | "detail">("list");

  useEffect(() => {
    if (id === "novo") {
      setView("form");
      setSelectedSchedule(null);
    } else if (id) {
      setView("form");
      fetchScheduleById(id);
    } else {
      setView("list");
      fetchSchedulesAndTeachers();
    }
  }, [id, currentDepartment]);

  const fetchSchedulesAndTeachers = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchSchedules(), fetchTeachers()]);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
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
      await fetchTeachers(); // Carrega os professores

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

      navigate("/escalas-ebd");
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

  const handleViewSchedule = (schedule: Schedule) => {
    navigate(`/escalas-ebd/${schedule.id}`);
    setSelectedSchedule(schedule);
    setView("detail");
  };

  const handleEditSchedule = (schedule: Schedule) => {
    navigate(`/escalas-ebd/${schedule.id}`);
    setSelectedSchedule(schedule);
    setView("form");
  };

  const handleCancel = () => {
    navigate("/escalas-ebd");
    setSelectedSchedule(null);
    setView("list");
  };

  // New functions for replication and random generation
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
      
      navigate("/escalas-ebd");
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
      
      navigate("/escalas-ebd");
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

  if (view === "form") {
    return (
      <ScheduleForm
        schedule={selectedSchedule || undefined}
        members={teachers}
        songs={[]}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    );
  }

  if (view === "detail" && selectedSchedule) {
    return (
      <div className="animate-fade-in">
        <Card className="w-full max-w-3xl mx-auto">
          <CardContent className="pt-6">
            <ScheduleActions
              schedule={selectedSchedule}
              members={teachers}
              songs={[]}
              onReplicateSchedule={handleReplicateSchedule}
              onGenerateSchedule={handleGenerateSchedule}
            />
            
            <div className="flex justify-end mt-6">
              <Button 
                variant="outline" 
                className="mr-2"
                onClick={handleCancel}
              >
                Voltar
              </Button>
              <Button onClick={() => handleEditSchedule(selectedSchedule)}>
                Editar
              </Button>
            </div>
          </CardContent>
        </Card>
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
          onClick={() => navigate("/escalas-ebd/novo")}
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
              onClick={() => navigate("/escalas-ebd/novo")}
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
    </div>
  );
};

export default EBDSchedules;
