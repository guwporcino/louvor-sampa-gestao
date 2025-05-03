
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardStats from "../components/DashboardStats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Music, FileMusic, Plus, User, BookOpen, Headphones } from "lucide-react";
import { mockMembers, mockSchedules, mockSongs, getUpcomingSchedules } from "../data/mockData";
import { Schedule, Member, Song } from "../types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDepartment } from "../contexts/DepartmentContext";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "../components/LoadingSpinner";

const Index = () => {
  const navigate = useNavigate();
  const { currentDepartment } = useDepartment();
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [activeMembers, setActiveMembers] = useState(0);
  const [upcomingSchedulesCount, setUpcomingSchedulesCount] = useState(0);
  const [totalSongs, setTotalSongs] = useState(0);
  
  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM", {
      locale: ptBR
    });
  };

  useEffect(() => {
    if (!currentDepartment) return;
    
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        let membersPromise, schedulesPromise, songsPromise, classroomsPromise;
        
        // Fetch data based on department
        switch(currentDepartment.name.toLowerCase()) {
          case 'louvor':
            // Temporarily using mock data
            setMembers(mockMembers);
            setSchedules(getUpcomingSchedules().slice(0, 3));
            setSongs(mockSongs);
            
            setTotalMembers(mockMembers.length);
            setActiveMembers(mockMembers.filter(m => m.active).length);
            setUpcomingSchedulesCount(getUpcomingSchedules().length);
            setTotalSongs(mockSongs.length);
            break;
            
          case 'escola bíblica':
            // Would fetch teachers and EBD schedules
            setMembers([]);
            setSchedules([]);
            setSongs([]);
            
            // Fetch classrooms from Supabase
            const { data: classroomsData, error: classroomsError } = await supabase
              .from('classrooms')
              .select('*')
              .eq('active', true);
              
            if (classroomsError) throw classroomsError;
            setClassrooms(classroomsData || []);
            
            setTotalMembers(0);
            setActiveMembers(0);
            setUpcomingSchedulesCount(0);
            setTotalSongs(classroomsData?.length || 0);
            break;
            
          case 'sonoplastia':
            // Would fetch sound operators and schedules
            setMembers([]);
            setSchedules([]);
            setSongs([]);
            
            setTotalMembers(0);
            setActiveMembers(0);
            setUpcomingSchedulesCount(0);
            setTotalSongs(0);
            break;
            
          default:
            setMembers([]);
            setSchedules([]);
            setSongs([]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentDepartment]);
  
  const renderScheduleItem = (schedule: Schedule) => {
    let path = '/escalas';
    if (currentDepartment?.name.toLowerCase() === 'escola bíblica') {
      path = '/escalas-ebd';
    } else if (currentDepartment?.name.toLowerCase() === 'sonoplastia') {
      path = '/escalas-som';
    }
    
    return (
      <div 
        key={schedule.id} 
        className="flex items-center p-3 border rounded-md mb-2 hover:bg-gray-50 cursor-pointer" 
        onClick={() => navigate(`${path}/${schedule.id}`)}
      >
        <Calendar className="h-4 w-4 mr-3 text-worship-blue" />
        <div className="flex-1">
          <p className="font-medium">{schedule.title}</p>
          <p className="text-sm text-gray-600">{formatDate(schedule.date)}</p>
        </div>
      </div>
    );
  };
  
  const renderMemberItem = (member: Member) => {
    let path = '/membros';
    if (currentDepartment?.name.toLowerCase() === 'escola bíblica') {
      path = '/professores';
    } else if (currentDepartment?.name.toLowerCase() === 'sonoplastia') {
      path = '/operadores';
    }
    
    return (
      <div 
        key={member.id} 
        className="flex items-center p-3 border rounded-md mb-2 hover:bg-gray-50 cursor-pointer" 
        onClick={() => navigate(`${path}/${member.id}`)}
      >
        <User className="h-4 w-4 mr-3 text-worship-purple" />
        <div className="flex-1">
          <p className="font-medium">{member.name}</p>
          <p className="text-sm text-gray-600">{member.email}</p>
        </div>
      </div>
    );
  };
  
  const renderSongItem = (song: Song) => {
    return (
      <div 
        key={song.id} 
        className="flex items-center p-3 border rounded-md mb-2 hover:bg-gray-50 cursor-pointer" 
        onClick={() => navigate(`/repertorio/${song.id}`)}
      >
        <FileMusic className="h-4 w-4 mr-3 text-worship-gold" />
        <div className="flex-1">
          <p className="font-medium">{song.title}</p>
          <p className="text-sm text-gray-600">{song.artist}</p>
        </div>
      </div>
    );
  };
  
  const renderClassroomItem = (classroom: any) => {
    return (
      <div 
        key={classroom.id} 
        className="flex items-center p-3 border rounded-md mb-2 hover:bg-gray-50 cursor-pointer" 
        onClick={() => navigate(`/turmas/${classroom.id}`)}
      >
        <BookOpen className="h-4 w-4 mr-3 text-worship-blue" />
        <div className="flex-1">
          <p className="font-medium">{classroom.name}</p>
          <p className="text-sm text-gray-600">{classroom.age_group || 'Todas as idades'}</p>
        </div>
      </div>
    );
  };
  
  // Render dashboard based on current department
  const renderDashboardCards = () => {
    if (currentDepartment?.name.toLowerCase() === 'louvor') {
      return (
        <>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Próximas Escalas</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => navigate('/escalas')}>
                  Ver todos
                </Button>
              </div>
              <CardDescription>Escalas próximas de acontecer</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              {schedules.length > 0 ? schedules.map(renderScheduleItem) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma escala próxima
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate('/escalas/novo')}>
                <Plus className="h-4 w-4 mr-1" /> Nova Escala
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Membros Recentes</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => navigate('/membros')}>
                  Ver todos
                </Button>
              </div>
              <CardDescription>Últimos membros adicionados</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              {members.length > 0 ? members.slice(0, 3).map(renderMemberItem) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum membro cadastrado
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate('/membros/novo')}>
                <Plus className="h-4 w-4 mr-1" /> Novo Membro
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Repertório</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => navigate('/repertorio')}>
                  Ver todos
                </Button>
              </div>
              <CardDescription>Músicas recentes</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              {songs.length > 0 ? songs.slice(0, 3).map(renderSongItem) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma música cadastrada
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate('/repertorio/novo')}>
                <Plus className="h-4 w-4 mr-1" /> Nova Música
              </Button>
            </CardFooter>
          </Card>
        </>
      );
    } else if (currentDepartment?.name.toLowerCase() === 'escola bíblica') {
      return (
        <>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Próximas Aulas</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => navigate('/escalas-ebd')}>
                  Ver todos
                </Button>
              </div>
              <CardDescription>Aulas agendadas</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhuma aula agendada
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate('/escalas-ebd/novo')}>
                <Plus className="h-4 w-4 mr-1" /> Nova Aula
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Professores</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => navigate('/professores')}>
                  Ver todos
                </Button>
              </div>
              <CardDescription>Professores ativos</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhum professor cadastrado
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate('/professores/novo')}>
                <Plus className="h-4 w-4 mr-1" /> Novo Professor
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Salas de Aula</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => navigate('/turmas')}>
                  Ver todos
                </Button>
              </div>
              <CardDescription>Salas disponíveis</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              {classrooms.length > 0 ? classrooms.slice(0, 3).map(renderClassroomItem) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma sala cadastrada
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate('/turmas/novo')}>
                <Plus className="h-4 w-4 mr-1" /> Nova Sala
              </Button>
            </CardFooter>
          </Card>
        </>
      );
    } else if (currentDepartment?.name.toLowerCase() === 'sonoplastia') {
      return (
        <>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Próximas Escalas</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => navigate('/escalas-som')}>
                  Ver todos
                </Button>
              </div>
              <CardDescription>Escalas de som e mídia</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhuma escala agendada
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate('/escalas-som/novo')}>
                <Plus className="h-4 w-4 mr-1" /> Nova Escala
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Operadores</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => navigate('/operadores')}>
                  Ver todos
                </Button>
              </div>
              <CardDescription>Equipe de sonoplastia</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhum operador cadastrado
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate('/operadores/novo')}>
                <Plus className="h-4 w-4 mr-1" /> Novo Operador
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Equipamentos</CardTitle>
                <Button size="sm" variant="ghost">Ver todos</Button>
              </div>
              <CardDescription>Equipamentos disponíveis</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-gray-500 text-center py-4">
                Funcionalidade em desenvolvimento
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled>
                <Plus className="h-4 w-4 mr-1" /> Novo Equipamento
              </Button>
            </CardFooter>
          </Card>
        </>
      );
    }
    
    // Default/fallback
    return (
      <div className="col-span-3 flex items-center justify-center">
        <p className="text-gray-500">Selecione um departamento para visualizar o dashboard</p>
      </div>
    );
  };
  
  // Generate department-specific stats
  const getDashboardStats = () => {
    if (currentDepartment?.name.toLowerCase() === 'louvor') {
      return {
        title1: 'Total de Membros',
        value1: totalMembers,
        description1: 'Membros cadastrados',
        icon1: <User className="h-5 w-5" />,
        
        title2: 'Membros Ativos',
        value2: activeMembers,
        description2: 'Participando ativamente',
        icon2: <FileText className="h-5 w-5" />,
        
        title3: 'Próximas Escalas',
        value3: upcomingSchedulesCount,
        description3: 'Escalas futuras',
        icon3: <Calendar className="h-5 w-5" />,
        
        title4: 'Músicas',
        value4: totalSongs,
        description4: 'No repertório',
        icon4: <Music className="h-5 w-5" />,
      };
    } else if (currentDepartment?.name.toLowerCase() === 'escola bíblica') {
      return {
        title1: 'Professores',
        value1: totalMembers,
        description1: 'Professores cadastrados',
        icon1: <User className="h-5 w-5" />,
        
        title2: 'Professores Ativos',
        value2: activeMembers,
        description2: 'Ministrando aulas',
        icon2: <FileText className="h-5 w-5" />,
        
        title3: 'Próximas Aulas',
        value3: upcomingSchedulesCount,
        description3: 'Aulas agendadas',
        icon3: <Calendar className="h-5 w-5" />,
        
        title4: 'Salas',
        value4: classrooms.length,
        description4: 'Salas disponíveis',
        icon4: <BookOpen className="h-5 w-5" />,
      };
    } else if (currentDepartment?.name.toLowerCase() === 'sonoplastia') {
      return {
        title1: 'Operadores',
        value1: totalMembers,
        description1: 'Operadores cadastrados',
        icon1: <User className="h-5 w-5" />,
        
        title2: 'Operadores Ativos',
        value2: activeMembers,
        description2: 'Participando ativamente',
        icon2: <FileText className="h-5 w-5" />,
        
        title3: 'Próximas Escalas',
        value3: upcomingSchedulesCount,
        description3: 'Escalas agendadas',
        icon3: <Calendar className="h-5 w-5" />,
        
        title4: 'Equipamentos',
        value4: 0,
        description4: 'Equipamentos registrados',
        icon4: <Headphones className="h-5 w-5" />,
      };
    }
    
    // Default
    return {
      title1: 'Total de Membros',
      value1: 0,
      description1: 'Membros cadastrados',
      icon1: <User className="h-5 w-5" />,
      
      title2: 'Membros Ativos',
      value2: 0,
      description2: 'Participando ativamente',
      icon2: <FileText className="h-5 w-5" />,
      
      title3: 'Próximas Escalas',
      value3: 0,
      description3: 'Escalas futuras',
      icon3: <Calendar className="h-5 w-5" />,
      
      title4: 'Itens',
      value4: 0,
      description4: 'Itens cadastrados',
      icon4: <Music className="h-5 w-5" />,
    };
  };
  
  const stats = getDashboardStats();

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Gestão de Equipes - {currentDepartment?.name || 'Igreja Batista Renovada Cristo À Única Esperança'}
      </p>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <DashboardStats 
            title1={stats.title1}
            value1={stats.value1}
            description1={stats.description1}
            icon1={stats.icon1}
            
            title2={stats.title2}
            value2={stats.value2}
            description2={stats.description2}
            icon2={stats.icon2}
            
            title3={stats.title3}
            value3={stats.value3}
            description3={stats.description3}
            icon3={stats.icon3}
            
            title4={stats.title4}
            value4={stats.value4}
            description4={stats.description4}
            icon4={stats.icon4}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {renderDashboardCards()}
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
