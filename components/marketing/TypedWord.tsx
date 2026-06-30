'use client'

import { useEffect, useState } from 'react'
import { useMarketingTheme } from './ThemeProvider'

const WORDS      = ['hotel', 'resort', 'restaurant', 'property', 'portfolio']
const TYPE_MS    = 90
const DELETE_MS  = 55
const PAUSE_FULL = 1600
const PAUSE_NEXT = 300

export function TypedWord() {
  const { theme } = useMarketingTheme()

  const [display,    setDisplay]    = useState('')
  const [wordIndex,  setWordIndex]  = useState(0)
  const [charIndex,  setCharIndex]  = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const word = WORDS[wordIndex]
    let timeout: ReturnType<typeof setTimeout>

    if (!isDeleting && charIndex < word.length) {
      /* Typing */
      timeout = setTimeout(() => {
        setDisplay(word.slice(0, charIndex + 1))
        setCharIndex((c) => c + 1)
      }, TYPE_MS)
    } else if (!isDeleting && charIndex === word.length) {
      /* Pause at full word, then start deleting */
      timeout = setTimeout(() => setIsDeleting(true), PAUSE_FULL)
    } else if (isDeleting && charIndex > 0) {
      /* Deleting */
      timeout = setTimeout(() => {
        setDisplay(word.slice(0, charIndex - 1))
        setCharIndex((c) => c - 1)
      }, DELETE_MS)
    } else if (isDeleting && charIndex === 0) {
      /* Pause before next word */
      setIsDeleting(false)
      timeout = setTimeout(() => {
        setWordIndex((i) => (i + 1) % WORDS.length)
      }, PAUSE_NEXT)
    }

    return () => clearTimeout(timeout)
  }, [charIndex, wordIndex, isDeleting])

  const gradient =
    theme === 'dark'
      ? 'linear-gradient(135deg,#a5b4fc,#6366f1,#818cf8)'
      : 'linear-gradient(135deg,#4338ca,#6366f1,#818cf8)'

  return (
    <span className="relative inline-block">
      {/* Gradient typed text */}
      <span
        style={{
          backgroundImage: gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {display || ' '}
      </span>

      {/* Blinking cursor — excluded from global theme transition */}
      <span
        className="typed-cursor absolute -right-[5px] top-[0.08em] bottom-[0.08em] rounded-[1px]"
        style={{
          width: 3,
          background: 'var(--mk-accent)',
          animation: 'mk-blink-cursor 0.8s step-end infinite',
        }}
      />
    </span>
  )
}
