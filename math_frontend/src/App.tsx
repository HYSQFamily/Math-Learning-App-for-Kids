import React, { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Trophy, Star, Brain } from "lucide-react"
import { TutorIntroduction } from "./components/TutorIntroduction"
import { api, User, Problem, Progress } from "./lib/api"
import { TutorChat } from "./components/TutorChat"
import { AchievementsDisplay } from "./components/AchievementsDisplay"

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState("")
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [answer, setAnswer] = useState("")
  const [progress, setProgress] = useState<Progress | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [attempt, setAttempt] = useState<any>(null)
  const [hintIndex, setHintIndex] = useState(0)
  const [lastActivity, setLastActivity] = useState(Date.now())

  useEffect(() => {
    const resetTimer = () => setLastActivity(Date.now())
    const checkInactivity = () => {
      const inactiveTime = Date.now() - lastActivity
      if (inactiveTime > 600000) { // 10 minutes
        const utterance = new SpeechSynthesisUtterance("小朋友，让我们继续解题吧！")
        utterance.lang = "zh-CN"
        window.speechSynthesis.speak(utterance)
        resetTimer()
        console.log("Inactivity detected, triggered voice prompt")
      }
    }

    const activityEvents = ["mousemove", "keydown", "click"]
    activityEvents.forEach(event => 
      window.addEventListener(event, resetTimer)
    )

    const inactivityCheck = setInterval(checkInactivity, 10000)

    return () => {
      activityEvents.forEach(event => 
        window.removeEventListener(event, resetTimer)
      )
      clearInterval(inactivityCheck)
    }
  }, [lastActivity])

  const handleLogin = async () => {
    if (!username) return
    const newUser = await api.createUser(username)
    setUser(newUser)
    loadNewProblem()
    loadProgress(newUser.id)
  }

  const loadNewProblem = async () => {
    const problems = await api.getProblems()
    if (problems.length > 0) {
      setCurrentProblem(problems[Math.floor(Math.random() * problems.length)])
      setShowHint(false)
      setHintIndex(0)
      setAnswer("")
    }
  }

  const loadProgress = async (userId: string) => {
    const userProgress = await api.getProgress(userId)
    setProgress(userProgress)
  }

  const answerInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (!user || !currentProblem || !answer) return
    if (event?.button === 2) {
      event.preventDefault()
      return
    }

    const result = await api.submitAttempt(user.id, currentProblem.id, Number(answer))
    setAttempt(result)
    await loadProgress(user.id)
    
    if (result.is_correct) {
      await loadNewProblem()
      setAnswer("")
      // Use setTimeout to ensure focus is set after state updates and DOM changes
      setTimeout(() => {
        if (answerInputRef.current) {
          answerInputRef.current.focus()
          answerInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 0)
    } else {
      setShowHint(true)
    }
  }

  const showNextHint = () => {
    if (!currentProblem) return
    if (hintIndex < currentProblem.hints.length - 1) {
      setHintIndex(h => h + 1)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>数学学习助手</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="输入你的名字"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Button className="w-full" onClick={handleLogin}>
                开始学习
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <TutorIntroduction />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="text-yellow-500" />
                积分
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{progress?.points || 0}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="text-yellow-500" />
                连续学习
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{progress?.current_streak || 0} 天</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="text-blue-500" />
                正确率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {progress?.total_solved ? 
                  Math.round((progress.correct_solved / progress.total_solved) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {progress && (
          <AchievementsDisplay 
            points={progress.points}
            achievements={progress.achievements}
          />
        )}
        
        {user && <TutorChat userId={user.id} />}

        {currentProblem && (
          <Card>
            <CardHeader>
              <CardTitle>题目</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">{currentProblem.question}</p>
              <div className="flex flex-wrap items-start gap-2 mt-2 bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-500" />
                  <p className="text-sm text-blue-700 font-medium">知识点：{currentProblem.knowledge_point}</p>
                </div>
                {currentProblem.related_points?.length > 0 && (
                  <div className="flex items-center gap-2 w-full mt-1">
                    <p className="text-sm text-blue-500">
                      相关知识点：{currentProblem.related_points.join('、')}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <Input
                  type="number"
                  placeholder="输入你的答案"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  ref={answerInputRef}
                />
                
                <div className="flex gap-2">
                  <Button 
                    onClick={(e) => handleSubmit(e)} 
                    onContextMenu={(e) => e.preventDefault()}
                    className="flex-1"
                  >
                    提交答案
                  </Button>
                  <Button variant="outline" onClick={loadNewProblem}>
                    跳过
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => {
                      if (currentProblem) {
                        setShowHint(true)
                        const tutorTrigger = document.querySelector('[data-tutor-trigger]') as HTMLButtonElement
                        if (tutorTrigger) {
                          tutorTrigger.click()
                        }
                      }
                    }}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 flex items-center gap-1"
                  >
                    <Brain className="w-4 h-4" />
                    求助
                  </Button>
                </div>
              </div>

              {(showHint || attempt?.need_extra_help) && (
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <p className="font-medium text-blue-900">提示:</p>
                  <p className="text-blue-800">{currentProblem.hints[hintIndex]}</p>
                  {hintIndex < currentProblem.hints.length - 1 && (
                    <Button variant="link" onClick={showNextHint}>
                      显示下一个提示
                    </Button>
                  )}
                  {attempt?.need_extra_help && (
                    <div className="border-t pt-2 mt-2">
                      <p className="text-sm text-blue-700">
                        看起来这个知识点有点难度，让我们一起来攻克它！
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        知识点掌握度: {attempt.mastery_level}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default App
