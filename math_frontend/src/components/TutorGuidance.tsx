import { useState } from "react"
import { Button } from "./ui/button"
import type { Problem } from "../types"

interface TutorGuidanceProps {
  problem: Problem
}

export function TutorGuidance({ problem }: TutorGuidanceProps) {
  const [expanded, setExpanded] = useState(false)

  const divisionTips = [
    "1. 用生活中的例子解释：比如分糖果、分玩具等",
    "2. 画图解释：把数量画出来，再分成几份",
    "3. 先从简单数字开始练习",
    "4. 强调除法和乘法的关系",
    "5. 鼓励孩子说出思考过程"
  ]

  const commonMistakes = [
    "混淆除数和被除数",
    "不理解余数的概念",
    "计算步骤顺序错误"
  ]

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">家长/老师指导建议</h3>
        <Button
          variant="ghost"
          onClick={() => setExpanded(!expanded)}
          className="text-sm"
        >
          {expanded ? "收起" : "展开"}
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">教学建议</h4>
            <ul className="list-none space-y-2">
              {divisionTips.map((tip, index) => (
                <li key={index} className="text-gray-600">{tip}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">常见错误</h4>
            <ul className="list-disc list-inside space-y-1">
              {commonMistakes.map((mistake, index) => (
                <li key={index} className="text-gray-600">{mistake}</li>
              ))}
            </ul>
          </div>

          {problem.knowledge_point.includes("除法") && (
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-blue-700 text-sm">
                💡 提示：这道题涉及除法概念，可以先让孩子说说生活中遇到过哪些需要平均分配的情况
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
