'use client'

import { useMarketingTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useMarketingTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{
        background: 'var(--mk-glass-bg)',
        border: '1px solid var(--mk-border-strong)',
        color: 'var(--mk-text-2)',
      }}
    >
      <span className="text-[13px] leading-none">{isDark ? '☀' : '🌙'}</span>

      {/* Pill track */}
      <div
        className="relative flex-shrink-0"
        style={{
          width: 32,
          height: 18,
          borderRadius: 9,
          background: 'var(--mk-surface-3)',
          border: '1px solid var(--mk-border-strong)',
        }}
      >
        {/* Sliding thumb — excluded from global transition via .theme-toggle-thumb */}
        <div
          className="theme-toggle-thumb absolute top-[3px]"
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: 'var(--mk-accent)',
            boxShadow: '0 0 6px var(--mk-accent-glow)',
            transform: isDark ? 'translateX(3px)' : 'translateX(17px)',
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </div>

      {/* Label — hidden on small screens */}
      <span
        className="hidden sm:block text-[11px]"
        style={{
          fontWeight: 600,
          letterSpacing: '0.04em',
          color: 'var(--mk-text-2)',
        }}
      >
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  )
}
