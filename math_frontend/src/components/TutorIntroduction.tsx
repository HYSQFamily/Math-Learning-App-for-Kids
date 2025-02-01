import { Bot, Sparkles } from "lucide-react"

export function TutorIntroduction() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <Bot className="w-8 h-8 text-blue-600" />
          <Sparkles className="absolute -bottom-1 -right-1 w-4 h-4 text-yellow-400" />
        </div>
        <h2 className="text-xl font-semibold text-blue-900">欢迎来到数学学习助手！</h2>
      </div>
      <p className="text-blue-800">
        我是你的智能数学助教，随时准备帮助你解决数学问题。让我们一起开始有趣的数学学习之旅吧！
      </p>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="bg-white/50 rounded-lg p-3">
          <h3 className="font-medium text-blue-900 mb-2">学习特点</h3>
          <ul className="space-y-1 text-blue-800">
            <li>• 个性化学习进度</li>
            <li>• 实时答疑解惑</li>
            <li>• 趣味性练习题</li>
            <li>• 知识点掌握追踪</li>
          </ul>
        </div>
        <div className="bg-white/50 rounded-lg p-3">
          <h3 className="font-medium text-blue-900 mb-2">学习建议</h3>
          <ul className="space-y-1 text-blue-800">
            <li>• 每天坚持练习</li>
            <li>• 遇到不懂就问</li>
            <li>• 认真思考后再答题</li>
            <li>• 复习错题加深理解</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
