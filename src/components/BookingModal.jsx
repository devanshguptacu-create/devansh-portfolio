import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'

const SLOTS = ['Morning', 'Afternoon', 'Evening']
const MODES = ['Phone call', 'Video call']
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const empty = { name: '', email: '', phone: '', date: '', slot: 'Morning', mode: 'Phone call', topic: '', note: '', website: '' }

export default function BookingModal() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [f, setF] = useState(empty)
  const [errs, setErrs] = useState({})
  const [state, setState] = useState('idle')
  const [note, setNote] = useState('')

  const today = ymd(new Date())
  const max = ymd(new Date(Date.now() + 90 * 864e5))

  useEffect(() => {
    const show = () => { setState('idle'); setNote(''); setErrs({}); setF((p) => ({ ...empty, email: user?.email || p.email })); setOpen(true) }
    window.addEventListener('open-booking', show)
    return () => window.removeEventListener('open-booking', show)
  }, [user])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

  if (!open) return null
  const set = (e) => { setF({ ...f, [e.target.name]: e.target.value }); if (errs[e.target.name]) setErrs({ ...errs, [e.target.name]: '' }) }

  function validate() {
    const e = {}
    if (!f.name.trim() || f.name.trim().length > 100) e.name = 'Enter your name.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim()) || f.email.length > 254) e.email = 'Enter a valid email.'
    if (f.phone.trim() && !/^[+0-9 ()-]{6,20}$/.test(f.phone.trim())) e.phone = 'Use digits, +, spaces or dashes only.'
    if (!f.date || f.date < today || f.date > max) e.date = 'Pick a date within the next 90 days.'
    if (!f.topic.trim() || f.topic.trim().length > 150) e.topic = 'Add a topic (max 150 characters).'
    if (f.note.length > 1000) e.note = 'Note must be under 1000 characters.'
    return e
  }

  async function submit(ev) {
    ev.preventDefault()
    if (f.website) return
    const v = validate()
    setErrs(v)
    if (Object.keys(v).length) return
    let last = 0
    try { last = Number(sessionStorage.getItem('dg-last-booking') || 0) } catch {}
    if (Date.now() - last < 30000) { setState('error'); setNote('Please wait a few seconds before sending another request.'); return }
    if (!supabase) { setState('error'); setNote('Booking is not available right now. Please email me directly.'); return }
    setState('sending'); setNote('')
    const { error } = await supabase.from('appointments').insert({
      user_id: user?.id ?? null,
      name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim() || null,
      preferred_date: f.date, time_slot: f.slot, mode: f.mode,
      topic: f.topic.trim(), note: f.note.trim() || null,
    })
    if (error) { setState('error'); setNote('Could not send your request: ' + error.message); return }
    try { sessionStorage.setItem('dg-last-booking', String(Date.now())) } catch {}
    setState('done')
  }

  return (
    <div className="overlay" onClick={() => setOpen(false)}>
      <div className="modal bk-modal" role="dialog" aria-modal="true" aria-label="Book a call" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: 4 }}>Book a call</h3>
        {state === 'done' ? (
          <>
            <p className="fok" style={{ margin: '14px 0' }}>Request sent. This is a request, not a confirmed slot. I will confirm the exact time by email or phone.</p>
            <button type="button" className="btn primary" autoFocus onClick={() => setOpen(false)}>Close</button>
          </>
        ) : (
          <form className="bk-form" onSubmit={submit} noValidate>
            <p className="muted" style={{ fontSize: '.9rem' }}>Choose a preferred day and time. I will reply to confirm.</p>
            <div className="hp" aria-hidden="true"><label>Website<input name="website" tabIndex="-1" autoComplete="off" value={f.website} onChange={set} /></label></div>
            <label>Name<input name="name" value={f.name} onChange={set} maxLength="100" autoComplete="name" />{errs.name && <small className="ferr">{errs.name}</small>}</label>
            <label>Email<input name="email" type="email" value={f.email} onChange={set} maxLength="254" autoComplete="email" />{errs.email && <small className="ferr">{errs.email}</small>}</label>
            <label>Phone (optional)<input name="phone" value={f.phone} onChange={set} maxLength="20" autoComplete="tel" />{errs.phone && <small className="ferr">{errs.phone}</small>}</label>
            <div className="bk-row">
              <label>Preferred date<input name="date" type="date" min={today} max={max} value={f.date} onChange={set} />{errs.date && <small className="ferr">{errs.date}</small>}</label>
              <label>Time of day<select name="slot" value={f.slot} onChange={set}>{SLOTS.map((s) => <option key={s}>{s}</option>)}</select></label>
            </div>
            <label>How should we talk?<select name="mode" value={f.mode} onChange={set}>{MODES.map((s) => <option key={s}>{s}</option>)}</select></label>
            <label>Topic<input name="topic" value={f.topic} onChange={set} maxLength="150" />{errs.topic && <small className="ferr">{errs.topic}</small>}</label>
            <label>Note (optional)<textarea name="note" rows="3" value={f.note} onChange={set} maxLength="1000" />{errs.note && <small className="ferr">{errs.note}</small>}</label>
            {note && <p className="ferr" role="status">{note}</p>}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn primary" disabled={state === 'sending'}>{state === 'sending' ? 'Sending...' : 'Send request'}</button>
              <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}