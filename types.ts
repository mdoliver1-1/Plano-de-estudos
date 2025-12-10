
export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  createdAt: number;
  careerId?: string; // New field for persistence
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  createdAt: number;
}

export interface LessonMetrics {
  studyTime: number; // in minutes
  questionsTotal: number;
  questionsCorrect: number;
}

export interface Lesson {
  id: string;
  title: string;
  completed: boolean;
  revisionDate?: string | null;
  revisionQueue?: number[]; 
  notes?: string;
  materialLink?: string;
  flashcards?: Flashcard[];
  metrics?: LessonMetrics; 
}

export interface Subject {
  id: string;
  name: string;
  lessons: Lesson[];
  isOpen: boolean;
}

export interface TimerSettings {
  focus: number;
  short: number;
  long: number;
}

export interface Inventory {
  ice: number; 
}

export interface StudyPlan {
  id: string;
  name: string;
  subjects: Subject[];
  timerSettings: TimerSettings;
  createdAt: number;
  streak?: number;
  lastStudyDate?: number;
  inventory?: Inventory;
  bonusXP?: number;
  forcedMedals?: string[];
  careerId?: string; 
}

export interface ActiveSession {
  sId: string;
  lId: string;
  title: string;
  startTime: number;
  accumulatedTime: number; 
  isPaused: boolean;
}

// --- GLOBAL CONSTANTS ---
export const CAREERS: Record<string, { label: string, ranks: string[] }> = {
  fiscal: { label: "🦁 Área Fiscal", ranks: ["Concurseiro", "Analista", "Auditor Jr.", "Auditor Fiscal", "Superintendente", "Auditor-Geral"] },
  policial: { label: "👮 Segurança Pública", ranks: ["Cadete", "Operacional", "Agente Especial", "Comissário", "Superintendente", "Diretor-Geral"] },
  saude: { label: "🏥 Área Saúde", ranks: ["Acadêmico", "Interno", "Residente", "Especialista", "Titular", "Diretor Clínico"] },
  juridica: { label: "⚖️ Área Jurídica", ranks: ["Estagiário", "Bacharel", "Advogado", "Juiz", "Desembargador", "Ministro"] },
  bancaria: { label: "🏦 Bancária & Gestão", ranks: ["Estagiário", "Escriturário", "Gerente", "Superintendente", "Diretor", "Presidente"] },
  ti: { label: "💻 Tecnologia (TI)", ranks: ["Junior", "Pleno", "Senior", "Tech Lead", "Arquiteto", "CTO"] },
  diplomacia: { label: "🌍 Diplomacia", ranks: ["Candidato", "3º Secretário", "2º Secretário", "Conselheiro", "Embaixador", "Chanceler"] },
  vestibular: { label: "🎓 Vestibular/ENEM", ranks: ["Treineiro", "Vestibulando", "Candidato", "Competitivo", "Gabaritador", "Universitário"] },
};
