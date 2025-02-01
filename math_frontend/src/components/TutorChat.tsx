import React, { useState, useEffect, useRef } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Bot, Send, Star, Sparkles, X } from "lucide-react"
import { ServicePicker } from "./ServicePicker"
import { api } from "../lib/api"
import { cn } from "../lib/utils"

interface Message {
  role: "user" | "AI"
  text: string
}

const SUGGESTED_QUESTIONS = [
  "这道题怎么解？",
  "能给我一个提示吗？",
  "为什么我的答案不对？",
  "这道题用什么方法解？"
]

export function TutorChat({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [service, setService] = useState("openai")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    setError(null)

    try {
      setIsLoading(true)
      setMessages(prev => [...prev, { role: "user", text: input }])
      
      const response = await api.askTutor(userId, input, service)
      setMessages(prev => [...prev, { role: "AI", text: response.answer }])
      setInput("")
    } catch (error: any) {
      console.error("Error asking tutor:", error)
      const errorMessage = error.response?.data?.detail || error.message || "AI助手暂时无法回答，请稍后再试"
      setError(errorMessage)
      setMessages(prev => [...prev, { 
        role: "AI", 
        text: `抱歉，我遇到了一些问题：${errorMessage}` 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          data-tutor-trigger
          className="fixed bottom-8 right-8 p-2.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-50 group"
          aria-label="打开智能助教"
        >
          <Star className="w-5 h-5 text-white group-hover:animate-spin" />
        </button>
      )}

      <div className={cn(
        "fixed inset-0 bg-black/50 transition-opacity duration-200 z-40",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className={cn(
          "fixed bottom-4 right-4 w-full sm:w-[400px] bg-white rounded-xl shadow-xl transition-transform duration-200 max-h-[80vh] flex flex-col",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}>
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Bot className="w-6 h-6 text-blue-600" />
                  <Sparkles className="absolute -bottom-1 -right-1 w-3 h-3 text-yellow-400" />
                </div>
                <span className="font-medium">智能数学助教</span>
              </div>
              <ServicePicker service={service} setService={setService} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col p-4">
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 ${
                    message.role === "AI" ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  {message.role === "AI" && (
                    <div className="flex-shrink-0">
                      <Bot className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl max-w-[80%] ${
                      message.role === "AI"
                        ? "bg-blue-100 text-blue-900"
                        : "bg-purple-100 text-purple-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Bot className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>有什么问题都可以问我哦！</p>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="bg-white/50"
                    onClick={() => setInput(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-2">
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="输入你的问题，或者点击上面的问题..."
                    disabled={isLoading}
                    className="bg-white/50"
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
