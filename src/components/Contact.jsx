import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useSiteSettings } from '../data/siteSettings.js'

const empty = { name: '', email: '', subject: '', message: '', website: '' }
const emailOk = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)

function validate(f) {
  const e = {}
  if (!f.name.trim() || f.name.trim().length > 100) e.name = 'Enter your name (max 100 characters).'
  if (!emailOk(f.email.trim()) || f.email.length > 254) e.email = 'Enter a valid email address.'
  if (!f.subject.trim() || f.subject.trim().length > 150) e.subject = 'Enter a subject (max 150 characters).'
  if (f.message.trim().length < 10) e.message = 'Message must be at least 10 characters.'
  if (f.message.length > 3000) e.message = 'Message must be under 3000 characters.'
  return e
}

export default function Contact() {
  const { user } = useAuth()
  const { contact, activeSocials } = useSiteSettings()
  const [f, setF] = useState(empty)
  const [errs, setErrs] = useState({})
  const [state, setState] = useState('idle')
  const [note, setNote] = useState('')

  const set = (e) => {
    setF({ ...f, [e.target.name]: e.target.value })
    if (errs[e.target.name]) setErrs({ ...errs, [e.target.name]: '' })
  }

  async function submit(e) {
    e.preventDefault()
    if (f.website) return // honeypot: bots fill this hidden field
    const v = validate(f)
    setErrs(v)
    if (Object.keys(v).length) { setState('idle'); setNote(''); return }

    let last = 0
    try { last = Number(sessionStorage.getItem('dg-last-msg') || 0) } catch {}
    if (Date.now() - last < 30000) { setState('error'); setNote('Please wait a few seconds before sending another message.'); return }
    if (!supabase) { setState('error'); setNote('The message service is not configured. Please email me directly.'); return }

    setState('sending'); setNote('')
    const { error } = await supabase.from('messages').insert({
      user_id: user?.id ?? null,
      name: f.name.trim(),
      email: f.email.trim(),
      subject: f.subject.trim(),
      message: f.message.trim(),
    })
    if (error) { setState('error'); setNote('Could not send your message: ' + error.message); return }
    try { sessionStorage.setItem('dg-last-msg', String(Date.now())) } catch {}
    setF(empty); setState('done'); setNote('Thank you! Your message has been sent. I will get back to you soon.')
  }

  const liName = (k) => activeSocials.find((s) => s.key === k)?.url

  return (
    <section id="contact">
      <div className="wrap">
        <div className="reveal">
          <div className="eyebrow">Contact</div>
          <h2>Let's connect</h2>
          <p className="muted" style={{ maxWidth: 560, marginBottom: 36 }}>
            Open to internships, collaborations and learning opportunities. Send a message and I will reply as soon as I can.
          </p>
        </div>
        <div className="contact-grid reveal">
          <div className="contact-info">
            <a className="card contact-item" href={`mailto:${contact.email}`}><span>Email</span><strong>{contact.email}</strong></a>
            {liName('linkedin') && <a className="card contact-item" href={liName('linkedin')} target="_blank" rel="noopener noreferrer"><span>LinkedIn</span><strong>Connect with me ↗</strong></a>}
            {liName('github') && <a className="card contact-item" href={liName('github')} target="_blank" rel="noopener noreferrer"><span>GitHub</span><strong>View my repositories ↗</strong></a>}
            {liName('instagram') && <a className="card contact-item" href={liName('instagram')} target="_blank" rel="noopener noreferrer"><span>Instagram</span><strong>Follow me ↗</strong></a>}
            {contact.showPhone && contact.whatsapp && <a className="card contact-item" href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer"><span>WhatsApp / Phone</span><strong>{contact.phone} ↗</strong></a>}
          </div>

          <form className="card contact-form" onSubmit={submit} noValidate>
            <div className="hp" aria-hidden="true"><label>Website<input name="website" tabIndex="-1" autoComplete="off" value={f.website} onChange={set} /></label></div>
            <label>Name<input name="name" value={f.name} onChange={set} autoComplete="name" maxLength="100" aria-invalid={!!errs.name} />{errs.name && <small className="ferr">{errs.name}</small>}</label>
            <label>Email<input name="email" type="email" value={f.email} onChange={set} autoComplete="email" maxLength="254" aria-invalid={!!errs.email} />{errs.email && <small className="ferr">{errs.email}</small>}</label>
            <label>Subject<input name="subject" value={f.subject} onChange={set} maxLength="150" aria-invalid={!!errs.subject} />{errs.subject && <small className="ferr">{errs.subject}</small>}</label>
            <label>Message<textarea name="message" rows="5" value={f.message} onChange={set} maxLength="3000" aria-invalid={!!errs.message} />{errs.message && <small className="ferr">{errs.message}</small>}</label>
            <button className="btn primary" disabled={state === 'sending'}>{state === 'sending' ? 'Sending...' : 'Send Message'}</button>
            {note && <p className={state === 'done' ? 'fok' : 'ferr'} role="status">{note}</p>}
          </form>
        </div>
      </div>
    </section>
  )
}