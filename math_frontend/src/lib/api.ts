import { Problem, SubmitAnswerResponse, TutorResponse, User, Progress } from '../types'
import { fallbackProblems, fallbackUser, fallbackProgress, fallbackAttemptResult, fallbackTutorResponse } from './fallbackData'

// Define multiple API endpoints to try in order
const API_ENDPOINTS = [
  import.meta.env.VITE_API_URL,
  'https://math-learning-app-backend.fly.dev',
  'https://math-learning-app-backend-nbpuekjl.fly.dev'
].filter(Boolean); // Remove any undefined/empty values

// Start with the first endpoint
let API_BASE_URL = API_ENDPOINTS[0];

// Function to try the next available API endpoint
const tryNextEndpoint = () => {
  const currentIndex = API_ENDPOINTS.indexOf(API_BASE_URL);
  if (currentIndex < API_ENDPOINTS.length - 1) {
    API_BASE_URL = API_ENDPOINTS[currentIndex + 1];
    console.log(`Switching to next API endpoint: ${API_BASE_URL}`);
    return true;
  }
  return false; // No more endpoints to try
};

// Helper function to handle API errors
const handleApiError = (error: any, fallbackMessage: string): never => {
  console.error(`API Error: ${fallbackMessage}`, error)
  
  // Check if it's a CORS error
  if (error.message && (
    error.message.includes('NetworkError') || 
    error.message.includes('Failed to fetch') ||
    error.message.includes('Network request failed')
  )) {
    throw new Error('无法连接到服务器，请检查网络连接')
  }
  
  // If the error has a message, use it, otherwise use the fallback
  throw new Error(error.message || fallbackMessage)
}

// API client
export const api = {
  // Create or get a user
  async createUser(username: string, gradeLevel: number, retryCount = 0): Promise<User> {
    try {
      // Get client ID from localStorage or generate a new one
      let clientId = localStorage.getItem('client_id')
      if (!clientId) {
        clientId = crypto.randomUUID()
        localStorage.setItem('client_id', clientId)
      }
      
      console.log(`Attempting to create user with API endpoint: ${API_BASE_URL}`);
      
      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Client-ID': clientId
          },
          body: JSON.stringify({
            username,
            grade_level: gradeLevel
          })
        })
        
        if (!response.ok) {
          // If we get a 409 (conflict), the user already exists, try to get it
          if (response.status === 409) {
            return await this.getUser(clientId)
          }
          
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || `创建用户失败: ${response.status}`)
        }
        
        return await response.json()
      } catch (error: any) {
        // If network error and we have more endpoints to try
        if ((error instanceof TypeError || error.message.includes('Failed to fetch')) && 
            retryCount < API_ENDPOINTS.length - 1 && tryNextEndpoint()) {
          console.log(`Network error, retrying with next endpoint: ${API_BASE_URL}`);
          return this.createUser(username, gradeLevel, retryCount + 1);
        }
        
        // If all endpoints failed or it's not a network error
        throw error;
      }
    } catch (error: any) {
      console.warn('All API endpoints failed, using fallback:', error)
      // Return fallback user data
      return {
        ...fallbackUser,
        id: localStorage.getItem('client_id') || fallbackUser.id,
        username: username || fallbackUser.username,
        grade_level: gradeLevel || fallbackUser.grade_level
      }
    }
  },
  
  // Get a user by ID
  async getUser(userId: string): Promise<User> {
    try {
      // Get client ID from localStorage as fallback
      let clientId = localStorage.getItem('client_id')
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          'X-Client-ID': clientId || ''
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `获取用户失败: ${response.status}`)
      }
      
      return await response.json()
    } catch (error: any) {
      console.warn('Error getting user, using fallback:', error)
      // Return fallback user data
      return {
        ...fallbackUser,
        id: userId || localStorage.getItem('client_id') || fallbackUser.id
      }
    }
  },
  
  // Get user progress
  async getUserProgress(userId: string): Promise<Progress> {
    try {
      // Get client ID from localStorage as fallback
      let clientId = localStorage.getItem('client_id')
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}/progress`, {
        headers: {
          'X-Client-ID': clientId || ''
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `获取进度失败: ${response.status}`)
      }
      
      return await response.json()
    } catch (error: any) {
      console.warn('Error getting progress, using fallback:', error)
      // Return fallback progress data
      return fallbackProgress
    }
  },
  
  // Get the next problem
  async getNextProblem(topic?: string, timestamp?: number, language: string = "sv+zh"): Promise<Problem> {
    try {
      // Add timestamp to prevent caching
      const cacheBuster = timestamp || Date.now()
      const topicParam = topic ? `&topic=${topic}` : ''
      const languageParam = `&language=${language}`
      
      // Try the generator endpoint first
      try {
        const response = await fetch(`${API_BASE_URL}/generator/generate?grade_level=3${topicParam}${languageParam}&t=${cacheBuster}`)
        
        if (response.ok) {
          const problem = await response.json()
          return problem
        }
      } catch (error) {
        console.warn('Generator endpoint failed, trying problems/next:', error)
      }
      
      // Fall back to the problems/next endpoint
      // Get client ID from localStorage or use a default
      let clientId = localStorage.getItem('client_id') || 'guest-user'
      
      // Include user_id and language parameters in the fallback endpoint
      const response = await fetch(`${API_BASE_URL}/problems/next?t=${cacheBuster}&user_id=${clientId}${languageParam}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `获取题目失败: ${response.status}`)
      }
      
      return await response.json()
    } catch (error: any) {
      console.warn('Error getting problem, using fallback:', error)
      
      // Return a random fallback problem
      const randomIndex = Math.floor(Math.random() * fallbackProblems.length)
      const fallbackProblem = fallbackProblems[randomIndex]
      
      // Add timestamp to make it unique
      return {
        ...fallbackProblem,
        id: `fallback-${Date.now()}`,
        created_at: new Date().toISOString()
      }
    }
  },
  
  // Submit an answer
  async submitAnswer(userId: string, problemId: string, answer: number): Promise<SubmitAnswerResponse> {
    try {
      // Try the evaluation endpoint first
      try {
        const evalResponse = await fetch(`${API_BASE_URL}/evaluation/evaluate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            problem_id: problemId,
            user_answer: answer,
            user_id: userId
          })
        })
        
        if (evalResponse.ok) {
          const result = await evalResponse.json()
          return {
            is_correct: result.is_correct,
            message: result.explanation
          }
        }
      } catch (error) {
        console.warn('Evaluation endpoint failed, trying problems/submit:', error)
      }
      
      // Fall back to the problems/submit endpoint
      const response = await fetch(`${API_BASE_URL}/problems/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          problem_id: problemId,
          answer
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `提交答案失败: ${response.status}`)
      }
      
      return await response.json()
    } catch (error: any) {
      console.warn('Error submitting answer, using fallback:', error)
      
      // For fallback, check if the answer is correct based on the problem ID
      // This is a simple check for demo purposes
      const problemIdNum = parseInt(problemId.replace(/\D/g, ''))
      const isCorrect = problemIdNum % 2 === 0 ? answer % 2 === 0 : answer % 2 !== 0
      
      return {
        ...fallbackAttemptResult,
        is_correct: isCorrect,
        message: isCorrect ? '答对了！' : '答错了，再试一次吧！'
      }
    }
  },
  
  // Ask the AI tutor
  async askTutor(userId: string, question: string, hintType: string = 'quick_hint'): Promise<TutorResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          question,
          hint_type: hintType
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `AI助手无法回答: ${response.status}`)
      }
      
      return await response.json()
    } catch (error: any) {
      console.warn('Error asking tutor, using fallback:', error)
      
      // Return fallback tutor response
      return {
        ...fallbackTutorResponse,
        answer: `我是AI助手黄小星。你的问题是: "${question}"。我现在无法连接到服务器，但我可以告诉你解题的一般方法：仔细阅读题目，理解问题，列出方程，然后一步步解答。`
      }
    }
  }
}
