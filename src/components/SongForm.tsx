
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Song } from "../types";

interface SongFormProps {
  song?: Song;
  onSubmit: (song: Partial<Song>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const SongForm: React.FC<SongFormProps> = ({
  song,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const isEditing = !!song;
  const [formData, setFormData] = useState<Partial<Song>>(
    song || {
      title: "",
      artist: "",
      key: "",
      bpm: undefined,
      sheetUrl: "",
      youtubeUrl: "",
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "bpm" ? (value ? parseInt(value) : undefined) : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEditing ? "Editar Música" : "Nova Música"}</CardTitle>
          <CardDescription>
            {isEditing
              ? "Atualize os dados da música"
              : "Adicione uma nova música ao repertório"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Label htmlFor="artist">Artista/Compositor</Label>
            <Input
              id="artist"
              name="artist"
              value={formData.artist}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="key">Tom</Label>
              <Input
                id="key"
                name="key"
                value={formData.key}
                onChange={handleChange}
                placeholder="Ex: C, Dm, G#"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bpm">BPM</Label>
              <Input
                id="bpm"
                name="bpm"
                type="number"
                value={formData.bpm || ""}
                onChange={handleChange}
                placeholder="Ex: 75"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sheetUrl">Link da Cifra (PDF)</Label>
            <Input
              id="sheetUrl"
              name="sheetUrl"
              value={formData.sheetUrl}
              onChange={handleChange}
              placeholder="https://example.com/cifra.pdf"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtubeUrl">Link do YouTube</Label>
            <Input
              id="youtubeUrl"
              name="youtubeUrl"
              value={formData.youtubeUrl}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=..."
            />
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

export default SongForm;
