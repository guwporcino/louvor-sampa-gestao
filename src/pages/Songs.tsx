
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileUp } from "lucide-react";
import SongsList from "../components/SongsList";
import SongForm from "../components/SongForm";
import SongImport from "../components/SongImport";
import { Song } from "../types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const Songs = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    fetchSongs();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('songs-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'songs' 
        }, 
        () => {
          fetchSongs();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const fetchSongs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching songs:', error);
        toast({
          title: 'Erro ao carregar músicas',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        // Convert to Song type
        const formattedSongs: Song[] = data.map(song => ({
          id: song.id,
          title: song.title,
          artist: song.artist || undefined,
          key: song.key || undefined,
          bpm: song.bpm || undefined,
          sheetUrl: song.sheet_url || undefined,
          youtubeUrl: song.youtube_url || undefined,
          createdAt: new Date(song.created_at)
        }));
        setSongs(formattedSongs);
      }
    } catch (error) {
      console.error('Unexpected error fetching songs:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateNew = () => {
    setEditingSong(undefined);
    setShowForm(true);
    setShowImport(false);
  };
  
  const handleShowImport = () => {
    setShowImport(true);
    setShowForm(false);
  };
  
  const handleEdit = (song: Song) => {
    setEditingSong(song);
    setShowForm(true);
    setShowImport(false);
  };
  
  const handleCancel = () => {
    setShowForm(false);
    setShowImport(false);
    setEditingSong(undefined);
  };
  
  const handleSubmit = async (formData: Partial<Song>) => {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      if (editingSong) {
        // Update existing song
        const { error } = await supabase
          .from('songs')
          .update({
            title: formData.title,
            artist: formData.artist || null,
            key: formData.key || null,
            bpm: formData.bpm || null,
            sheet_url: formData.sheetUrl || null,
            youtube_url: formData.youtubeUrl || null
          })
          .eq('id', editingSong.id);
          
        if (error) {
          throw error;
        }
        
        toast({
          title: 'Música atualizada',
          description: 'A música foi atualizada com sucesso.'
        });
      } else {
        // Create new song
        const { error } = await supabase
          .from('songs')
          .insert({
            title: formData.title || '',
            artist: formData.artist || null,
            key: formData.key || null,
            bpm: formData.bpm || null,
            sheet_url: formData.sheetUrl || null,
            youtube_url: formData.youtubeUrl || null,
            created_by: user.id
          });
          
        if (error) {
          throw error;
        }
        
        toast({
          title: 'Música cadastrada',
          description: 'A música foi adicionada ao repertório.'
        });
      }
      
      // Reset form state
      setShowForm(false);
      setEditingSong(undefined);
    } catch (error: any) {
      console.error('Error saving song:', error);
      toast({
        title: 'Erro ao salvar música',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="animate-fade-in">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : showForm ? (
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
      ) : showImport ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Importar Músicas</h1>
            <Button onClick={handleCancel} variant="outline">
              Voltar
            </Button>
          </div>
          <SongImport />
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Repertório</h1>
              <p className="text-gray-600">Gerenciamento de músicas para o louvor</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleShowImport} variant="outline">
                <FileUp className="h-4 w-4 mr-1" /> Importar Excel
              </Button>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-1" /> Nova Música
              </Button>
            </div>
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
