// ─── User ──────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  photoUrl: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
}

// ─── Quiz ──────────────────────────────────────────────
export interface QuizSummary {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  createdAt: string;
  creator: { id: string; name: string };
  questionCount: number;
  attemptCount: number;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  order: number;
}

export interface QuizDetail {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  createdAt: string;
  creator: { id: string; name: string };
  attemptCount: number;
  questions: QuizQuestion[];
}

// ─── Attempt ───────────────────────────────────────────
export interface AttemptResult {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalScore: number;
  submittedAt: string;
}

export interface AttemptHistoryItem {
  id: string;
  quizId: string;
  quizTitle: string;
  quizDescription: string;
  questionCount: number;
  score: number;
  totalScore: number;
  percentage: number;
  submittedAt: string;
}

export interface ReviewQuestion {
  questionId: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  selectedAnswerIndex: number;
  isCorrect: boolean;
}

export interface AttemptDetail {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalScore: number;
  percentage: number;
  startedAt: string;
  submittedAt: string;
  review: ReviewQuestion[];
}

// ─── API Response ──────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: { field: string; message: string }[];
}

// ─── Create Quiz ───────────────────────────────────────
export interface CreateQuestionInput {
  questionText: string;
  options: [string, string, string, string];
  correctAnswerIndex: number;
}

export interface CreateQuizInput {
  title: string;
  description: string;
  timeLimit: number;
  questions: CreateQuestionInput[];
}
