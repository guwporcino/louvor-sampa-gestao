
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Song } from "../types";
import { FileMusic, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SongsListProps {
  songs: Song[];
  onEdit: (song: Song) => void;
}

const SongsList: React.FC<SongsListProps> = ({ songs, onEdit }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Artista</TableHead>
            <TableHead>Tom/BPM</TableHead>
            <TableHead>Links</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {songs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                Nenhuma música encontrada
              </TableCell>
            </TableRow>
          ) : (
            songs.map((song) => (
              <TableRow key={song.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileMusic className="h-4 w-4 text-worship-purple" />
                    {song.title}
                  </div>
                </TableCell>
                <TableCell>{song.artist}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {song.key && <Badge variant="outline">{song.key}</Badge>}
                    {song.bpm && <Badge variant="outline">{song.bpm} BPM</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {song.sheetUrl && (
                      <a
                        href={song.sheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Cifra
                      </a>
                    )}
                    {song.youtubeUrl && (
                      <a
                        href={song.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        YouTube
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(song)}
                  >
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SongsList;
