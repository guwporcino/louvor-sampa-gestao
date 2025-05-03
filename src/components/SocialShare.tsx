
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Share,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Schedule } from "@/types";
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

interface SocialShareProps {
  schedule: Schedule;
}

const SocialShare: React.FC<SocialShareProps> = ({ schedule }) => {
  const { toast } = useToast();

  const getShareUrl = () => {
    // Criar URL para compartilhamento (usando window.location)
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/escalas-ebd/${schedule.id}`;
    return shareUrl;
  };

  const getShareText = () => {
    return `Confira a escala de Escola Bíblica: ${schedule.title} - ${format(schedule.date, 'dd/MM/yyyy')}`;
  };

  const handleShare = async (platform: string) => {
    const shareUrl = getShareUrl();
    const shareText = getShareText();

    try {
      if (navigator.share && platform === 'native') {
        // Web Share API (mobile)
        await navigator.share({
          title: schedule.title,
          text: shareText,
          url: shareUrl,
        });
        
        toast({
          title: "Compartilhado",
          description: "Conteúdo compartilhado com sucesso!",
        });
        return;
      }

      // Fallback para links de compartilhamento específicos
      let shareLink = '';

      switch (platform) {
        case 'facebook':
          shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
          break;
        case 'twitter':
          shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
          break;
        case 'linkedin':
          shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
          break;
        case 'whatsapp':
          shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
          break;
        default:
          // Copiar link
          await navigator.clipboard.writeText(shareUrl);
          toast({
            title: "Link copiado",
            description: "Link copiado para a área de transferência",
          });
          return;
      }

      // Abrir em nova janela
      if (shareLink) {
        window.open(shareLink, '_blank', 'noopener,noreferrer');
      }
      
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      
      // Fallback para copiar link
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copiado",
          description: "Link copiado para a área de transferência",
        });
      } catch (clipboardError) {
        toast({
          title: "Erro",
          description: "Não foi possível compartilhar. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  // Verificar se o navegador suporta o Web Share API
  const supportsNativeShare = !!navigator.share;

  return (
    <div>
      {supportsNativeShare ? (
        <Button
          onClick={() => handleShare('native')}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Share className="h-4 w-4" />
          <span>Compartilhar</span>
        </Button>
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="flex items-center gap-2"
              variant="outline"
            >
              <Share className="h-4 w-4" />
              <span>Compartilhar</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex justify-start"
                onClick={() => handleShare('facebook')}
              >
                <Facebook className="mr-2 h-4 w-4" />
                <span>Facebook</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex justify-start"
                onClick={() => handleShare('twitter')}
              >
                <Twitter className="mr-2 h-4 w-4" />
                <span>Twitter</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex justify-start"
                onClick={() => handleShare('linkedin')}
              >
                <Linkedin className="mr-2 h-4 w-4" />
                <span>LinkedIn</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex justify-start"
                onClick={() => handleShare('whatsapp')}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                  <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                  <path d="M13.5 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                  <path d="M9 13a5 5 0 0 0 6 0" />
                </svg>
                <span>WhatsApp</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex justify-start"
                onClick={() => handleShare('copy')}
              >
                <svg 
                  className="mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Copiar Link</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default SocialShare;
