import { useState } from "react"

interface LoginProps {
  onLogin: (username: string, gradeLevel: number) => void
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("")
  const [gradeLevel, setGradeLevel] = useState(3)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) return
    
    setIsSubmitting(true)
    
    try {
      // Get or create client ID
      let clientId = localStorage.getItem('client_id')
      if (!clientId) {
        clientId = crypto.randomUUID()
        localStorage.setItem('client_id', clientId)
      }
      
      await onLogin(username, gradeLevel)
    } catch (error) {
      console.error("Error logging in:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome to Math Learning App</h2>
        <p>Please sign in to start learning</p>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="grade">Grade Level:</label>
            <select
              id="grade"
              value={gradeLevel}
              onChange={e => setGradeLevel(parseInt(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting || !username.trim()}
            className="login-btn"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}
