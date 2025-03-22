import { API_BASE_URL } from './config'
import { Problem } from '../types'
import { fallbackProblems } from './fallbackData'

// API base URL - use environment variable if available, otherwise use default
const apiBaseUrl = API_BASE_URL || 'https://math-learning-app-backend.fly.dev'

export const api = {
  async getNextProblem(topic?: string, timestamp?: number, languageParam?: string): Promise<Problem> {
    try {
      // Add a cache buster to prevent caching
      const cacheBuster = timestamp || Date.now()
      
      // Get client ID from localStorage or generate a new one
      let clientId = localStorage.getItem('client_id')
      if (!clientId) {
        clientId = `client-${Math.random().toString(36).substring(2, 9)}`
        localStorage.setItem('client_id', clientId)
      }
      
      // Use the provided language parameter or default
      const langParam = languageParam || "sv+zh"
      
      // Add topic parameter if provided
      const topicParam = topic ? `&topic=${encodeURIComponent(topic)}` : ''
      
      // Add language parameter
      const formattedLanguageParam = `&language=${encodeURIComponent(langParam)}`
      
      // Make the API call with user_id parameter - use problems/next endpoint instead of generator/generate
      const response = await fetch(`${apiBaseUrl}/problems/next?t=${cacheBuster}&user_id=${clientId}${topicParam}${formattedLanguageParam}`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching next problem:', error)
      
      // Return a fallback problem if API call fails
      return fallbackProblems[Math.floor(Math.random() * fallbackProblems.length)]
    }
  },

  async submitAnswer(userId: string, problemId: string, answer: number): Promise<{ correct: boolean; feedback?: string }> {
    try {
      const response = await fetch(`${apiBaseUrl}/problems/${problemId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: userId,
          answer 
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()
      return { 
        correct: result.is_correct, 
        feedback: result.message 
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      // Return a fallback response
      return { correct: answer === 42, feedback: 'Could not connect to server. This is a fallback response.' }
    }
  },

  async login(username: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const response = await fetch(`${apiBaseUrl}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        return { success: false, error: data.detail || 'Login failed' }
      }

      return { success: true, user: data }
    } catch (error) {
      console.error('Error logging in:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  },

  async register(username: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const response = await fetch(`${apiBaseUrl}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        return { success: false, error: data.detail || 'Registration failed' }
      }

      return { success: true, user: data }
    } catch (error) {
      console.error('Error registering:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  },

  async getUserProfile(userId: string): Promise<any> {
    try {
      const response = await fetch(`${apiBaseUrl}/users/${userId}`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  },

  async updateUserProfile(userId: string, data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${apiBaseUrl}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.detail || 'Update failed' }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Error updating user profile:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  },

  async askTutor(userId: string, question: string, hintType: string): Promise<{ answer: string; model?: string }> {
    try {
      const response = await fetch(`${apiBaseUrl}/tutor/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, question, hint_type: hintType }),
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error asking tutor:', error)
      throw new Error('AI助手服务未配置')
    }
  }
}
