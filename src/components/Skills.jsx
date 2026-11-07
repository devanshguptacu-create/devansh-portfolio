import { learning } from '../data/content.js'

const GROUPS = ['Programming Languages', 'Web Development', 'AI & Machine Learning', 'Database & Backend', 'Tools & Platforms', 'Cloud & Deployment']

function groupOf(category = '', name = '') {
  const c = category.toLowerCase()
  const n = name.toLowerCase()
  if (/azure|aws|vercel|netlify|cloud|deploy|docker/.test(n)) return 'Cloud & Deployment'
  if (c.includes('programming')) return 'Programming Languages'
  if (c.includes('frontend') || c.includes('web')) return 'Web Development'
  if (c.includes('ai') || c.includes('ml') || c.includes('machine')) return 'AI & Machine Learning'
  if (c.includes('database') || c.includes('backend')) return 'Database & Backend'
  if (c.includes('cloud')) return 'Cloud & Deployment'
  if (c.includes('tool') || c.includes('platform')) return 'Tools & Platforms'
  return 'Tools & Platforms'
}

const ICONS = [
  [/python/, 'Py'], [/javascript|^js$/, 'JS'], [/^c$/, 'C'], [/html/, '</>'], [/css/, 'CSS'],
  [/react/, 'Re'], [/git/, 'Git'], [/azure/, 'Az'], [/sql|postgres/, 'DB'], [/supabase/, 'Sb'],
  [/vs ?code|visual studio/, 'VS'], [/machine|ml/, 'ML'], [/\bai\b|artificial/, 'AI'], [/data/, 'Da'], [/node/, 'No'],
]
function iconFor(name = '') {
  const n = name.toLowerCase().trim()
  const hit = ICONS.find(([re]) => re.test(n))
  return hit ? hit[1] : name.slice(0, 2).toUpperCase()
}

export default function Skills({ skills }) {
  const grouped = GROUPS.map((g) => [g, skills.filter((s) => groupOf(s.category, s.name) === g)]).filter(([, list]) => list.length)
  return (
    <section id="skills">
      <div className="wrap reveal">
        <div className="eyebrow">Skills</div>
        <h2>What I work with</h2>
        {grouped.map(([g, list]) => (
          <div className="cat" key={g}>
            <h3>{g}</h3>
            <div className="grid">
              {list.map((s) => (
                <div className="card skill" key={s.id || s.name}>
                  <span className="skill-ico" aria-hidden="true">{iconFor(s.name)}</span>
                  <span className="skill-name">{s.name}</span>
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