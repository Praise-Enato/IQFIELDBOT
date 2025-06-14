export interface Question {
  id: string;
  field: Field;
  difficulty: number;
  question: string;
  type: 'multiple-choice' | 'text' | 'number';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
  timeLimit?: number;
}

export type Field = 'math' | 'logic' | 'programming' | 'language' | 'visual-patterns';

export interface FieldScore {
  correct: number;
  total: number;
}

export interface UserSession {
  id: string;
  selectedField: Field | null;
  currentQuestion: Question | null;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  difficulty: number;
  fieldScores: Record<Field, FieldScore>;
  startTime: number;
  isComplete: boolean;
}

export interface ChatMessage {
  id: string;
  type: 'bot' | 'user' | 'question';
  content: string;
  question?: Question;
  isCorrect?: boolean;
  timestamp: number;
}