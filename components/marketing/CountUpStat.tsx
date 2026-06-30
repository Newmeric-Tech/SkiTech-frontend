'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpStatProps {
  to: number
  suffix?: string
  decimals?: number
  separator?: boolean
  duration?: number
}

export function CountUpStat({
  to,
  suffix    = '',
  decimals  = 0,
  separator = false,
  duration  = 1800,
}: CountUpStatProps) {
  const ref     = useRef<HTMLSpanElement>(null)
  const [value, setValue]   = useState(0)
  const [started, setStarted] = useState(false)

  /* Trigger on scroll into view */
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  /* Animate counter */
  useEffect(() => {
    if (!started) return
    const startTime = performance.now()

    const tick = (now: number) => {
      const t      = Math.min((now - startTime) / duration, 1)
      const eased  = 1 - Math.pow(1 - t, 3) /* cubic ease-out */
      setValue(eased * to)
      if (t < 1) requestAnimationFrame(tick)
      else setValue(to)
    }

    requestAnimationFrame(tick)
  }, [started, to, duration])

  /* Format the number */
  const formatted = (() => {
    if (decimals > 0) return value.toFixed(decimals)
    const n = Math.floor(value)
    return separator ? n.toLocaleString() : n.toString()
  })()

  return <span ref={ref}>{formatted}{suffix}</span>
}
