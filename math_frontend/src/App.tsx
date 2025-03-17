import { useReducer, useEffect, useState } from 'react'
import { Login } from './components/Login'
import { ProblemDisplay } from './components/ProblemDisplay'
import { UserProfile } from './components/UserProfile'
import { TutorChat } from './components/TutorChat'
import { api } from './lib/api'
import { Problem, User, Progress } from './types'
import { isValidNumber } from './lib/utils'

// Define application state
interface AppState {
  user: User | null
  progress: Progress | null
  problem: Problem | null
  answer: string
  isSubmitting: boolean
  isCorrect: boolean | null
  isLoading: boolean
  error: string | null
  showTutor: boolean
  showLogin: boolean
}

// Define action types
type AppAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; progress: Progress } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOAD_PROBLEM_START' }
  | { type: 'LOAD_PROBLEM_SUCCESS'; payload: Problem }
  | { type: 'LOAD_PROBLEM_FAILURE'; payload: string }
  | { type: 'UPDATE_ANSWER'; payload: string }
  | { type: 'SUBMIT_ANSWER_START' }
  | { type: 'SUBMIT_ANSWER_SUCCESS'; payload: { isCorrect: boolean } }
  | { type: 'SUBMIT_ANSWER_FAILURE'; payload: string }
  | { type: 'NEXT_PROBLEM' }
  | { type: 'TOGGLE_TUTOR' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }

// Initial state
const initialState: AppState = {
  user: null,
  progress: null,
  problem: null,
  answer: '',
  isSubmitting: false,
  isCorrect: null,
  isLoading: false,
  error: null,
  showTutor: false,
  showLogin: true
}

// Reducer function
function reducer(state: AppState, action: AppAction): AppState {
  console.log('Reducer action:', action.type, action)
  
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        progress: action.payload.progress,
        isLoading: false,
        showLogin: false,
        error: null
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload
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
        problem: action.payload,
        isLoading: false,
        answer: '',
        isCorrect: null,
        error: null
      }
    case 'LOAD_PROBLEM_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      }
    case 'UPDATE_ANSWER':
      return {
        ...state,
        answer: action.payload
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
    case 'NEXT_PROBLEM':
      return {
        ...state,
        answer: '',
        isCorrect: null,
        error: null
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

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [retryCount, setRetryCount] = useState(0)
  
  // Handle login
  const handleLogin = async (username: string, gradeLevel: number) => {
    dispatch({ type: 'LOGIN_START' })
    console.log('Starting login process for user:', username);
    
    try {
      console.log('Attempting to create user...');
      const user = await api.createUser(username, gradeLevel)
      console.log('User created/retrieved successfully:', user);
      
      let progress = null
      
      try {
        console.log('Fetching user progress...');
        progress = await api.getUserProgress(user.id)
        console.log('User progress fetched successfully:', progress);
      } catch (progressError) {
        console.warn('Failed to get user progress, using fallback:', progressError)
        // Use fallback progress data
        progress = {
          points: 0,
          streak_days: 0,
          mastery_levels: {},
          achievements: []
        }
        console.log('Using fallback progress data:', progress);
      }
      
      console.log('Dispatching LOGIN_SUCCESS action');
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, progress }
      })
      
      // Load the first problem after login
      console.log('Fetching first problem...');
      fetchNextProblem()
    } catch (error: any) {
      console.error('登录失败:', error)
      
      // Always log the full error object for debugging
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      if (error.message && (
        error.message.includes('NetworkError') || 
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed') ||
        error.message.includes('CORS')
      )) {
        console.log('Network error detected, using fallback login');
        // Use fallback user data for offline mode
        const fallbackUser = {
          id: localStorage.getItem('client_id') || crypto.randomUUID(),
          username: username || 'Guest',
          grade_level: gradeLevel || 3,
          points: 0,
          streak_days: 0
        }
        
        const fallbackProgress = {
          points: 0,
          streak_days: 0,
          mastery_levels: {},
          achievements: []
        }
        
        console.log('Dispatching LOGIN_SUCCESS action with fallback data');
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: fallbackUser, progress: fallbackProgress }
        })
        
        // Load the first problem after login
        console.log('Fetching first problem with fallback...');
        fetchNextProblem()
      } else {
        console.log('Dispatching LOGIN_FAILURE action');
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: error.message || '登录失败，请重试'
        })
      }
    }
  }
  
  // Fetch the next problem
  const fetchNextProblem = async (topic?: string) => {
    dispatch({ type: 'LOAD_PROBLEM_START' })
    
    try {
      // Add timestamp to ensure we get a new problem
      const timestamp = Date.now()
      
      // If no topic is provided, randomly select one
      const topics = ['addition', 'subtraction', 'multiplication', 'division']
      const randomTopic = topics[Math.floor(Math.random() * topics.length)]
      
      // Pass language parameter for bilingual problems
      const problem = await api.getNextProblem(topic || randomTopic, timestamp, "sv+zh")
      
      dispatch({
        type: 'LOAD_PROBLEM_SUCCESS',
        payload: problem
      })
    } catch (error: any) {
      console.error('获取题目失败:', error)
      
      // Retry up to 3 times with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000
        console.log(`Retrying in ${delay}ms (attempt ${retryCount + 1}/3)`)
        
        setTimeout(() => {
          setRetryCount(retryCount + 1)
          fetchNextProblem()
        }, delay)
      } else {
        dispatch({
          type: 'LOAD_PROBLEM_FAILURE',
          payload: error.message || '获取题目失败，请重试'
        })
        setRetryCount(0)
      }
    }
  }
  
  // Handle next problem button click
  const handleNextProblem = () => {
    dispatch({ type: 'NEXT_PROBLEM' })
    fetchNextProblem()
  }
  
  // Handle answer change
  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'UPDATE_ANSWER',
      payload: e.target.value
    })
  }
  
  // Handle answer submission
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
      
      const result = await api.submitAnswer(
        state.user?.id || clientId,
        state.problem.id,
        parseFloat(state.answer)
      )
      
      dispatch({
        type: 'SUBMIT_ANSWER_SUCCESS',
        payload: { isCorrect: result.is_correct }
      })
    } catch (error: any) {
      console.error('提交答案失败:', error)
      dispatch({
        type: 'SUBMIT_ANSWER_FAILURE',
        payload: error.message || '提交答案失败，请重试'
      })
    }
  }
  
  // Toggle tutor visibility
  const toggleTutor = () => {
    dispatch({ type: 'TOGGLE_TUTOR' })
  }
  
  // Error boundary
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error)
      dispatch({
        type: 'SET_ERROR',
        payload: '应用程序遇到了问题，请刷新页面重试'
      })
    }
    
    window.addEventListener('error', handleError)
    
    return () => {
      window.removeEventListener('error', handleError)
    }
  }, [])
  
  // If there's an error, show error message
  if (state.error && state.error.includes('应用程序遇到了问题')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-bold text-center text-red-600">应用程序出错了</h2>
          <p className="mb-4 text-center text-gray-700">
            抱歉，应用程序遇到了问题。请刷新页面重试。
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              刷新页面
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">数学学习助手</h1>
          {state.user && (
            <UserProfile user={state.user} progress={state.progress} />
          )}
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-4">
        {state.showLogin ? (
          <Login onLogin={handleLogin} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {state.problem ? (
                <ProblemDisplay
                  problem={state.problem}
                  answer={state.answer}
                  isSubmitting={state.isSubmitting}
                  isCorrect={state.isCorrect}
                  onAnswerChange={handleAnswerChange}
                  onSubmit={handleSubmit}
                  onNextProblem={handleNextProblem}
                  onToggleTutor={toggleTutor}
                />
              ) : (
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <p className="text-center text-gray-700">
                    {state.isLoading ? '加载题目中...' : '没有可用的题目'}
                  </p>
                </div>
              )}
              
              {state.error && !state.error.includes('应用程序遇到了问题') && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
                  <p>{state.error}</p>
                </div>
              )}
            </div>
            
            {state.showTutor && state.problem && (
              <div className="md:col-span-1">
                <TutorChat
                  userId={state.user?.id || 'guest'}
                  problem={state.problem}
                  userAnswer={state.answer ? parseFloat(state.answer) : undefined}
                />
              </div>
            )}
          </div>
        )}
      </main>
      
      <footer className="bg-gray-200 p-4 text-center text-gray-600">
        <p>© 2025 数学学习助手 - 让学习更有趣</p>
      </footer>
    </div>
  )
}

export default App
