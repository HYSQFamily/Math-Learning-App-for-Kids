import { API_BASE_URL } from './config'
import { Problem, User, Progress } from '../types'
import { fallbackProblems } from './fallbackData'

// API base URL - use environment variable if available, otherwise use default
const apiBaseUrl = API_BASE_URL || 'https://math-learning-app-backend.fly.dev'

// List of API endpoints to try in order
const API_ENDPOINTS = [
  'https://math-learning-app-backend.fly.dev',
  'https://math-learning-app-backend-devin.fly.dev'
]

export const api = {
  async createUser(username: string, gradeLevel: number = 3): Promise<User> {
    // Try each endpoint in sequence
    for (let i = 0; i < API_ENDPOINTS.length; i++) {
      const endpoint = API_ENDPOINTS[i]
      try {
        console.log(`Attempting to create user with API endpoint: ${endpoint}`)
        
        // Ensure we're using HTTPS
        const secureEndpoint = endpoint.replace('http://', 'https://')
        
        const response = await fetch(`${secureEndpoint}/users/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            username, 
            grade_level: gradeLevel 
          }),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error(`Error from ${endpoint}:`, errorData)
          throw new Error(errorData.detail || 'Failed to create user')
        }
        
        return await response.json()
      } catch (error) {
        console.log(`Switching to next API endpoint: ${API_ENDPOINTS[(i + 1) % API_ENDPOINTS.length]}`)
        if (i === API_ENDPOINTS.length - 1) {
          console.error('All API endpoints failed, using fallback:', error)
          // Return a fallback user if all endpoints fail
          return {
            id: localStorage.getItem('client_id') || crypto.randomUUID(),
            username: username || 'Guest',
            grade_level: gradeLevel || 3,
            points: 0,
            streak_days: 0
          }
        }
        console.log('Network error, retrying with next endpoint:', API_ENDPOINTS[(i + 1) % API_ENDPOINTS.length])
      }
    }
    
    // This should never be reached due to the fallback in the loop
    throw new Error('Failed to create user')
  },
  
  async getUserProgress(userId: string): Promise<Progress> {
    try {
      // Ensure we're using HTTPS
      const secureApiBaseUrl = apiBaseUrl.replace('http://', 'https://')
      
      const response = await fetch(`${secureApiBaseUrl}/users/${userId}/progress`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching user progress:', error)
      // Return fallback progress data
      return {
        points: 0,
        streak_days: 0,
        mastery_levels: {},
        achievements: []
      }
    }
  },

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
      
      // Try each endpoint in sequence
      for (let i = 0; i < API_ENDPOINTS.length; i++) {
        const endpoint = API_ENDPOINTS[i]
        try {
          console.log(`Attempting to fetch problem with API endpoint: ${endpoint}`)
          
          // Ensure we're using HTTPS
          const secureEndpoint = endpoint.replace('http://', 'https://')
          
          // Make the API call with user_id parameter - use problems/next endpoint
          const response = await fetch(`${secureEndpoint}/problems/next?t=${cacheBuster}&user_id=${clientId}${topicParam}${formattedLanguageParam}`)
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
          }
          
          const data = await response.json()
          
          // Process the question field if it's a string that contains JSON
          if (typeof data.question === 'string') {
            try {
              if (data.question.startsWith('{') && data.question.includes('"zh"')) {
                data.question = JSON.parse(data.question)
              }
            } catch (e) {
              // If parsing fails, keep the original string
              console.log('Failed to parse question JSON:', e)
            }
          }
          
          return data
        } catch (error) {
          console.log(`Error with endpoint ${endpoint}:`, error)
          if (i === API_ENDPOINTS.length - 1) {
            throw error // Re-throw if this was the last endpoint
          }
          console.log(`Switching to next API endpoint: ${API_ENDPOINTS[(i + 1) % API_ENDPOINTS.length]}`)
        }
      }
      
      // This should never be reached due to the re-throw above
      throw new Error('All API endpoints failed')
    } catch (error) {
      console.error('Error fetching next problem:', error)
      
      // Return a fallback problem if API call fails
      return fallbackProblems[Math.floor(Math.random() * fallbackProblems.length)]
    }
  },

  async submitAnswer(userId: string, problemId: string, answer: number): Promise<{ is_correct: boolean; message?: string }> {
    try {
      // Try each endpoint in sequence
      for (let i = 0; i < API_ENDPOINTS.length; i++) {
        const endpoint = API_ENDPOINTS[i]
        try {
          console.log(`Attempting to submit answer with API endpoint: ${endpoint}`)
          
          // Ensure we're using HTTPS
          const secureEndpoint = endpoint.replace('http://', 'https://')
          
          const response = await fetch(`${secureEndpoint}/problems/${problemId}/submit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              user_id: userId,
              problem_id: problemId,
              answer 
            }),
          })
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
          }
          
          return await response.json()
        } catch (error) {
          console.log(`Error with endpoint ${endpoint}:`, error)
          if (i === API_ENDPOINTS.length - 1) {
            throw error // Re-throw if this was the last endpoint
          }
          console.log(`Switching to next API endpoint: ${API_ENDPOINTS[(i + 1) % API_ENDPOINTS.length]}`)
        }
      }
      
      // This should never be reached due to the re-throw above
      throw new Error('All API endpoints failed')
    } catch (error) {
      console.error('Error submitting answer:', error)
      // Return a fallback response
      return { is_correct: answer === 42, message: 'Could not connect to server. This is a fallback response.' }
    }
  },

  async login(username: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      // Ensure we're using HTTPS
      const secureApiBaseUrl = apiBaseUrl.replace('http://', 'https://')
      
      const response = await fetch(`${secureApiBaseUrl}/users/login`, {
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
      // Ensure we're using HTTPS
      const secureApiBaseUrl = apiBaseUrl.replace('http://', 'https://')
      
      const response = await fetch(`${secureApiBaseUrl}/users/register`, {
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
      // Ensure we're using HTTPS
      const secureApiBaseUrl = apiBaseUrl.replace('http://', 'https://')
      
      const response = await fetch(`${secureApiBaseUrl}/users/${userId}`)
      
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
      // Ensure we're using HTTPS
      const secureApiBaseUrl = apiBaseUrl.replace('http://', 'https://')
      
      const response = await fetch(`${secureApiBaseUrl}/users/${userId}`, {
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
      // Ensure we're using HTTPS
      const secureApiBaseUrl = apiBaseUrl.replace('http://', 'https://')
      
      const response = await fetch(`${secureApiBaseUrl}/tutor/ask`, {
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
