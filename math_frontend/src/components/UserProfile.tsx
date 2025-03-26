import { User, Progress } from '../types'

interface UserProfileProps {
  user: User
  progress: Progress | null
  onLogout?: () => void
}

export function UserProfile({ user, progress, onLogout }: UserProfileProps) {
  // Ensure we have valid values with fallbacks
  const displayName = user.username || 'Guest'
  const displayPoints = user.points || 0
  const displayStreak = user.streak_days || 0
  
  return (
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <p className="font-medium">{displayName}</p>
        <p className="text-sm text-gray-500">
          <span className="text-yellow-500">{displayPoints} 分</span> | 
          <span className="text-green-500 ml-1">{displayStreak} 天连续</span>
        </p>
      </div>
      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
        {displayName.charAt(0).toUpperCase()}
      </div>
      
      {onLogout && (
        <button 
          onClick={onLogout}
          className="text-sm text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
        >
          退出
        </button>
      )}
    </div>
  )
}
