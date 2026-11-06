import { profile as p } from '../data/content.js'

export default function About() {
  return (
    <section id="about">
      <div className="wrap reveal">
        <div className="eyebrow">About</div>
        <h2>A developing engineer, learning by building.</h2>
        <div style={{ maxWidth: 680 }}>
          {p.about.map((t, i) => <p key={i} className="muted" style={{ marginBottom: 14 }}>{t}</p>)}
        </div>
      </div>
    </section>
  )
}
