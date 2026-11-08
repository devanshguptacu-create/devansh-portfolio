import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

export const TYPES = ['Education', 'Hackathon', 'Open Source', 'Academic Project', 'Project', 'Verified Achievement', 'Learning']
export const STATUSES = ['Ongoing', 'Completed', 'Participation', 'Selected', 'Award', 'Verified', 'In progress']

// Only facts from the portfolio brief. No invented dates, awards or selections.
export const DEFAULTS = [
  { id: 'edu', type: 'Education', title: 'B.Tech in Computer Science and Engineering', org: 'Chandigarh University', date: '', description: 'Specialization in Artificial Intelligence and Machine Learning.', link: '', status: 'Ongoing' },
  { id: 'hf', type: 'Open Source', title: 'Hacktoberfest journey', org: 'Hacktoberfest', date: '', description: 'Built TouchGrass AI and SideHustleStudio while learning open-source collaboration.', link: 'https://github.com/devanshguptacu-create/TouchGrass-AI', status: 'Participation' },
  { id: 'azure', type: 'Academic Project', title: 'Azure Save Forest', org: 'Chandigarh University', date: '', description: 'Cloud computing project using Azure virtual networking, a virtual machine and website hosting.', link: '', status: 'Completed' },
  { id: 'medi', type: 'Project', title: 'MediSaathi AI', org: 'Personal project', date: '', description: 'AI-powered health copilot concept to make medical documents easier to understand. Still in development.', link: 'https://github.com/devanshguptacu-create/MediSaathi-AI', status: 'In progress' },
  { id: 'cert', type: 'Verified Achievement', title: 'Scientific Paper (Coursera)', org: 'Coursera', date: 'October 2026', description: 'Completed the course and earned a verified certificate.', link: '', status: 'Verified' },
]

const clip = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '')
const safeUrl = (v) => (/^https?:\/\/\S+$/i.test((v || '').trim()) ? v.trim() : '')

export function sanitize(list) {
  return (Array.isArray(list) ? list : []).slice(0, 30).map((it, i) => ({
    id: clip(String(it?.id ?? i), 40) || String(i),
    type: TYPES.includes(it?.type) ? it.type : 'Project',
    title: clip(it?.title, 120),
    org: clip(it?.org, 120),
    date: clip(it?.date, 40),
    description: clip(it?.description, 400),
    link: safeUrl(it?.link),
    status: STATUSES.includes(it?.status) ? it.status : 'Completed',
  })).filter((it) => it.title)
}

export function useTimeline() {
  const [items, setItems] = useState(() => sanitize(DEFAULTS))
  useEffect(() => {
    if (!supabase) return
    let on = true
    supabase.from('site_settings').select('value').eq('key', 'timeline').maybeSingle()
      .then(({ data }) => { if (on && data && Array.isArray(data.value?.items)) setItems(sanitize(data.value.items)) })
    return () => { on = false }
  }, [])
  return items
}