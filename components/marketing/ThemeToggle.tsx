'use client'

import { useMarketingTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useMarketingTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'var(--mk-glass-bg)',
        border: '1px solid var(--mk-border-strong)',
        borderRadius: 999,
        padding: '5px 10px',
        cursor: 'pointer',
        color: 'var(--mk-text-2)',
        fontFamily: 'inherit',
        outline: 'none',
      }}
    >
      {/* Icon — variation selector U+FE0F forces emoji rendering (without it ☀ renders as * glyph) */}
      <span style={{ fontSize: 13, lineHeight: 1 }}>
        {isDark ? '☀️' : '🌙'}
      </span>

      {/* Pill track — fully inline so no Tailwind purge risk */}
      <span
        style={{
          position: 'relative',
          display: 'inline-block',
          width: 32,
          height: 18,
          borderRadius: 9,
          background: 'var(--mk-surface-3)',
          border: '1px solid var(--mk-border-strong)',
          flexShrink: 0,
        }}
      >
        {/* Thumb — no theme-toggle-thumb class so globals.css transition:none !important doesn't kill the slide */}
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: isDark ? 3 : 17,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: 'var(--mk-accent)',
            boxShadow: '0 0 6px var(--mk-accent-glow)',
            transition: 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </span>

      {/* Label */}
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}>
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  )
}
