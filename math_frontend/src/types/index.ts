export type Language = 'en' | 'zh';

export interface WordProblem {
  id: string;
  text: Record<Language, string>;
  answer: number;
  explanation: Record<Language, string>;
}

export interface User {
  id: string;
  name: string;
  points: number;
  streak: number;
}

export interface Progress {
  points: number;
  current_streak: number;
  accuracy: number;
}

export interface Problem {
  id: string;
  question_en: string;
  question_zh: string;
  hints_en: string[];
  hints_zh: string[];
  knowledge_point: string;
  related_points?: string[];
}
