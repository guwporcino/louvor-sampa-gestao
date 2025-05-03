
import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardStats from "../components/DashboardStats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Music, FileMusic, Plus } from "lucide-react";
import { mockMembers, mockSchedules, mockSongs, getUpcomingSchedules } from "../data/mockData";
import { Schedule, Member, Song } from "../types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Index = () => {
  const navigate = useNavigate();
  const upcomingSchedules = getUpcomingSchedules().slice(0, 3);
  const activeMembers = mockMembers.filter(member => member.active);

  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM", { locale: ptBR });
  };

  const renderScheduleItem = (schedule: Schedule) => {
    return (
      <div
        key={schedule.id}
        className="flex items-center p-3 border rounded-md mb-2 hover:bg-gray-50 cursor-pointer"
        onClick={() => navigate(`/escalas/${schedule.id}`)}
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
    return (
      <div
        key={member.id}
        className="flex items-center p-3 border rounded-md mb-2 hover:bg-gray-50 cursor-pointer"
        onClick={() => navigate(`/membros/${member.id}`)}
      >
        <FileText className="h-4 w-4 mr-3 text-worship-purple" />
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

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">Gestão de Equipe de Louvor - Igreja Batista SP</p>
      
      <DashboardStats
        totalMembers={mockMembers.length}
        activeMembers={activeMembers.length}
        upcomingSchedules={getUpcomingSchedules().length}
        totalSongs={mockSongs.length}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
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
            {upcomingSchedules.length > 0 ? (
              upcomingSchedules.map(renderScheduleItem)
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhuma escala próxima
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => navigate('/escalas/novo')}
            >
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
            {mockMembers.length > 0 ? (
              mockMembers.slice(0, 3).map(renderMemberItem)
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhum membro cadastrado
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => navigate('/membros/novo')}
            >
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
            {mockSongs.length > 0 ? (
              mockSongs.slice(0, 3).map(renderSongItem)
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhuma música cadastrada
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => navigate('/repertorio/novo')}
            >
              <Plus className="h-4 w-4 mr-1" /> Nova Música
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
