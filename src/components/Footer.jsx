import SocialLinks from './SocialLinks.jsx'
import { contact, linkedinUrl } from '../data/social.js'
import { profile } from '../data/content.js'

const links = [['home', 'Home'], ['about', 'About'], ['skills', 'Skills'], ['projects', 'Projects'], ['certifications', 'Achievements'], ['contact', 'Contact']]

export default function Footer() {
  const go = (e, id) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }
  return (
    <footer className="site-footer">
      <div className="wrap foot-grid">
        <div>
          <div className="logo" style={{ fontSize: '1.3rem' }}>DG<span style={{ color: 'var(--violet)' }}>.</span></div>
          <p className="muted" style={{ margin: '10px 0 16px', maxWidth: 320 }}>
            {profile.name}. B.Tech CSE (AI/ML) student at Chandigarh University, building intelligent solutions through code.
          </p>
          {linkedinUrl && <a className="btn primary" href={linkedinUrl} target="_blank" rel="noopener noreferrer">Connect on LinkedIn</a>}
        </div>
        <div>
          <h3 className="foot-title">Quick links</h3>
          <ul className="foot-links">
            {links.map(([id, label]) => <li key={id}><a href={'#' + id} onClick={(e) => go(e, id)}>{label}</a></li>)}
          </ul>
        </div>
        <div>
          <h3 className="foot-title">Get in touch</h3>
          <p><a className="foot-mail" href={`mailto:${contact.email}`}>{contact.email}</a></p>
          <SocialLinks />
        </div>
      </div>
      <div className="wrap foot-copy">© {new Date().getFullYear()} {profile.name}. All rights reserved.</div>
    </footer>
  )
}