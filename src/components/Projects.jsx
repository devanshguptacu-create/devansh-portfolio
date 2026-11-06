import { useEffect, useState } from 'react'

export default function Projects({ projects }) {
  const [sel, setSel] = useState(null)

  useEffect(() => {
    if (!sel) return
    const onKey = (e) => e.key === 'Escape' && setSel(null)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [sel])

  return (
    <section id="projects">
      <div className="wrap reveal">
        <div className="eyebrow">Projects</div>
        <h2>Selected work</h2>
        <div className="grid">
          {projects.map((p) => (
            <article className="card pcard" key={p.id}>
              <div className="thumb">
                {p.image_url ? <img src={p.image_url} alt={`${p.title} preview`} loading="lazy" /> : p.title}
              </div>
              <h3>{p.title}</h3>
              <p className="muted" style={{ fontSize: '.92rem' }}>{p.description}</p>
              <div>
                <span className="tag accent">{p.status}</span>
                {(p.tech || []).map((t) => <span className="tag" key={t}>{t}</span>)}
              </div>
              <div className="btns">
                <button className="btn" onClick={() => setSel(p)}>View details</button>
                {p.github_url && <a className="btn" href={p.github_url} target="_blank" rel="noopener noreferrer">GitHub</a>}
                {p.demo_url && <a className="btn" href={p.demo_url} target="_blank" rel="noopener noreferrer">Live demo</a>}
              </div>
            </article>
          ))}
        </div>
      </div>

      {sel && (
        <div className="overlay" onClick={() => setSel(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label={sel.title} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: 6 }}>{sel.title}</h3>
            <span className="tag accent" style={{ marginTop: 0 }}>{sel.status}</span>
            <p className="muted" style={{ margin: '16px 0' }}>{sel.details || sel.description}</p>
            <div className="btns" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {sel.github_url && <a className="btn" href={sel.github_url} target="_blank" rel="noopener noreferrer">GitHub</a>}
              <button className="btn primary" autoFocus onClick={() => setSel(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
