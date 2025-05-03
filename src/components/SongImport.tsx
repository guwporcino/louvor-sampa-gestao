
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Download, FileSpreadsheet, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

interface SongData {
  title: string;
  artist?: string;
  key?: string;
  bpm?: number;
  sheet_url?: string;
  youtube_url?: string;
}

const SongImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<SongData[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Process the Excel file when selected
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setError(null);
    setPreview([]);
    
    if (files && files.length > 0) {
      const selectedFile = files[0];
      
      // Check if file is Excel
      if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
        setError("Por favor, selecione um arquivo Excel válido (.xlsx ou .xls)");
        return;
      }
      
      setFile(selectedFile);
      
      // Parse Excel file for preview
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = evt.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
          
          // Validate and map data
          const songsData = jsonData.map((row: any) => ({
            title: row.title || row.Title || row.Título || row.titulo || "",
            artist: row.artist || row.Artist || row.Artista || row.artista || "",
            key: row.key || row.Key || row.Tom || row.tom || "",
            bpm: row.bpm || row.BPM || 0,
            sheet_url: row.sheet_url || row.sheetUrl || row.Cifra || row.cifra || "",
            youtube_url: row.youtube_url || row.youtubeUrl || row.YouTube || row.youtube || "",
          }));
          
          // Validate required fields
          const validSongs = songsData.filter(song => song.title);
          
          if (validSongs.length === 0) {
            setError("Nenhuma música válida encontrada no arquivo. Verifique se o arquivo tem uma coluna 'title' ou 'Título'.");
            return;
          }
          
          setPreview(validSongs);
        } catch (error) {
          console.error("Error processing file:", error);
          setError("Erro ao processar o arquivo Excel. Verifique se o formato está correto.");
        }
      };
      
      reader.onerror = () => {
        setError("Erro ao ler o arquivo.");
      };
      
      reader.readAsBinaryString(selectedFile);
    }
  };

  // Handle import button click
  const handleImport = async () => {
    if (!preview.length || !user) return;
    
    setUploading(true);
    setProgress(0);
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      // Import songs one by one to show progress
      for (let i = 0; i < preview.length; i++) {
        const song = preview[i];
        
        const { error } = await supabase.from('songs').insert({
          title: song.title,
          artist: song.artist || null,
          key: song.key || null,
          bpm: song.bpm || null,
          sheet_url: song.sheet_url || null,
          youtube_url: song.youtube_url || null,
          created_by: user.id
        });
        
        if (error) {
          console.error("Error importing song:", error);
          errorCount++;
        } else {
          successCount++;
        }
        
        // Update progress
        const currentProgress = Math.round(((i + 1) / preview.length) * 100);
        setProgress(currentProgress);
      }
      
      // Show results
      if (errorCount > 0) {
        toast({
          title: "Importação concluída com avisos",
          description: `${successCount} músicas importadas com sucesso. ${errorCount} músicas não puderam ser importadas.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Importação concluída com sucesso",
          description: `${successCount} músicas foram adicionadas ao repertório.`,
          variant: "success",
        });
      }
      
      // Reset states
      setFile(null);
      setPreview([]);
      
      // Reset file input
      const fileInput = document.getElementById('excel-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar as músicas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Download template
  const downloadTemplate = () => {
    const template = [
      {
        title: "Nome da Música",
        artist: "Nome do Artista",
        key: "C",
        bpm: 120,
        sheet_url: "https://exemplo.com/cifra.pdf",
        youtube_url: "https://youtube.com/watch?v=exemplo"
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Músicas");
    
    // Generate and download the file
    XLSX.writeFile(workbook, "template_musicas.xlsx");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Músicas</CardTitle>
        <CardDescription>
          Importe múltiplas músicas de uma planilha Excel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              id="excel-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={downloadTemplate}
            disabled={uploading}
          >
            <Download className="w-4 h-4 mr-2" />
            Template
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Importando músicas...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {preview.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-medium">Prévia da importação</h3>
            </div>
            
            <div className="rounded-md border">
              <div className="p-4 bg-muted/50">
                <p className="text-sm font-medium">
                  {preview.length} músicas encontradas no arquivo
                </p>
              </div>
              <div className="p-4 max-h-48 overflow-auto">
                <ul className="space-y-2 text-sm">
                  {preview.slice(0, 10).map((song, idx) => (
                    <li key={idx} className="flex items-center">
                      <div className="w-8 text-center">{idx + 1}</div>
                      <div className="flex-1 font-medium">{song.title}</div>
                      <div className="text-muted-foreground">{song.artist}</div>
                    </li>
                  ))}
                  {preview.length > 10 && (
                    <li className="text-muted-foreground text-center">
                      ...e mais {preview.length - 10} músicas
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleImport} 
          disabled={!preview.length || uploading}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Importando..." : "Importar Músicas"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SongImport;
