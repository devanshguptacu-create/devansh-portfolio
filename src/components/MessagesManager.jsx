import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const fmt = (d) => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
const mailTo = (m) => `mailto:${encodeURIComponent(m.email).replace('%40', '@')}?subject=${encodeURIComponent('Re: ' + m.subject)}`

export default function MessagesManager() {
  const [rows, setRows] = useState([])
  const [open, setOpen] = useState(null)
  const [filter, setFilter] = useState('all')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setErr('')
    const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
    if (error) setErr(error.message)
    else setRows(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function setRead(m, val) {
    const { error } = await supabase.from('messages').update({ is_read: val }).eq('id', m.id)
    if (error) return setErr(error.message)
    setRows((rs) => rs.map((r) => (r.id === m.id ? { ...r, is_read: val } : r)))
  }
  async function remove(m) {
    if (!window.confirm('Delete this message permanently?')) return
    const { error } = await supabase.from('messages').delete().eq('id', m.id)
    if (error) return setErr(error.message)
    setRows((rs) => rs.filter((r) => r.id !== m.id))
    if (open === m.id) setOpen(null)
  }
  function toggle(m) {
    const next = open === m.id ? null : m.id
    setOpen(next)
    if (next && !m.is_read) setRead(m, true)
  }

  const unread = rows.filter((r) => !r.is_read).length
  const shown = filter === 'unread' ? rows.filter((r) => !r.is_read) : rows

  return (
    <section className="admin-manager-section" id="messages">
      <div className="admin-section-heading">
        <div>
          <div className="admin-kicker">VISITOR MESSAGES</div>
          <h2>Messages inbox</h2>
          <p>Messages sent through your contact form appear here.</p>
        </div>
        <span className="admin-count">{unread} unread / {rows.length} total</span>
      </div>
      {err && <div className="admin-alert admin-alert-error">! {err}</div>}
      <div className="admin-panel admin-list-panel">
        <div className="admin-panel-heading">
          <h3>Inbox</h3>
          <span>
            <button type="button" className={'msg-tab' + (filter === 'all' ? ' on' : '')} onClick={() => setFilter('all')}>All</button>
            <button type="button" className={'msg-tab' + (filter === 'unread' ? ' on' : '')} onClick={() => setFilter('unread')}>Unread</button>
            <button type="button" className="msg-tab" onClick={load}>Refresh</button>
          </span>
        </div>
        <div className="admin-record-list">
          {loading && <p className="admin-empty">Loading messages...</p>}
          {!loading && shown.length === 0 && <p className="admin-empty">{filter === 'unread' ? 'No unread messages.' : 'No messages yet.'}</p>}
          {shown.map((m) => (
            <article className={'admin-record msg-row' + (m.is_read ? '' : ' unread')} key={m.id}>
              <div className="admin-record-body">
                <button type="button" className="msg-head" onClick={() => toggle(m)} aria-expanded={open === m.id}>
                  <strong>{!m.is_read && <i className="msg-dot" />}{m.subject}</strong>
                  <span>{m.name} &middot; {m.email} &middot; {fmt(m.created_at)}</span>
                </button>
                {open === m.id && <p className="msg-body">{m.message}</p>}
              </div>
              <div className="admin-record-actions">
                <a className="msg-link" href={mailTo(m)}>Reply</a>
                <button type="button" onClick={() => setRead(m, !m.is_read)}>{m.is_read ? 'Mark unread' : 'Mark read'}</button>
                <button type="button" className="danger" onClick={() => remove(m)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}