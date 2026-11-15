import Icon from './Icon.jsx'
import { useSiteSettings } from '../data/siteSettings.js'

const openBooking = () => window.dispatchEvent(new Event('open-booking'))
const svg = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
const Cal = () => (<svg {...svg}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>)
const Ph = () => (<svg {...svg}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>)

export default function QuickActions() {
  const { contact } = useSiteSettings()
  const tel = (contact.phone || '').replace(/[^\d+]/g, '')
  const wa = (contact.whatsapp || '').replace(/\D/g, '')
  return (
    <div className="quick-actions reveal">
      <button type="button" className="qa qa-primary" onClick={openBooking}><Cal /><span><strong>Book a call</strong><small>Pick a day and time</small></span></button>
      {contact.showPhone && tel && <a className="qa" href={`tel:${tel}`}><Ph /><span><strong>Call me</strong><small>{contact.phone}</small></span></a>}
      {contact.showPhone && wa && <a className="qa" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={20} /><span><strong>WhatsApp</strong><small>Chat with me</small></span></a>}
      <a className="qa" href={`mailto:${contact.email}`}><Icon name="mail" size={20} /><span><strong>Email</strong><small>{contact.email}</small></span></a>
    </div>
  )
}