import React from 'react'
import { Problem } from '../types'

interface ProblemDisplayProps {
  problem: Problem
  answer: string
  isSubmitting: boolean
  isCorrect: boolean | null
  onAnswerChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
  onNextProblem: () => void
  onToggleTutor: () => void
}

export function ProblemDisplay({
  problem,
  answer,
  isSubmitting,
  isCorrect,
  onAnswerChange,
  onSubmit,
  onNextProblem,
  onToggleTutor
}: ProblemDisplayProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {problem.knowledge_point || '数学题'}
          </span>
          <span className="text-gray-500 text-sm">
            难度: {'★'.repeat(problem.difficulty || 1)}
          </span>
        </div>
        <h2 className="text-xl font-semibold mb-2">题目</h2>
        <p className="text-lg">{problem.question}</p>
      </div>

      <form onSubmit={onSubmit} className="mb-4">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
              你的答案
            </label>
            <input
              type="text"
              id="answer"
              value={answer}
              onChange={onAnswerChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入你的答案"
              disabled={isSubmitting || isCorrect !== null}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || isCorrect !== null || !answer.trim()}
          >
            {isSubmitting ? "提交中..." : "提交答案"}
          </button>
        </div>
      </form>

      {isCorrect !== null && (
        <div
          className={`p-4 rounded-md mb-4 ${
            isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          <p className="font-medium">
            {isCorrect ? "✅ 回答正确！" : `❌ 回答错误，正确答案是: ${problem.answer}`}
          </p>
          <div className="mt-4 flex justify-between">
            <button
              onClick={onNextProblem}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              下一题
            </button>
            {!isCorrect && (
              <button
                onClick={onToggleTutor}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
              >
                请AI助手帮忙
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
