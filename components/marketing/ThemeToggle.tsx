'use client'

import { useMarketingTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useMarketingTheme()
  const isDark = theme === 'dark'

  return (
    <button
      className="theme-btn"
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleTheme() }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="theme-btn-icon">
        {isDark ? '☀️' : '🌙'}
      </span>
      <div className="theme-btn-track">
        <div className="theme-btn-thumb" />
      </div>
      <span className="theme-btn-label">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  )
}
