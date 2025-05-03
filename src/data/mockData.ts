
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

export const mockMembers: Member[] = [
  {
    id: "1",
    name: "Ana Silva",
    email: "ana.silva@email.com",
    phone: "(11) 98765-4321",
    categories: ["1"], // Soprano
    active: true,
    createdAt: new Date("2023-01-15")
  },
  {
    id: "2",
    name: "Carlos Santos",
    email: "carlos.santos@email.com",
    phone: "(11) 91234-5678",
    categories: ["3"], // Tenor
    active: true,
    createdAt: new Date("2023-02-20")
  },
  {
    id: "3",
    name: "Mariana Oliveira",
    email: "mariana.oliveira@email.com",
    phone: "(11) 99876-5432",
    categories: ["2"], // Contralto
    active: true,
    createdAt: new Date("2023-01-10")
  },
  {
    id: "4",
    name: "Paulo Rodrigues",
    email: "paulo.rodrigues@email.com",
    phone: "(11) 97654-3210",
    categories: ["4"], // Baixo vocal
    active: true,
    createdAt: new Date("2023-03-05")
  },
  {
    id: "5",
    name: "Lucas Ferreira",
    email: "lucas.ferreira@email.com",
    phone: "(11) 95678-1234",
    categories: ["5"], // Violão
    active: true,
    createdAt: new Date("2023-02-15")
  },
  {
    id: "6",
    name: "Gabriel Almeida",
    email: "gabriel.almeida@email.com",
    phone: "(11) 93456-7890",
    categories: ["6"], // Guitarra
    active: true,
    createdAt: new Date("2023-04-10")
  },
  {
    id: "7",
    name: "Juliana Costa",
    email: "juliana.costa@email.com",
    phone: "(11) 94567-8901",
    categories: ["7"], // Bateria
    active: true,
    createdAt: new Date("2023-03-20")
  },
  {
    id: "8",
    name: "Ricardo Martins",
    email: "ricardo.martins@email.com",
    phone: "(11) 92345-6789",
    categories: ["8"], // Teclado
    active: true,
    createdAt: new Date("2023-01-25")
  },
  {
    id: "9",
    name: "Felipe Souza",
    email: "felipe.souza@email.com",
    phone: "(11) 98901-2345",
    categories: ["9"], // Contrabaixo
    active: true,
    createdAt: new Date("2023-04-15")
  },
  {
    id: "10",
    name: "Roberta Gonçalves",
    email: "roberta.goncalves@email.com",
    phone: "(11) 96789-0123",
    categories: ["1", "8"], // Soprano e Teclado
    active: true,
    createdAt: new Date("2023-02-10")
  }
];

export const mockSongs: Song[] = [
  {
    id: "1",
    title: "Grande é o Senhor",
    artist: "Adhemar de Campos",
    key: "G",
    bpm: 80,
    sheetUrl: "https://example.com/cifras/grande-senhor.pdf",
    youtubeUrl: "https://www.youtube.com/watch?v=example1",
    createdAt: new Date("2023-01-05")
  },
  {
    id: "2",
    title: "Deus é Deus",
    artist: "Delino Marçal",
    key: "C",
    bpm: 72,
    sheetUrl: "https://example.com/cifras/deus-e-deus.pdf",
    youtubeUrl: "https://www.youtube.com/watch?v=example2",
    createdAt: new Date("2023-01-10")
  },
  {
    id: "3",
    title: "Ousado Amor",
    artist: "Isaías Saad",
    key: "D",
    bpm: 68,
    sheetUrl: "https://example.com/cifras/ousado-amor.pdf",
    youtubeUrl: "https://www.youtube.com/watch?v=example3",
    createdAt: new Date("2023-02-15")
  },
  {
    id: "4",
    title: "Nada Além do Sangue",
    artist: "Fernandinho",
    key: "Em",
    bpm: 76,
    sheetUrl: "https://example.com/cifras/nada-alem-sangue.pdf",
    youtubeUrl: "https://www.youtube.com/watch?v=example4",
    createdAt: new Date("2023-01-20")
  },
  {
    id: "5",
    title: "Oceanos",
    artist: "Hillsong",
    key: "D",
    bpm: 66,
    sheetUrl: "https://example.com/cifras/oceanos.pdf",
    youtubeUrl: "https://www.youtube.com/watch?v=example5",
    createdAt: new Date("2023-03-05")
  }
];

export const mockSchedules: Schedule[] = [
  {
    id: "1",
    date: new Date("2023-05-07"),
    title: "Culto Matutino",
    description: "Culto de domingo às 10h",
    members: ["1", "3", "5", "7", "9"],
    songs: ["1", "3", "5"],
    isPublished: true,
    createdAt: new Date("2023-04-30")
  },
  {
    id: "2",
    date: new Date("2023-05-07"),
    title: "Culto Noturno",
    description: "Culto de domingo às 18h",
    members: ["2", "4", "6", "8", "10"],
    songs: ["2", "4", "1"],
    isPublished: true,
    createdAt: new Date("2023-04-30")
  },
  {
    id: "3",
    date: new Date("2023-05-14"),
    title: "Culto Matutino",
    description: "Culto de domingo às 10h",
    members: ["2", "3", "5", "8", "9"],
    songs: ["3", "4", "5"],
    isPublished: true,
    createdAt: new Date("2023-05-07")
  },
  {
    id: "4",
    date: new Date("2023-05-14"),
    title: "Culto Noturno",
    description: "Culto de domingo às 18h",
    members: ["1", "4", "6", "7", "10"],
    songs: ["1", "2", "5"],
    isPublished: true,
    createdAt: new Date("2023-05-07")
  },
  {
    id: "5",
    date: new Date("2023-05-21"),
    title: "Culto Matutino",
    description: "Culto de domingo às 10h",
    members: ["1", "4", "5", "7", "9"],
    songs: ["2", "3", "4"],
    isPublished: false,
    createdAt: new Date("2023-05-14")
  }
];

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
