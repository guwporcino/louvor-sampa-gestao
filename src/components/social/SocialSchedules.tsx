
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check, Clock, Search, Users, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Tipos para voluntários
interface Volunteer {
  id: string;
  name: string;
  phone: string;
  activities: string[];
}

// Tipos para escalas
interface Schedule {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  volunteers: string[];
  status: 'upcoming' | 'in-progress' | 'completed';
}

const SocialSchedules = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Estado para o formulário de nova escala
  const [newSchedule, setNewSchedule] = useState<Partial<Schedule>>({
    date: new Date(),
    startTime: "08:00",
    endTime: "12:00",
    status: 'upcoming',
    volunteers: []
  });

  // Dados simulados de voluntários
  const volunteersList: Volunteer[] = [
    { id: "1", name: "Ana Silva", phone: "(11) 98765-4321", activities: ["distribution", "collection"] },
    { id: "2", name: "Carlos Oliveira", phone: "(11) 91234-5678", activities: ["cooking", "distribution"] },
    { id: "3", name: "Mariana Santos", phone: "(11) 99876-5432", activities: ["collection", "sorting"] },
    { id: "4", name: "Paulo Costa", phone: "(11) 95678-1234", activities: ["cooking", "cleaning"] },
    { id: "5", name: "Juliana Lima", phone: "(11) 94321-8765", activities: ["distribution", "sorting"] },
  ];

  // Dados simulados de escalas
  const initialSchedules: Schedule[] = [
    { 
      id: "1", 
      title: "Distribuição de Marmitas", 
      date: new Date(2025, 4, 20), 
      startTime: "08:00", 
      endTime: "12:00", 
      location: "Praça Central",
      description: "Distribuição de marmitas para pessoas em situação de rua",
      volunteers: ["1", "2", "4"],
      status: 'upcoming'
    },
    { 
      id: "2", 
      title: "Coleta de Roupas", 
      date: new Date(2025, 4, 15), 
      startTime: "14:00", 
      endTime: "18:00", 
      location: "Igreja Matriz",
      description: "Coleta de roupas de inverno para campanha do agasalho",
      volunteers: ["3", "5"],
      status: 'in-progress'
    },
    { 
      id: "3", 
      title: "Preparo de Alimentos", 
      date: new Date(2025, 4, 10), 
      startTime: "07:00", 
      endTime: "12:00", 
      location: "Cozinha Comunitária",
      description: "Preparo de alimentos para distribuição posterior",
      volunteers: ["2", "4"],
      status: 'completed'
    },
  ];

  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         schedule.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || schedule.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddSchedule = () => {
    // Validação simples
    if (!newSchedule.title || !newSchedule.location) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const schedule: Schedule = {
      id: Date.now().toString(),
      title: newSchedule.title || '',
      date: newSchedule.date || new Date(),
      startTime: newSchedule.startTime || '08:00',
      endTime: newSchedule.endTime || '12:00',
      location: newSchedule.location || '',
      description: newSchedule.description || '',
      volunteers: newSchedule.volunteers || [],
      status: newSchedule.status as 'upcoming' | 'in-progress' | 'completed',
    };

    setSchedules([schedule, ...schedules]);
    setShowScheduleForm(false);
    setNewSchedule({
      date: new Date(),
      startTime: "08:00",
      endTime: "12:00",
      status: 'upcoming',
      volunteers: []
    });
  };

  const getVolunteerNames = (volunteerIds: string[]) => {
    return volunteerIds.map(id => {
      const volunteer = volunteersList.find(v => v.id === id);
      return volunteer ? volunteer.name : '';
    }).join(', ');
  };

  const toggleVolunteer = (volunteerId: string) => {
    setNewSchedule(prev => {
      const volunteers = prev.volunteers || [];
      if (volunteers.includes(volunteerId)) {
        return { ...prev, volunteers: volunteers.filter(id => id !== volunteerId) };
      } else {
        return { ...prev, volunteers: [...volunteers, volunteerId] };
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return "bg-blue-100 text-blue-800";
      case 'in-progress':
        return "bg-yellow-100 text-yellow-800";
      case 'completed':
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Escalas de Projetos Sociais</CardTitle>
              <CardDescription>
                Agendamento e organização de escalas para atividades de projetos sociais
              </CardDescription>
            </div>
            <Dialog open={showScheduleForm} onOpenChange={setShowScheduleForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Escala
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Criar Nova Escala</DialogTitle>
                  <DialogDescription>
                    Preencha os detalhes para a nova escala de trabalho voluntário.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="title">Título</label>
                    <Input 
                      id="title" 
                      value={newSchedule.title || ''} 
                      onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                      placeholder="Ex: Distribuição de Marmitas"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label>Data</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newSchedule.date ? (
                            format(newSchedule.date, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newSchedule.date}
                          onSelect={(date) => setNewSchedule({...newSchedule, date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="startTime">Horário de Início</label>
                      <Input 
                        id="startTime" 
                        type="time"
                        value={newSchedule.startTime || ''} 
                        onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="endTime">Horário de Término</label>
                      <Input 
                        id="endTime" 
                        type="time"
                        value={newSchedule.endTime || ''} 
                        onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="location">Local</label>
                    <Input 
                      id="location" 
                      value={newSchedule.location || ''} 
                      onChange={(e) => setNewSchedule({...newSchedule, location: e.target.value})}
                      placeholder="Ex: Praça Central"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="description">Descrição</label>
                    <Input 
                      id="description" 
                      value={newSchedule.description || ''} 
                      onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
                      placeholder="Descreva brevemente a atividade"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="status">Status</label>
                    <Select 
                      value={newSchedule.status} 
                      onValueChange={(value) => setNewSchedule({...newSchedule, status: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Agendado</SelectItem>
                        <SelectItem value="in-progress">Em Andamento</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <label>Voluntários</label>
                    <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                      {volunteersList.map(volunteer => (
                        <div key={volunteer.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`volunteer-${volunteer.id}`} 
                            checked={(newSchedule.volunteers || []).includes(volunteer.id)}
                            onCheckedChange={() => toggleVolunteer(volunteer.id)}
                          />
                          <label htmlFor={`volunteer-${volunteer.id}`} className="text-sm cursor-pointer">
                            {volunteer.name} - {volunteer.phone}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowScheduleForm(false)}>Cancelar</Button>
                  <Button onClick={handleAddSchedule}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar escalas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="upcoming">Agendados</SelectItem>
                <SelectItem value="in-progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluídos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Atividade</TableHead>
                  <TableHead className="w-[120px]">Data</TableHead>
                  <TableHead className="w-[120px]">Horário</TableHead>
                  <TableHead className="w-[150px]">Local</TableHead>
                  <TableHead>Voluntários</TableHead>
                  <TableHead className="w-[120px] text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.length > 0 ? (
                  filteredSchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.title}</TableCell>
                      <TableCell>{format(schedule.date, "dd/MM/yyyy")}</TableCell>
                      <TableCell>{`${schedule.startTime} - ${schedule.endTime}`}</TableCell>
                      <TableCell>{schedule.location}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{getVolunteerNames(schedule.volunteers)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(schedule.status)}`}>
                          {schedule.status === 'upcoming' && 'Agendado'}
                          {schedule.status === 'in-progress' && 'Em Andamento'}
                          {schedule.status === 'completed' && 'Concluído'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      Nenhuma escala encontrada com os filtros atuais.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredSchedules.length} de {schedules.length} escalas
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Exportar</Button>
            <Button variant="outline" size="sm">Imprimir</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SocialSchedules;
