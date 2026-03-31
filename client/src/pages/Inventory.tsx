import { useEffect, useState } from 'react'
import { Search, Plus, AlertTriangle, Package } from 'lucide-react'
import Modal from '../components/Modal'
import './Inventory.css'


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

const CATEGORIES = [
  'Brakes', 'Engine', 'Suspension', 'Transmission',
  'Interior', 'Body', 'Electrical', 'Exhaust', 'Cooling', 'Other'
]

function load(): Part[] {
  try { return JSON.parse(localStorage.getItem('hojco_parts') || '[]') } catch { return [] }
}
function save(parts: Part[]) {
  localStorage.setItem('hojco_parts', JSON.stringify(parts))
  window.dispatchEvent(new Event('hojco_parts_updated'))
}

const emptyForm = {
  partName: '', make: '', model: '', year: '',
  category: '', quantity: '', lowAt: '5', price: '', partNo: ''
}

export default function Inventory() {
  const [parts, setParts] = useState<Part[]>([])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterStock, setFilterStock] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  useEffect(() => { setParts(load()) }, [])

  const filtered = parts.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.partName.toLowerCase().includes(q) ||
      p.make.toLowerCase().includes(q) || p.model.toLowerCase().includes(q) ||
      p.partNo.toLowerCase().includes(q)
    const matchCat = !filterCat || p.category === filterCat
    const matchStock =
      !filterStock ||
      (filterStock === 'low' && p.quantity <= (p.lowAt ?? 5) && p.quantity > 0) ||
      (filterStock === 'out' && p.quantity === 0)
    return matchSearch && matchCat && matchStock
  })

  const lowStockParts = parts.filter(p => p.quantity <= (p.lowAt ?? 5))

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(p: Part) {
    setEditingId(p.id)
    setForm({
      partName: p.partName, make: p.make, model: p.model, year: p.year,
      category: p.category, quantity: String(p.quantity), lowAt: String(p.lowAt ?? 5),
      price: String(p.price), partNo: p.partNo ?? ''
    })
    setFormError('')
    setModalOpen(true)
  }

  function handleSave() {
    if (!form.partName.trim() || !form.category) {
      setFormError('Part name and category are required.')
      return
    }
    const updated = editingId
      ? parts.map(p => p.id === editingId ? {
          ...p,
          partName: form.partName.trim(),
          make: form.make.trim(),
          model: form.model.trim(),
          year: form.year.trim(),
          category: form.category,
          quantity: parseInt(form.quantity) || 0,
          lowAt: parseInt(form.lowAt) || 5,
          price: parseFloat(form.price) || 0,
          partNo: form.partNo.trim()
        } : p)
      : [...parts, {
          id: Date.now().toString(),
          partName: form.partName.trim(),
          make: form.make.trim(),
          model: form.model.trim(),
          year: form.year.trim(),
          category: form.category,
          quantity: parseInt(form.quantity) || 0,
          lowAt: parseInt(form.lowAt) || 5,
          price: parseFloat(form.price) || 0,
          partNo: form.partNo.trim()
        }]
    save(updated)
    setParts(updated)
    setModalOpen(false)
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this part?')) return
    const updated = parts.filter(p => p.id !== id)
    save(updated)
    setParts(updated)
  }

  const f = (field: keyof typeof emptyForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => { setForm(prev => ({ ...prev, [field]: e.target.value })); setFormError('') }

  return (
    <div>
      <div className="page-title">Parts Inventory</div>
      <div className="page-sub">Track parts, quantities, and pricing</div>

      {lowStockParts.length > 0 && (
        <div className="alert alert-warn">
          <AlertTriangle size={16} />
          <strong>{lowStockParts.length} part{lowStockParts.length > 1 ? 's' : ''}</strong>
          &nbsp;at or below low-stock threshold:&nbsp;
          {lowStockParts.slice(0, 3).map(p => p.partName).join(', ')}
          {lowStockParts.length > 3 ? ` +${lowStockParts.length - 3} more` : ''}
        </div>
      )}

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-wrap">
            <Search size={14} />
            <input
              className="search-input"
              placeholder="Search parts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="filter-select" value={filterStock} onChange={e => setFilterStock(e.target.value)}>
            <option value="">All Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={15} /> Add Part
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Package size={40} />
          <p>{parts.length === 0 ? "No parts yet. Add your first part to get started." : "No parts match your filters."}</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Part Name</th>
                <th>Part No.</th>
                <th>Vehicle</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const isOut = p.quantity === 0
                const isLow = p.quantity <= (p.lowAt ?? 5)
                return (
                  <tr key={p.id}>
                    <td><strong>{p.partName}</strong></td>
                    <td>
                      {p.partNo
                        ? <span className="part-no">{p.partNo}</span>
                        : <span className="no-value">—</span>}
                    </td>
                    <td>{p.year} {p.make} {p.model}</td>
                    <td><span className="badge badge-accent">{p.category}</span></td>
                    <td>
                      <span className={isOut ? 'qty-out' : isLow ? 'qty-low' : 'qty-ok'}>
                        {p.quantity}
                        {isOut && <span className="qty-tag">OUT</span>}
                        {!isOut && isLow && <span className="qty-tag">LOW</span>}
                      </span>
                    </td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>${(p.quantity * p.price).toFixed(2)}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Part' : 'Add New Part'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>
              {editingId ? 'Save Changes' : 'Add Part'}
            </button>
          </>
        }
      >
        <div className="form-grid cols-2">
          <div className="form-group col-span-2">
            <label>Part Name</label>
            <input value={form.partName} onChange={f('partName')} placeholder="e.g. Front Brake Pad Set" />
          </div>
          <div className="form-group">
            <label>Part Number</label>
            <input value={form.partNo} onChange={f('partNo')} placeholder="e.g. BP-8841" />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={f('category')}>
              <option value="">Select…</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Make</label>
            <input value={form.make} onChange={f('make')} placeholder="e.g. Toyota" />
          </div>
          <div className="form-group">
            <label>Model</label>
            <input value={form.model} onChange={f('model')} placeholder="e.g. Camry" />
          </div>
          <div className="form-group">
            <label>Year</label>
            <input value={form.year} onChange={f('year')} placeholder="e.g. 2019" />
          </div>
          <div className="form-group">
            <label>Unit Price ($)</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={f('price')} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input type="number" min="0" value={form.quantity} onChange={f('quantity')} placeholder="0" />
          </div>
          <div className="form-group">
            <label>Low Stock Alert At</label>
            <input type="number" min="0" value={form.lowAt} onChange={f('lowAt')} placeholder="5" />
          </div>
        </div>
        {formError && <div className="alert alert-error" style={{ marginTop: '16px' }}>{formError}</div>}
      </Modal>
    </div>
  )
}