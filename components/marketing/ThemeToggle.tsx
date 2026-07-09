'use client'

import { Sun, Moon } from 'lucide-react'
import { useMarketingTheme } from './ThemeProvider'

const SLOT = 26
const PAD = 3
const WIDTH = 64
const HEIGHT = 32
const TRAVEL = WIDTH - PAD * 2 - SLOT

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
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: `${WIDTH}px`,
        height: `${HEIGHT}px`,
        padding: `${PAD}px`,
        borderRadius: '999px',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,23,42,0.08)',
        background: isDark ? 'rgba(15,15,20,0.4)' : 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: isDark ? 'none' : '0 4px 20px rgba(15,23,42,0.05)',
        cursor: 'pointer',
        flexShrink: 0,
        transition:
          'background-color 0.5s cubic-bezier(0.4,0,0.2,1), border-color 0.5s cubic-bezier(0.4,0,0.2,1), box-shadow 0.5s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Sliding thumb */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: `${PAD}px`,
          left: `${PAD}px`,
          width: `${SLOT}px`,
          height: `${SLOT}px`,
          borderRadius: '999px',
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)',
          border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(15,23,42,0.06)',
          boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 4px 12px rgba(15,23,42,0.04)',
          transform: `translateX(${isDark ? TRAVEL : 0}px)`,
          transition:
            'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), background-color 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease',
        }}
      />

      {/* Sun */}
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: `${SLOT}px`,
          height: `${SLOT}px`,
        }}
      >
        <Sun
          size={15}
          strokeWidth={2.5}
          style={{
            color: !isDark ? '#eab308' : 'rgba(255,255,255,0.3)',
            filter: !isDark ? 'drop-shadow(0 0 6px rgba(234,179,8,0.5))' : 'none',
            transition: 'color 0.5s ease, filter 0.5s ease',
          }}
        />
      </span>

      {/* Moon */}
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: `${SLOT}px`,
          height: `${SLOT}px`,
        }}
      >
        <Moon
          size={15}
          strokeWidth={2.5}
          style={{
            color: isDark ? '#3b82f6' : 'rgba(15,23,42,0.3)',
            filter: isDark ? 'drop-shadow(0 0 6px rgba(59,130,246,0.5))' : 'none',
            transition: 'color 0.5s ease, filter 0.5s ease',
          }}
        />
      </span>
    </button>
  )
}
