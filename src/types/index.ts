
export type VoiceType = 'soprano' | 'contralto' | 'tenor' | 'baixo';
export type InstrumentType = 'violao' | 'guitarra' | 'bateria' | 'teclado' | 'baixo' | 'outro';

export interface Category {
  id: string;
  name: string;
  type: 'voice' | 'instrument';
  voiceType?: VoiceType;
  instrumentType?: InstrumentType;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  categories: string[]; // Category IDs
  active: boolean;
  createdAt: Date;
}

export interface Song {
  id: string;
  title: string;
  artist?: string;
  key?: string;
  bpm?: number;
  sheetUrl?: string; // URL para cifra (PDF)
  youtubeUrl?: string;
  createdAt: Date;
}

export interface Schedule {
  id: string;
  date: Date;
  title: string;
  description?: string;
  members: string[]; // Member IDs
  songs: string[]; // Song IDs
  isPublished: boolean;
  createdAt: Date;
}

export interface Attendance {
  scheduleId: string;
  memberId: string;
  status: 'confirmed' | 'declined' | 'pending';
  note?: string;
}
