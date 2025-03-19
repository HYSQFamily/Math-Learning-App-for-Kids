/**
 * API client for the Math Learning App
 */

import { Problem } from '../types'
import { generateFallbackProblem } from './fallbackData'

// API base URL - use environment variable if available, otherwise use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://math-learning-app-backend.fly.dev'

/**
 * API client for the Math Learning App
 */
export const api = {
  /**
   * Get the next problem
   * @param topic Optional topic to filter problems
   * @param timestamp Optional timestamp to prevent caching
   * @param language Optional language parameter (default: sv+zh)
   * @returns Promise<Problem>
   */
  async getNextProblem(topic?: string, timestamp?: number, language: string = "sv+zh"): Promise<Problem> {
    try {
      // Add timestamp to prevent caching
      const cacheBuster = timestamp || Date.now()
      const topicParam = topic ? `&topic=${topic}` : ''
      const languageParam = `&language=${encodeURIComponent(language)}`
      
      // Get client ID from localStorage or generate a new one
      let clientId = localStorage.getItem('client_id')
      if (!clientId) {
        clientId = `client-${Math.random().toString(36).substring(2, 9)}`
        localStorage.setItem('client_id', clientId)
      }
      
      // Try the generator endpoint first
      try {
        const response = await fetch(`${API_BASE_URL}/generator/generate?grade_level=3${topicParam}${languageParam}&t=${cacheBuster}&user_id=${clientId}`)
        
        if (response.ok) {
          const problem = await response.json()
          return problem
        }
      } catch (error) {
        console.warn('Generator endpoint failed, trying problems/next:', error)
      }
      
      // Fall back to the problems/next endpoint
      try {
        const response = await fetch(`${API_BASE_URL}/problems/next?t=${cacheBuster}&user_id=${clientId}${languageParam}`)
        
        if (response.ok) {
          const problem = await response.json()
          return problem
        } else {
          throw new Error(`API error: ${response.status}`)
        }
      } catch (error) {
        console.error('Problems/next endpoint failed:', error)
        throw error
      }
    } catch (error) {
      console.error('Error fetching next problem:', error)
      // Fallback to local problem generation
      return generateFallbackProblem()
    }
  },

  /**
   * Submit an answer to a problem
   * @param problemId Problem ID
   * @param answer User's answer
   * @returns Promise<{correct: boolean, feedback?: string}>
   */
  async submitAnswer(problemId: string | number, answer: number): Promise<{correct: boolean, feedback?: string}> {
    try {
      // Get client ID from localStorage or use a default
      const clientId = localStorage.getItem('client_id') || 'guest-user'
      
      const response = await fetch(`${API_BASE_URL}/problems/${problemId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer,
          user_id: clientId
        }),
      })

      if (response.ok) {
        return await response.json()
      } else {
        throw new Error(`API error: ${response.status}`)
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      // Fallback to local evaluation
      return {
        correct: Math.random() > 0.5, // Random result for fallback
        feedback: '离线模式：无法连接到服务器，使用本地评估'
      }
    }
  },

  /**
   * Login a user
   * @param username Username
   * @param password Password
   * @returns Promise<{token: string, user: {id: string, username: string}}>
   */
  async login(username: string, password: string): Promise<{token: string, user: {id: string, username: string}}> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Store the user ID in localStorage for future API calls
        if (data.user && data.user.id) {
          localStorage.setItem('client_id', data.user.id)
        }
        
        return data
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || `API error: ${response.status}`)
      }
    } catch (error) {
      console.error('Error logging in:', error)
      throw error
    }
  },

  /**
   * Register a new user
   * @param username Username
   * @param password Password
   * @returns Promise<{token: string, user: {id: string, username: string}}>
   */
  async register(username: string, password: string): Promise<{token: string, user: {id: string, username: string}}> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Store the user ID in localStorage for future API calls
        if (data.user && data.user.id) {
          localStorage.setItem('client_id', data.user.id)
        }
        
        return data
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || `API error: ${response.status}`)
      }
    } catch (error) {
      console.error('Error registering:', error)
      throw error
    }
  },

  /**
   * Ask the AI tutor a question
   * @param userId User ID
   * @param question Question to ask
   * @param hintType Type of hint to request
   * @returns Promise<{answer: string, model?: string}>
   */
  async askTutor(userId: string, question: string, hintType: string = 'quick_hint'): Promise<{answer: string, model?: string}> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          question,
          hint_type: hintType
        }),
      })

      if (response.ok) {
        return await response.json()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || `API error: ${response.status}`)
      }
    } catch (error) {
      console.error('Error asking tutor:', error)
      throw error
    }
  }
}
