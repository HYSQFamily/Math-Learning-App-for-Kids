import { useState } from "react"
import { Button } from "./ui/button"
import { api } from "../lib/api"
import type { Problem } from "../types"

interface TutorChatProps {
  problem: Problem
}

export function TutorChat({ problem }: TutorChatProps) {
  const [response, setResponse] = useState(`你好！我是黄小星，我使用 DeepSeek-R1 大模型来帮助你学习。这道题是关于${problem.knowledge_point}的，让我们一起来解决吧！`)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const askQuestion = async (question: string, hintType: "quick_hint" | "deep_analysis") => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await api.askTutor("student", question, hintType)
      const modelName = hintType === "quick_hint" ? "DeepSeek-V3" : "DeepSeek-R1"
      setResponse(
        `${result.answer}\n\n` +
        `使用模型: ${modelName}\n` +
        `${hintType === "quick_hint" ? "快速提示模式 ⚡️" : "深度分析模式 🔍"}`
      )
    } catch (err: any) {
      const errorMessage = err.message === "AI助手服务未配置" 
        ? "智能助教暂时无法使用，请稍后再试" 
        : err.message || "请求失败，请稍后再试"
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
          onClick={() => askQuestion("能给我一个提示吗？", "quick_hint")}
          variant="secondary"
          className="bg-white border-2 border-blue-100 hover:bg-blue-50"
          disabled={isLoading}
        >
          请求提示 💡
        </Button>
        <Button
          onClick={() => askQuestion("这道题的解题思路是什么？", "deep_analysis")}
          variant="secondary"
          className="bg-white border-2 border-blue-100 hover:bg-blue-50"
          disabled={isLoading}
        >
          分析思路 🤔
        </Button>
        <Button
          onClick={() => askQuestion("这道题考察了哪些知识点？", "quick_hint")}
          variant="secondary"
          className="bg-white border-2 border-blue-100 hover:bg-blue-50"
          disabled={isLoading}
        >
          知识点 ⭐️
        </Button>
      </div>
    </div>
  )
}
