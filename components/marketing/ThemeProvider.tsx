'use client'

import {
  createContext, useContext, useEffect,
  useState, useCallback
} from 'react'

type Theme = 'dark' | 'light'
const STORAGE_KEY = 'skitech-marketing-theme'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  isMenuOpen: boolean
  setMenuOpen: (open: boolean) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
  isMenuOpen: false,
  setMenuOpen: () => {},
})

export function MarketingThemeProvider({
  children,
  fontVariables = '',
}: {
  children: React.ReactNode
  fontVariables?: string
}) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [isMenuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    const osDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial: Theme = saved ?? (osDark ? 'dark' : 'light')
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', next)
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isMenuOpen, setMenuOpen }}>
      <div className={`marketing-page ${fontVariables}`} suppressHydrationWarning>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export const useMarketingTheme = () => useContext(ThemeContext)
