import React, { useState, useEffect } from "react"
import { Brain, Star } from "lucide-react"
import { TutorChat } from "./components/TutorChat"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { api, Problem } from "./lib/api"
import { cn, isValidNumber } from "./lib/utils"

export default function App() {
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [points, setPoints] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [incorrectCount, setIncorrectCount] = useState(0)
  const [showTutor, setShowTutor] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [aiService, setAiService] = useState<"openai" | "deepseek">("openai")

  useEffect(() => {
    loadNewProblem()
  }, [])

  useEffect(() => {
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'mousemove', 'touchstart']
    const resetTimer = () => setLastActivity(Date.now())
    activityEvents.forEach(event => window.addEventListener(event, resetTimer))
    const inactivityCheck = setInterval(() => {
      if (Date.now() - lastActivity > 600000) { // 10 minutes (600000ms)
        new Audio("/reminder.mp3").play().catch(console.error)
        setLastActivity(Date.now())
      }
    }, 600000)

    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, resetTimer))
      clearInterval(inactivityCheck)
    }
  }, [lastActivity])

  const loadNewProblem = async () => {
    try {
      const problem = await api.getNextProblem()
      setCurrentProblem(problem)
      setUserAnswer("")
      setTimeout(() => {
        const answerInput = document.querySelector('input[placeholder="输入你的答案"]') as HTMLInputElement
        if (answerInput) {
          answerInput.focus()
        }
      }, 100)
    } catch (error) {
      console.error("Error loading problem:", error)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!currentProblem || !userAnswer) return

    try {
      const result = await api.submitAnswer(currentProblem.id, parseFloat(userAnswer))
      if (result.is_correct) {
        setPoints(prev => prev + 10)
        setCorrectCount(prev => prev + 1)
        loadNewProblem()
      } else {
        setIncorrectCount(prev => prev + 1)
      }
    } catch (error) {
      console.error("Error submitting answer:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer()
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    if (userAnswer && isValidNumber(userAnswer)) {
      handleSubmitAnswer()
    }
    return false
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">数学学习助手</h1>
            <div className="text-sm text-gray-600">
              得分: {points} | 正确: {correctCount} | 错误: {incorrectCount}
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => setShowTutor(!showTutor)}
            className={cn(
              "text-blue-600 relative",
              showTutor && "after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-blue-500 after:rounded-full"
            )}
            aria-label={showTutor ? "关闭智能助教" : "打开智能助教"}
          >
            <Star className={cn("w-5 h-5", showTutor && "text-yellow-500 fill-yellow-500")} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            {currentProblem && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">题目</h3>
                  <p>{currentProblem.question}</p>
                  {currentProblem.knowledge_point && (
                    <p className="text-sm text-gray-600 mt-2">
                      知识点: {currentProblem.knowledge_point}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <Input
                    type="text"
                    placeholder="输入你的答案"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-32"
                    autoFocus
                  />
                  <Button 
                    onClick={handleSubmitAnswer}
                    onContextMenu={handleContextMenu}
                    disabled={!userAnswer || !isValidNumber(userAnswer)}
                  >
                    提交答案
                  </Button>
                  <Button variant="outline" onClick={loadNewProblem}>
                    跳过
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => {
                      setShowTutor(true)
                      const tutorInput = document.querySelector('input[placeholder="输入你的问题，或者点击上面的问题..."]') as HTMLInputElement
                      if (tutorInput) {
                        tutorInput.focus()
                        tutorInput.value = "这道题怎么做？"
                      }
                    }}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 flex items-center gap-1"
                  >
                    <Brain className="w-4 h-4" />
                    求助
                  </Button>
                </div>
              </div>
            )}
          </div>

          {showTutor && (
            <div className="bg-white rounded-lg p-6 shadow-sm overflow-y-auto max-h-[600px]">
              <TutorChat userId="test-user" service={aiService} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
