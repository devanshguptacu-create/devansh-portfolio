import { useEffect, useState } from 'react'
import { profile as p } from '../data/content.js'

const base = import.meta.env.BASE_URL

export default function Hero() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % p.roles.length), 2600)
    return () => clearInterval(t)
  }, [])
  const img = base + (p.useAvatar ? p.avatarPath : p.photoPath)

  return (
    <section id="home" className="hero">
      <div className="wrap">
        <div className="reveal">
          {p.status.show && <div className="status"><i className="dot" />{p.status.text}</div>}
          <div className="name">{p.name.toUpperCase()}</div>
          <h1>{p.headline}</h1>
          <div className="role" aria-live="polite"><span key={i}>{p.roles[i]}</span></div>
          <p className="intro">{p.intro}</p>
          <div className="actions">
            <a className="btn primary" href="#projects">Explore My Work</a>
            <a className="btn" href={base + p.resumePath} download>Download Resume</a>
            <a className="btn" href={p.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            {p.linkedin && <a className="btn" href={p.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
          </div>
        </div>
        <div className="avatar reveal">
          <img src={img} alt={`${p.name} profile`} width="340" height="340"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = base + p.avatarPath }} />
        </div>
      </div>
    </section>
  )
}
