export interface Problem {
  id: string
  question: string
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
