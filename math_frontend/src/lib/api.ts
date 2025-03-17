import { Problem, SubmitAnswerResponse, TutorResponse } from '../types'
// User and Progress interfaces are defined at the bottom of this file

// API base URL - use the deployed backend
const API_BASE_URL = 'https://math-learning-app-backend-nbpuekjl.fly.dev'

// Fallback data for when API calls fail
const FALLBACK_PROBLEM: Problem = {
  id: 'fallback-1',
  question: '5 + 7 = ?',
  answer: 12,
  knowledge_point: 'addition',
  related_points: [],
  difficulty: 1,
  created_at: new Date().toISOString(),
  hints: ['Try counting on your fingers', 'Start with 5 and count 7 more']
}

// API client
export const api = {
  // User management
  async createUser(username: string, gradeLevel: number): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': localStorage.getItem('client_id') || 'unknown'
        },
        body: JSON.stringify({ username, grade_level: gradeLevel }),
        mode: 'cors' // Explicitly set CORS mode
      })
      
      if (!response.ok) {
        throw new Error('Failed to create user')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating user:', error)
      // Return a fallback user
      return {
        id: localStorage.getItem('client_id') || 'fallback-user',
        username: username || 'Guest',
        grade_level: gradeLevel || 3,
        points: 0,
        streak_days: 0
      }
    }
  },
  
  async getUser(userId: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          'x-client-id': localStorage.getItem('client_id') || 'unknown'
        },
        mode: 'cors' // Explicitly set CORS mode
      })
      
      if (!response.ok) {
        throw new Error('Failed to get user')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error getting user:', error)
      // Return a fallback user
      return {
        id: userId,
        username: 'Guest',
        grade_level: 3,
        points: 0,
        streak_days: 0
      }
    }
  },
  
  async getUserProgress(userId: string): Promise<Progress> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/progress`, {
        headers: {
          'x-client-id': localStorage.getItem('client_id') || 'unknown'
        },
        mode: 'cors' // Explicitly set CORS mode
      })
      
      if (!response.ok) {
        throw new Error('Failed to get user progress')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error getting user progress:', error)
      // Return fallback progress
      return {
        points: 0,
        streak_days: 0,
        mastery_levels: {},
        achievements: []
      }
    }
  },
  
  // Problem management
  async getNextProblem(topic?: string, timestamp?: number): Promise<Problem> {
    try {
      // First try to get a problem from the generator endpoint
      try {
        const topicParam = topic ? `&topic=${topic}` : '';
        const timeParam = timestamp ? `&timestamp=${timestamp}` : `&timestamp=${Date.now()}`;
        
        // Use no-cors mode to avoid CORS errors
        const genResponse = await fetch(`${API_BASE_URL}/generator/generate?grade_level=3&service=replicate${topicParam}${timeParam}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': localStorage.getItem('client_id') || 'unknown'
          },
          mode: 'cors' // Try with CORS mode first
        }).catch(error => {
          console.warn('CORS error with generator endpoint:', error);
          throw error; // Re-throw to trigger fallback
        });
        
        if (genResponse && genResponse.ok) {
          const problem = await genResponse.json()
          
          // Parse hints if they're a JSON string
          if (typeof problem.hints === 'string') {
            try {
              problem.hints = JSON.parse(problem.hints)
            } catch (e) {
              // If parsing fails, keep as string
              console.warn('Failed to parse hints JSON:', e)
            }
          }
          
          return problem
        }
      } catch (genError) {
        console.error('Error generating problem:', genError)
      }
      
      // If generator fails, try the problems/next endpoint
      try {
        const response = await fetch(`${API_BASE_URL}/problems/next`, {
          headers: {
            'x-client-id': localStorage.getItem('client_id') || 'unknown'
          },
          mode: 'cors' // Try with CORS mode
        }).catch(error => {
          console.warn('CORS error with problems/next endpoint:', error);
          throw error; // Re-throw to trigger fallback
        });
        
        if (response && response.ok) {
          const problem = await response.json()
          
          // Parse hints if they're a JSON string
          if (typeof problem.hints === 'string') {
            try {
              problem.hints = JSON.parse(problem.hints)
            } catch (e) {
              // If parsing fails, keep as string
              console.warn('Failed to parse hints JSON:', e)
            }
          }
          
          return problem
        }
      } catch (nextError) {
        console.error('Error getting next problem:', nextError)
      }
      
      // If all API calls fail, use fallback data
      console.log('Using fallback problem due to API failures');
      
      // Import fallback problems dynamically
      const { fallbackProblems } = await import('../lib/fallbackData');
      
      // Select a random problem based on topic if possible
      let filteredProblems = fallbackProblems;
      if (topic) {
        const topicProblems = fallbackProblems.filter(p => 
          p.knowledge_point.toLowerCase() === topic.toLowerCase()
        );
        if (topicProblems.length > 0) {
          filteredProblems = topicProblems;
        }
      }
      
      // Get a random problem
      const randomIndex = Math.floor(Math.random() * filteredProblems.length);
      return filteredProblems[randomIndex];
      
    } catch (error) {
      console.error('All problem fetching methods failed:', error)
      // Return a fallback problem as last resort
      return FALLBACK_PROBLEM
    }
  },
  
  async submitAnswer(
    userId: string,
    problemId: string,
    answer: number
  ): Promise<SubmitAnswerResponse> {
    try {
      // First try the evaluation endpoint
      try {
        const evalResponse = await fetch(`${API_BASE_URL}/evaluation/evaluate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': localStorage.getItem('client_id') || 'unknown'
          },
          body: JSON.stringify({
            problem_id: problemId,
            user_answer: answer,
            user_id: userId
          }),
          mode: 'cors' // Try with CORS mode
        }).catch(error => {
          console.warn('CORS error with evaluation endpoint:', error);
          throw error; // Re-throw to trigger fallback
        });
        
        if (evalResponse && evalResponse.ok) {
          const result = await evalResponse.json()
          return {
            is_correct: result.is_correct,
            message: result.explanation
          }
        }
      } catch (evalError) {
        console.error('Error evaluating answer:', evalError)
      }
      
      // If evaluation fails, try the attempts endpoint
      try {
        const response = await fetch(`${API_BASE_URL}/problems/${problemId}/attempts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': localStorage.getItem('client_id') || 'unknown'
          },
          body: JSON.stringify({
            user_id: userId,
            answer
          }),
          mode: 'cors' // Try with CORS mode
        }).catch(error => {
          console.warn('CORS error with attempts endpoint:', error);
          throw error; // Re-throw to trigger fallback
        });
        
        if (response && response.ok) {
          return await response.json()
        }
      } catch (attemptError) {
        console.error('Error submitting attempt:', attemptError)
      }
      
      // For fallback, check if the answer matches the fallback problem
      const { fallbackProblems } = await import('../lib/fallbackData');
      const matchingProblem = fallbackProblems.find(p => p.id === problemId);
      
      const isCorrect = matchingProblem 
        ? Math.abs(answer - matchingProblem.answer) < 0.001
        : false;
        
      // Return a fallback response
      return {
        is_correct: isCorrect,
        message: isCorrect ? '答案正确！' : '答案不正确，再试一次！'
      }
    } catch (error) {
      console.error('All answer submission methods failed:', error)
      
      // For fallback, check if the answer matches the fallback problem
      const isCorrect = FALLBACK_PROBLEM.id === problemId 
        ? Math.abs(answer - FALLBACK_PROBLEM.answer) < 0.001
        : false;
        
      // Return a fallback response
      return {
        is_correct: isCorrect,
        message: isCorrect ? '答案正确！' : '答案不正确，再试一次！'
      }
    }
  },
  
  // AI Tutor
  async askTutor(
    userId: string,
    question: string,
    service: string = 'deepseek'
  ): Promise<TutorResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': localStorage.getItem('client_id') || 'unknown'
        },
        body: JSON.stringify({
          user_id: userId,
          question,
          hint_type: 'quick_hint',
          service
        }),
        mode: 'cors' // Try with CORS mode
      }).catch(error => {
        console.warn('CORS error with tutor endpoint:', error);
        throw error; // Re-throw to trigger fallback
      });
      
      if (response && response.ok) {
        return await response.json()
      }
      
      throw new Error('Failed to get tutor response')
    } catch (error) {
      console.error('Error asking tutor:', error)
      // Return a fallback response
      return {
        answer: '抱歉，AI助手暂时无法回答，请稍后再试。',
        model: 'fallback'
      }
    }
  }
}

// Define User and Progress types for export
export interface User {
  id: string
  username: string
  grade_level: number
  points: number
  streak_days: number
}

export interface Progress {
  points: number
  streak_days: number
  mastery_levels: Record<string, number>
  achievements: Array<{
    id: string
    name: string
    description: string
    points: number
  }>
}
