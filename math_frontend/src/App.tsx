import { useState, useEffect } from "react"
import type { Problem } from "./types"
import { TutorChat } from "./components/TutorChat"
import { Button } from "./components/ui/button"
import { api } from "./lib/api"
import { isValidNumber } from "./lib/utils"

export default function App() {
  const [problem, setProblem] = useState<Problem | null>(null)
  const [answer, setAnswer] = useState("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [currentModel, setCurrentModel] = useState("DeepSeek-V3")
  // Tutor is always visible now

  useEffect(() => {
    fetchNextProblem()
  }, [])

  const fetchNextProblem = async () => {
    try {
      const nextProblem = await api.getNextProblem()
      // Batch state updates together
      setProblem(nextProblem)
      setAnswer("")
      setIsCorrect(null)
      // Focus input immediately using requestAnimationFrame
      requestAnimationFrame(() => {
        focusAnswerInput()
      })
    } catch (error) {
      console.error("获取题目失败:", error)
    }
  }

  const handleSubmit = async () => {
    if (!problem || !isValidNumber(answer)) return

    try {
      console.log("Submitting answer:", answer)
      const result = await api.submitAnswer(problem.id, parseFloat(answer))
      
      if (result.is_correct) {
        // First, show correct answer feedback
        setIsCorrect(true)
        
        // Clear the answer immediately
        setAnswer("")
        
        // Use setTimeout to ensure the correct feedback is visible briefly
        setTimeout(async () => {
          try {
            const nextProblem = await api.getNextProblem()
            setProblem(nextProblem)
            setIsCorrect(null)
            // Focus input after state updates using requestAnimationFrame
            requestAnimationFrame(() => {
              const input = document.querySelector("input[type=text]") as HTMLInputElement
              if (input) {
                input.focus()
                input.scrollIntoView({ behavior: "smooth", block: "center" })
              }
            })
          } catch (error) {
            console.error("获取下一题失败:", error)
          }
        }, 500) // Show correct answer feedback for 500ms
      } else {
        setIsCorrect(false)
      }
    } catch (error) {
      console.error("提交答案失败:", error)
    }
  }

  const focusAnswerInput = () => {
    const input = document.querySelector("input[type=text]") as HTMLInputElement
    if (input) {
      input.focus()
      input.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="absolute top-2 right-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-sm">
        当前模型: {currentModel}
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">数学学习助手</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {problem ? (
            <>
              <div className="mb-4">
                <h2 className="text-lg font-medium text-gray-900 mb-2">题目</h2>
                <p className="text-gray-700">{problem.question}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    知识点：{problem.knowledge_point}
                  </span>
                  {problem.related_points?.map((point, i) => (
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
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full px-3 py-2 border rounded-md"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between">
                <Button onClick={handleSubmit} className="px-6">
                  提交答案
                </Button>

              </div>

              {isCorrect !== null && (
                <div
                  className={`mt-4 p-3 rounded ${
                    isCorrect
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {isCorrect ? "答对了！" : "再试一次吧！"}
                </div>
              )}
            </>
          ) : (
            <p>加载中...</p>
          )}
        </div>

        {problem && (
          <div className="mt-6 bg-white border-2 border-blue-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🐱</span>
              <span className="text-gray-800">黄小星</span>
            </div>
            <TutorChat problem={problem} onModelChange={setCurrentModel} />
          </div>
        )}
      </div>
    </div>
  )
}
