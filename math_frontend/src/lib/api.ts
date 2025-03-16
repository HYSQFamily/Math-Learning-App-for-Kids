import type { Problem as ProblemType, SubmitAnswerResponse, TutorResponse as TutorResponseType } from "../types";

export interface User {
  id: string;
  username: string;
  grade_level: number;
  points: number;
  streak_days: number;
}

export interface Problem extends ProblemType {
  hints: string[];
  type?: string;
}

export interface AttemptResult extends SubmitAnswerResponse {
  need_extra_help?: boolean;
  mastery_level?: number;
  explanation?: string;
}

export interface TutorResponse extends TutorResponseType {}

const API_URL = "https://math-learning-app-backend.fly.dev"

export const api = {
  getUser: async (userId?: string): Promise<User> => {
    let clientId = localStorage.getItem('client_id')
    if (!clientId) {
      clientId = crypto.randomUUID()
      localStorage.setItem('client_id', clientId)
    }
    
    try {
      // Use client ID if no user ID provided
      const effectiveUserId = userId || clientId || 'default-user'
      
      const response = await fetch(`${API_URL}/users/${effectiveUserId}`, {
        headers: {
          'x-client-id': clientId
        }
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "网络错误" }))
        throw new Error(error.detail || "获取用户信息失败")
      }
      
      return await response.json()
    } catch (error: any) {
      console.error("获取用户信息失败:", error)
      // Return a default user object instead of throwing
      return {
        id: clientId || "default-user",
        username: "DefaultUser",
        grade_level: 3,
        points: 0,
        streak_days: 0
      }
    }
  },
  
  getUserProgress: async (userId?: string): Promise<any> => {
    let clientId = localStorage.getItem('client_id')
    if (!clientId) {
      clientId = crypto.randomUUID()
      localStorage.setItem('client_id', clientId)
    }
    
    try {
      // Use client ID if no user ID provided
      const effectiveUserId = userId || clientId || 'default-user'
      
      const response = await fetch(`${API_URL}/users/${effectiveUserId}/progress`, {
        headers: {
          'x-client-id': clientId
        }
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "网络错误" }))
        throw new Error(error.detail || "获取学习进度失败")
      }
      
      return await response.json()
    } catch (error: any) {
      console.error("获取学习进度失败:", error)
      // Return default progress instead of throwing
      return {
        points: 0,
        streak_days: 0,
        mastery_levels: {
          addition: 0.0,
          subtraction: 0.0,
          multiplication: 0.0
        },
        achievements: []
      }
    }
  },
  
  getNextProblem: async (): Promise<Problem> => {
    let clientId = localStorage.getItem('client_id')
    if (!clientId) {
      clientId = crypto.randomUUID()
      localStorage.setItem('client_id', clientId)
    }
    
    try {
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
    let clientId = localStorage.getItem('client_id')
    if (!clientId) {
      clientId = crypto.randomUUID()
      localStorage.setItem('client_id', clientId)
    }
    
    try {
      const response = await fetch(`${API_URL}/problems/submit`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-client-id": clientId
        },
        body: JSON.stringify({ 
          user_id: clientId, 
          problem_id: problemId, 
          answer 
        })
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
    let clientId = localStorage.getItem('client_id')
    if (!clientId) {
      clientId = crypto.randomUUID()
      localStorage.setItem('client_id', clientId)
    }
    
    try {
      const response = await fetch(`${API_URL}/tutor/ask?service=deepseek`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-client-id": clientId
        },
        body: JSON.stringify({ user_id: userId || clientId, question, hint_type: hintType })
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
