import { Problem } from '../types'

// Fallback problems for when the API is unavailable
export const fallbackProblems: Problem[] = [
  {
    id: 'fallback-1',
    question: '5 + 7 = ?',
    answer: 12,
    knowledge_point: 'addition',
    difficulty: 1,
    created_at: new Date().toISOString(),
    hints: ['想象5个苹果和7个苹果放在一起', '数一数总共有多少个苹果']
  },
  {
    id: 'fallback-2',
    question: '15 - 8 = ?',
    answer: 7,
    knowledge_point: 'subtraction',
    difficulty: 1,
    created_at: new Date().toISOString(),
    hints: ['从15个苹果中拿走8个', '数一数还剩下多少个苹果']
  },
  {
    id: 'fallback-3',
    question: '4 × 6 = ?',
    answer: 24,
    knowledge_point: 'multiplication',
    difficulty: 2,
    created_at: new Date().toISOString(),
    hints: ['想象4排，每排6个苹果', '数一数总共有多少个苹果']
  },
  {
    id: 'fallback-4',
    question: '20 ÷ 5 = ?',
    answer: 4,
    knowledge_point: 'division',
    difficulty: 2,
    created_at: new Date().toISOString(),
    hints: ['把20个苹果平均分给5个人', '每个人能得到多少个苹果']
  },
  {
    id: 'fallback-5',
    question: '小明有8个苹果，小红有5个苹果，小明比小红多几个苹果？',
    answer: 3,
    knowledge_point: 'subtraction',
    difficulty: 1,
    created_at: new Date().toISOString(),
    hints: ['比较两个人的苹果数量', '用减法计算差值']
  },
  {
    id: 'fallback-6',
    question: '一个长方形长6厘米，宽4厘米，它的面积是多少平方厘米？',
    answer: 24,
    knowledge_point: 'multiplication',
    difficulty: 2,
    created_at: new Date().toISOString(),
    hints: ['长方形的面积 = 长 × 宽', '代入数值计算']
  }
]

// Fallback user data
export const fallbackUser = {
  id: 'default-user',
  username: 'Guest',
  grade_level: 3,
  points: 0,
  streak_days: 0
}

// Fallback progress data
export const fallbackProgress = {
  points: 0,
  streak_days: 0,
  mastery_levels: {
    addition: 0.0,
    subtraction: 0.0,
    multiplication: 0.0,
    division: 0.0
  },
  achievements: []
}

// Fallback attempt result
export const fallbackAttemptResult = {
  is_correct: false,
  message: '无法连接到服务器，请稍后再试'
}

// Fallback tutor response
export const fallbackTutorResponse = {
  answer: '我是AI助手黄小星。我现在无法连接到服务器，但我可以告诉你解题的一般方法：仔细阅读题目，理解问题，列出方程，然后一步步解答。',
  model: 'fallback'
}
