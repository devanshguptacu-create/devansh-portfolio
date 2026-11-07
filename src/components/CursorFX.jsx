import { useEffect } from 'react'

export default function CursorFX() {
  useEffect(() => {
    if (!matchMedia('(pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return

    document.documentElement.classList.add('fx-cursor')
    const canvas = document.createElement('canvas')
    canvas.className = 'fx-canvas'
    const ctx = canvas.getContext('2d')
    const dot = document.createElement('div')
    const ring = document.createElement('div')
    dot.className = 'fx-dot'
    ring.className = 'fx-ring'
    document.body.append(canvas, dot, ring)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = innerWidth * dpr
      canvas.height = innerHeight * dpr
      canvas.style.width = innerWidth + 'px'
      canvas.style.height = innerHeight + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const mouse = { x: -100, y: -100 }
    const ringPos = { x: -100, y: -100 }
    const head = { x: -100, y: -100 }
    const trail = []
    const bursts = []
    const MAX = 22
    let idle = true
    let idleTimer = 0
    let raf = 0
    let running = false
    let magnet = null

    const resetMagnet = () => { if (magnet) { magnet.style.translate = ''; magnet = null } }
    const start = () => { if (!running) { running = true; raf = requestAnimationFrame(tick) } }

    function tick() {
      ringPos.x += (mouse.x - ringPos.x) * 0.16
      ringPos.y += (mouse.y - ringPos.y) * 0.16
      ring.style.transform = `translate(${ringPos.x}px,${ringPos.y}px)`

      if (!idle) {
        head.x += (mouse.x - head.x) * 0.45
        head.y += (mouse.y - head.y) * 0.45
        trail.push({ x: head.x, y: head.y })
        if (trail.length > MAX) trail.shift()
      } else if (trail.length) {
        trail.shift()
      }

      ctx.clearRect(0, 0, innerWidth, innerHeight)
      ctx.lineCap = 'round'
      for (let i = 1; i < trail.length; i++) {
        const t = i / trail.length
        ctx.strokeStyle = `rgba(${Math.round(139 - 60 * t)},${Math.round(124 + 16 * t)},${Math.round(246 + 9 * t)},${t * 0.6})`
        ctx.lineWidth = 1 + t * 5
        ctx.beginPath()
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y)
        ctx.lineTo(trail[i].x, trail[i].y)
        ctx.stroke()
      }
      for (let i = bursts.length - 1; i >= 0; i--) {
        const p = bursts[i]
        p.x += p.vx; p.y += p.vy
        p.vx *= 0.94; p.vy *= 0.94
        p.life -= 0.035
        if (p.life <= 0) { bursts.splice(i, 1); continue }
        ctx.fillStyle = p.c + p.life + ')'
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1 + 2.4 * p.life, 0, 6.283)
        ctx.fill()
      }

      const settled = Math.abs(mouse.x - ringPos.x) < 0.1 && Math.abs(mouse.y - ringPos.y) < 0.1
      if (idle && !trail.length && !bursts.length && settled) { running = false; return }
      raf = requestAnimationFrame(tick)
    }

    const move = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      if (head.x < 0) { head.x = mouse.x; head.y = mouse.y; ringPos.x = mouse.x; ringPos.y = mouse.y }
      idle = false
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => { idle = true; start() }, 90)

      dot.style.transform = `translate(${mouse.x}px,${mouse.y}px)`
      dot.style.opacity = ring.style.opacity = 1

      const t = e.target
      const field = t.closest?.('input,textarea,select')
      dot.classList.toggle('txt', !!field)
      ring.classList.toggle('txt', !!field)
      ring.classList.toggle('hot', !!t.closest?.('a,button,[role=button],label'))

      const m = t.closest?.('.btn,.social-btn,.chip,.totop')
      if (m !== magnet) resetMagnet()
      if (m) {
        magnet = m
        const r = m.getBoundingClientRect()
        const dx = Math.max(-8, Math.min(8, (e.clientX - (r.left + r.width / 2)) * 0.22))
        const dy = Math.max(-8, Math.min(8, (e.clientY - (r.top + r.height / 2)) * 0.22))
        m.style.translate = `${dx}px ${dy}px`
      }

      const card = t.closest?.('.card')
      if (card) {
        const r = card.getBoundingClientRect()
        card.style.setProperty('--mx', e.clientX - r.left + 'px')
        card.style.setProperty('--my', e.clientY - r.top + 'px')
      }
      start()
    }

    const down = () => {
      ring.classList.add('down')
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * 6.283 + Math.random() * 0.4
        const s = 2.5 + Math.random() * 3
        bursts.push({ x: mouse.x, y: mouse.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, c: i % 2 ? 'rgba(139,124,246,' : 'rgba(79,140,255,' })
      }
      start()
    }
    const up = () => ring.classList.remove('down')
    const leave = () => { dot.style.opacity = ring.style.opacity = 0; resetMagnet() }

    window.addEventListener('mousemove', move)
    window.addEventListener('mousedown', down)
    window.addEventListener('mouseup', up)
    window.addEventListener('resize', resize)
    document.addEventListener('mouseleave', leave)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(idleTimer)
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mousedown', down)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('resize', resize)
      document.removeEventListener('mouseleave', leave)
      resetMagnet()
      document.documentElement.classList.remove('fx-cursor')
      canvas.remove(); dot.remove(); ring.remove()
    }
  }, [])
  return null
}