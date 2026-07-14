'use client'

import { useEffect, useState } from 'react'

const WORDS      = ['hotel', 'resort', 'restaurant', 'property', 'portfolio']
const TYPE_MS    = 90
const DELETE_MS  = 55
const PAUSE_FULL = 1600
const PAUSE_NEXT = 300

export function TypedWord() {
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
      timeout = setTimeout(() => {
        setIsDeleting(false)
        setWordIndex((i) => (i + 1) % WORDS.length)
      }, PAUSE_NEXT)
    }

    return () => clearTimeout(timeout)
  }, [charIndex, wordIndex, isDeleting])

  return (
    <span className="relative inline-block" style={{ color: 'var(--mk-text-1)' }}>
      {display || ' '}

      {/* Blinking cursor — excluded from global theme transition */}
      <span
        className="typed-cursor absolute -right-[5px] top-[0.08em] bottom-[0.08em] rounded-[1px]"
        style={{
          width: 3,
          background: 'var(--mk-text-1)',
          animation: 'mk-blink-cursor 0.8s step-end infinite',
        }}
      />
    </span>
  )
}
