import { useState } from "react"
import { Button } from "./ui/button"
import { api } from "../lib/api"
import type { Problem } from "../types"
import { TutorGuidance } from "./TutorGuidance"

interface TutorChatProps {
  problem: Problem
}

export function TutorChat({ problem }: TutorChatProps) {
  const [showGuidance, setShowGuidance] = useState(false)
  const [response, setResponse] = useState(`你好！我是黄小星，让我们一起来解决这道${problem.knowledge_point}的题目吧！`)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const askQuestion = async (question: string, hintType: "quick_hint" | "deep_analysis") => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await api.askTutor("student", question, hintType)
      setResponse(
        `${result.answer}${showGuidance && result.model ? `\n\n【使用模型: ${result.model}】` : ""}`
      )
    } catch (err: any) {
      const errorMessage = err.message === "AI助手服务未配置" 
        ? "小星暂时休息了，请稍后再试" 
        : err.message || "对不起，我现在有点累，请稍后再试"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="bg-white border-2 border-blue-100 rounded-lg p-4">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <span>🐱</span>
            <p className="text-gray-600">黄小星正在思考中...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-500">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-gray-800 whitespace-pre-wrap">{response}</div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => askQuestion("给我一点小提示吧", "quick_hint")}
          variant="secondary"
          className="bg-white border-2 border-blue-100 hover:bg-blue-50 text-lg"
          disabled={isLoading}
        >
          给点线索 🎯
        </Button>
        <Button
          onClick={() => askQuestion("这道题要怎么想呢？", "deep_analysis")}
          variant="secondary"
          className="bg-white border-2 border-blue-100 hover:bg-blue-50 text-lg"
          disabled={isLoading}
        >
          帮我想想 🤔
        </Button>
        <Button
          onClick={() => askQuestion("我想要更多帮助", "deep_analysis")}
          variant="secondary"
          className="bg-white border-2 border-blue-100 hover:bg-blue-50 text-lg"
          disabled={isLoading}
        >
          更多帮助 ✨
        </Button>
      </div>

      <Button
        onClick={() => setShowGuidance(prev => !prev)}
        variant="ghost"
        className="mt-2 text-gray-500 hover:text-gray-700"
        disabled={isLoading}
      >
        {showGuidance ? "隐藏家长指导 👨‍👩‍👧‍👦" : "家长/老师指导 👨‍👩‍👧‍👦"}
      </Button>

      {showGuidance && <TutorGuidance problem={problem} />}
    </div>
  )
}
