import { learning } from '../data/content.js'

export default function Skills({ skills }) {
  const cats = [...new Set(skills.map((s) => s.category))]
  return (
    <section id="skills">
      <div className="wrap reveal">
        <div className="eyebrow">Skills</div>
        <h2>What I work with</h2>
        {cats.map((c) => (
          <div className="cat" key={c}>
            <h3>{c}</h3>
            <div className="grid">
              {skills.filter((s) => s.category === c).map((s) => (
                <div className="card skill" key={s.name}>
                  <span>{s.name}</span>
                  {s.level_label && <span className="tag accent" style={{ margin: 0 }}>{s.level_label}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="cat">
          <h3>Currently learning</h3>
          <div>{learning.map((l) => <span className="tag" key={l}>{l}</span>)}</div>
        </div>
      </div>
    </section>
  )
}
