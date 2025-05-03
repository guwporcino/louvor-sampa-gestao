
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Music } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Schedule, Member, Song } from "../types";
import LoadingSpinner from "@/components/LoadingSpinner";
import ScheduleList from "../components/ScheduleList";
import ScheduleForm from "../components/ScheduleForm";
import { useDepartment } from "@/contexts/DepartmentContext";
import { Card, CardContent } from "@/components/ui/card";

const Schedules = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentDepartment } = useDepartment();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [view, setView] = useState<"list" | "form" | "detail">("list");

  useEffect(() => {
    console.log('Schedules useEffect - ID:', id);
    
    if (id === "novo") {
      console.log('Setting view to form for new schedule');
      setView("form");
      setSelectedSchedule(null);
      
      // Ensure data is loaded for new form
      fetchMembersAndSongs();
      setIsLoading(false);
    } else if (id) {
      console.log('Setting view to form/detail for existing schedule:', id);
      fetchScheduleById(id);
    } else {
      console.log('Setting view to list');
      setView("list");
      fetchSchedulesAndData();
    }
  }, [id, currentDepartment]);

  const fetchSchedulesAndData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchSchedules(), fetchMembersAndSongs()]);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      // Buscar o departamento de Louvor primeiro
      const { data: louvorDept, error: deptError } = await supabase
        .from('departments')
        .select('id')
        .eq('name', 'Louvor')
        .single();

      if (deptError) throw deptError;
      
      // Buscar as escalas de Louvor
      const { data, error } = await supabase
        .from("schedules")
        .select(`
          id, 
          title, 
          description, 
          date, 
          is_published,
          created_at
        `)
        .eq("department_id", louvorDept.id)
        .order("date", { ascending: false });

      if (error) throw error;

      const formattedSchedules: Schedule[] = (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description || "",
        date: new Date(item.date),
        isPublished: item.is_published || false,
        members: [],  // Será preenchido depois
        songs: [],    // Será preenchido depois
        departmentId: louvorDept.id,
        createdAt: new Date(item.created_at),
      }));

      // Para cada escala, buscar os membros e músicas associados
      for (const schedule of formattedSchedules) {
        // Buscar membros associados
        const { data: memberData, error: memberError } = await supabase
          .from("schedule_members")
          .select("member_id")
          .eq("schedule_id", schedule.id);

        if (!memberError && memberData) {
          schedule.members = memberData.map((m) => m.member_id);
        }

        // Buscar músicas associadas
        const { data: songData, error: songError } = await supabase
          .from("schedule_songs")
          .select("song_id, order_num")
          .eq("schedule_id", schedule.id)
          .order("order_num", { ascending: true });

        if (!songError && songData) {
          schedule.songs = songData.map((s) => s.song_id);
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

  const fetchMembersAndSongs = async () => {
    try {
      // Buscar o departamento de Louvor primeiro
      const { data: louvorDept, error: deptError } = await supabase
        .from('departments')
        .select('id')
        .eq('name', 'Louvor')
        .single();

      if (deptError) throw deptError;
      
      // Buscar os membros associados ao departamento
      const { data: memberData, error: memberError } = await supabase
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
        .eq('department_id', louvorDept.id);
      
      if (memberError) throw memberError;
      
      const formattedMembers: Member[] = memberData
        .map((item) => {
          const profile = item.profiles;
          if (!profile) return null;
          
          return {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            phone: profile.phone || "",
            categories: [], // Será preenchido depois
            active: profile.active || true,
            createdAt: new Date(),
          };
        })
        .filter(Boolean) as Member[];
      
      // Buscar categorias para cada membro
      for (const member of formattedMembers) {
        const { data: categoryData, error: categoryError } = await supabase
          .from("member_categories")
          .select("category_id")
          .eq("member_id", member.id);
        
        if (!categoryError && categoryData) {
          member.categories = categoryData.map((c) => c.category_id);
        }
      }
      
      setMembers(formattedMembers);
      
      // Buscar todas as músicas
      const { data: songData, error: songError } = await supabase
        .from('songs')
        .select('*')
        .order('title');
        
      if (songError) throw songError;
      
      const formattedSongs: Song[] = (songData || []).map((song) => ({
        id: song.id,
        title: song.title,
        artist: song.artist || "",
        key: song.key || "",
        bpm: song.bpm || null,
        youtubeUrl: song.youtube_url || "",
        sheetUrl: song.sheet_url || "",
        createdAt: new Date(song.created_at),
      }));
      
      setSongs(formattedSongs);
      
    } catch (error) {
      console.error("Erro ao buscar membros e músicas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados necessários",
        variant: "destructive",
      });
    }
  };

  const fetchScheduleById = async (scheduleId: string) => {
    try {
      setIsLoading(true);
      await fetchMembersAndSongs(); // Carrega os membros e músicas

      const { data, error } = await supabase
        .from("schedules")
        .select(`
          id, 
          title, 
          description, 
          date, 
          is_published,
          department_id,
          created_at
        `)
        .eq("id", scheduleId)
        .single();

      if (error) throw error;

      // Buscar membros associados
      const { data: memberData, error: memberError } = await supabase
        .from("schedule_members")
        .select("member_id")
        .eq("schedule_id", scheduleId);

      if (memberError) throw memberError;

      // Buscar músicas associadas
      const { data: songData, error: songError } = await supabase
        .from("schedule_songs")
        .select("song_id, order_num")
        .eq("schedule_id", scheduleId)
        .order("order_num", { ascending: true });

      if (songError) throw songError;

      const schedule: Schedule = {
        id: data.id,
        title: data.title,
        description: data.description || "",
        date: new Date(data.date),
        isPublished: data.is_published || false,
        members: memberData.map((m) => m.member_id),
        songs: songData.map((s) => s.song_id),
        departmentId: data.department_id,
        createdAt: new Date(data.created_at),
      };

      setSelectedSchedule(schedule);
      setView("form"); // Set view to form after fetching schedule data
    } catch (error) {
      console.error("Erro ao buscar escala:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da escala",
        variant: "destructive",
      });
      navigate("/escalas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: Partial<Schedule>) => {
    try {
      setIsSubmitting(true);
      
      // Buscar o departamento de Louvor se não estiver definido
      if (!formData.departmentId) {
        const { data: louvorDept, error: deptError } = await supabase
          .from('departments')
          .select('id')
          .eq('name', 'Louvor')
          .single();
  
        if (deptError) throw deptError;
        formData.departmentId = louvorDept.id;
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
          })
          .eq("id", selectedSchedule.id);

        if (error) throw error;

        // Remover associações antigas de membros
        await supabase
          .from("schedule_members")
          .delete()
          .eq("schedule_id", selectedSchedule.id);

        // Adicionar novas associações de membros
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

        // Remover associações antigas de músicas
        await supabase
          .from("schedule_songs")
          .delete()
          .eq("schedule_id", selectedSchedule.id);

        // Adicionar novas associações de músicas
        if (formData.songs && formData.songs.length > 0) {
          const songInserts = formData.songs.map((songId, index) => ({
            schedule_id: selectedSchedule.id,
            song_id: songId,
            order_num: index + 1,
          }));

          const { error: songError } = await supabase
            .from("schedule_songs")
            .insert(songInserts);

          if (songError) throw songError;
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
          })
          .select("id")
          .single();

        if (error) throw error;

        // Adicionar associações de membros
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

        // Adicionar associações de músicas
        if (formData.songs && formData.songs.length > 0) {
          const songInserts = formData.songs.map((songId, index) => ({
            schedule_id: data.id,
            song_id: songId,
            order_num: index + 1,
          }));

          const { error: songError } = await supabase
            .from("schedule_songs")
            .insert(songInserts);

          if (songError) throw songError;
        }

        toast({
          title: "Sucesso",
          description: "Nova escala criada com sucesso",
        });
      }

      navigate("/escalas");
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
    navigate(`/escalas/${schedule.id}`);
    setSelectedSchedule(schedule);
    setView("detail");
  };

  const handleEditSchedule = (schedule: Schedule) => {
    navigate(`/escalas/${schedule.id}`);
    setSelectedSchedule(schedule);
    setView("form");
  };

  const handleCancel = () => {
    navigate("/escalas");
    setSelectedSchedule(null);
    setView("list");
  };

  console.log('Schedules rendering with:', {
    isLoading,
    view,
    id,
    membersCount: members.length,
    songsCount: songs.length
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (view === "form") {
    console.log('Rendering form with selectedSchedule:', !!selectedSchedule);
    console.log('Members count:', members.length);
    console.log('Songs count:', songs.length);
    
    return (
      <ScheduleForm
        schedule={selectedSchedule || undefined}
        members={members}
        songs={songs}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        viewMode={false}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Escalas de Louvor</h1>
      <p className="text-gray-600 mb-8">
        Gerenciamento de escalas para o ministério de louvor
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
          onClick={() => navigate("/escalas/novo")}
        >
          <Plus className="mr-2 h-4 w-4" /> Nova Escala
        </Button>
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col justify-center items-center h-64 text-center p-6">
            <Music className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-xl mb-2">Nenhuma escala encontrada</p>
            <p className="text-gray-500 mb-4 max-w-md">
              Crie sua primeira escala para o ministério de louvor
            </p>
            <Button
              onClick={() => navigate("/escalas/novo")}
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

export default Schedules;
