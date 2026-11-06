function fmt(d) {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt)) return ''
  return dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export default function Certifications({ certifications = [] }) {
  if (!certifications.length) return null
  return (
    <section id="certifications">
      <div className="wrap">
        <div className="cert-head reveal">
          <div className="eyebrow">Achievements</div>
          <h2>Certifications</h2>
          <p>Learning, building and growing through continuous learning.</p>
        </div>
        <div className="cert-grid reveal">
          {certifications.map((c) => (
            <article className="card cert-card" key={c.id}>
              {c.image_url ? (
                <a className="cert-media" href={c.image_url} target="_blank" rel="noopener noreferrer" aria-label={`View ${c.name} certificate image`}>
                  <img src={c.image_url} alt={`${c.name} certificate`} loading="lazy" />
                  <span className="cert-view">View ↗</span>
                </a>
              ) : (
                <div className="cert-media cert-empty">{c.provider}</div>
              )}
              <div className="cert-body">
                <span className="cert-provider">{c.provider}</span>
                <h3>{c.name}</h3>
                {fmt(c.issue_date) && <p className="cert-date">Issued {fmt(c.issue_date)}</p>}
                {c.credential_url && (
                  <a className="btn cert-btn" href={c.credential_url} target="_blank" rel="noopener noreferrer">View credential ↗</a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
