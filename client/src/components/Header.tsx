import { useNavigate } from 'react-router-dom'
import { Wrench, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import './Header.css'

export default function Header() {
  const navigate = useNavigate()
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(
        now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
        '  ' +
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      )
    }
    update()
    const interval = setInterval(update, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('hojco_token')
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-left">
        <Wrench size={20} className="header-icon" />
        <span className="header-brand">Hojco Auto Shop</span>
      </div>
      <div className="header-right">
        <span className="header-clock">{time}</span>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </header>
  )
}