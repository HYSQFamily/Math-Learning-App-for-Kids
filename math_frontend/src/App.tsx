import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TutorChat } from "./components/TutorChat"
import { api } from "./lib/api"
import { Problem } from "./types"

function App() {
  const [problem, setProblem] = useState<Problem | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const answerInputRef = useRef<HTMLInputElement>(null)
  
  const userId = useMemo(() => Math.random().toString(36).substring(2, 15), [])

  const loadProblem = useCallback(async () => {
    try {
      setIsLoading(true)
      const newProblem = await api.getNextProblem()
      setProblem(newProblem)
      setIsCorrect(null)
      console.log("新题目加载完成")
    } catch (error) {
      console.error("加载题目失败:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProblem()
  }, [loadProblem])

  useEffect(() => {
    if (problem && !isLoading && isCorrect === null) {
      queueMicrotask(() => {
        if (answerInputRef.current) {
          answerInputRef.current.value = ""
          answerInputRef.current.focus()
          answerInputRef.current.scrollIntoView({ 
            behavior: "instant",
            block: "center" 
          })
          console.log("新题目输入框已获得焦点")
        }
      })
    }
  }, [problem, isLoading, isCorrect])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!problem || isLoading || !answerInputRef.current) return

    const answer = answerInputRef.current.value.trim()
    if (!answer) return

    try {
      setIsLoading(true)
      const result = await api.submitAnswer(problem.id, answer)
      
      if (result.is_correct) {
        setIsCorrect(true)
        console.log("答案正确，准备加载下一题")
        
        // Clear input and load next problem immediately
        answerInputRef.current.value = ""
        const nextProblem = await api.getNextProblem()
        setProblem(nextProblem)
        setIsCorrect(null)
        
        // Ensure focus after state updates
        queueMicrotask(() => {
          if (answerInputRef.current) {
            answerInputRef.current.focus()
            answerInputRef.current.scrollIntoView({ 
              behavior: "instant",
              block: "center" 
            })
            console.log("下一题输入框已获得焦点")
          }
        })
      } else {
        setIsCorrect(false)
        console.log("答案错误")
      }
    } catch (error) {
      console.error("提交答案失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!problem) {
    return <div className="flex justify-center items-center min-h-screen">
      <p className="text-lg">正在加载题目...</p>
    </div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">第 {problem.id} 题</h2>
          <p className="text-lg">{problem.question}</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              ref={answerInputRef}
              type="text" 
              placeholder="输入你的答案"
              disabled={isLoading}
              className="text-lg p-2"
            />
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "提交中..." : "提交答案"}
            </Button>
          </form>

          {isCorrect !== null && (
            <div className={`p-4 rounded-lg ${
              isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {isCorrect ? "答对了！" : "答错了，再试一次？"}
            </div>
          )}
        </div>

        <TutorChat 
          userId={userId}
          problem={problem}
        />
      </div>
    </div>
  )
}

export default App
