// Fallback data for when the backend is unavailable
export const fallbackProblems = [
  {
    id: "fallback-1",
    question: "5 + 7 = ?",
    answer: 12,
    knowledge_point: "addition",
    difficulty: 1,
    created_at: new Date().toISOString(),
    hints: ["Count 5 and then add 7 more", "You can also think of it as 7 + 5"]
  },
  {
    id: "fallback-2",
    question: "15 - 8 = ?",
    answer: 7,
    knowledge_point: "subtraction",
    difficulty: 2,
    created_at: new Date().toISOString(),
    hints: ["Start with 15 and count down 8", "Think of how much you need to add to 8 to get 15"]
  },
  {
    id: "fallback-3",
    question: "6 × 4 = ?",
    answer: 24,
    knowledge_point: "multiplication",
    difficulty: 3,
    created_at: new Date().toISOString(),
    hints: ["Add 6 four times", "Think of 4 groups of 6 items"]
  },
  {
    id: "fallback-4",
    question: "20 ÷ 5 = ?",
    answer: 4,
    knowledge_point: "division",
    difficulty: 2,
    created_at: new Date().toISOString(),
    hints: ["How many groups of 5 can you make from 20?", "If you share 20 items equally among 5 people, how many does each person get?"]
  },
  {
    id: "fallback-5",
    question: "9 + 8 = ?",
    answer: 17,
    knowledge_point: "addition",
    difficulty: 1,
    created_at: new Date().toISOString(),
    hints: ["Add 9 + 1 to get 10, then add 7 more", "Think of it as 10 + 7"]
  },
  {
    id: "fallback-6",
    question: "24 - 9 = ?",
    answer: 15,
    knowledge_point: "subtraction",
    difficulty: 2,
    created_at: new Date().toISOString(),
    hints: ["First subtract 4 to get 20, then subtract 5 more", "Think of it as 24 - 10 + 1"]
  },
  {
    id: "fallback-7",
    question: "7 × 8 = ?",
    answer: 56,
    knowledge_point: "multiplication",
    difficulty: 3,
    created_at: new Date().toISOString(),
    hints: ["Think of 7 groups of 8", "You can also think of it as 7 × 4 × 2 = 28 × 2 = 56"]
  },
  {
    id: "fallback-8",
    question: "小明有12个苹果，他给了小红3个，又给了小刚2个，他还剩下几个苹果？",
    answer: 7,
    knowledge_point: "subtraction",
    difficulty: 2,
    created_at: new Date().toISOString(),
    hints: ["小明总共给出了多少个苹果？", "用总数减去给出的苹果数"]
  },
  {
    id: "fallback-9",
    question: "一个长方形的长是8厘米，宽是5厘米，它的面积是多少平方厘米？",
    answer: 40,
    knowledge_point: "multiplication",
    difficulty: 2,
    created_at: new Date().toISOString(),
    hints: ["长方形的面积 = 长 × 宽", "计算 8 × 5"]
  },
  {
    id: "fallback-10",
    question: "小丽有36颗糖果，她想平均分给9个小朋友，每个小朋友可以得到几颗糖果？",
    answer: 4,
    knowledge_point: "division",
    difficulty: 2,
    created_at: new Date().toISOString(),
    hints: ["使用除法：总数 ÷ 人数", "计算 36 ÷ 9"]
  }
];

export const fallbackUser = {
  id: "default-user",
  username: "DefaultUser",
  grade_level: 3,
  points: 0,
  streak_days: 0
};

export const fallbackProgress = {
  points: 0,
  streak_days: 0,
  mastery_levels: {
    addition: 0.0,
    subtraction: 0.0,
    multiplication: 0.0
  },
  achievements: []
};

export const fallbackAttemptResult = {
  is_correct: false,
  message: "无法连接到服务器，请稍后再试。",
  need_extra_help: false
};

export const fallbackTutorResponse = {
  answer: "抱歉，AI助手暂时无法回答，请稍后再试。",
  model: "fallback"
};
