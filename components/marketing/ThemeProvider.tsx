'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'

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

export function MarketingThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setTheme] = useState<Theme>('dark')
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    const osDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial: Theme = saved ?? (osDark ? 'dark' : 'light')
    setTheme(initial)
    // Set on the div — primary mechanism, immune to next-themes' <html> attribute
    if (divRef.current) divRef.current.setAttribute('data-theme', initial)
    // Also set on <html> for the [data-theme] .marketing-page selector
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      if (divRef.current) divRef.current.setAttribute('data-theme', next)
      document.documentElement.setAttribute('data-theme', next)
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

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
