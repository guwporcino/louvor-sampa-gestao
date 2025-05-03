
import React, { useState } from "react";
import { format, addDays, addWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Copy, Repeat, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Schedule, Member, Song } from "../types";
import { replicateSchedule, generateRandomSchedule } from "@/utils/scheduleUtils";
import LoadingSpinner from "./LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDepartment } from "@/contexts/DepartmentContext";

interface ScheduleActionsProps {
  schedule: Schedule;
  members: Member[];
  songs: Song[];
  onReplicateSchedule?: (newSchedule: Omit<Schedule, 'id' | 'createdAt'>) => Promise<void>;
  onGenerateSchedule?: (newSchedule: Omit<Schedule, 'id' | 'createdAt'>) => Promise<void>;
}

const ScheduleActions: React.FC<ScheduleActionsProps> = ({ 
  schedule, 
  members, 
  songs, 
  onReplicateSchedule,
  onGenerateSchedule
}) => {
  const { departments } = useDepartment();
  const [isReplicateDialogOpen, setIsReplicateDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replicateDate, setReplicateDate] = useState<Date | undefined>(addWeeks(schedule.date, 1));
  
  // Generate random schedule states
  const [generateTitle, setGenerateTitle] = useState(`Escala de ${getDepartmentName(schedule.departmentId)}`);
  const [generateDate, setGenerateDate] = useState<Date | undefined>(new Date());
  const [generateDescription, setGenerateDescription] = useState("");
  const [memberCount, setMemberCount] = useState("2");

  function getDepartmentName(departmentId?: string): string {
    if (!departmentId) return '';
    const dept = departments.find(d => d.id === departmentId);
    return dept?.name || '';
  }

  const isDepartmentLouvor = getDepartmentName(schedule.departmentId) === 'Louvor';
  const isDepartmentEBD = getDepartmentName(schedule.departmentId) === 'Escola Bíblica';
  const isDepartmentSom = getDepartmentName(schedule.departmentId) === 'Sonoplastia';
  
  const handleReplicate = async () => {
    if (!replicateDate || !onReplicateSchedule) return;
    
    try {
      setIsSubmitting(true);
      const newSchedule = replicateSchedule(schedule, replicateDate);
      await onReplicateSchedule(newSchedule);
      setIsReplicateDialogOpen(false);
    } catch (error) {
      console.error("Erro ao replicar escala:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGenerate = async () => {
    if (!generateDate || !onGenerateSchedule) return;
    
    try {
      setIsSubmitting(true);
      const newSchedule = generateRandomSchedule(
        generateTitle,
        generateDate,
        generateDescription,
        members,
        schedule.departmentId || '',
        parseInt(memberCount, 10),
        schedule.classroomId
      );
      await onGenerateSchedule(newSchedule);
      setIsGenerateDialogOpen(false);
    } catch (error) {
      console.error("Erro ao gerar escala aleatória:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <div>
          <h2 className="text-2xl font-bold">
            {schedule.title}
          </h2>
          <p className="text-gray-600">
            <CalendarIcon className="inline mr-1 h-4 w-4" />
            {format(schedule.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          {schedule.description && (
            <p className="mt-2 text-gray-700">{schedule.description}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsReplicateDialogOpen(true)}
          >
            <Copy className="h-4 w-4" />
            <span>Replicar</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsGenerateDialogOpen(true)}
          >
            <Shuffle className="h-4 w-4" />
            <span>Gerar Aleatória</span>
          </Button>
        </div>
      </div>
      
      {/* Participants section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">
          {isDepartmentLouvor ? 'Participantes' : 
            isDepartmentEBD ? 'Professores' : 
            isDepartmentSom ? 'Operadores' : 'Participantes'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {members
            .filter(member => schedule.members.includes(member.id))
            .map((member) => (
              <div
                key={member.id}
                className="p-2 border rounded-md flex items-center"
              >
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
            ))}
            
          {schedule.members.length === 0 && (
            <p className="text-gray-500 col-span-3">Nenhum participante selecionado</p>
          )}
        </div>
      </div>
      
      {/* Songs section - only for worship */}
      {isDepartmentLouvor && songs.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Repertório</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {songs
              .filter(song => schedule.songs.includes(song.id))
              .map((song) => (
                <div
                  key={song.id}
                  className="p-2 border rounded-md flex items-center"
                >
                  <div>
                    <p className="font-medium">{song.title}</p>
                    {song.artist && (
                      <p className="text-sm text-gray-500">{song.artist}</p>
                    )}
                  </div>
                </div>
              ))}
              
            {schedule.songs.length === 0 && (
              <p className="text-gray-500 col-span-2">Nenhuma música selecionada</p>
            )}
          </div>
        </div>
      )}
      
      {/* Replicate Dialog */}
      <Dialog open={isReplicateDialogOpen} onOpenChange={setIsReplicateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replicar Escala</DialogTitle>
            <DialogDescription>
              Selecione a nova data para replicar esta escala.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="replicateDate">Nova Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="replicateDate"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !replicateDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {replicateDate ? (
                      format(replicateDate, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={replicateDate}
                    onSelect={setReplicateDate}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setReplicateDate(addDays(new Date(), 1))}
                >
                  Amanhã
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setReplicateDate(addDays(new Date(), 7))}
                >
                  Em 1 semana
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setReplicateDate(addDays(new Date(), 14))}
                >
                  Em 2 semanas
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReplicateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleReplicate}
              disabled={isSubmitting || !replicateDate}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner /> <span className="ml-2">Replicando...</span>
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" /> Replicar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Generate Random Schedule Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Gerar Escala Aleatória</DialogTitle>
            <DialogDescription>
              Crie uma nova escala com participantes selecionados aleatoriamente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={generateTitle}
                onChange={(e) => setGenerateTitle(e.target.value)}
                placeholder="Ex: Escala de Domingo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !generateDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {generateDate ? (
                      format(generateDate, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={generateDate}
                    onSelect={setGenerateDate}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={generateDescription}
                onChange={(e) => setGenerateDescription(e.target.value)}
                placeholder="Ex: Culto da manhã"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="memberCount">Número de {
                isDepartmentLouvor ? 'Participantes' : 
                isDepartmentEBD ? 'Professores' : 
                isDepartmentSom ? 'Operadores' : 'Participantes'
              }</Label>
              <Select 
                value={memberCount} 
                onValueChange={setMemberCount}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGenerateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={isSubmitting || !generateDate || !generateTitle}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner /> <span className="ml-2">Gerando...</span>
                </>
              ) : (
                <>
                  <Shuffle className="mr-2 h-4 w-4" /> Gerar Escala
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleActions;
