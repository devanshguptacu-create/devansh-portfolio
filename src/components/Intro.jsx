import { useEffect, useState } from 'react'
import './intro.css'

const NAME = 'DEVANSH GUPTA'
const KEY = 'dg-intro-seen'

function shouldShow() {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    return !sessionStorage.getItem(KEY)
  } catch {
    return true
  }
}

export default function Intro() {
  const [gone, setGone] = useState(() => !shouldShow())
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (gone) return
    document.body.style.overflow = 'hidden'
    const auto = setTimeout(() => setLeaving(true), 2700)
    return () => { clearTimeout(auto); document.body.style.overflow = '' }
  }, [gone])

  useEffect(() => {
    if (!leaving) return
    const t = setTimeout(() => {
      setGone(true)
      document.body.style.overflow = ''
      try { sessionStorage.setItem(KEY, '1') } catch {}
    }, 900)
    return () => clearTimeout(t)
  }, [leaving])

  if (gone) { document.documentElement.classList.add('site-ready'); return null }

  return (
    <div className={'dg-intro' + (leaving ? ' leaving' : '')} onClick={() => setLeaving(true)} aria-hidden="true">
      <div className="intro-grid" />
      <div className="intro-glow" />
      <div className="intro-center">
        <div className="intro-mark">DG<span>.</span></div>
        <div className="intro-name">
          {NAME.split('').map((c, i) => (
            <span key={i} style={{ '--i': i }}>{c === ' ' ? '\u00A0' : c}</span>
          ))}
        </div>
        <p className="intro-sub">AI/ML &nbsp;•&nbsp; Software &nbsp;•&nbsp; Open Source</p>
        <div className="intro-bar"><i /></div>
      </div>
      <span className="intro-skip">Click to skip</span>
    </div>
  )
}
