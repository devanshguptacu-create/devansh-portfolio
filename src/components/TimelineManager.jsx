import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { TYPES, STATUSES, DEFAULTS, sanitize } from '../data/timeline.js'

const blank = { type: 'Project', title: '', org: '', date: '', description: '', link: '', status: 'Completed' }
const newId = () => (window.crypto?.randomUUID ? window.crypto.randomUUID() : 'i' + Date.now() + Math.random().toString(16).slice(2))

export default function TimelineManager() {
  const [items, setItems] = useState(sanitize(DEFAULTS))
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'timeline').maybeSingle()
      .then(({ data }) => { if (data && Array.isArray(data.value?.items)) setItems(sanitize(data.value.items)) })
  }, [])

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const change = (next) => { setItems(next); setDirty(true); setOk('') }

  function submit(e) {
    e.preventDefault()
    setErr('')
    if (!form.title.trim()) return setErr('Title is required.')
    if (form.link.trim() && !/^https?:\/\/\S+$/i.test(form.link.trim())) return setErr('Link must start with https://')
    if (!editing && items.length >= 30) return setErr('You can keep at most 30 items.')
    const clean = { ...form, title: form.title.trim(), org: form.org.trim(), date: form.date.trim(), description: form.description.trim(), link: form.link.trim() }
    if (editing) change(items.map((it) => (it.id === editing ? { ...it, ...clean } : it)))
    else change([...items, { ...clean, id: newId() }])
    setForm(blank); setEditing(null)
  }

  function edit(it) { setEditing(it.id); setForm({ type: it.type, title: it.title, org: it.org, date: it.date, description: it.description, link: it.link, status: it.status }); window.scrollTo({ top: document.getElementById('timeline-admin').offsetTop - 20, behavior: 'smooth' }) }
  function remove(it) { if (window.confirm('Remove "' + it.title + '" from the timeline?')) { change(items.filter((x) => x.id !== it.id)); if (editing === it.id) { setEditing(null); setForm(blank) } } }
  function move(i, d) { const j = i + d; if (j < 0 || j >= items.length) return; const n = [...items]; [n[i], n[j]] = [n[j], n[i]]; change(n) }

  async function save() {
    setBusy(true); setErr(''); setOk('')
    const { error } = await supabase.from('site_settings').upsert({ key: 'timeline', value: { items: sanitize(items) } })
    setBusy(false)
    if (error) return setErr(error.message)
    setDirty(false); setOk('Timeline saved. Reload the public site to see it.')
  }

  return (
    <section className="admin-manager-section" id="timeline-admin">
      <div className="admin-section-heading">
        <div>
          <div className="admin-kicker">ACHIEVEMENTS</div>
          <h2>Timeline</h2>
          <p>Add only things that really happened. Use the status label honestly: Participation is not Selected or Award.</p>
        </div>
        <span className="admin-count">{items.length} items{dirty ? ' - unsaved' : ''}</span>
      </div>
      {ok && <div className="admin-alert admin-alert-success">&#10003; {ok}</div>}
      {err && <div className="admin-alert admin-alert-error">! {err}</div>}
      <div className="admin-manager-grid">
        <div className="admin-panel">
          <div className="admin-panel-heading"><h3>{editing ? 'Edit item' : 'Add item'}</h3><span>PUBLIC</span></div>
          <form onSubmit={submit} className="project-admin-form admin-form">
            <div className="admin-form-row">
              <div><label>Type</label><select name="type" value={form.type} onChange={set}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
              <div><label>Status</label><select name="status" value={form.status} onChange={set}>{STATUSES.map((t) => <option key={t}>{t}</option>)}</select></div>
            </div>
            <label>Title</label><input name="title" value={form.title} onChange={set} maxLength="120" />
            <label>Organization or event</label><input name="org" value={form.org} onChange={set} maxLength="120" />
            <label>Date (free text, e.g. Oct 2026)</label><input name="date" value={form.date} onChange={set} maxLength="40" />
            <label>Description</label><textarea name="description" rows="3" value={form.description} onChange={set} maxLength="400" />
            <label>Link (optional)</label><input name="link" value={form.link} onChange={set} placeholder="https://..." />
            <div className="admin-form-actions">
              <button className="admin-submit">{editing ? 'Update item' : 'Add item'}</button>
              {editing && <button type="button" className="admin-cancel" onClick={() => { setEditing(null); setForm(blank) }}>Cancel</button>}
            </div>
          </form>
        </div>
        <div className="admin-panel admin-list-panel">
          <div className="admin-panel-heading">
            <h3>Timeline items</h3>
            <button type="button" className="admin-refresh" onClick={save} disabled={busy || !dirty}>{busy ? 'Saving...' : 'Save timeline'}</button>
          </div>
          <div className="admin-record-list">
            {items.length === 0 && <p className="admin-empty">No items. The timeline will be hidden on your site.</p>}
            {items.map((it, i) => (
              <article className="admin-record" key={it.id}>
                <div className="admin-record-body">
                  <strong>{it.title}</strong>
                  <p>{it.type} &middot; {it.status}{it.date ? ' &middot; ' + it.date : ''}</p>
                </div>
                <div className="admin-record-actions">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">Up</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">Down</button>
                  <button type="button" onClick={() => edit(it)}>Edit</button>
                  <button type="button" className="danger" onClick={() => remove(it)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}