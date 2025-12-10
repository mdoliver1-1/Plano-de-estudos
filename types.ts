
export interface UserProfile {
  id: string;
  name: string;
  avatar: string; // Emoji or Initials
  createdAt: number;
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
  revisionQueue?: number[]; // Array of timestamps for future revisions (Cycle logic)
  notes?: string;
  materialLink?: string; // Optional URL for study material
  flashcards?: Flashcard[];
  metrics?: LessonMetrics; // New: Performance data
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
  ice: number; // Freeze streak item
}

export interface StudyPlan {
  id: string;
  name: string;
  subjects: Subject[];
  timerSettings: TimerSettings;
  createdAt: number;
  streak?: number;
  lastStudyDate?: number;
  inventory?: Inventory; // Gamification items
  bonusXP?: number; // Added for Developer Mode / Special Events
}

export interface ActiveSession {
  sId: string;
  lId: string;
  title: string;
  startTime: number; // Timestamp de quando começou (ou retomou)
  accumulatedTime: number; // Tempo acumulado em ms antes da última pausa
  isPaused: boolean;
}
