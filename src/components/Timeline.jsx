import { useTimeline } from '../data/timeline.js'

export default function Timeline() {
  const items = useTimeline()
  if (!items.length) return null
  return (
    <section id="timeline">
      <div className="wrap">
        <div className="eyebrow">Journey</div>
        <h2>Education and milestones</h2>
        <ol className="tl">
          {items.map((it, i) => (
            <li className="tl-item card-in" key={it.id} style={{ animationDelay: i * 70 + 'ms' }}>
              <span className="tl-dot" aria-hidden="true" />
              <div className="card tl-card">
                <div className="tl-meta">
                  <span className="tag accent">{it.type}</span>
                  <span className="tag">{it.status}</span>
                  {it.date && <span className="tl-date">{it.date}</span>}
                </div>
                <h3>{it.title}</h3>
                {it.org && <p className="tl-org">{it.org}</p>}
                {it.description && <p className="muted">{it.description}</p>}
                {it.link && <a className="tl-link" href={it.link} target="_blank" rel="noopener noreferrer">View &#8599;</a>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}