import * as React from "react"
import { useReducer, useEffect, useRef } from "react"
import type { Problem } from "./types"
import { TutorChat } from "./components/TutorChat"
import { Button } from "./components/ui/button"
import { api } from "./lib/api"
import { isValidNumber } from "./lib/utils"

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
  status: "idle" | "submitting" | "fetching" | "error"
  problem: Problem | null
  answer: string
  isCorrect: boolean | null
  error: string | null
}

type Action =
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS"; payload: { isCorrect: boolean } }
  | { type: "NEXT_PROBLEM_START" }
  | { type: "NEXT_PROBLEM_SUCCESS"; payload: { problem: Problem } }
  | { type: "SET_ANSWER"; payload: string }
  | { type: "SET_ERROR"; payload: string }
  | { type: "RESET_CORRECT" }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SUBMIT_START":
      return { ...state, status: "submitting", error: null }
    case "SUBMIT_SUCCESS":
      return {
        ...state,
        status: action.payload.isCorrect ? "fetching" : "idle",
        isCorrect: action.payload.isCorrect,
        answer: action.payload.isCorrect ? "" : state.answer
      }
    case "NEXT_PROBLEM_SUCCESS":
      return {
        ...state,
        status: "idle",
        problem: action.payload.problem,
        answer: "",
        isCorrect: null  // Reset isCorrect for the new problem
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
  error: null
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const answerInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchNextProblem()
  }, [])

  useEffect(() => {
    if (state.problem && answerInputRef.current) {
      setTimeout(() => {
        answerInputRef.current?.focus()
        answerInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 100)
    }
  }, [state.problem])

  const fetchNextProblem = async () => {
    try {
      dispatch({ type: "NEXT_PROBLEM_START" })
      const nextProblem = await api.getNextProblem()
      dispatch({ type: "NEXT_PROBLEM_SUCCESS", payload: { problem: nextProblem } })
    } catch (error: any) {
      console.error("获取题目失败:", error)
      dispatch({ type: "SET_ERROR", payload: error.message || "获取题目失败，请刷新页面重试" })
    }
  }

  const handleSubmit = async () => {
    if (!state.problem || !isValidNumber(state.answer) || state.status === "submitting" || state.status === "fetching") {
      console.log("提交验证失败:", { problem: !!state.problem, isValid: isValidNumber(state.answer), status: state.status })
      return
    }

    const currentAnswer = state.answer.trim()
    console.log("开始提交答案:", { problemId: state.problem.id, answer: currentAnswer })
    dispatch({ type: "SUBMIT_START" })

    try {
      const result = await api.submitAnswer(state.problem.id, parseFloat(currentAnswer))
      console.log("收到提交结果:", result)
      
      if (result.is_correct) {
        console.log("答案正确，准备加载下一题")
        dispatch({ type: "SUBMIT_SUCCESS", payload: { isCorrect: true } })
        
        // Start fetching next problem immediately
        console.log("开始获取下一题")
        const nextProblemPromise = api.getNextProblem()
        
        // Show brief success feedback and ensure state updates are processed
        await new Promise(resolve => setTimeout(resolve, 100))
        
        try {
          const nextProblem = await nextProblemPromise
          console.log("获取到下一题:", nextProblem)
          
          // Use microtask to ensure state updates are processed
          await Promise.resolve()
          
          dispatch({ type: "NEXT_PROBLEM_SUCCESS", payload: { problem: nextProblem } })
          console.log("已更新下一题状态")
          
          // Focus input after state update using microtask
          queueMicrotask(() => {
            if (answerInputRef.current) {
              answerInputRef.current.focus()
              answerInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
              console.log("输入框已获得焦点")
            } else {
              console.warn("未找到输入框元素")
            }
          })
        } catch (error: any) {
          console.error("获取下一题失败:", error)
          dispatch({ type: "SET_ERROR", payload: error.message || "获取下一题失败，请刷新页面重试" })
        }
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
          <div className="text-sm text-gray-500 bg-white/80 px-2 py-1 rounded-full border border-gray-200">
            使用了DeepSeek AI大模型
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
