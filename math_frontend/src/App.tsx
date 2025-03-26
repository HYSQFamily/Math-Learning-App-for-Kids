import { useReducer } from "react"
import { api } from "./lib/api"
import { Problem, User, Progress } from "./types"
import { Login } from "./components/Login"
import { ProblemDisplay } from "./components/ProblemDisplay"
import { UserProfile } from "./components/UserProfile"
import { TutorChat } from "./components/TutorChat"

// Define action types
type Action =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOAD_PROBLEM_START' }
  | { type: 'LOAD_PROBLEM_SUCCESS'; payload: Problem }
  | { type: 'LOAD_PROBLEM_FAILURE'; payload: string }
  | { type: 'UPDATE_ANSWER'; payload: number }
  | { type: 'SUBMIT_ANSWER_START' }
  | { type: 'SUBMIT_ANSWER_SUCCESS'; payload: { is_correct: boolean; message?: string } }
  | { type: 'SUBMIT_ANSWER_FAILURE'; payload: string }
  | { type: 'NEXT_PROBLEM' }
  | { type: 'UPDATE_PROGRESS'; payload: Progress }

// Define state type
type State = {
  user: User | null
  isLoading: boolean
  error: string | null
  currentProblem: Problem | null
  userAnswer: number | null
  isSubmitting: boolean
  submissionResult: { is_correct: boolean; message?: string } | null
  progress: Progress | null
}

// Initial state
const initialState: State = {
  user: null,
  isLoading: false,
  error: null,
  currentProblem: null,
  userAnswer: null,
  isSubmitting: false,
  submissionResult: null,
  progress: null
}

// Reducer function
function reducer(state: State, action: Action): State {
  console.log("Reducer action:", action)
  
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null }
    case 'LOGIN_SUCCESS':
      return { ...state, isLoading: false, user: action.payload }
    case 'LOGIN_FAILURE':
      return { ...state, isLoading: false, error: action.payload }
    case 'LOAD_PROBLEM_START':
      return { ...state, isLoading: true, error: null }
    case 'LOAD_PROBLEM_SUCCESS':
      return { 
        ...state, 
        isLoading: false, 
        currentProblem: action.payload,
        userAnswer: null,
        submissionResult: null
      }
    case 'LOAD_PROBLEM_FAILURE':
      return { ...state, isLoading: false, error: action.payload }
    case 'UPDATE_ANSWER':
      return { ...state, userAnswer: action.payload }
    case 'SUBMIT_ANSWER_START':
      return { ...state, isSubmitting: true }
    case 'SUBMIT_ANSWER_SUCCESS':
      return { 
        ...state, 
        isSubmitting: false, 
        submissionResult: action.payload
      }
    case 'SUBMIT_ANSWER_FAILURE':
      return { ...state, isSubmitting: false, error: action.payload }
    case 'NEXT_PROBLEM':
      return { 
        ...state, 
        currentProblem: null,
        userAnswer: null,
        submissionResult: null
      }
    case 'UPDATE_PROGRESS':
      return { ...state, progress: action.payload }
    default:
      return state
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  // No need for character in this component
  
  // Extract state variables for easier access
  const { 
    user, 
    isLoading, 
    error, 
    currentProblem, 
    userAnswer, 
    isSubmitting, 
    submissionResult,
    progress
  } = state

  // Handle login
  const handleLogin = async (username: string, gradeLevel: number) => {
    try {
      console.log("Starting login process for user:", username)
      dispatch({ type: 'LOGIN_START' })
      
      console.log("Attempting to create user...")
      const userData = await api.createUser(username, gradeLevel)
      console.log("User created/retrieved successfully:", userData)
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: userData })
      
      // Fetch user progress
      console.log("Fetching user progress...")
      const progressData = await api.getUserProgress(userData.id)
      console.log("User progress fetched successfully:", progressData)
      
      dispatch({ type: 'UPDATE_PROGRESS', payload: progressData })
      
      // Load first problem
      console.log("Fetching first problem...")
      loadNextProblem()
    } catch (error: any) {
      console.error("Login error:", error)
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error.message || "Failed to login. Please try again." 
      })
    }
  }

  // Load next problem
  const loadNextProblem = async () => {
    if (!user) return;
    
    try {
      dispatch({ type: 'LOAD_PROBLEM_START' })
      
      // Get a random topic
      const topics = ["addition", "subtraction", "multiplication", "division"]
      const randomTopic = topics[Math.floor(Math.random() * topics.length)]
      
      // Use the problems/next endpoint with user_id parameter
      const problem = await api.getNextProblem(randomTopic, Date.now(), "sv+zh")
      
      dispatch({ type: 'LOAD_PROBLEM_SUCCESS', payload: problem })
    } catch (error: any) {
      console.error("Error loading problem:", error)
      dispatch({ 
        type: 'LOAD_PROBLEM_FAILURE', 
        payload: error.message || "Failed to load problem. Please try again." 
      })
    }
  }

  // Handle answer update
  const handleAnswerChange = (value: number) => {
    dispatch({ type: 'UPDATE_ANSWER', payload: value })
  }

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    if (!user || !currentProblem || userAnswer === null) return
    
    try {
      dispatch({ type: 'SUBMIT_ANSWER_START' })
      
      const result = await api.submitAnswer(user.id, currentProblem.id, userAnswer)
      
      dispatch({ type: 'SUBMIT_ANSWER_SUCCESS', payload: result })
      
      // Update progress after submission
      const progressData = await api.getUserProgress(user.id)
      dispatch({ type: 'UPDATE_PROGRESS', payload: progressData })
    } catch (error: any) {
      console.error("Error submitting answer:", error)
      dispatch({ 
        type: 'SUBMIT_ANSWER_FAILURE', 
        payload: error.message || "Failed to submit answer. Please try again." 
      })
    }
  }

  // Handle next problem
  const handleNextProblem = () => {
    if (!user) return
    
    dispatch({ type: 'NEXT_PROBLEM' })
    loadNextProblem()
  }

  // If not logged in, show login screen
  if (!user) {
    return (
      <div className="min-h-screen bg-blue-50">
        <header className="bg-blue-600 text-white p-4">
          <h1 className="text-2xl font-bold">数学学习助手</h1>
        </header>
        <main className="container mx-auto p-4">
          <Login onLogin={handleLogin} isLoading={isLoading} error={error} />
        </main>
        <footer className="bg-gray-200 p-4 text-center text-sm text-gray-600">
          © 2025 数学学习助手 - 让学习更有趣
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">数学学习助手</h1>
        <UserProfile user={user} progress={progress} />
      </header>
      
      <main className="container mx-auto p-4">
        {isLoading && !currentProblem ? (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              onClick={() => user && loadNextProblem()}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              重试
            </button>
          </div>
        ) : currentProblem ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <ProblemDisplay 
                problem={currentProblem}
                userAnswer={userAnswer}
                onAnswerChange={handleAnswerChange}
                onSubmit={handleSubmitAnswer}
                isSubmitting={isSubmitting}
                submissionResult={submissionResult}
                onNextProblem={handleNextProblem}
              />
            </div>
            
            <div>
              {submissionResult && (
                <TutorChat 
                  userId={user.id}
                  problem={currentProblem} 
                  userAnswer={userAnswer || undefined}
                  username={user.username}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-8">
            <button
              onClick={() => user && loadNextProblem()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700"
            >
              开始练习
            </button>
          </div>
        )}
      </main>
      
      <footer className="bg-gray-200 p-4 text-center text-sm text-gray-600">
        © 2025 数学学习助手 - 让学习更有趣
      </footer>
    </div>
  )
}
