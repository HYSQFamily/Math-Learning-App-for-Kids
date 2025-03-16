import * as React from "react"
import { useReducer, useEffect, useRef, useState } from "react"
import type { Problem } from "./types"
import { TutorChat } from "./components/TutorChat"
import { Button } from "./components/ui/button"
import { api } from "./lib/api"
import { isValidNumber } from "./lib/utils"
import type { User } from "./lib/api"

// Add React to global scope for JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
      input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
      label: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>
      span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>
      h1: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
      h2: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
      p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>
    }
  }
}

interface State {
  status: "idle" | "submitting" | "fetching" | "transitioning" | "error"
  lastCorrectTime: number | null
  problem: Problem | null
  answer: string
  isCorrect: boolean | null
  error: string | null
  nextProblem: Problem | null
  difficulty?: number
  created_at?: string
}

type Action =
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS"; payload: { isCorrect: boolean } }
  | { type: "NEXT_PROBLEM_START" }
  | { type: "NEXT_PROBLEM_SUCCESS"; payload: { problem: Problem } }
  | { type: "SET_ANSWER"; payload: string }
  | { type: "SET_ERROR"; payload: string }
  | { type: "RESET_CORRECT" }
  | { type: "TRANSITION_TO_NEXT" }
  | { type: "TRANSITION_COMPLETE" }

function reducer(state: State, action: Action): State {
  console.log("Reducer action:", action.type, action)
  
  switch (action.type) {
    case "SUBMIT_START":
      return { ...state, status: "submitting", error: null }
    case "SUBMIT_SUCCESS":
      if (action.payload.isCorrect) {
        return {
          ...state,
          status: "idle",
          isCorrect: true,
          answer: "",
          lastCorrectTime: Date.now()
        }
      }
      return {
        ...state,
        status: "idle",
        isCorrect: false
      }
    case "TRANSITION_TO_NEXT":
      return {
        ...state,
        status: "transitioning",
        problem: null,
        isCorrect: null
      }
    case "TRANSITION_COMPLETE":
      return {
        ...state,
        status: "idle",
        isCorrect: null
      }
    case "NEXT_PROBLEM_START":
      return {
        ...state,
        status: "fetching",
        problem: null,
        isCorrect: null,
        error: null
      }
    case "NEXT_PROBLEM_SUCCESS":
      return {
        ...state,
        status: "idle",
        problem: action.payload.problem,
        answer: "",
        isCorrect: null,
        error: null,
        lastCorrectTime: null
      }
    case "SET_ANSWER":
      return { ...state, answer: action.payload }
    case "SET_ERROR":
      return { ...state, status: "error", error: action.payload }
    case "RESET_CORRECT":
      return { ...state, isCorrect: null }
    default:
      return state
  }
}

const initialState: State = {
  status: "idle",
  problem: null,
  answer: "",
  isCorrect: null,
  error: null,
  lastCorrectTime: null,
  nextProblem: null,
  difficulty: undefined,
  created_at: undefined
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const answerInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<User | null>(null)
  // Using any type for progress data
  const [userProgress, setUserProgress] = useState<any>(null)

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
          setUserProgress(progressData)
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      }
    }
    
    loadUserData()
    fetchNextProblem()
  }, [])

  // Handle transitions and fetch next problem
  useEffect(() => {
    const handleTransition = async () => {
      if (state.status === "transitioning") {
        console.log("状态转换中，开始获取下一题")
        try {
          const nextProblem = await api.getNextProblem()
          if (nextProblem) {
            // Convert API problem to the format expected by the reducer
            const problem: Problem = {
              id: nextProblem.id || `problem-${Date.now()}`,
              question: nextProblem.question || "5 + 7 = ?",
              answer: nextProblem.answer || 0,
              knowledge_point: nextProblem.knowledge_point || "addition",
              related_points: nextProblem.related_points || [],
              difficulty: nextProblem.difficulty || 1,
              created_at: nextProblem.created_at || new Date().toISOString()
            }
            dispatch({ type: "NEXT_PROBLEM_SUCCESS", payload: { problem } })
            dispatch({ type: "TRANSITION_COMPLETE" })
          }else {
            dispatch({ type: "SET_ERROR", payload: "获取下一题失败，请刷新页面重试" })
          }
        } catch (error: any) {
          console.error("获取下一题失败:", error)
          dispatch({ type: "SET_ERROR", payload: error.message || "获取下一题失败，请刷新页面重试" })
        }
      }
    }
    handleTransition()
  }, [state.status])

  // Unified focus management
  useEffect(() => {
    const focusInput = () => {
      if (answerInputRef.current) {
        // Clear the input value directly
        answerInputRef.current.value = ''
        // Use requestAnimationFrame for smoother focus handling
        requestAnimationFrame(() => {
          if (answerInputRef.current) {
            answerInputRef.current.focus()
            answerInputRef.current.scrollIntoView({ 
              behavior: "smooth", 
              block: "center" 
            })
            console.log("输入框已获得焦点")
          }
        })
      }
    }

    // Focus input when:
    // 1. Initial problem load
    // 2. After transition completes
    // 3. When returning to idle state with a new problem
    if (state.status === "idle" && state.problem) {
      console.log("准备聚焦到输入框，当前状态:", state.status)
      focusInput()
    }
  }, [state.status, state.problem?.id])

  const fetchNextProblem = async () => {
    try {
      dispatch({ type: "NEXT_PROBLEM_START" })
      const nextProblem = await api.getNextProblem()
      // Convert API problem to the format expected by the reducer
      const problem: Problem = {
        id: nextProblem.id || `problem-${Date.now()}`,
        question: nextProblem.question || "5 + 7 = ?",
        answer: nextProblem.answer || 0,
        knowledge_point: nextProblem.knowledge_point || "addition",
        related_points: nextProblem.related_points || [],
        difficulty: nextProblem.difficulty || 1,
        created_at: nextProblem.created_at || new Date().toISOString()
      }
      dispatch({ type: "NEXT_PROBLEM_SUCCESS", payload: { problem } })
    } catch (error: any) {
      console.error("获取题目失败:", error)
      dispatch({ type: "SET_ERROR", payload: error.message || "获取题目失败，请刷新页面重试" })
    }
  }

  const handleSubmit = async () => {
    if (!state.problem || !isValidNumber(state.answer) || state.status !== "idle") {
      console.log("提交验证失败:", { problem: !!state.problem, isValid: isValidNumber(state.answer), status: state.status })
      return
    }

    const currentAnswer = state.answer.trim()
    const currentProblem = state.problem
    console.log("开始提交答案:", { problemId: currentProblem.id, answer: currentAnswer })
    
    try {
      dispatch({ type: "SUBMIT_START" })
      const result = await api.submitAnswer(currentProblem.id, Number(currentAnswer))
      
      console.log("收到提交结果:", result)
      
      if (result.is_correct) {
        console.log("答案正确，开始转换到下一题")
        // First mark as correct and clear the input
        dispatch({ type: "SUBMIT_SUCCESS", payload: { isCorrect: true } })
        
        // Use requestAnimationFrame to ensure state updates are processed
        requestAnimationFrame(() => {
          // Then transition to next problem
          dispatch({ type: "TRANSITION_TO_NEXT" })
        })
      } else {
        console.log("答案错误")
        dispatch({ type: "SUBMIT_SUCCESS", payload: { isCorrect: false } })
      }
    } catch (error: any) {
      console.error("提交答案失败:", error)
      dispatch({ type: "SET_ERROR", payload: error.message || "提交答案失败，请稍后再试" })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
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

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {state.error ? (
            <div className="p-4 bg-red-50 text-red-800 rounded-lg flex items-center gap-2">
              <span>⚠️</span>
              <p>{state.error}</p>
            </div>
          ) : state.problem ? (
            <>
              <div className="mb-4">
                <h2 className="text-lg font-medium text-gray-900 mb-2">题目</h2>
                <p className="text-gray-700">{state.problem.question}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    知识点：{state.problem.knowledge_point}
                  </span>
                  {state.problem.related_points?.map((point: string, i: number) => (
                    <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {point}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  你的答案
                </label>
                <input
                  type="text"
                  value={state.answer}
                  onChange={(e) => dispatch({ type: "SET_ANSWER", payload: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full px-3 py-2 border rounded-md"
                  ref={answerInputRef}
                />
              </div>

              <div className="flex items-center justify-between">
                <Button 
                  onClick={handleSubmit} 
                  className="px-6"
                  disabled={state.status === "submitting" || state.status === "fetching"}
                >
                  {state.status === "submitting" || state.status === "fetching" ? "提交中..." : "提交答案"}
                </Button>
              </div>

              {(state.status === "submitting" || state.status === "fetching") && (
                <div className="mt-4 p-3 rounded bg-blue-50 text-blue-800 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>正在加载下一道题，请稍候...</span>
                </div>
              )}

              {state.status === "idle" && state.isCorrect !== null && (
                <div
                  className={`mt-4 p-3 rounded ${
                    state.isCorrect
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {state.isCorrect ? "答对了！" : "再试一次吧！"}
                </div>
              )}
            </>
          ) : (
            <p>加载中...</p>
          )}
        </div>

        {state.problem && (
          <div className="mt-6 bg-white border-2 border-blue-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🐱</span>
              <span className="text-gray-800">黄小星</span>
            </div>
            <TutorChat problem={state.problem} />
          </div>
        )}
      </div>
    </div>
  )
}
