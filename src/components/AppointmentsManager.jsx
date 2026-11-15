import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const STATUSES = ['Pending', 'Confirmed', 'Declined', 'Completed']
const fmtDay = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { dateStyle: 'medium' })

export default function AppointmentsManager() {
  const [rows, setRows] = useState([])
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setErr('')
    const { data, error } = await supabase.from('appointments').select('*').order('preferred_date', { ascending: true })
    if (error) setErr(error.message); else setRows(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function setStatus(a, status) {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', a.id)
    if (error) return setErr(error.message)
    setRows((rs) => rs.map((r) => (r.id === a.id ? { ...r, status } : r)))
  }
  async function remove(a) {
    if (!window.confirm('Delete this appointment request permanently?')) return
    const { error } = await supabase.from('appointments').delete().eq('id', a.id)
    if (error) return setErr(error.message)
    setRows((rs) => rs.filter((r) => r.id !== a.id))
  }
  const mail = (a) => `mailto:${encodeURIComponent(a.email).replace('%40', '@')}?subject=${encodeURIComponent('Your call request: ' + a.topic)}`
  const pending = rows.filter((r) => r.status === 'Pending').length

  return (
    <section className="admin-manager-section" id="appointments">
      <div className="admin-section-heading">
        <div>
          <div className="admin-kicker">BOOKINGS</div>
          <h2>Appointments</h2>
          <p>Call requests from your portfolio. Confirm the final time by email or phone.</p>
        </div>
        <span className="admin-count">{pending} pending / {rows.length} total</span>
      </div>
      {err && <div className="admin-alert admin-alert-error">! {err}</div>}
      <div className="admin-panel admin-list-panel">
        <div className="admin-panel-heading"><h3>Requests</h3><button type="button" className="admin-refresh" onClick={load}>Refresh</button></div>
        <div className="admin-record-list">
          {loading && <p className="admin-empty">Loading...</p>}
          {!loading && rows.length === 0 && <p className="admin-empty">No appointment requests yet.</p>}
          {rows.map((a) => (
            <article className={'admin-record msg-row' + (a.status === 'Pending' ? ' unread' : '')} key={a.id}>
              <div className="admin-record-body">
                <strong>{a.topic}</strong>
                <p>{fmtDay(a.preferred_date)} &middot; {a.time_slot} &middot; {a.mode}</p>
                <p>{a.name} &middot; {a.email}{a.phone ? ' · ' + a.phone : ''}</p>
                {a.note && <p className="msg-body">{a.note}</p>}
              </div>
              <div className="admin-record-actions">
                <select value={a.status} onChange={(e) => setStatus(a, e.target.value)} aria-label="Status">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                <a className="msg-link" href={mail(a)}>Reply</a>
                {a.phone && <a className="msg-link" href={`tel:${a.phone.replace(/[^\d+]/g, '')}`}>Call</a>}
                <button type="button" className="danger" onClick={() => remove(a)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}