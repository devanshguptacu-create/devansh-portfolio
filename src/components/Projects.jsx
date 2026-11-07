import { useEffect, useMemo, useState } from 'react'

export const PROJECT_CATEGORIES = ['AI/ML', 'Web Development', 'Hackathon Projects', 'Open Source', 'Other Projects']

export default function Projects({ projects }) {
  const [sel, setSel] = useState(null)
  const [cat, setCat] = useState('All')

  const items = useMemo(
    () => projects.map((p) => ({ ...p, category: PROJECT_CATEGORIES.includes(p.category) ? p.category : 'Other Projects' })),
    [projects]
  )
  const present = PROJECT_CATEGORIES.filter((c) => items.some((p) => p.category === c))
  const shown = cat === 'All' || !present.includes(cat) ? items : items.filter((p) => p.category === cat)

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

        {present.length > 1 && (
          <div className="filters" role="tablist" aria-label="Project categories">
            {['All', ...present].map((c) => (
              <button key={c} type="button" role="tab" aria-selected={cat === c}
                className={'chip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
        )}

        {shown.length === 0 && <p className="muted">No projects to show yet.</p>}

        <div className="grid" key={cat}>
          {shown.map((p) => (
            <article className="card pcard card-in" key={p.id}>
              <div className="thumb">
                {p.image_url ? <img src={p.image_url} alt={`${p.title} preview`} loading="lazy" /> : p.title}
              </div>
              <h3>{p.title}</h3>
              <p className="muted" style={{ fontSize: '.92rem' }}>{p.description}</p>
              <div>
                <span className="tag accent">{p.status}</span>
                <span className="tag">{p.category}</span>
                {(p.tech || []).map((t) => <span className="tag" key={t}>{t}</span>)}
              </div>
              <div className="btns">
                <button className="btn" type="button" onClick={() => setSel(p)}>View details</button>
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
            <span className="tag">{sel.category}</span>
            <p className="muted" style={{ margin: '16px 0' }}>{sel.details || sel.description}</p>
            {(sel.tech || []).length > 0 && <div style={{ marginBottom: 16 }}>{sel.tech.map((t) => <span className="tag" key={t}>{t}</span>)}</div>}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {sel.github_url && <a className="btn" href={sel.github_url} target="_blank" rel="noopener noreferrer">GitHub</a>}
              {sel.demo_url && <a className="btn" href={sel.demo_url} target="_blank" rel="noopener noreferrer">Live demo</a>}
              <button className="btn primary" type="button" autoFocus onClick={() => setSel(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}