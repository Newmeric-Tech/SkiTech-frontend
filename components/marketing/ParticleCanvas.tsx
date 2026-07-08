'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  alphaDir: number
}

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = 0
    let H = 0
    let particles: Particle[] = []
    let animId: number
    const mouse = { x: -9999, y: -9999 }

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
      const count = Math.floor((W * H) / 7000)
      particles = Array.from({ length: count }, () => ({
        x:        Math.random() * W,
        y:        Math.random() * H,
        vx:       (Math.random() - 0.5) * 0.3,
        vy:       (Math.random() - 0.5) * 0.3,
        radius:   1.2 + Math.random() * 1.8,
        alpha:    0.18 + Math.random() * 0.7,
        alphaDir: Math.random() > 0.5 ? 1 : -1,
      }))
    }

    /* Listen on window so canvas can stay pointer-events-none */
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        mouse.x = x
        mouse.y = y
      } else {
        mouse.x = -9999
        mouse.y = -9999
      }
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    resize()

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      /* Read theme token each frame — no restart needed on theme switch */
      const pageEl = canvas.closest<HTMLElement>('.marketing-page')
      const rgb = (
        getComputedStyle(pageEl ?? document.documentElement)
          .getPropertyValue('--mk-particle-rgb')
          .trim() || '99,102,241'
      )

      particles.forEach((p) => {
        /* Pulse alpha */
        p.alpha += p.alphaDir * 0.005
        if (p.alpha >= 0.9) { p.alpha = 0.9; p.alphaDir = -1 }
        if (p.alpha <= 0.12) { p.alpha = 0.12; p.alphaDir =  1 }

        /* Mouse repulsion */
        const dx   = p.x - mouse.x
        const dy   = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > 0 && dist < 120) {
          const force = (120 - dist) / 120
          p.vx += (dx / dist) * force * 0.14
          p.vy += (dy / dist) * force * 0.14
        }

        /* Dampen and clamp velocity */
        p.vx *= 0.98
        p.vy *= 0.98
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > 1.4) { p.vx *= 1.4 / speed; p.vy *= 1.4 / speed }

        /* Move + wrap */
        p.x += p.vx
        p.y += p.vy
        if (p.x < -5)    p.x = W + 5
        if (p.x > W + 5) p.x = -5
        if (p.y < -5)    p.y = H + 5
        if (p.y > H + 5) p.y = -5

        /* Draw particle */
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rgb},${p.alpha})`
        ctx.fill()
      })

      /* Connection lines between nearby particles */
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a  = particles[i]
          const b  = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < 90) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(${rgb},${(1 - d / 90) * 0.22})`
            ctx.lineWidth   = 0.6
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
