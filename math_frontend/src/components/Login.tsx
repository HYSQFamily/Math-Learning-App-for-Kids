import { useState } from "react"

interface LoginProps {
  onLogin: (username: string, gradeLevel: number) => Promise<void>
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("")
  const [gradeLevel, setGradeLevel] = useState(3)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) {
      setError('请输入用户名')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Get or create client ID
      let clientId = localStorage.getItem('client_id')
      if (!clientId) {
        clientId = crypto.randomUUID()
        localStorage.setItem('client_id', clientId)
      }
      
      await onLogin(username, gradeLevel)
    } catch (error: any) {
      console.error("Error logging in:", error)
      
      // Improved error message for CORS errors
      if (error.message && (
        error.message.includes('NetworkError') || 
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed') ||
        error.message.includes('CORS')
      )) {
        setError('无法连接到服务器，正在使用离线模式')
        // Proceed with fallback login after a short delay
        setTimeout(() => {
          onLogin(username, gradeLevel).catch(e => {
            console.error("Fallback login failed:", e)
          })
        }, 1000)
      } else {
        setError(error.message || '登录失败，请重试')
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Welcome to Math Learning App</h2>
      <p className="mb-4 text-center">Please sign in to start learning</p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block mb-1">
            Username:
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="gradeLevel" className="block mb-1">
            Grade Level:
          </label>
          <select
            id="gradeLevel"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            <option value={1}>Grade 1</option>
            <option value={2}>Grade 2</option>
            <option value={3}>Grade 3</option>
            <option value={4}>Grade 4</option>
            <option value={5}>Grade 5</option>
            <option value={6}>Grade 6</option>
          </select>
        </div>
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
