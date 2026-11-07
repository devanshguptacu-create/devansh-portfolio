import { activeSocials } from '../data/social.js'

export default function SocialLinks() {
  return (
    <ul className="social-list">
      {activeSocials.map((s) => (
        <li key={s.key}>
          <a className="social-btn" href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}>{s.icon}</a>
        </li>
      ))}
    </ul>
  )
}