import { useEffect, useState } from 'react'
import { Search, Plus, Eye, Printer, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'
import './Invoices.css'

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

function load(): Invoice[] {
  try { return JSON.parse(localStorage.getItem('hojco_invoices') || '[]') } catch { return [] }
}
function save(invoices: Invoice[]) {
  localStorage.setItem('hojco_invoices', JSON.stringify(invoices))
}

const emptyForm = {
  customerName: '', phone: '', email: '',
  year: '', make: '', model: '', vin: '', mileage: '',
  workQuoted: '', diagnosis: '', notes: '',
  laborHrs: '', laborRate: '', partsCost: ''
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  useEffect(() => { setInvoices(load()) }, [])

  const filtered = invoices.filter(i => {
    const q = search.toLowerCase()
    return !q ||
      i.customerName.toLowerCase().includes(q) ||
      i.make.toLowerCase().includes(q) ||
      i.model.toLowerCase().includes(q) ||
      (i.invoiceNum || '').toLowerCase().includes(q)
  })

  const laborTotal = (parseFloat(form.laborHrs) || 0) * (parseFloat(form.laborRate) || 0)
  const estimatedTotal = laborTotal + (parseFloat(form.partsCost) || 0)

  function openAdd() {
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  function handleSave() {
    if (!form.customerName.trim() || !form.make.trim() || !form.model.trim()) {
      setFormError('Customer name, make, and model are required.')
      return
    }
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      invoiceNum: 'INV-' + String(invoices.length + 1).padStart(4, '0'),
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      year: form.year.trim(),
      make: form.make.trim(),
      model: form.model.trim(),
      vin: form.vin.trim(),
      mileage: form.mileage.trim(),
      workQuoted: form.workQuoted.trim(),
      diagnosis: form.diagnosis.trim(),
      notes: form.notes.trim(),
      laborHrs: parseFloat(form.laborHrs) || 0,
      laborRate: parseFloat(form.laborRate) || 0,
      laborTotal,
      partsCost: parseFloat(form.partsCost) || 0,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      })
    }
    const updated = [newInvoice, ...invoices]
    save(updated)
    setInvoices(updated)
    setModalOpen(false)
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this invoice? This cannot be undone.')) return
    const updated = invoices.filter(i => i.id !== id)
    save(updated)
    setInvoices(updated)
  }

  function handlePrint(inv: Invoice) {
    const total = inv.laborTotal + inv.partsCost
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${inv.invoiceNum} — ${inv.customerName}</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'DM Sans', sans-serif; color: #111; padding: 48px; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
          .brand { font-size: 24px; font-weight: 800; color: #1a1a2e; }
          .brand-sub { font-size: 11px; color: #888; margin-top: 2px; text-transform: uppercase; letter-spacing: 1px; }
          .inv-meta { text-align: right; }
          .inv-num { font-size: 16px; font-weight: 700; color: #6c63ff; }
          .inv-date { font-size: 12px; color: #888; margin-top: 2px; }
          hr { border: none; border-top: 2px solid #eee; margin: 24px 0; }
          .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #6c63ff; margin-bottom: 10px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 24px; }
          .grid-3 { grid-template-columns: 1fr 1fr 1fr; }
          .field .lbl { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; }
          .field .val { font-size: 14px; font-weight: 500; margin-top: 2px; }
          .text-block { font-size: 13px; line-height: 1.6; white-space: pre-wrap; margin-bottom: 20px; }
          .notes-block { background: #f8f8ff; border-left: 3px solid #6c63ff; padding: 12px 16px; border-radius: 4px; font-size: 13px; line-height: 1.6; margin-bottom: 20px; }
          .charges table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .charges th { background: #f4f4f8; padding: 9px 12px; text-align: left; font-size: 11px; color: #888; text-transform: uppercase; }
          .charges td { padding: 10px 12px; border-bottom: 1px solid #eee; }
          .total-box { display: flex; justify-content: flex-end; margin-top: 16px; }
          .total-inner { border: 2px solid #6c63ff; border-radius: 10px; padding: 14px 22px; text-align: right; }
          .total-lbl { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
          .total-amt { font-size: 28px; font-weight: 800; color: #6c63ff; }
          .footer { text-align: center; font-size: 11px; color: #aaa; margin-top: 48px; }
          @media print { body { padding: 32px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">Hojco Auto Shop</div>
            <div class="brand-sub">Professional Automotive Services</div>
          </div>
          <div class="inv-meta">
            <div class="inv-num">${inv.invoiceNum}</div>
            <div class="inv-date">${inv.date}</div>
          </div>
        </div>
        <hr />
        <div class="section-title">Customer</div>
        <div class="grid">
          <div class="field"><div class="lbl">Name</div><div class="val">${inv.customerName}</div></div>
          ${inv.phone ? `<div class="field"><div class="lbl">Phone</div><div class="val">${inv.phone}</div></div>` : ''}
          ${inv.email ? `<div class="field"><div class="lbl">Email</div><div class="val">${inv.email}</div></div>` : ''}
        </div>
        <div class="section-title">Vehicle</div>
        <div class="grid grid-3">
          <div class="field"><div class="lbl">Year</div><div class="val">${inv.year || '—'}</div></div>
          <div class="field"><div class="lbl">Make</div><div class="val">${inv.make}</div></div>
          <div class="field"><div class="lbl">Model</div><div class="val">${inv.model}</div></div>
          ${inv.vin ? `<div class="field" style="grid-column:span 2"><div class="lbl">VIN</div><div class="val" style="font-family:monospace">${inv.vin}</div></div>` : ''}
          ${inv.mileage ? `<div class="field"><div class="lbl">Mileage</div><div class="val">${inv.mileage}</div></div>` : ''}
        </div>
        ${inv.workQuoted ? `<div class="section-title">Work Performed / Quoted</div><div class="text-block">${inv.workQuoted}</div>` : ''}
        ${inv.diagnosis ? `<div class="section-title">Diagnosis</div><div class="text-block">${inv.diagnosis}</div>` : ''}
        ${inv.notes ? `<div class="section-title">Recommendations</div><div class="notes-block">${inv.notes}</div>` : ''}
        <div class="section-title">Charges</div>
        <div class="charges">
          <table>
            <thead><tr><th>Description</th><th>Amount</th></tr></thead>
            <tbody>
              <tr><td>Labor — ${inv.laborHrs} hrs @ $${inv.laborRate}/hr</td><td>$${inv.laborTotal.toFixed(2)}</td></tr>
              <tr><td>Parts &amp; Materials</td><td>$${inv.partsCost.toFixed(2)}</td></tr>
            </tbody>
          </table>
          <div class="total-box">
            <div class="total-inner">
              <div class="total-lbl">Total Due</div>
              <div class="total-amt">$${total.toFixed(2)}</div>
            </div>
          </div>
        </div>
        <div class="footer">Thank you for your business! — Hojco Auto Shop</div>
        <script>window.onload = () => { window.print() }<\/script>
      </body>
      </html>
    `)
    win.document.close()
  }

  const f = (field: keyof typeof emptyForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => { setForm(prev => ({ ...prev, [field]: e.target.value })); setFormError('') }

  return (
    <div>
      <div className="page-title">Service Invoices</div>
      <div className="page-sub">Create, manage, and print service records</div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-wrap">
            <Search size={14} />
            <input
              className="search-input"
              placeholder="Search customer or vehicle…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={15} /> New Invoice
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Eye size={40} />
          <p>{invoices.length === 0 ? 'No invoices yet. Create your first service invoice.' : 'No invoices match your search.'}</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Work Summary</th>
                <th>Labor</th>
                <th>Parts</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => {
                const total = inv.laborTotal + inv.partsCost
                return (
                  <tr key={inv.id}>
                    <td><span className="inv-num-cell">{inv.invoiceNum}</span></td>
                    <td className="inv-date-cell">{inv.date}</td>
                    <td>
                      <strong>{inv.customerName}</strong>
                      {inv.phone && <div className="inv-sub">{inv.phone}</div>}
                    </td>
                    <td>
                      {inv.year} {inv.make} {inv.model}
                      {inv.mileage && <div className="inv-sub">{inv.mileage} mi</div>}
                    </td>
                    <td className="inv-work-cell">{inv.workQuoted || '—'}</td>
                    <td>${inv.laborTotal.toFixed(2)}</td>
                    <td>${inv.partsCost.toFixed(2)}</td>
                    <td><strong className="inv-total">${total.toFixed(2)}</strong></td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => setViewInvoice(inv)}>
                          <Eye size={13} /> View
                        </button>
                        <button className="btn btn-warn btn-sm" onClick={() => handlePrint(inv)}>
                          <Printer size={13} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(inv.id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* New Invoice Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Service Invoice"
        width="700px"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Create Invoice</button>
          </>
        }
      >
        <div className="inv-form-section">Customer Information</div>
        <div className="form-grid cols-2">
          <div className="form-group">
            <label>Customer Name</label>
            <input value={form.customerName} onChange={f('customerName')} placeholder="Full name" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={form.phone} onChange={f('phone')} placeholder="(555) 000-0000" />
          </div>
          <div className="form-group col-span-2">
            <label>Email</label>
            <input type="email" value={form.email} onChange={f('email')} placeholder="customer@email.com" />
          </div>
        </div>

        <div className="inv-form-section">Vehicle Information</div>
        <div className="form-grid cols-3">
          <div className="form-group">
            <label>Year</label>
            <input value={form.year} onChange={f('year')} placeholder="2019" />
          </div>
          <div className="form-group">
            <label>Make</label>
            <input value={form.make} onChange={f('make')} placeholder="Toyota" />
          </div>
          <div className="form-group">
            <label>Model</label>
            <input value={form.model} onChange={f('model')} placeholder="Camry" />
          </div>
          <div className="form-group col-span-2">
            <label>VIN (Optional)</label>
            <input value={form.vin} onChange={f('vin')} placeholder="17-character VIN" />
          </div>
          <div className="form-group">
            <label>Mileage</label>
            <input value={form.mileage} onChange={f('mileage')} placeholder="85,000" />
          </div>
        </div>

        <div className="inv-form-section">Service Details</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Work Performed / Quoted</label>
            <textarea value={form.workQuoted} onChange={f('workQuoted')} rows={3} placeholder="Describe the work done or quoted…" />
          </div>
          <div className="form-group">
            <label>Diagnosis</label>
            <textarea value={form.diagnosis} onChange={f('diagnosis')} rows={3} placeholder="Diagnostic findings…" />
          </div>
          <div className="form-group">
            <label>Recommended Repairs / Notes</label>
            <textarea value={form.notes} onChange={f('notes')} rows={3} placeholder="Additional recommendations…" />
          </div>
        </div>

        <div className="inv-form-section">Charges</div>
        <div className="form-grid cols-3">
          <div className="form-group">
            <label>Labor Hours</label>
            <input type="number" min="0" step="0.5" value={form.laborHrs} onChange={f('laborHrs')} placeholder="0" />
          </div>
          <div className="form-group">
            <label>Labor Rate ($/hr)</label>
            <input type="number" min="0" value={form.laborRate} onChange={f('laborRate')} placeholder="85" />
          </div>
          <div className="form-group">
            <label>Parts Cost ($)</label>
            <input type="number" min="0" step="0.01" value={form.partsCost} onChange={f('partsCost')} placeholder="0.00" />
          </div>
        </div>

        <div className="inv-total-preview">
          <span className="inv-total-label">Estimated Total</span>
          <span className="inv-total-value">${estimatedTotal.toFixed(2)}</span>
        </div>

        {formError && (
          <div className="alert alert-error" style={{ marginTop: '16px' }}>{formError}</div>
        )}
      </Modal>

      {/* View Invoice Modal */}
      <Modal
        open={!!viewInvoice}
        onClose={() => setViewInvoice(null)}
        title="Invoice Details"
        width="660px"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setViewInvoice(null)}>Close</button>
            <button className="btn btn-warn" onClick={() => viewInvoice && handlePrint(viewInvoice)}>
              <Printer size={14} /> Print / PDF
            </button>
          </>
        }
      >
        {viewInvoice && (
          <div className="inv-view">
            <div className="inv-view-header">
              <div>
                <div className="inv-view-customer">{viewInvoice.customerName}</div>
                {viewInvoice.phone && <div className="inv-view-contact">{viewInvoice.phone}</div>}
                {viewInvoice.email && <div className="inv-view-contact">{viewInvoice.email}</div>}
              </div>
              <div className="inv-view-meta">
                <div className="inv-view-num">{viewInvoice.invoiceNum}</div>
                <div className="inv-view-date">{viewInvoice.date}</div>
              </div>
            </div>

            <div className="inv-view-vehicle">
              <div className="inv-view-section-title">Vehicle</div>
              <div className="inv-view-grid-3">
                <div className="inv-view-field">
                  <div className="inv-view-lbl">Year</div>
                  <div className="inv-view-val">{viewInvoice.year || '—'}</div>
                </div>
                <div className="inv-view-field">
                  <div className="inv-view-lbl">Make</div>
                  <div className="inv-view-val">{viewInvoice.make}</div>
                </div>
                <div className="inv-view-field">
                  <div className="inv-view-lbl">Model</div>
                  <div className="inv-view-val">{viewInvoice.model}</div>
                </div>
                {viewInvoice.vin && (
                  <div className="inv-view-field" style={{ gridColumn: 'span 2' }}>
                    <div className="inv-view-lbl">VIN</div>
                    <div className="inv-view-val mono">{viewInvoice.vin}</div>
                  </div>
                )}
                {viewInvoice.mileage && (
                  <div className="inv-view-field">
                    <div className="inv-view-lbl">Mileage</div>
                    <div className="inv-view-val">{viewInvoice.mileage}</div>
                  </div>
                )}
              </div>
            </div>

            {viewInvoice.workQuoted && (
              <div className="inv-view-block">
                <div className="inv-view-section-title">Work Performed / Quoted</div>
                <p className="inv-view-text">{viewInvoice.workQuoted}</p>
              </div>
            )}
            {viewInvoice.diagnosis && (
              <div className="inv-view-block">
                <div className="inv-view-section-title">Diagnosis</div>
                <p className="inv-view-text">{viewInvoice.diagnosis}</p>
              </div>
            )}
            {viewInvoice.notes && (
              <div className="inv-view-block">
                <div className="inv-view-section-title">Recommendations</div>
                <p className="inv-view-text">{viewInvoice.notes}</p>
              </div>
            )}

            <div className="inv-view-charges">
              <div className="inv-view-charge-row">
                <span>Labor — {viewInvoice.laborHrs} hrs @ ${viewInvoice.laborRate}/hr</span>
                <span>${viewInvoice.laborTotal.toFixed(2)}</span>
              </div>
              <div className="inv-view-charge-row">
                <span>Parts &amp; Materials</span>
                <span>${viewInvoice.partsCost.toFixed(2)}</span>
              </div>
              <div className="inv-view-total-row">
                <span>Total</span>
                <span>${(viewInvoice.laborTotal + viewInvoice.partsCost).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}