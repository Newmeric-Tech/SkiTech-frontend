'use client'

import { useEffect, useRef } from 'react'

const GLOW_SIZE = 300
const RING_SIZE = 36
const DOT_SIZE  = 8

export function CustomCursor() {
  const glowRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    /* Only activate on pointer:fine (mouse) devices */
    if (window.matchMedia('(pointer: coarse)').matches) return

    const glow = glowRef.current
    const ring = ringRef.current
    const dot  = dotRef.current
    if (!glow || !ring || !dot) return

    /* State — mutated in rAF, never triggers re-render */
    let mouseX  = -500, mouseY  = -500
    let glowX   = -500, glowY   = -500
    let ringX   = -500, ringY   = -500
    let scale   = 1
    let hovering = false
    let visible  = false
    let raf: number

    /* --- Event handlers --- */
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      if (!visible) {
        /* Teleport lag-followers to cursor on first move to avoid swooping in */
        glowX = mouseX; glowY = mouseY
        ringX = mouseX; ringY = mouseY
        visible = true
        glow.style.opacity = '1'
        ring.style.opacity = '1'
        dot.style.opacity  = '1'
      }
    }

    const onLeaveDoc = () => {
      visible = false
      glow.style.opacity = '0'
      ring.style.opacity = '0'
      dot.style.opacity  = '0'
    }

    /* Delegate interactive-element detection via bubbling mouseover */
    const onOver = (e: MouseEvent) => {
      hovering = !!(e.target as HTMLElement).closest(
        'a, button, [role="button"], input, textarea, select, label, [tabindex]'
      )
    }

    /* --- Animation loop --- */
    const animate = () => {
      /* Dot: exact pixel follow */
      dot.style.transform = `translate(${mouseX - DOT_SIZE / 2}px,${mouseY - DOT_SIZE / 2}px)`

      /* Ring: gentle lag + lerp'd scale on interactive hover */
      ringX  += (mouseX - ringX) * 0.15
      ringY  += (mouseY - ringY) * 0.15
      scale  += ((hovering ? 1.65 : 1) - scale) * 0.14
      ring.style.transform = `translate(${ringX - RING_SIZE / 2}px,${ringY - RING_SIZE / 2}px) scale(${scale})`

      /* Glow: slower drift */
      glowX  += (mouseX - glowX) * 0.06
      glowY  += (mouseY - glowY) * 0.06
      glow.style.transform = `translate(${glowX - GLOW_SIZE / 2}px,${glowY - GLOW_SIZE / 2}px)`

      raf = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove',   onMove)
    document.addEventListener('mouseleave', onLeaveDoc)
    document.addEventListener('mouseover',  onOver)
    raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove',   onMove)
      document.removeEventListener('mouseleave', onLeaveDoc)
      document.removeEventListener('mouseover',  onOver)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      {/* Glow — large soft blob, slowest */}
      <div
        id="cursor-glow"
        ref={glowRef}
        className="fixed top-0 left-0 pointer-events-none select-none"
        style={{
          zIndex:       9990,
          width:        GLOW_SIZE,
          height:       GLOW_SIZE,
          borderRadius: '50%',
          background:   'radial-gradient(circle, var(--mk-accent-glow) 0%, transparent 68%)',
          opacity:      0,
          willChange:   'transform',
        }}
      />

      {/* Ring — medium circle, slight lag */}
      <div
        id="cursor-ring"
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none select-none"
        style={{
          zIndex:       9998,
          width:        RING_SIZE,
          height:       RING_SIZE,
          borderRadius: '50%',
          border:       '1.5px solid var(--mk-accent)',
          opacity:      0,
          willChange:   'transform',
          transformOrigin: '50% 50%',
        }}
      />

      {/* Dot — small precise follower */}
      <div
        id="cursor-dot"
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none select-none"
        style={{
          zIndex:       9999,
          width:        DOT_SIZE,
          height:       DOT_SIZE,
          borderRadius: '50%',
          background:   'var(--mk-accent)',
          opacity:      0,
          willChange:   'transform',
        }}
      />
    </>
  )
}
