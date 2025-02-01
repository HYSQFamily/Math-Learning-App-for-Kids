import { useState, useEffect } from "react"
import type { Problem } from "./types"
import { TutorChat } from "./components/TutorChat"
import { ServicePicker } from "./components/ServicePicker"
import { Button } from "./components/ui/button"
import { api } from "./lib/api"
import { isValidNumber } from "./lib/utils"

export default function App() {
  const [problem, setProblem] = useState<Problem | null>(null)
  const [answer, setAnswer] = useState("")
  const [service, setService] = useState<"openai" | "deepseek">("deepseek")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isTutorVisible, setIsTutorVisible] = useState(false)

  useEffect(() => {
    fetchNextProblem()
  }, [])

  const fetchNextProblem = async () => {
    try {
      const nextProblem = await api.getNextProblem()
      setProblem(nextProblem)
      setAnswer("")
      setIsCorrect(null)
      focusAnswerInput()
    } catch (error) {
      console.error("获取题目失败:", error)
    }
  }

  const handleSubmit = async () => {
    if (!problem || !isValidNumber(answer)) return

    try {
      const result = await api.submitAnswer(problem.id, parseFloat(answer))
      setIsCorrect(result.is_correct)
      if (result.is_correct) {
        setTimeout(fetchNextProblem, 1000)
      }
    } catch (error) {
      console.error("提交答案失败:", error)
    }
  }

  const focusAnswerInput = () => {
    const input = document.querySelector("input[type=text]") as HTMLInputElement
    if (input) input.focus()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">数学学习助手</h1>
          <ServicePicker service={service} setService={setService} />
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {problem ? (
            <>
              <div className="mb-4">
                <h2 className="text-lg font-medium text-gray-900 mb-2">题目</h2>
                <p className="text-gray-700">{problem.question}</p>
                <p className="text-sm text-gray-500 mt-1">
                  知识点：{problem.knowledge_point}
                </p>
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
                <Button
                  variant="secondary"
                  onClick={() => setIsTutorVisible(!isTutorVisible)}
                  className="flex items-center gap-2"
                >
                  {isTutorVisible ? (
                    <>
                      <span>隐藏助手</span>
                      <span>👋</span>
                    </>
                  ) : (
                    <>
                      <span>需要帮助</span>
                      <span>🤖</span>
                    </>
                  )}
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

        {isTutorVisible && problem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={(e) => {
            if (e.target === e.currentTarget) setIsTutorVisible(false);
          }}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    🤖
                  </div>
                  <span className="font-medium">智能数学助教</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsTutorVisible(false)} className="h-8 w-8">
                  ❌
                </Button>
              </div>
              <TutorChat problem={problem} service={service} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
