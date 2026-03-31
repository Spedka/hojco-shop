import { useEffect, useState } from 'react'
import { Package, FileText, DollarSign, AlertTriangle, } from 'lucide-react'
import './Dashboard.css'

interface Part {
  id: string
  partName: string
  make: string
  model: string
  year: string
  category: string
  quantity: number
  lowAt: number
  price: number
  partNo: string
}

interface Invoice {
  id: string
  invoiceNum: string
  customerName: string
  phone: string
  email: string
  year: string
  make: string
  model: string
  vin: string
  mileage: string
  workQuoted: string
  diagnosis: string
  notes: string
  laborHrs: number
  laborRate: number
  laborTotal: number
  partsCost: number
  date: string
}

interface Expense {
  id: string
  date: string
  description: string
  category: string
  amount: number
  notes: string
}

function load<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}

export default function Dashboard() {
  const [parts, setParts] = useState<Part[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])

  useEffect(() => {
    setParts(load<Part>('hojco_parts'))
    setInvoices(load<Invoice>('hojco_invoices'))
    setExpenses(load<Expense>('hojco_expenses'))
  }, [])

  const totalRevenue = invoices.reduce((s, i) => s + i.laborTotal + i.partsCost, 0)
  const lowStock = parts.filter(p => p.quantity <= (p.lowAt ?? 5))
  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthExpenses = expenses
    .filter(e => e.date.startsWith(thisMonth))
    .reduce((s, e) => s + e.amount, 0)

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div>
      <div className="page-title">Dashboard</div>
      <div className="page-sub">{today}</div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="alert alert-warn">
          <AlertTriangle size={16} />
          <strong>{lowStock.length} part{lowStock.length > 1 ? 's' : ''}</strong>&nbsp;
          at or below low-stock threshold —&nbsp;
          {lowStock.slice(0, 3).map(p => p.partName).join(', ')}
          {lowStock.length > 3 ? ` +${lowStock.length - 3} more` : ''}
        </div>
      )}

      {/* Stat cards */}
      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-icon accent"><Package size={18} /></div>
          <div className="stat-value">{parts.length}</div>
          <div className="stat-label">Part SKUs</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-icon accent"><FileText size={18} /></div>
          <div className="stat-value">{invoices.length}</div>
          <div className="stat-label">Total Invoices</div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon success"><DollarSign size={18} /></div>
          <div className="stat-value">${totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        {lowStock.length > 0 && (
          <div className="stat-card error">
            <div className="stat-icon error"><AlertTriangle size={18} /></div>
            <div className="stat-value">{lowStock.length}</div>
            <div className="stat-label">Low Stock Items</div>
          </div>
        )}
        <div className="stat-card warn">
          <div className="stat-icon warn"><DollarSign size={18} /></div>
          <div className="stat-value">${monthExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
          <div className="stat-label">Expenses This Month</div>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="dash-grid">

        {/* Recent invoices */}
        <div className="card">
          <div className="dash-card-title">Recent Invoices</div>
          {invoices.length === 0 ? (
            <p className="dash-empty">No invoices yet.</p>
          ) : (
            invoices.slice(0, 5).map(inv => (
              <div className="dash-row" key={inv.id}>
                <div className="dash-row-icon accent">
                  <FileText size={15} />
                </div>
                <div className="dash-row-info">
                  <div className="dash-row-name">{inv.customerName}</div>
                  <div className="dash-row-detail">{inv.year} {inv.make} {inv.model} · {inv.date}</div>
                </div>
                <div className="dash-row-amount">
                  ${(inv.laborTotal + inv.partsCost).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Low stock parts */}
        <div className="card">
          <div className="dash-card-title">Low Stock Parts</div>
          {lowStock.length === 0 ? (
            <p className="dash-empty">All parts sufficiently stocked ✓</p>
          ) : (
            lowStock.slice(0, 6).map(p => (
              <div className="dash-row" key={p.id}>
                <div className="dash-row-icon error">
                  <AlertTriangle size={15} />
                </div>
                <div className="dash-row-info">
                  <div className="dash-row-name">{p.partName}</div>
                  <div className="dash-row-detail">{p.make} {p.model} · {p.category}</div>
                </div>
                <div className="dash-row-amount error">
                  {p.quantity} left
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}