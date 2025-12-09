export interface Flashcard {
  id: string;
  front: string;
  back: string;
  createdAt: number;
}

export interface Lesson {
  id: string;
  title: string;
  completed: boolean;
  revisionDate?: string | null; // ISO string
  notes?: string; // Content of the summary
  flashcards?: Flashcard[]; // Array of flashcards
}

export interface Subject {
  id: string;
  name: string;
  lessons: Lesson[];
  isOpen: boolean;
}

export interface TimerSettings {
  focus: number; // minutes
  short: number; // minutes
  long: number; // minutes
}

export interface StudyPlan {
  id: string;
  name: string;
  subjects: Subject[];
  timerSettings: TimerSettings;
  createdAt: number;
  streak?: number; // Current streak count
  lastStudyDate?: number; // Timestamp of last activity
}