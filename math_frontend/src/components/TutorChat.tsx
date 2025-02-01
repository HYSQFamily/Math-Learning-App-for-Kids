import React, { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Bot, Send, Star, Sparkles, X, Brain } from "lucide-react"
import { ServicePicker } from "./ServicePicker"
import { api } from "../lib/api"
import { cn } from "../lib/utils"

interface Message {
  role: "user" | "AI"
  text: string
}

const SUGGESTED_QUESTIONS = [
  "这道题的解题思路是什么？",
  "能给我一个类似的例子吗？",
  "为什么这个答案是对的？",
]

interface TutorChatProps {
  userId: string
  service: "openai" | "deepseek"
}

export function TutorChat({ userId, service }: TutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentService, setCurrentService] = useState<"openai" | "deepseek">(service)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    setError(null)

    try {
      setIsLoading(true)
      setMessages(prev => [...prev, { role: "user", text: input }])
      
      const response = await api.askTutor(userId, input, currentService)
      setMessages(prev => [...prev, { role: "AI", text: response.answer }])
      setInput("")
    } catch (error: any) {
      console.error("Error asking tutor:", error)
      setError(error.message || "AI助手暂时无法回答，请稍后再试")
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
        "fixed inset-0 bg-black/30 transition-opacity duration-200 z-40",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className={cn(
          "fixed bottom-4 right-4 w-[95%] sm:w-[400px] bg-white rounded-xl shadow-xl transition-all duration-200 max-h-[85vh] flex flex-col",
          isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}>
          <div className="p-3 border-b flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <Sparkles className="absolute -bottom-1 -right-1 w-2.5 h-2.5 text-yellow-400" />
                </div>
                <span className="font-medium text-sm">智能数学助教</span>
              </div>
              <ServicePicker service={currentService} setService={setCurrentService} />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 hover:bg-blue-100/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col p-4">
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 px-1">
              {messages.map((message, index) => (
                <div
                  key={index}
                  ref={index === messages.length - 1 ? messagesEndRef : undefined}
                  className={`flex items-start gap-2 ${
                    message.role === "AI" ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  {message.role === "AI" && (
                    <div className="relative">
                      <Bot className="w-6 h-6 text-blue-600" />
                      <Sparkles className="absolute -bottom-1 -right-1 w-3 h-3 text-yellow-400" />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] shadow-sm ${
                      message.role === "AI"
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900"
                        : "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Bot className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>有什么问题都可以问我哦！</p>
                  <p className="text-xs mt-2 text-gray-400">点击下方建议问题，或直接输入你的问题</p>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 flex items-center gap-1.5"
                  onClick={() => setInput("这道题我不会，能帮我解释一下吗？")}
                >
                  <Brain className="w-4 h-4" />
                  求助
                </Button>
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <Button
                    key={index}
                    variant="secondary"
                    size="sm"
                    onClick={() => setInput(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-2">
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                    <span>{error}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 hover:bg-red-100"
                      onClick={() => setError(null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="输入你的问题，或者点击上面的问题..."
                    disabled={isLoading}
                    className="bg-white/50"
                    autoFocus
                  />
                  <Button 
                    onClick={handleSend} 
                    onContextMenu={(e) => e.preventDefault()}
                    disabled={isLoading}
                    className={cn(
                      "bg-blue-500 hover:bg-blue-600 px-3",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
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
