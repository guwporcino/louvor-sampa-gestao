
import { Member, Song, Schedule, Category } from "../types";

export const mockCategories: Category[] = [
  { id: "1", name: "Soprano", type: "voice", voiceType: "soprano" },
  { id: "2", name: "Contralto", type: "voice", voiceType: "contralto" },
  { id: "3", name: "Tenor", type: "voice", voiceType: "tenor" },
  { id: "4", name: "Baixo", type: "voice", voiceType: "baixo" },
  { id: "5", name: "Violão", type: "instrument", instrumentType: "violao" },
  { id: "6", name: "Guitarra", type: "instrument", instrumentType: "guitarra" },
  { id: "7", name: "Bateria", type: "instrument", instrumentType: "bateria" },
  { id: "8", name: "Teclado", type: "instrument", instrumentType: "teclado" },
  { id: "9", name: "Contrabaixo", type: "instrument", instrumentType: "baixo" }
];

// Zeroed members array
export const mockMembers: Member[] = [];

// Real worship songs with accurate data
export const mockSongs: Song[] = [
  {
    id: "1",
    title: "Maravilhosa Graça",
    artist: "Rebeca Nemer",
    key: "G",
    bpm: 75,
    sheetUrl: "https://www.cifraclub.com.br/rebeca-nemer/maravilhosa-graca/",
    youtubeUrl: "https://www.youtube.com/watch?v=w3s7iqr9XuI",
    createdAt: new Date("2023-01-05")
  },
  {
    id: "2",
    title: "Lugar Secreto",
    artist: "Gabriela Rocha",
    key: "D",
    bpm: 72,
    sheetUrl: "https://www.cifraclub.com.br/gabriela-rocha/lugar-secreto/",
    youtubeUrl: "https://www.youtube.com/watch?v=TxcMycpX_gM",
    createdAt: new Date("2023-02-10")
  },
  {
    id: "3",
    title: "Oceanos",
    artist: "Hillsong",
    key: "D",
    bpm: 65,
    sheetUrl: "https://www.cifraclub.com.br/hillsong-worship/oceanos-where-feet-may-fail/",
    youtubeUrl: "https://www.youtube.com/watch?v=1m_sWJQm2fs",
    createdAt: new Date("2023-02-15")
  },
  {
    id: "4",
    title: "Ousado Amor",
    artist: "Isaías Saad",
    key: "G",
    bpm: 68,
    sheetUrl: "https://www.cifraclub.com.br/isaias-saad/ousado-amor/",
    youtubeUrl: "https://www.youtube.com/watch?v=DnM7MJv7Ebs",
    createdAt: new Date("2023-03-20")
  },
  {
    id: "5",
    title: "Nada Além do Sangue",
    artist: "Fernandinho",
    key: "Em",
    bpm: 76,
    sheetUrl: "https://www.cifraclub.com.br/fernandinho/nada-alem-do-sangue/",
    youtubeUrl: "https://www.youtube.com/watch?v=8a92vQQ2E4I",
    createdAt: new Date("2023-01-20")
  },
  {
    id: "6",
    title: "Teu Santo Nome",
    artist: "Gabriela Rocha",
    key: "E",
    bpm: 74,
    sheetUrl: "https://www.cifraclub.com.br/gabriela-rocha/teu-santo-nome/",
    youtubeUrl: "https://www.youtube.com/watch?v=d1hLxiAGGdg",
    createdAt: new Date("2023-04-05")
  },
  {
    id: "7",
    title: "Teu Amor Não Falha",
    artist: "Nívea Soares",
    key: "D",
    bpm: 72,
    sheetUrl: "https://www.cifraclub.com.br/nivea-soares/teu-amor-nao-falha/",
    youtubeUrl: "https://www.youtube.com/watch?v=2L0K2JGwAIQ",
    createdAt: new Date("2023-04-15")
  },
  {
    id: "8",
    title: "Grande é o Senhor",
    artist: "Adhemar de Campos",
    key: "G",
    bpm: 80,
    sheetUrl: "https://www.cifraclub.com.br/adhemar-de-campos/grande-e-o-senhor/",
    youtubeUrl: "https://www.youtube.com/watch?v=4UtW4d4-7JA",
    createdAt: new Date("2023-05-10")
  },
  {
    id: "9",
    title: "Deus é Deus",
    artist: "Delino Marçal",
    key: "C",
    bpm: 72,
    sheetUrl: "https://www.cifraclub.com.br/delino-marcal/deus-e-deus/",
    youtubeUrl: "https://www.youtube.com/watch?v=OYvYA3MCxlw",
    createdAt: new Date("2023-05-20")
  },
  {
    id: "10",
    title: "Quão Grande é o Meu Deus",
    artist: "Soraya Moraes",
    key: "A",
    bpm: 65,
    sheetUrl: "https://www.cifraclub.com.br/soraya-moraes/quao-grande-e-meu-deus/",
    youtubeUrl: "https://www.youtube.com/watch?v=RJ9XNPUIcHE",
    createdAt: new Date("2023-06-01")
  }
];

// Zeroed schedules array
export const mockSchedules: Schedule[] = [];

export function getMemberById(id: string): Member | undefined {
  return mockMembers.find(member => member.id === id);
}

export function getSongById(id: string): Song | undefined {
  return mockSongs.find(song => song.id === id);
}

export function getCategoryById(id: string): Category | undefined {
  return mockCategories.find(category => category.id === id);
}

export function getMembersByCategory(categoryId: string): Member[] {
  return mockMembers.filter(member => member.categories.includes(categoryId));
}

export function getUpcomingSchedules(): Schedule[] {
  const today = new Date();
  return mockSchedules
    .filter(schedule => schedule.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}
