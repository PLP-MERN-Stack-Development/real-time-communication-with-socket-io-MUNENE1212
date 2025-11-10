import { useState, useEffect } from 'react'

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('chatflow-theme')
    if (savedTheme) return savedTheme

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }

    return 'light'
  })

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)

    // Save to localStorage
    localStorage.setItem('chatflow-theme', theme)

    // Remove preload class after theme is applied
    setTimeout(() => {
      document.body.classList.remove('preload')
    }, 100)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  return { theme, toggleTheme }
}
