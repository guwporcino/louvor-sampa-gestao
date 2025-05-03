
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { mockSongs } from "../data/mockData";
import SongsList from "../components/SongsList";
import SongForm from "../components/SongForm";
import { Song } from "../types";

const Songs = () => {
  const [songs, setSongs] = useState(mockSongs);
  const [showForm, setShowForm] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleCreateNew = () => {
    setEditingSong(undefined);
    setShowForm(true);
  };
  
  const handleEdit = (song: Song) => {
    setEditingSong(song);
    setShowForm(true);
  };
  
  const handleCancel = () => {
    setShowForm(false);
    setEditingSong(undefined);
  };
  
  const handleSubmit = (formData: Partial<Song>) => {
    setIsSubmitting(true);
    
    // Simulação de delay de API
    setTimeout(() => {
      if (editingSong) {
        // Edição
        setSongs(songs.map(song => 
          song.id === editingSong.id ? { ...song, ...formData } as Song : song
        ));
      } else {
        // Criação
        const newSong: Song = {
          id: String(Date.now()),
          title: formData.title || "",
          artist: formData.artist,
          key: formData.key,
          bpm: formData.bpm,
          sheetUrl: formData.sheetUrl,
          youtubeUrl: formData.youtubeUrl,
          createdAt: new Date()
        };
        setSongs([...songs, newSong]);
      }
      
      setIsSubmitting(false);
      setShowForm(false);
      setEditingSong(undefined);
    }, 500);
  };
  
  return (
    <div className="animate-fade-in">
      {showForm ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">
              {editingSong ? "Editar Música" : "Nova Música"}
            </h1>
          </div>
          <SongForm 
            song={editingSong}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Repertório</h1>
              <p className="text-gray-600">Gerenciamento de músicas para o louvor</p>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-1" /> Nova Música
            </Button>
          </div>
          
          <SongsList 
            songs={songs} 
            onEdit={handleEdit} 
          />
        </div>
      )}
    </div>
  );
};

export default Songs;
