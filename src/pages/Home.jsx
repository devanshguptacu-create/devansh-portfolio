import { useEffect, useState } from 'react'
import Nav from '../components/Nav.jsx'
import Hero from '../components/Hero.jsx'
import About from '../components/About.jsx'
import Skills from '../components/Skills.jsx'
import Projects from '../components/Projects.jsx'
import Certifications from '../components/Certifications.jsx'
import Contact from '../components/Contact.jsx'
import Footer from '../components/Footer.jsx'
import { supabase } from '../lib/supabase.js'
import {
  skills as defaultSkills,
  projects as defaultProjects,
  profile
} from '../data/content.js'

export default function Home() {
  const [skills, setSkills] = useState(defaultSkills)
  const [projects, setProjects] = useState(defaultProjects)
  const [certifications, setCertifications] = useState([])
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    if (!supabase) return

    async function loadContent() {
      const [projectResult, skillResult, certResult] = await Promise.all([
        supabase.from('projects').select('*').eq('published', true).order('sort_order'),
        supabase.from('skills').select('*').eq('visible', true).order('sort_order'),
        supabase.from('certifications').select('*').eq('visible', true).order('issue_date', { ascending: false })
      ])

      if (projectResult.data?.length) setProjects(projectResult.data)
      if (skillResult.data?.length) setSkills(skillResult.data)
      if (certResult.data) setCertifications(certResult.data)

      if (projectResult.error) console.error('Projects:', projectResult.error.message)
      if (skillResult.error) console.error('Skills:', skillResult.error.message)
      if (certResult.error) console.error('Certifications:', certResult.error.message)
    }

    loadContent()
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in')
          io.unobserve(entry.target)
        }
      }),
      { threshold: 0.12 }
    )

    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [skills, projects, certifications])

  useEffect(() => {
    const glow = document.querySelector('.cursor-glow')
    const fine = window.matchMedia('(pointer:fine)').matches

    const move = (e) => {
      if (glow) {
        glow.style.left = e.clientX + 'px'
        glow.style.top = e.clientY + 'px'
      }
    }

    const scroll = () => setShowTop(window.scrollY > 600)

    if (fine) window.addEventListener('mousemove', move)
    window.addEventListener('scroll', scroll, { passive: true })

    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('scroll', scroll)
    }
  }, [])

  return (
    <>
      <div className="cursor-glow" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <About />
        <Skills skills={skills} />
        <Projects projects={projects} />
        <Certifications certifications={certifications} />
        <Contact />
      </main>
      <Footer />
      <button
        className={'totop' + (showTop ? ' show' : '')}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑
      </button>
    </>
  )
}
