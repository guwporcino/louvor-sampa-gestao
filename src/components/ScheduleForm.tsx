
import React, { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Schedule, Member, Song } from "../types";
import { ptBR } from "date-fns/locale";

interface ScheduleFormProps {
  schedule?: Schedule;
  members: Member[];
  songs: Song[];
  onSubmit: (schedule: Partial<Schedule>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  schedule,
  members,
  songs,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const isEditing = !!schedule;
  const [formData, setFormData] = useState<Partial<Schedule>>(
    schedule || {
      title: "",
      description: "",
      date: new Date(),
      members: [],
      songs: [],
      isPublished: false,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleMemberChange = (memberId: string, checked: boolean) => {
    setFormData({
      ...formData,
      members: checked
        ? [...(formData.members || []), memberId]
        : (formData.members || []).filter((id) => id !== memberId),
    });
  };

  const handleSongChange = (songId: string, checked: boolean) => {
    setFormData({
      ...formData,
      songs: checked
        ? [...(formData.songs || []), songId]
        : (formData.songs || []).filter((id) => id !== songId),
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData({
        ...formData,
        date,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEditing ? "Editar Escala" : "Nova Escala"}</CardTitle>
          <CardDescription>
            {isEditing
              ? "Atualize os dados da escala"
              : "Cadastre uma nova escala de ministração"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? (
                    format(formData.date, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={handleDateSelect}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Membros</Label>
            <div className="max-h-48 overflow-y-auto border rounded-md p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`member-${member.id}`}
                      checked={(formData.members || []).includes(member.id)}
                      onCheckedChange={(checked) =>
                        handleMemberChange(member.id, Boolean(checked))
                      }
                    />
                    <label
                      htmlFor={`member-${member.id}`}
                      className="text-sm font-medium leading-none"
                    >
                      {member.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Músicas</Label>
            <div className="max-h-48 overflow-y-auto border rounded-md p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {songs.map((song) => (
                  <div key={song.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`song-${song.id}`}
                      checked={(formData.songs || []).includes(song.id)}
                      onCheckedChange={(checked) =>
                        handleSongChange(song.id, Boolean(checked))
                      }
                    />
                    <label
                      htmlFor={`song-${song.id}`}
                      className="text-sm font-medium leading-none"
                    >
                      {song.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublished"
              checked={formData.isPublished}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isPublished: Boolean(checked) })
              }
            />
            <label
              htmlFor="isPublished"
              className="text-sm font-medium leading-none"
            >
              Publicar Escala
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : isEditing ? "Atualizar" : "Cadastrar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ScheduleForm;
