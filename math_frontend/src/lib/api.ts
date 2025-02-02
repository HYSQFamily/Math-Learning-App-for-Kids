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
}

const API_URL = import.meta.env.VITE_API_URL || "https://math-learning-app-backend-devin.fly.dev"

export const api = {
  getNextProblem: async (): Promise<Problem> => {
    console.log("Fetching next problem...")
    const clientId = localStorage.getItem('client_id') || crypto.randomUUID()
    if (!localStorage.getItem('client_id')) {
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
    
    // Store the client ID for future requests
    if (!localStorage.getItem('client_id')) {
      localStorage.setItem('client_id', response.headers.get('x-client-id') || crypto.randomUUID())
    }
    
    return problem
  },

  submitAnswer: async (problemId: string, answer: number): Promise<AttemptResult> => {
    const clientId = localStorage.getItem('client_id') || crypto.randomUUID()
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

  askTutor: async (userId: string, question: string): Promise<TutorResponse> => {
    try {
      const response = await fetch(`${API_URL}/tutor/ask?service=deepseek`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, question })
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
