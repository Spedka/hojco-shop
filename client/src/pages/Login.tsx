import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wrench } from 'lucide-react'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const res = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed.')
        setPassword('')
        return
      }

      localStorage.setItem('hojco_token', data.token)
      navigate('/dashboard')
    } catch {
      setError('Could not reach the server. Make sure it is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-inner">
          <div className="brand">
            <Wrench size={28} className="brand-icon" />
            <div>
              <div className="brand-name">Hojco</div>
              <div className="brand-sub">Auto Shop Manager</div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <h2 className="login-box-title">Sign in</h2>
          <p className="login-box-sub">Enter your credentials to continue</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError('') }}
                placeholder="Enter username"
                autoComplete="username"
                autoFocus
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}