import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, FileText, DollarSign } from 'lucide-react'
import { useEffect, useState } from 'react'
import './Sidebar.css'

function getLowStockCount() {
  try {
    const parts = JSON.parse(localStorage.getItem('hojco_parts') || '[]')
    return parts.filter((p: any) => p.quantity <= (p.lowAt ?? 5)).length
  } catch { return 0 }
}

export default function Sidebar() {
  const [lowStock, setLowStock] = useState(0)

  useEffect(() => {
    setLowStock(getLowStockCount())
    const handler = () => setLowStock(getLowStockCount())
    window.addEventListener('hojco_parts_updated', handler)
    return () => window.removeEventListener('hojco_parts_updated', handler)
  }, [])

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-label">Overview</div>
        <NavLink to="/dashboard" end className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <LayoutDashboard size={16} />
          Dashboard
        </NavLink>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Operations</div>
        <NavLink to="/dashboard/inventory" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <Package size={16} />
          Parts Inventory
          {lowStock > 0 && <span className="nav-badge">{lowStock}</span>}
        </NavLink>
        <NavLink to="/dashboard/invoices" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <FileText size={16} />
          Invoices
        </NavLink>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Finance</div>
        <NavLink to="/dashboard/expenses" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <DollarSign size={16} />
          Expenses
        </NavLink>
      </div>
    </aside>
  )
}