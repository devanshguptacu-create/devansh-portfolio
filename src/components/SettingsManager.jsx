import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { invalidateSiteSettings } from '../data/siteSettings.js'
import { contact as dc, socials as ds } from '../data/social.js'
import { profile as dp } from '../data/content.js'

const LINKS = ds.map((s) => [s.key, s.label])
const httpOk = (v) => !v || /^https?:\/\/\S+$/i.test(v)
const emailOk = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)

export default function SettingsManager() {
  const [links, setLinks] = useState(Object.fromEntries(ds.map((s) => [s.key, s.url])))
  const [contact, setContact] = useState({ email: dc.email, phone: dc.phone, whatsapp: dc.whatsapp, showPhone: dc.showPhone })
  const [prof, setProf] = useState({ headline: dp.headline, intro: dp.intro, statusShow: dp.status.show, statusText: dp.status.text })
  const [busy, setBusy] = useState('')
  const [ok, setOk] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    supabase.from('site_settings').select('key,value').in('key', ['social', 'profile']).then(({ data }) => {
      const o = {}
      ;(data || []).forEach((r) => { o[r.key] = r.value })
      if (o.social?.links) setLinks((l) => ({ ...l, ...o.social.links }))
      if (o.social?.contact) setContact((c) => ({ ...c, ...o.social.contact }))
      if (o.profile) setProf((p) => ({
        headline: o.profile.headline ?? p.headline,
        intro: o.profile.intro ?? p.intro,
        statusShow: o.profile.status?.show ?? p.statusShow,
        statusText: o.profile.status?.text ?? p.statusText,
      }))
    })
  }, [])

  async function save(key, value, label) {
    setBusy(key); setErr(''); setOk('')
    const { error } = await supabase.from('site_settings').upsert({ key, value })
    setBusy('')
    if (error) return setErr(error.message)
    invalidateSiteSettings()
    setOk(label + ' saved. Reload the public site to see it.')
  }

  function saveSocial(e) {
    e.preventDefault()
    for (const [k, label] of LINKS) {
      const v = (links[k] || '').trim()
      if (!httpOk(v)) return setErr(label + ' link must start with https://')
    }
    if (!emailOk(contact.email.trim())) return setErr('Enter a valid email address.')
    const wa = (contact.whatsapp || '').replace(/\D/g, '')
    if (wa && (wa.length < 8 || wa.length > 15)) return setErr('WhatsApp number must have 8 to 15 digits, with country code.')
    if (contact.phone && !/^[+\d\s()-]{6,20}$/.test(contact.phone.trim())) return setErr('Phone number format is not valid.')
    const clean = Object.fromEntries(LINKS.map(([k]) => [k, (links[k] || '').trim()]))
    save('social', { links: clean, contact: { email: contact.email.trim(), phone: (contact.phone || '').trim(), whatsapp: wa, showPhone: !!contact.showPhone } }, 'Social and contact settings')
  }

  function saveProfile(e) {
    e.preventDefault()
    const h = prof.headline.trim(), i = prof.intro.trim(), s = prof.statusText.trim()
    if (!h || h.length > 120) return setErr('Headline is required (max 120 characters).')
    if (!i || i.length > 400) return setErr('Intro is required (max 400 characters).')
    if (s.length > 120) return setErr('Status text must be under 120 characters.')
    save('profile', { headline: h, intro: i, status: { show: !!prof.statusShow, text: s } }, 'Profile')
  }

  return (
    <section className="admin-manager-section" id="settings">
      <div className="admin-section-heading">
        <div>
          <div className="admin-kicker">SITE SETTINGS</div>
          <h2>Profile and social links</h2>
          <p>Leave a link empty to hide that icon from your public site.</p>
        </div>
      </div>
      {ok && <div className="admin-alert admin-alert-success">&#10003; {ok}</div>}
      {err && <div className="admin-alert admin-alert-error">! {err}</div>}
      <div className="admin-manager-grid">
        <div className="admin-panel">
          <div className="admin-panel-heading"><h3>Social and contact</h3><span>PUBLIC</span></div>
          <form onSubmit={saveSocial} className="project-admin-form admin-form">
            {LINKS.map(([k, label]) => (
              <div key={k}><label>{label} URL</label>
                <input value={links[k] || ''} onChange={(e) => setLinks({ ...links, [k]: e.target.value })} placeholder="https://..." /></div>
            ))}
            <label>Public email</label>
            <input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
            <div className="admin-form-row">
              <div><label>Phone</label><input value={contact.phone || ''} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></div>
              <div><label>WhatsApp (digits, with country code)</label><input value={contact.whatsapp || ''} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} /></div>
            </div>
            <label className="admin-check-row"><input type="checkbox" checked={!!contact.showPhone} onChange={(e) => setContact({ ...contact, showPhone: e.target.checked })} /> Show phone and WhatsApp on the public site</label>
            <div className="admin-form-actions"><button className="admin-submit" disabled={busy === 'social'}>{busy === 'social' ? 'Saving...' : 'Save social settings'}</button></div>
          </form>
        </div>
        <div className="admin-panel">
          <div className="admin-panel-heading"><h3>Hero profile</h3><span>PUBLIC</span></div>
          <form onSubmit={saveProfile} className="project-admin-form admin-form">
            <label>Headline</label>
            <input value={prof.headline} onChange={(e) => setProf({ ...prof, headline: e.target.value })} maxLength="120" />
            <label>Short introduction</label>
            <textarea rows="4" value={prof.intro} onChange={(e) => setProf({ ...prof, intro: e.target.value })} maxLength="400" />
            <label>Status line</label>
            <input value={prof.statusText} onChange={(e) => setProf({ ...prof, statusText: e.target.value })} maxLength="120" />
            <label className="admin-check-row"><input type="checkbox" checked={!!prof.statusShow} onChange={(e) => setProf({ ...prof, statusShow: e.target.checked })} /> Show status badge in the hero</label>
            <div className="admin-form-actions"><button className="admin-submit" disabled={busy === 'profile'}>{busy === 'profile' ? 'Saving...' : 'Save profile'}</button></div>
          </form>
        </div>
      </div>
    </section>
  )
}