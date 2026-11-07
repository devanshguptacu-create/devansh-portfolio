import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { profile as defaultProfile } from './content.js'
import { contact as defContact, socials as defSocials } from './social.js'

let promise = null
export function invalidateSiteSettings() { promise = null }

function fetchSettings() {
  if (!supabase) return Promise.resolve({})
  if (!promise) {
    promise = supabase.from('site_settings').select('key,value').in('key', ['social', 'profile'])
      .then(({ data }) => {
        const o = {}
        ;(data || []).forEach((r) => { o[r.key] = r.value })
        return o
      })
      .catch(() => ({}))
  }
  return promise
}

const safeUrl = (u) => (typeof u === 'string' && /^https?:\/\/\S+$/i.test(u.trim()) ? u.trim() : '')
const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : undefined)

export function mergeSettings(o = {}) {
  const sv = o.social || {}
  const links = sv.links || {}
  const contact = { ...defContact, ...(sv.contact || {}) }
  const socials = defSocials.map((s) => ({
    ...s,
    url: safeUrl(Object.prototype.hasOwnProperty.call(links, s.key) ? links[s.key] : s.url),
  }))
  const activeSocials = socials.filter((s) => s.url)
  const linkedinUrl = socials.find((s) => s.key === 'linkedin')?.url || ''
  const githubUrl = socials.find((s) => s.key === 'github')?.url || defaultProfile.github
  const ov = o.profile || {}
  const profile = {
    ...defaultProfile,
    headline: str(ov.headline, 120) || defaultProfile.headline,
    intro: str(ov.intro, 400) || defaultProfile.intro,
    status: {
      show: typeof ov.status?.show === 'boolean' ? ov.status.show : defaultProfile.status.show,
      text: str(ov.status?.text, 120) || defaultProfile.status.text,
    },
    linkedin: linkedinUrl,
    github: githubUrl,
  }
  return { contact, socials, activeSocials, linkedinUrl, profile }
}

export function useSiteSettings() {
  const [raw, setRaw] = useState(null)
  useEffect(() => {
    let on = true
    fetchSettings().then((o) => { if (on) setRaw(o) })
    return () => { on = false }
  }, [])
  return useMemo(() => mergeSettings(raw || {}), [raw])
}