const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface User {
  id: string;
  username: string;
  grade_level: number;
  points: number;
  streak_days: number;
  last_practice?: string;
}

export interface Problem {
  id: string;
  type: string;
  question_en: string;
  question_zh: string;
  correct_answer: number;
  difficulty: number;
  hints_en: string[];
  hints_zh: string[];
  explanation_en: string;
  explanation_zh: string;
  knowledge_point: string;
  related_points: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_reward: number;
}

export interface Progress {
  user_id: string;
  total_solved: number;
  correct_solved: number;
  current_streak: number;
  points: number;
  last_practice: string;
  achievements: Achievement[];
}

export const api = {
  createUser: async (username: string): Promise<User> => {
    const response = await fetch(`${API_URL}/users/?username=${encodeURIComponent(username)}`, {
      method: 'POST'
    });
    return response.json();
  },

  askTutor: async (userId: string, question: string, service: string = 'openai') => {
    try {
      const response = await fetch(`${API_URL}/tutor/ask?service=${service}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, question }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '系统出现错误，请稍后再试');
      }
      
      return response.json();
    } catch (error: any) {
      console.error('AI Tutor Error:', error);
      throw error;
    }
  },

  getProblems: async (type?: string): Promise<Problem[]> => {
    const url = type ? `${API_URL}/problems/?problem_type=${type}` : `${API_URL}/problems/`;
    const response = await fetch(url);
    return response.json();
  },

  submitAttempt: async (userId: string, problemId: string, answer: number) => {
    const response = await fetch(`${API_URL}/attempts/?user_id=${userId}&problem_id=${problemId}&answer=${answer}`, {
      method: 'POST'
    });
    return response.json();
  },

  getProgress: async (userId: string): Promise<Progress> => {
    const response = await fetch(`${API_URL}/progress/${userId}`);
    return response.json();
  },

  getArithmeticProblem: async (operation: string, language: string = 'en') => {
    const response = await fetch(`${API_URL}/problems/arithmetic?operation=${operation}&language=${language}`, {
      method: 'POST'
    });
    return response.json();
  },

  checkArithmeticAnswer: async (problemId: string, userId: string, answer: number) => {
    const response = await fetch(`${API_URL}/problems/arithmetic/${problemId}/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, answer }),
    });
    return response.json();
  },

  getWordProblem: async (language: string = 'en'): Promise<Problem> => {
    const response = await fetch(`${API_URL}/problems/word?language=${language}`, {
      method: 'POST'
    });
    return response.json();
  },

  checkWordProblemAnswer: async (problemId: string, userId: string, answer: number): Promise<{ correct: boolean }> => {
    const response = await fetch(`${API_URL}/problems/word/${problemId}/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, answer }),
    });
    return response.json();
  }
};
