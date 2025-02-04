import type { Problem } from '../types'

export interface AttemptResult {
  is_correct: boolean;
  need_extra_help?: boolean;
  mastery_level?: number;
}

export interface TutorResponse {
  answer: string;
  model?: string;
}

const API_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:8000"

export const api = {
  getNextProblem: async (): Promise<Problem> => {
    try {
      let clientId = localStorage.getItem('client_id')
      if (!clientId) {
        clientId = crypto.randomUUID()
        localStorage.setItem('client_id', clientId)
      }
      const response = await fetch(`${API_URL}/problems/next`, {
        headers: {
          'x-client-id': clientId
        }
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "网络错误" }))
        throw new Error(error.detail || "获取题目失败，请刷新页面重试")
      }
      const problem = await response.json()
      if (!problem || typeof problem !== 'object') {
        throw new Error("题目数据格式错误")
      }
      return problem
    } catch (error: any) {
      console.error("获取题目失败:", error)
      throw new Error(error.message || "获取题目失败，请稍后再试")
    }
  },

  submitAnswer: async (problemId: string, answer: number): Promise<AttemptResult> => {
    try {
      let clientId = localStorage.getItem('client_id')
      if (!clientId) {
        clientId = crypto.randomUUID()
        localStorage.setItem('client_id', clientId)
      }
      const response = await fetch(`${API_URL}/problems/submit`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-client-id": clientId
        },
        body: JSON.stringify({ problem_id: problemId, answer })
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "网络错误" }))
        throw new Error(error.detail || "提交答案失败，请稍后再试")
      }
      const result = await response.json()
      if (!result || typeof result.is_correct !== 'boolean') {
        throw new Error("服务器返回数据格式错误")
      }
      return result
    } catch (error: any) {
      console.error("提交答案失败:", error)
      throw new Error(error.message || "提交答案失败，请稍后再试")
    }
  },

  askTutor: async (userId: string, question: string, hintType: "quick_hint" | "deep_analysis"): Promise<TutorResponse> => {
    try {
      const response = await fetch(`${API_URL}/tutor/ask?service=deepseek`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, question, hint_type: hintType })
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "网络错误" }))
        throw new Error(error.detail || "AI助手暂时无法回答，请稍后再试")
      }
      return response.json()
    } catch (error: any) {
      console.error("AI Tutor Error:", error)
      throw new Error(error.message || "AI助手暂时无法回答，请稍后再试")
    }
  }
}
