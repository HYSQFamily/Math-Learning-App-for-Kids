export interface Problem {
  id: string
  question: string
  answer: number
  hints?: string[]
  knowledge_point: string
  related_points?: string[]
  difficulty?: number
  created_at?: string
}

export interface SubmitAnswerResponse {
  is_correct: boolean
  message?: string
}

export interface TutorResponse {
  answer: string
  model?: string
}
