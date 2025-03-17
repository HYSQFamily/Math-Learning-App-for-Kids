import * as React from "react"
import { useReducer, useEffect, useRef, useState } from "react"
import type { Problem } from "./types"
import { TutorChat } from "./components/TutorChat"
import { Button } from "./components/ui/button"
import { api } from "./lib/api"
import { isValidNumber } from "./lib/utils"
import { fallbackProblems } from "./lib/fallbackData"
import type { User } from "./lib/api"

// Add React to global scope for JSX
declare global {
  interface Window {
    React: typeof React
  }
}
window.React = React

// Initial state for the reducer
interface AppState {
  user: {
    id: string
    username: string
    points: number
  } | null
  problem: Problem | null
  answer: string
  isSubmitting: boolean
  isCorrect: boolean | null
  isLoading: boolean
  error: string | null
  showTutor: boolean
  isTransitioning: boolean
}

const initialState: AppState = {
  user: null,
  problem: null,
  answer: "",
  isSubmitting: false,
  isCorrect: null,
  isLoading: false,
  error: null,
  showTutor: false,
  isTransitioning: false
}

// Action types for the reducer
type AppAction =
  | { type: "SET_USER"; payload: { id: string; username: string; points: number } }
  | { type: "NEXT_PROBLEM_START" }
  | { type: "NEXT_PROBLEM_SUCCESS"; payload: { problem: Problem } }
  | { type: "NEXT_PROBLEM_FAILURE"; payload: string }
  | { type: "SET_ANSWER"; payload: string }
  | { type: "SUBMIT_ANSWER_START" }
  | { type: "SUBMIT_ANSWER_SUCCESS"; payload: { isCorrect: boolean } }
  | { type: "SUBMIT_ANSWER_FAILURE"; payload: string }
  | { type: "TOGGLE_TUTOR" }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "TRANSITION_START" }
  | { type: "TRANSITION_COMPLETE" }

// Reducer function to handle state updates
function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload
      }
    case "NEXT_PROBLEM_START":
      return {
        ...state,
        isLoading: true,
        error: null,
        isTransitioning: true
      }
    case "NEXT_PROBLEM_SUCCESS":
      return {
        ...state,
        problem: action.payload.problem,
        answer: "",
        isCorrect: null,
        isLoading: false,
        error: null
      }
    case "NEXT_PROBLEM_FAILURE":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        isTransitioning: false
      }
    case "SET_ANSWER":
      return {
        ...state,
        answer: action.payload
      }
    case "SUBMIT_ANSWER_START":
      return {
        ...state,
        isSubmitting: true,
        error: null
      }
    case "SUBMIT_ANSWER_SUCCESS":
      return {
        ...state,
        isSubmitting: false,
        isCorrect: action.payload.isCorrect,
        error: null
      }
    case "SUBMIT_ANSWER_FAILURE":
      return {
        ...state,
        isSubmitting: false,
        error: action.payload
      }
    case "TOGGLE_TUTOR":
      return {
        ...state,
        showTutor: !state.showTutor
      }
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isSubmitting: false,
        isTransitioning: false
      }
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null
      }
    case "TRANSITION_START":
      return {
        ...state,
        isTransitioning: true
      }
    case "TRANSITION_COMPLETE":
      return {
        ...state,
        isTransitioning: false
      }
    default:
      return state
  }
}

// Main App component
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const answerInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<User | null>(null)
  // Progress data is fetched but not currently displayed in the UI
  // We keep this for future feature implementation
  const [_userProgress, _setUserProgress] = useState<any>(null)

  useEffect(() => {
    // Load user data and progress
    const loadUserData = async () => {
      try {
        // Get client ID from localStorage or generate a new one
        let clientId = localStorage.getItem('client_id')
        if (!clientId) {
          clientId = crypto.randomUUID()
          localStorage.setItem('client_id', clientId)
        }
        
        const userData = await api.getUser(clientId)
        setUser(userData)
        
        if (userData && userData.id) {
          const progressData = await api.getUserProgress(userData.id)
          _setUserProgress(progressData)
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      }
    }
    
    loadUserData()
    fetchNextProblem()
  }, [])

  // Function to fetch the next problem
  const fetchNextProblem = () => {
    if (!state.isTransitioning) {
      dispatch({ type: "TRANSITION_START" })
      setTimeout(async () => {
        try {
          // Add variety by selecting a random topic
          const topics = ["addition", "subtraction", "multiplication", "division"];
          const randomTopic = topics[Math.floor(Math.random() * topics.length)];
          
          // Add timestamp to prevent caching
          const timestamp = Date.now();
          
          const nextProblem = await api.getNextProblem(randomTopic, timestamp)
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
            dispatch({ type: "NEXT_PROBLEM_SUCCESS", payload: { problem } })
            dispatch({ type: "TRANSITION_COMPLETE" })
          } else {
            // Use fallback problem if API returns null
            let randomIndex;
            do {
              randomIndex = Math.floor(Math.random() * fallbackProblems.length);
            } while (state.problem && fallbackProblems[randomIndex].id === state.problem.id && fallbackProblems.length > 1);
            
            const fallbackProblem = fallbackProblems[randomIndex];
            dispatch({ 
              type: "NEXT_PROBLEM_SUCCESS", 
              payload: { problem: fallbackProblem } 
            })
            dispatch({ type: "TRANSITION_COMPLETE" })
          }
        } catch (error: any) {
          console.error("获取题目失败:", error)
          // Use fallback problem on error
          let randomIndex;
          do {
            randomIndex = Math.floor(Math.random() * fallbackProblems.length);
          } while (state.problem && fallbackProblems[randomIndex].id === state.problem.id && fallbackProblems.length > 1);
          
          const fallbackProblem = fallbackProblems[randomIndex];
          dispatch({ 
            type: "NEXT_PROBLEM_SUCCESS", 
            payload: { problem: fallbackProblem } 
          })
          dispatch({ type: "TRANSITION_COMPLETE" })
        }
      }, 500)
    }
  }

  // Function to handle answer submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!state.problem || state.isSubmitting || !isValidNumber(state.answer)) return

    dispatch({ type: "SUBMIT_ANSWER_START" })
    try {
      // Get client ID from localStorage or generate a new one
      let clientId = localStorage.getItem('client_id')
      if (!clientId) {
        clientId = crypto.randomUUID()
        localStorage.setItem('client_id', clientId)
      }
      
      const result = await api.submitAnswer(clientId, state.problem.id, parseFloat(state.answer))
      dispatch({ type: "SUBMIT_ANSWER_SUCCESS", payload: { isCorrect: result.is_correct } })
    } catch (error: any) {
      console.error("提交答案失败:", error)
      dispatch({ type: "SUBMIT_ANSWER_FAILURE", payload: error.message || "提交答案失败，请重试" })
    }
  }

  // Function to handle next problem button click
  const handleNextProblem = async () => {
    try {
      dispatch({ type: "NEXT_PROBLEM_START" })
      
      // Add variety by selecting a random topic
      const topics = ["addition", "subtraction", "multiplication", "division"];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      // Add timestamp to prevent caching and ensure unique problems
      const timestamp = Date.now();
      
      // Set a timeout to handle slow backend responses
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("请求超时，使用备用题目")), 5000)
      );
      
      // Race between the API call and the timeout
      const nextProblemPromise = api.getNextProblem(randomTopic, timestamp);
      const nextProblem = await Promise.race([nextProblemPromise, timeoutPromise])
        .catch(error => {
          console.warn("Problem fetch timed out or failed:", error);
          return null;
        });
      
      if (nextProblem) {
        // Convert API problem to the format expected by the reducer
        const problem: Problem = {
          id: nextProblem?.id || `problem-${timestamp}`,
          question: nextProblem?.question || "5 + 7 = ?",
          answer: nextProblem?.answer || 0,
          knowledge_point: nextProblem?.knowledge_point || randomTopic,
          related_points: nextProblem?.related_points || [],
          difficulty: nextProblem?.difficulty || 1,
          created_at: nextProblem?.created_at || new Date().toISOString(),
          hints: nextProblem?.hints || []
        }
        dispatch({ type: "NEXT_PROBLEM_SUCCESS", payload: { problem } })
      } else {
        // Use fallback problem if API returns null or times out
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * fallbackProblems.length);
        } while (state.problem && fallbackProblems[randomIndex].id === state.problem.id && fallbackProblems.length > 1);
        
        const fallbackProblem = fallbackProblems[randomIndex];
        dispatch({ 
          type: "NEXT_PROBLEM_SUCCESS", 
          payload: { problem: fallbackProblem } 
        })
      }
    } catch (error: any) {
      console.error("获取题目失败:", error)
      // Use fallback problem on error - ensure it's different from current problem
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * fallbackProblems.length);
      } while (state.problem && fallbackProblems[randomIndex].id === state.problem.id && fallbackProblems.length > 1);
      
      const fallbackProblem = fallbackProblems[randomIndex];
      dispatch({ 
        type: "NEXT_PROBLEM_SUCCESS", 
        payload: { problem: fallbackProblem } 
      })
    }
  }

  // Function to handle answer input change
  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_ANSWER", payload: e.target.value })
  }

  // Function to toggle tutor visibility
  const toggleTutor = () => {
    dispatch({ type: "TOGGLE_TUTOR" })
  }

  // Render the app
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">数学学习助手</h1>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-sm bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {user.username} | 积分: {user.points}
              </div>
            )}
            <div className="text-sm text-gray-500 bg-white/80 px-2 py-1 rounded-full border border-gray-200">
              使用了DeepSeek AI大模型
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {state.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 flex items-center">
              <span className="mr-2">⚠️</span>
              {state.error}
            </div>
          )}

          {state.isLoading ? (
            <div className="py-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          ) : state.problem ? (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">题目</h2>
                <p className="text-lg">{state.problem.question}</p>
              </div>

              <form onSubmit={handleSubmit} className="mb-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
                      你的答案
                    </label>
                    <input
                      type="text"
                      id="answer"
                      ref={answerInputRef}
                      value={state.answer}
                      onChange={handleAnswerChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="输入你的答案"
                      disabled={state.isSubmitting || state.isCorrect !== null}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    disabled={state.isSubmitting || state.isCorrect !== null || !isValidNumber(state.answer)}
                  >
                    {state.isSubmitting ? "提交中..." : "提交答案"}
                  </Button>
                </div>
              </form>

              {state.isCorrect !== null && (
                <div
                  className={`p-4 rounded-md mb-4 ${
                    state.isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  }`}
                >
                  <p className="font-medium">
                    {state.isCorrect ? "✅ 回答正确！" : "❌ 回答错误，正确答案是: " + state.problem.answer}
                  </p>
                  <div className="mt-4 flex justify-between">
                    <Button
                      onClick={handleNextProblem}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                      下一题
                    </Button>
                    {!state.isCorrect && (
                      <Button
                        onClick={toggleTutor}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
                      >
                        {state.showTutor ? "隐藏AI助手" : "请AI助手帮忙"}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-600">无法加载题目，请刷新页面重试</p>
              <Button
                onClick={fetchNextProblem}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                重试
              </Button>
            </div>
          )}
        </div>

        {state.showTutor && state.problem && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <TutorChat
              userId={user?.id || "default-user"}
              problem={state.problem}
              userAnswer={parseFloat(state.answer)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
