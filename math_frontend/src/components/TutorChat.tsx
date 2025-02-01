import { useState } from "react"
import { Button } from "./ui/button"
import { api } from "../lib/api"
import type { Problem } from "../types"

interface TutorChatProps {
  problem: Problem
  service: "openai" | "deepseek"
}

export function TutorChat({ problem, service }: TutorChatProps) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { 
      role: "assistant", 
      content: `你好！我是你的智能数学助教。这道题是关于${problem.knowledge_point}的，让我们一起来解决吧！\n\n你可以点击下面的按钮来获取提示或者解题思路，也可以直接问我问题。` 
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")

  const askQuestion = async (question: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.askTutor("student", question, service)
      setMessages(prev => [...prev, { role: "user", content: question }, { role: "assistant", content: response.answer }])
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
    <div className="bg-white p-6 overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
          {service === "openai" ? "🤖" : "🌟"}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-700">智能助教</h3>
          <p className="text-sm text-gray-500">我会用简单易懂的方式帮你解答问题</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-6 space-y-4 pr-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user" ? "bg-blue-50" : "bg-blue-100"
              }`}
            >
              {msg.role === "user" ? "👤" : service === "openai" ? "🤖" : "🌟"}
            </div>
            <div
              className={`p-4 rounded-lg flex-1 ${
                msg.role === "user" 
                  ? "bg-blue-50 rounded-tr-none" 
                  : "bg-gray-50 rounded-tl-none"
              }`}
            >
              <div className="whitespace-pre-wrap text-gray-800">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 p-4">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
            {error}
          </div>
        )}
      </div>

      <div className="space-y-4 shrink-0">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => askQuestion("这道题我不太明白，能给我一些提示吗？")}
            variant="secondary"
            className="text-sm"
            disabled={isLoading}
          >
            请求提示 💡
          </Button>
          <Button
            onClick={() => askQuestion("能帮我分析一下这道题的解题思路吗？")}
            variant="secondary"
            className="text-sm"
            disabled={isLoading}
          >
            分析思路 🤔
          </Button>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="输入你的问题..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputValue.trim() && !isLoading) {
                askQuestion(inputValue.trim())
                setInputValue("")
              }
            }}
            disabled={isLoading}
          />
          <Button
            onClick={() => {
              if (inputValue.trim() && !isLoading) {
                askQuestion(inputValue.trim())
                setInputValue("")
              }
            }}
            disabled={!inputValue.trim() || isLoading}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  )
}
