'use client'

import { useMarketingTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useMarketingTheme()

  return (
    <button
      className="theme-btn"
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        toggleTheme()
      }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="theme-btn-icon">
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
      <div className="theme-btn-track">
        <div className="theme-btn-thumb" />
      </div>
      <span className="theme-btn-label">
        {theme === 'dark' ? 'Light' : 'Dark'}
      </span>
    </button>
  )
}
