'use client'

import { useMarketingTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useMarketingTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        toggleTheme()
      }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: '10px',
        padding: '5px 10px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 600,
        fontFamily: 'inherit',
        color: 'inherit',
        whiteSpace: 'nowrap',
      }}
    >
      {/* Mode icon */}
      <span style={{ fontSize: '14px', lineHeight: '1' }}>
        {isDark ? '☀️' : '🌙'}
      </span>

      {/* Pill track */}
      <span
        style={{
          position: 'relative',
          display: 'inline-block',
          width: '32px',
          height: '18px',
          borderRadius: '100px',
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.22)',
          flexShrink: 0,
        }}
      >
        {/* Sliding thumb */}
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: isDark ? '2px' : '14px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#6366f1',
            boxShadow: '0 0 6px rgba(99,102,241,0.6)',
            transition: 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </span>

      {/* Label */}
      <span style={{ fontSize: '12px' }}>
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  )
}
