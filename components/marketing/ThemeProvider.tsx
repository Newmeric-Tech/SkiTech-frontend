'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'

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
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    const osDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolved: Theme = saved ?? (osDark ? 'dark' : 'light')
    setTheme(resolved)
    if (divRef.current) divRef.current.setAttribute('data-theme', resolved)
  }, [])

  const toggleTheme = () => {
    setTheme(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem(STORAGE_KEY, next)
      if (divRef.current) divRef.current.setAttribute('data-theme', next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div
        ref={divRef}
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
