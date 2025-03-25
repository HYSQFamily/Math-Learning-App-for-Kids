import React, { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { api } from "../lib/api"
import type { Problem } from "../types"
import { TutorGuidance } from "./TutorGuidance"
import { useCharacter } from "../lib/characters"

interface TutorChatProps {
  userId: string
  problem: Problem
  userAnswer?: number
  username?: string
}

export function TutorChat({ userId, problem, userAnswer, username }: TutorChatProps) {
  const [showGuidance, setShowGuidance] = useState(false)
  
  // Get preferred character from localStorage or use default
  const preferredCharacterId = localStorage.getItem("preferred_character") || "huang-xiaoxing";
  const { currentCharacter, CharacterSelector } = useCharacter(preferredCharacterId);
  
  const [response, setResponse] = useState(
    currentCharacter.greeting(
      username, 
      problem.knowledge_point, 
      userAnswer
    )
  )
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update response when character changes
  useEffect(() => {
    setResponse(
      currentCharacter.greeting(
        username, 
        problem.knowledge_point, 
        userAnswer
      )
    );
  }, [currentCharacter, username, problem.knowledge_point, userAnswer]);

  const askQuestion = async (question: string, hintType: "quick_hint" | "deep_analysis") => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await api.askTutor(userId, question, hintType)
      setResponse(
        `${result.answer}${showGuidance && result.model ? `\n\n【使用模型: ${result.model}】` : ""}`
      )
    } catch (err: any) {
      const errorMessage = err.message === "AI助手服务未配置" 
        ? `${currentCharacter.name}暂时休息了，请稍后再试` 
        : err.message || "对不起，我现在有点累，请稍后再试"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <CharacterSelector className="mb-2" />
      
      <div className="bg-white border-2 border-blue-100 rounded-lg p-4">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <span>{currentCharacter.avatar}</span>
            <p className="text-gray-600">{currentCharacter.thinkingMessage}</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-500">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-xl">{currentCharacter.avatar}</span>
              <div className="flex-1">
                <p className="whitespace-pre-wrap">{response}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button 
            onClick={() => askQuestion("这道题怎么解？", "quick_hint")}
            className="flex-1 bg-blue-500 hover:bg-blue-600"
          >
            提示
          </Button>
          <Button 
            onClick={() => askQuestion("请详细解释这道题的解法", "deep_analysis")}
            className="flex-1 bg-purple-500 hover:bg-purple-600"
          >
            详解
          </Button>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={() => setShowGuidance(!showGuidance)}
            variant="outline" 
            size="sm"
            className="text-xs text-gray-500"
          >
            {showGuidance ? "隐藏调试信息" : "显示调试信息"}
          </Button>
        </div>
        
        {showGuidance && <TutorGuidance problem={problem} />}
      </div>
    </div>
  )
}
