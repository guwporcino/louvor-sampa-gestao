
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, Info, X, Download, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';

type Song = {
  title: string;
  artist?: string;
  key?: string;
  bpm?: number;
  sheet_url?: string;
  youtube_url?: string;
};

const SongImport: React.FC = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ success: Song[], failed: Song[] }>({ success: [], failed: [] });
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith('.xlsx')) {
        toast({
          title: 'Formato de arquivo inválido',
          description: 'Por favor, selecione um arquivo Excel (.xlsx)',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
      processExcelFile(selectedFile);
    }
  };

  const processExcelFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<Song>(worksheet);
      
      // Validating required fields
      const validSongs = jsonData.filter(song => song.title);
      setSongs(validSongs);
      
      toast({
        title: 'Arquivo processado',
        description: `${validSongs.length} músicas encontradas`,
      });
    } catch (error) {
      console.error('Error processing Excel file:', error);
      toast({
        title: 'Erro ao processar arquivo',
        description: 'Ocorreu um erro ao ler o arquivo Excel',
        variant: 'destructive',
      });
    }
  };

  const uploadSongs = async () => {
    if (!user) {
      toast({
        title: 'Erro de autenticação',
        description: 'Você precisa estar logado para importar músicas',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    const successful: Song[] = [];
    const failed: Song[] = [];
    
    for (const song of songs) {
      try {
        const { error } = await supabase.from('songs').insert({
          title: song.title,
          artist: song.artist || null,
          key: song.key || null,
          bpm: song.bpm || null,
          sheet_url: song.sheet_url || null,
          youtube_url: song.youtube_url || null,
          created_by: user.id
        });
        
        if (error) throw error;
        successful.push(song);
      } catch (error) {
        console.error('Error uploading song:', error);
        failed.push(song);
      }
    }
    
    setUploadStatus({ success: successful, failed });
    setShowResults(true);
    setIsUploading(false);
    
    toast({
      title: 'Importação concluída',
      description: `${successful.length} músicas importadas. ${failed.length} falhas.`,
      variant: failed.length > 0 ? 'destructive' : 'default',
    });
  };

  const downloadTemplate = () => {
    const template = [
      {
        title: 'Nome da Música',
        artist: 'Artista/Compositor',
        key: 'Tom (ex: C, D, Em)',
        bpm: 120,
        sheet_url: 'https://exemplo.com/partitura.pdf',
        youtube_url: 'https://www.youtube.com/watch?v=exemplo'
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'template_importacao_musicas.xlsx');
  };

  const resetProcess = () => {
    setFile(null);
    setSongs([]);
    setShowResults(false);
    setUploadStatus({ success: [], failed: [] });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Importar Músicas</CardTitle>
        <CardDescription>
          Importe suas músicas de uma planilha Excel (.xlsx)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showResults ? (
          <div>
            <Alert className="mb-4" variant="default">
              <Info className="h-4 w-4" />
              <AlertTitle>Resultado da importação</AlertTitle>
              <AlertDescription>
                {uploadStatus.success.length} músicas foram importadas com sucesso.
                {uploadStatus.failed.length > 0 && (
                  <span> {uploadStatus.failed.length} músicas não puderam ser importadas.</span>
                )}
              </AlertDescription>
            </Alert>
            
            {uploadStatus.success.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Músicas importadas:</h3>
                <ul className="space-y-1">
                  {uploadStatus.success.map((song, idx) => (
                    <li key={idx} className="text-sm flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      {song.title} {song.artist && `- ${song.artist}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {uploadStatus.failed.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2 text-red-500">Falhas na importação:</h3>
                <ul className="space-y-1">
                  {uploadStatus.failed.map((song, idx) => (
                    <li key={idx} className="text-sm flex items-center">
                      <X className="h-4 w-4 text-red-500 mr-2" />
                      {song.title} {song.artist && `- ${song.artist}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={downloadTemplate}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar template Excel
                </Button>
              </div>
              
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="cursor-pointer"
                />
              </div>
              
              {songs.length > 0 && (
                <div>
                  <p className="text-sm mb-1">
                    {songs.length} músicas encontradas no arquivo.
                  </p>
                  <ul className="text-sm max-h-40 overflow-y-auto border rounded p-2">
                    {songs.slice(0, 10).map((song, idx) => (
                      <li key={idx} className="mb-1">
                        {song.title} {song.artist && `- ${song.artist}`}
                      </li>
                    ))}
                    {songs.length > 10 && <li>+ {songs.length - 10} músicas</li>}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {showResults ? (
          <Button onClick={resetProcess} className="w-full">
            Importar mais músicas
          </Button>
        ) : (
          <Button
            onClick={uploadSongs}
            disabled={songs.length === 0 || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Importando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Importar {songs.length} músicas
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SongImport;
