export interface User {
  id: string
  username: string
}

export interface Problem {
  id: string
  question: string
  answer: number
  hints: string[]
  knowledge_point: string
  related_points?: string[]
}

export interface Progress {
  points: number
  current_streak: number
  total_solved: number
  correct_solved: number
  achievements: Achievement[]
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points_reward: number
}

export interface AttemptResult {
  is_correct: boolean
  need_extra_help?: boolean
  mastery_level?: number
}

export interface TutorResponse {
  answer: string
}
