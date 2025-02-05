import { Trophy } from "lucide-react"
import { Achievement } from "../lib/api"

interface AchievementsDisplayProps {
  points: number
  achievements: Achievement[]
}

export function AchievementsDisplay({ achievements }: AchievementsDisplayProps) {
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="font-medium">成就系统</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-yellow-100">
                <span className="text-lg">{achievement.icon}</span>
              </div>
              <div>
                <h4 className="font-medium text-sm">{achievement.name}</h4>
                <p className="text-xs text-gray-600">{achievement.description}</p>
                <p className="text-xs text-yellow-600 mt-1">
                  +{achievement.points_reward} 积分
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
