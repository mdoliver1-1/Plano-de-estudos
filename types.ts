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
  notes?: string;
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

export interface StudyPlan {
  id: string;
  name: string;
  subjects: Subject[];
  timerSettings: TimerSettings;
  createdAt: number;
  streak?: number;
  lastStudyDate?: number;
}

export interface ActiveSession {
  sId: string;
  lId: string;
  title: string;
  startTime: number; // Timestamp de quando começou (ou retomou)
  accumulatedTime: number; // Tempo acumulado em ms antes da última pausa
  isPaused: boolean;
}