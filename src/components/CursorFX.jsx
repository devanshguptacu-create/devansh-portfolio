import { useEffect } from 'react'

export default function CursorFX() {
  useEffect(() => {
    if (!matchMedia('(pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return

    document.documentElement.classList.add('fx-cursor')
    const dot = document.createElement('div')
    const ring = document.createElement('div')
    dot.className = 'fx-dot'
    ring.className = 'fx-ring'
    document.body.append(dot, ring)

    let x = -100, y = -100, rx = -100, ry = -100, raf = 0

    const move = (e) => {
      x = e.clientX
      y = e.clientY
      dot.style.transform = `translate(${x}px,${y}px)`
      dot.style.opacity = ring.style.opacity = 1
      const hot = e.target.closest?.('a,button,[role=button],label,select')
      ring.classList.toggle('hot', !!hot)
      const card = e.target.closest?.('.card')
      if (card) {
        const r = card.getBoundingClientRect()
        card.style.setProperty('--mx', e.clientX - r.left + 'px')
        card.style.setProperty('--my', e.clientY - r.top + 'px')
      }
    }
    const loop = () => {
      rx += (x - rx) * 0.16
      ry += (y - ry) * 0.16
      ring.style.transform = `translate(${rx}px,${ry}px)`
      raf = requestAnimationFrame(loop)
    }
    const down = () => ring.classList.add('down')
    const up = () => ring.classList.remove('down')
    const leave = () => { dot.style.opacity = ring.style.opacity = 0 }

    window.addEventListener('mousemove', move)
    window.addEventListener('mousedown', down)
    window.addEventListener('mouseup', up)
    document.addEventListener('mouseleave', leave)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mousedown', down)
      window.removeEventListener('mouseup', up)
      document.removeEventListener('mouseleave', leave)
      document.documentElement.classList.remove('fx-cursor')
      dot.remove()
      ring.remove()
    }
  }, [])
  return null
}