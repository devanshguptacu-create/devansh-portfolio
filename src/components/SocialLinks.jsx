import Icon from './Icon.jsx'
import { useSiteSettings } from '../data/siteSettings.js'

export default function SocialLinks() {
  const { activeSocials } = useSiteSettings()
  return (
    <ul className="social-list">
      {activeSocials.map((s) => (
        <li key={s.key}>
          <a className="social-btn" data-k={s.key} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}>
            <Icon name={s.key} size={20} />
          </a>
        </li>
      ))}
    </ul>
  )
}