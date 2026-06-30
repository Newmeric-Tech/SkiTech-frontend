'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'
const STORAGE_KEY = 'skitech-marketing-theme'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
})

export function MarketingThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    const osDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(saved ?? (osDark ? 'dark' : 'light'))
  }, [])

  const toggleTheme = () => {
    setTheme(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div
        className="marketing-page font-merriweather"
        data-theme={theme}
        suppressHydrationWarning
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export const useMarketingTheme = () => useContext(ThemeContext)
