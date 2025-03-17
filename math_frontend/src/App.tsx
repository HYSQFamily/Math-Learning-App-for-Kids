import React, { useEffect, useReducer, useState } from 'react'
import { Login } from './components/Login'
import { ProblemDisplay } from './components/ProblemDisplay'
import { TutorChat } from './components/TutorChat'
import { UserProfile } from './components/UserProfile'
import { api } from './lib/api'
import { Problem } from './types'
import { isValidNumber } from './lib/utils'
import { fallbackProblems } from './lib/fallbackData'

// Define the application state
interface AppState {
  user: {
    id: string
    username: string
    gradeLevel: number
    points: number
    streakDays: number
  } | null
  problem: Problem | null
  answer: string
  isCorrect: boolean | null
  isLoading: boolean
  isSubmitting: boolean
  showTutor: boolean
  error: string | null
}

// Initial state
const initialState: AppState = {
  user: null,
  problem: null,
  answer: '',
  isCorrect: null,
  isLoading: true,
  isSubmitting: false,
  showTutor: false,
  error: null
}

// Action types
type Action =
  | { type: 'LOGIN_SUCCESS'; payload: { user: AppState['user'] } }
  | { type: 'LOAD_PROBLEM_START' }
  | { type: 'LOAD_PROBLEM_SUCCESS'; payload: { problem: Problem } }
  | { type: 'LOAD_PROBLEM_FAILURE'; payload: string }
  | { type: 'NEXT_PROBLEM_START' }
  | { type: 'NEXT_PROBLEM_SUCCESS'; payload: { problem: Problem } }
  | { type: 'NEXT_PROBLEM_FAILURE'; payload: string }
  | { type: 'SUBMIT_ANSWER_START' }
  | { type: 'SUBMIT_ANSWER_SUCCESS'; payload: { isCorrect: boolean } }
  | { type: 'SUBMIT_ANSWER_FAILURE'; payload: string }
  | { type: 'SET_ANSWER'; payload: string }
  | { type: 'TOGGLE_TUTOR' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }

// Reducer function
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isLoading: true,
        error: null
      }
    case 'LOAD_PROBLEM_START':
      return {
        ...state,
        isLoading: true,
        error: null
      }
    case 'LOAD_PROBLEM_SUCCESS':
      return {
        ...state,
        problem: action.payload.problem,
        isLoading: false,
        error: null
      }
    case 'LOAD_PROBLEM_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      }
    case 'NEXT_PROBLEM_START':
      return {
        ...state,
        isLoading: true,
        answer: '',
        isCorrect: null,
        error: null
      }
    case 'NEXT_PROBLEM_SUCCESS':
      return {
        ...state,
        problem: action.payload.problem,
        isLoading: false,
        answer: '',
        isCorrect: null,
        error: null
      }
    case 'NEXT_PROBLEM_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      }
    case 'SUBMIT_ANSWER_START':
      return {
        ...state,
        isSubmitting: true,
        error: null
      }
    case 'SUBMIT_ANSWER_SUCCESS':
      return {
        ...state,
        isSubmitting: false,
        isCorrect: action.payload.isCorrect,
        error: null
      }
    case 'SUBMIT_ANSWER_FAILURE':
      return {
        ...state,
        isSubmitting: false,
        error: action.payload
      }
    case 'SET_ANSWER':
      return {
        ...state,
        answer: action.payload
      }
    case 'TOGGLE_TUTOR':
      return {
        ...state,
        showTutor: !state.showTutor
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [retryCount, setRetryCount] = useState(0)

  // Load user data on initial load
  const loadUserData = async (username = 'Guest', gradeLevel = 3) => {
    try {
      // Generate a client ID if not exists
      let clientId = localStorage.getItem('client_id')
      if (!clientId) {
        clientId = crypto.randomUUID()
        localStorage.setItem('client_id', clientId)
      }
      
      // Create or get user
      const user = await api.createUser(username, gradeLevel)
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: {
            id: user.id,
            username: user.username,
            gradeLevel: user.grade_level,
            points: user.points,
            streakDays: user.streak_days
          }
        }
      })
      
      // Load initial problem
      fetchNextProblem()
    } catch (error: any) {
      console.error('Error loading user data:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message || '无法加载用户数据，请重试' })
    }
  }

  // Function to fetch the next problem
  const fetchNextProblem = async () => {
    dispatch({ type: 'LOAD_PROBLEM_START' })
    
    try {
      // Select a random topic
      const topics = ['addition', 'subtraction', 'multiplication', 'division']
      const randomTopic = topics[Math.floor(Math.random() * topics.length)]
      
      // Add timestamp to prevent caching
      const timestamp = Date.now()
      
      // Try to get a problem from the API with a timeout
      try {
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Problem fetch timed out')), 5000)
        })
        
        // Race between the API call and the timeout
        const nextProblemPromise = api.getNextProblem(randomTopic, timestamp)
        const nextProblem = await Promise.race([nextProblemPromise, timeoutPromise])
          .catch(error => {
            console.warn("Problem fetch timed out or failed:", error)
            return null
          })
        
        if (nextProblem) {
          // Convert API problem to the format expected by the reducer
          const problem: Problem = {
            id: nextProblem.id || `problem-${timestamp}`,
            question: nextProblem.question || "5 + 7 = ?",
            answer: nextProblem.answer || 0,
            knowledge_point: nextProblem.knowledge_point || randomTopic,
            related_points: nextProblem.related_points || [],
            difficulty: nextProblem.difficulty || 1,
            created_at: nextProblem.created_at || new Date().toISOString(),
            hints: nextProblem.hints || []
          }
          dispatch({ type: 'NEXT_PROBLEM_SUCCESS', payload: { problem } })
        } else {
          // Use fallback problem if API returns null or times out
          const randomIndex = Math.floor(Math.random() * fallbackProblems.length)
          const fallbackProblem = fallbackProblems[randomIndex]
          
          dispatch({ 
            type: 'NEXT_PROBLEM_SUCCESS', 
            payload: { problem: fallbackProblem }
          })
        }
      } catch (error: any) {
        console.error('获取题目失败:', error)
        
        // Use fallback problem if API call fails
        const randomIndex = Math.floor(Math.random() * fallbackProblems.length)
        const fallbackProblem = fallbackProblems[randomIndex]
        
        dispatch({ 
          type: 'NEXT_PROBLEM_SUCCESS', 
          payload: { problem: fallbackProblem }
        })
      }
    } catch (error: any) {
      console.error('获取题目失败:', error)
      dispatch({ type: 'NEXT_PROBLEM_FAILURE', payload: error.message || '获取题目失败，请重试' })
    }
  }

  // Function to handle answer submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!state.problem || state.isSubmitting || !isValidNumber(state.answer)) return

    dispatch({ type: 'SUBMIT_ANSWER_START' })
    try {
      // Get client ID from localStorage or generate a new one
      let clientId = localStorage.getItem('client_id')
      if (!clientId) {
        clientId = crypto.randomUUID()
        localStorage.setItem('client_id', clientId)
      }
      
      const result = await api.submitAnswer(clientId, state.problem.id, parseFloat(state.answer))
      dispatch({ type: 'SUBMIT_ANSWER_SUCCESS', payload: { isCorrect: result.is_correct } })
    } catch (error: any) {
      console.error('提交答案失败:', error)
      dispatch({ type: 'SUBMIT_ANSWER_FAILURE', payload: error.message || '提交答案失败，请重试' })
    }
  }

  // Function to handle getting the next problem
  const handleNextProblem = async () => {
    dispatch({ type: 'NEXT_PROBLEM_START' })
    
    try {
      // Select a random topic
      const topics = ['addition', 'subtraction', 'multiplication', 'division']
      const randomTopic = topics[Math.floor(Math.random() * topics.length)]
      
      // Add timestamp to prevent caching
      const timestamp = Date.now()
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Problem fetch timed out')), 5000)
      })
      
      // Race between the API call and the timeout
      const nextProblemPromise = api.getNextProblem(randomTopic, timestamp)
      const nextProblem = await Promise.race([nextProblemPromise, timeoutPromise])
        .catch(error => {
          console.warn("Problem fetch timed out or failed:", error)
          return null
        })
      
      if (nextProblem) {
        // Convert API problem to the format expected by the reducer
        const problem: Problem = {
          id: nextProblem.id || `problem-${timestamp}`,
          question: nextProblem.question || "5 + 7 = ?",
          answer: nextProblem.answer || 0,
          knowledge_point: nextProblem.knowledge_point || randomTopic,
          related_points: nextProblem.related_points || [],
          difficulty: nextProblem.difficulty || 1,
          created_at: nextProblem.created_at || new Date().toISOString(),
          hints: nextProblem.hints || []
        }
        dispatch({ type: 'NEXT_PROBLEM_SUCCESS', payload: { problem } })
      } else {
        // Use fallback problem if API returns null or times out
        const randomIndex = Math.floor(Math.random() * fallbackProblems.length)
        const fallbackProblem = fallbackProblems[randomIndex]
        
        dispatch({ 
          type: 'NEXT_PROBLEM_SUCCESS', 
          payload: { problem: fallbackProblem }
        })
      }
    } catch (error: any) {
      console.error('获取题目失败:', error)
      
      // Use fallback problem if API call fails
      const randomIndex = Math.floor(Math.random() * fallbackProblems.length)
      const fallbackProblem = fallbackProblems[randomIndex]
      
      dispatch({ 
        type: 'NEXT_PROBLEM_SUCCESS', 
        payload: { problem: fallbackProblem }
      })
    }
  }

  // Function to handle answer change
  const handleAnswerChange = (value: string) => {
    dispatch({ type: 'SET_ANSWER', payload: value })
  }

  // Function to toggle tutor
  const toggleTutor = () => {
    dispatch({ type: 'TOGGLE_TUTOR' })
  }

  // Load initial user data
  useEffect(() => {
    loadUserData()
  }, [])

  // Retry loading problem if it fails
  useEffect(() => {
    if (state.error && state.error.includes('加载题目') && retryCount < 3) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1)
        fetchNextProblem()
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [state.error, retryCount])

  // If user is not logged in, show login screen
  if (!state.user) {
    return <Login onLogin={loadUserData} />
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">数学学习助手</h1>
        <UserProfile
          username={state.user.username}
          points={state.user.points}
          streakDays={state.user.streakDays}
        />
      </header>

      <main className="bg-white rounded-lg shadow-md p-6 mb-8">
        {state.isLoading ? (
          <div className="text-center py-8">
            <p className="text-lg">加载中...</p>
          </div>
        ) : state.error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{state.error}</p>
            <button
              onClick={fetchNextProblem}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              重试
            </button>
          </div>
        ) : (
          <>
            {state.problem && (
              <ProblemDisplay
                problem={state.problem}
                answer={state.answer}
                isCorrect={state.isCorrect}
                isSubmitting={state.isSubmitting}
                onAnswerChange={handleAnswerChange}
                onSubmit={handleSubmit}
                onNextProblem={handleNextProblem}
                onToggleTutor={toggleTutor}
              />
            )}

            {state.showTutor && state.problem && (
              <div className="mt-8 border-t pt-6">
                <TutorChat
                  userId={state.user.id}
                  problem={state.problem}
                  userAnswer={state.answer ? parseFloat(state.answer) : undefined}
                />
              </div>
            )}
          </>
        )}
      </main>

      <footer className="text-center text-sm text-gray-500">
        <p>使用了DeepSeek AI大模型</p>
      </footer>
    </div>
  )
}
