import type { Problem as ProblemType, SubmitAnswerResponse, TutorResponse as TutorResponseType } from "../types";
import { fallbackProblems, fallbackUser, fallbackProgress, fallbackAttemptResult, fallbackTutorResponse } from "./fallbackData";

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

// Set to true to use fallback data when backend is unavailable
const USE_FALLBACK = true;
const API_URL = "https://math-learning-app-backend.fly.dev";

export const api = {
  getUser: async (userId?: string): Promise<User> => {
    let clientId = localStorage.getItem('client_id');
    if (!clientId) {
      clientId = crypto.randomUUID();
      localStorage.setItem('client_id', clientId);
    }
    
    try {
      // Use client ID if no user ID provided
      const effectiveUserId = userId || clientId || 'default-user';
      
      const response = await fetch(`${API_URL}/users/${effectiveUserId}`, {
        headers: {
          'x-client-id': clientId
        }
      });
      
      if (!response.ok) {
        throw new Error("获取用户信息失败");
      }
      
      return await response.json();
    } catch (error: any) {
      console.error("获取用户信息失败:", error);
      // Return a fallback user object
      if (USE_FALLBACK) {
        console.log("Using fallback user data");
        return {
          ...fallbackUser,
          id: clientId || fallbackUser.id
        };
      }
      
      // Return a default user object
      return {
        id: clientId || "default-user",
        username: "DefaultUser",
        grade_level: 3,
        points: 0,
        streak_days: 0
      };
    }
  },
  
  getUserProgress: async (userId?: string): Promise<any> => {
    let clientId = localStorage.getItem('client_id');
    if (!clientId) {
      clientId = crypto.randomUUID();
      localStorage.setItem('client_id', clientId);
    }
    
    try {
      // Use client ID if no user ID provided
      const effectiveUserId = userId || clientId || 'default-user';
      
      const response = await fetch(`${API_URL}/users/${effectiveUserId}/progress`, {
        headers: {
          'x-client-id': clientId
        }
      });
      
      if (!response.ok) {
        throw new Error("获取学习进度失败");
      }
      
      return await response.json();
    } catch (error: any) {
      console.error("获取学习进度失败:", error);
      // Return fallback progress
      if (USE_FALLBACK) {
        console.log("Using fallback progress data");
        return fallbackProgress;
      }
      
      // Return default progress
      return {
        points: 0,
        streak_days: 0,
        mastery_levels: {
          addition: 0.0,
          subtraction: 0.0,
          multiplication: 0.0
        },
        achievements: []
      };
    }
  },
  
  getNextProblem: async (): Promise<Problem> => {
    let clientId = localStorage.getItem('client_id');
    if (!clientId) {
      clientId = crypto.randomUUID();
      localStorage.setItem('client_id', clientId);
    }
    
    try {
      const response = await fetch(`${API_URL}/problems/next`, {
        headers: {
          'x-client-id': clientId
        }
      });
      
      if (!response.ok) {
        throw new Error("获取题目失败");
      }
      
      const problem = await response.json();
      return {
        ...problem,
        hints: Array.isArray(problem.hints) ? problem.hints : 
               (typeof problem.hints === 'string' ? JSON.parse(problem.hints) : [])
      };
    } catch (error: any) {
      console.error("获取题目失败:", error);
      
      // Return a fallback problem if backend is unavailable
      if (USE_FALLBACK) {
        console.log("Using fallback problem data");
        // Return a random fallback problem
        const randomIndex = Math.floor(Math.random() * fallbackProblems.length);
        return fallbackProblems[randomIndex];
      }
      
      throw new Error("Problem not found");
    }
  },

  submitAnswer: async (problemId: string, answer: number): Promise<AttemptResult> => {
    let clientId = localStorage.getItem('client_id');
    if (!clientId) {
      clientId = crypto.randomUUID();
      localStorage.setItem('client_id', clientId);
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
      });
      
      if (!response.ok) {
        throw new Error("提交答案失败");
      }
      
      return await response.json();
    } catch (error: any) {
      console.error("提交答案失败:", error);
      
      // Return a fallback result if backend is unavailable
      if (USE_FALLBACK) {
        console.log("Using fallback attempt result");
        // Check if the answer is correct for fallback problems
        const fallbackProblem = fallbackProblems.find(p => p.id === problemId);
        if (fallbackProblem) {
          const isCorrect = Math.abs(fallbackProblem.answer - answer) < 0.001;
          return {
            is_correct: isCorrect,
            message: isCorrect ? "答对了！" : "答错了，再试一次吧！",
            need_extra_help: !isCorrect
          };
        }
        return fallbackAttemptResult;
      }
      
      throw new Error("提交答案失败，请稍后再试");
    }
  },

  askTutor: async (userId: string, question: string, hintType: "quick_hint" | "deep_analysis"): Promise<TutorResponse> => {
    let clientId = localStorage.getItem('client_id');
    if (!clientId) {
      clientId = crypto.randomUUID();
      localStorage.setItem('client_id', clientId);
    }
    
    try {
      const response = await fetch(`${API_URL}/tutor/ask?service=deepseek`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-client-id": clientId
        },
        body: JSON.stringify({ user_id: userId || clientId, question, hint_type: hintType })
      });
      
      if (!response.ok) {
        throw new Error("AI助手暂时无法回答");
      }
      
      return await response.json();
    } catch (error: any) {
      console.error("AI助手请求失败:", error);
      
      // Return a fallback response if backend is unavailable
      if (USE_FALLBACK) {
        console.log("Using fallback tutor response");
        return fallbackTutorResponse;
      }
      
      throw new Error("AI助手暂时无法回答，请稍后再试");
    }
  }
};
