export interface Problem {
  id: string
  question: string | {
    zh: string
    sv: string
  }
  answer: number
  knowledge_point: string
  related_points?: string[]
  difficulty: number
  created_at: string
  hints?: string[]
  type?: string
}

export interface SubmitAnswerResponse {
  is_correct: boolean
  message?: string
  explanation?: string
}

export interface TutorResponse {
  answer: string
  model?: string
}

export interface User {
  id: string
  username: string
  grade_level: number
  points: number
  streak_days: number
}

export interface Progress {
  points: number
  streak_days: number
  mastery_levels: Record<string, number>
  achievements: Array<{
    id: string
    name: string
    description: string
    points: number
  }>
}
