export interface Problem {
  id: string;
  question: string;
  answer: number;
  hints: string[];
  knowledge_point: string;
  related_points?: string[];
}

export interface AttemptResult {
  is_correct: boolean;
  need_extra_help?: boolean;
  mastery_level?: number;
}

export interface TutorResponse {
  answer: string;
  model?: string;
}

const API_URL = import.meta.env.VITE_API_URL || "https://math-learning-app-backend-devin.fly.dev"

export const api = {
  getNextProblem: async (): Promise<Problem> => {
    console.log("Fetching next problem...")
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
    if (!response.ok) throw new Error("获取题目失败")
    const problem = await response.json()
    console.log("Received new problem:", problem)
    return problem
  },

  submitAnswer: async (problemId: string, answer: number): Promise<AttemptResult> => {
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
    if (!response.ok) throw new Error("提交答案失败")
    return response.json()
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
