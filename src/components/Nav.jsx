import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const items = ['home', 'about', 'skills', 'projects']

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')
  const { user, isAdmin, signOut } = useAuth()

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setOpen(false)
  }

  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) setActive(entry.target.id)
      }),
      { rootMargin: '-45% 0px -50% 0px' }
    )

    items.forEach(id => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })

    return () => io.disconnect()
  }, [])

  return (
    <header className="nav">
      <nav className="wrap" aria-label="Main">
        <a
          href="#home"
          className="logo"
          onClick={e => {
            e.preventDefault()
            scrollToSection('home')
          }}
        >
          DG<span style={{ color: 'var(--violet)' }}>.</span>
        </a>

        <button
          className="burger"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close' : 'Menu'}
        </button>

        <ul id="menu" className={'links' + (open ? ' open' : '')}>
          {items.map(id => (
            <li key={id}>
              <a
                href={'#' + id}
                className={active === id ? 'active' : ''}
                onClick={e => {
                  e.preventDefault()
                  scrollToSection(id)
                }}
              >
                {id[0].toUpperCase() + id.slice(1)}
              </a>
            </li>
          ))}

          {user ? (
            <>
              <li>
                <Link to="/dashboard" onClick={() => setOpen(false)}>
                  {isAdmin ? 'Admin' : 'Dashboard'}
                </Link>
              </li>
              <li>
                <button
                  className="nav-auth-btn"
                  onClick={async () => {
                    await signOut()
                    setOpen(false)
                  }}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" onClick={() => setOpen(false)}>Login</Link></li>
              <li><Link to="/register" onClick={() => setOpen(false)}>Register</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  )
}
