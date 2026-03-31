import { useEffect, useState } from 'react'
import { Search, Plus, DollarSign, TrendingDown, Calendar, Hash } from 'lucide-react'
import Modal from '../components/Modal'
import './Expenses.css'

interface Expense {
  id: string
  date: string
  description: string
  category: string
  amount: number
  notes: string
}

const CATEGORIES = [
  'Parts & Supplies',
  'Tools & Equipment',
  'Utilities',
  'Rent / Lease',
  'Labor / Payroll',
  'Insurance',
  'Other'
]

function load(): Expense[] {
  try { return JSON.parse(localStorage.getItem('hojco_expenses') || '[]') } catch { return [] }
}
function save(expenses: Expense[]) {
  localStorage.setItem('hojco_expenses', JSON.stringify(expenses))
}

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  description: '',
  category: '',
  amount: '',
  notes: ''
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  useEffect(() => { setExpenses(load()) }, [])

  // Build month options from existing expenses
  const months = [...new Set(expenses.map(e => e.date.slice(0, 7)))]
    .sort()
    .reverse()

  const filtered = expenses.filter(e => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q)
    const matchCat = !filterCat || e.category === filterCat
    const matchMonth = !filterMonth || e.date.startsWith(filterMonth)
    return matchSearch && matchCat && matchMonth
  })

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date))

  // Stats
  const thisMonth = new Date().toISOString().slice(0, 7)
  const thisYear = new Date().getFullYear().toString()
  const filteredTotal = filtered.reduce((s, e) => s + e.amount, 0)
  const monthTotal = expenses
    .filter(e => e.date.startsWith(thisMonth))
    .reduce((s, e) => s + e.amount, 0)
  const ytdTotal = expenses
    .filter(e => e.date.startsWith(thisYear))
    .reduce((s, e) => s + e.amount, 0)

  function openAdd() {
    setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) })
    setFormError('')
    setModalOpen(true)
  }

  function handleSave() {
    if (!form.date || !form.description.trim() || !form.category) {
      setFormError('Date, description, and category are required.')
      return
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setFormError('Please enter a valid amount.')
      return
    }
    const newExpense: Expense = {
      id: Date.now().toString(),
      date: form.date,
      description: form.description.trim(),
      category: form.category,
      amount: parseFloat(form.amount),
      notes: form.notes.trim()
    }
    const updated = [newExpense, ...expenses]
    save(updated)
    setExpenses(updated)
    setModalOpen(false)
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this expense?')) return
    const updated = expenses.filter(e => e.id !== id)
    save(updated)
    setExpenses(updated)
  }

  const f = (field: keyof typeof emptyForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => { setForm(prev => ({ ...prev, [field]: e.target.value })); setFormError('') }

  function formatMonth(ym: string) {
    const [y, m] = ym.split('-')
    return new Date(parseInt(y), parseInt(m) - 1, 1)
      .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  function catColor(cat: string) {
    const map: Record<string, string> = {
      'Parts & Supplies':   'badge-accent',
      'Tools & Equipment':  'badge-success',
      'Utilities':          'badge-warn',
      'Rent / Lease':       'badge-error',
      'Labor / Payroll':    'badge-accent',
      'Insurance':          'badge-warn',
      'Other':              'badge-muted'
    }
    return map[cat] ?? 'badge-muted'
  }

  return (
    <div>
      <div className="page-title">Expenses</div>
      <div className="page-sub">Track shop spending and costs over time</div>

      {/* Stat cards */}
      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-icon accent"><DollarSign size={18} /></div>
          <div className="stat-value">
            ${filteredTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <div className="stat-label">
            {filterMonth || filterCat || search ? 'Filtered Total' : 'All Time'}
          </div>
        </div>
        <div className="stat-card warn">
          <div className="stat-icon warn"><Calendar size={18} /></div>
          <div className="stat-value">
            ${monthTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <div className="stat-label">This Month</div>
        </div>
        <div className="stat-card error">
          <div className="stat-icon error"><TrendingDown size={18} /></div>
          <div className="stat-value">
            ${ytdTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <div className="stat-label">Year to Date</div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon success"><Hash size={18} /></div>
          <div className="stat-value">{expenses.length}</div>
          <div className="stat-label">Total Entries</div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-wrap">
            <Search size={14} />
            <input
              className="search-input"
              placeholder="Search expenses…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select
            className="filter-select"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
          >
            <option value="">All Time</option>
            {months.map(m => (
              <option key={m} value={m}>{formatMonth(m)}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={15} /> Log Expense
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <DollarSign size={40} />
          <p>
            {expenses.length === 0
              ? 'No expenses logged yet. Start tracking your shop costs.'
              : 'No expenses match your filters.'}
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(e => (
                <tr key={e.id}>
                  <td>
                    <span className="exp-date">
                      {new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </span>
                  </td>
                  <td><strong>{e.description}</strong></td>
                  <td><span className={`badge ${catColor(e.category)}`}>{e.category}</span></td>
                  <td><span className="exp-amount">${e.amount.toFixed(2)}</span></td>
                  <td className="exp-notes-cell">{e.notes || <span className="no-value">—</span>}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(e.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log Expense"
        width="480px"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save Expense</button>
          </>
        }
      >
        <div className="form-grid">
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={form.date} onChange={f('date')} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              value={form.description}
              onChange={f('description')}
              placeholder="What was purchased or paid"
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={f('category')}>
              <option value="">Select…</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={f('amount')}
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              value={form.notes}
              onChange={f('notes')}
              rows={2}
              placeholder="Any extra details…"
            />
          </div>
        </div>
        {formError && (
          <div className="alert alert-error" style={{ marginTop: '16px' }}>{formError}</div>
        )}
      </Modal>
    </div>
  )
}