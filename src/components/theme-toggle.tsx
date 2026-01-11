'use client'

import { useTheme } from '@/providers/theme-provider'

export function ThemeToggle() {
  const { theme, actualTheme, toggleTheme } = useTheme()

  const getIcon = () => {
    if (theme === 'system') {
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      )
    }

    if (actualTheme === 'dark') {
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )
    }

    return (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    )
  }

  const getTooltip = () => {
    if (theme === 'light') return 'Switch to Dark Mode'
    if (theme === 'dark') return 'Switch to System Theme'
    return 'Switch to Light Mode'
  }

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle group relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105"
      title={getTooltip()}
    >
      <div className="relative text-white">
        {getIcon()}
        {theme === 'system' && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        )}
      </div>

      <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white/30 dark:border-white/20 bg-gradient-to-br from-yellow-400 to-orange-500 dark:from-blue-400 dark:to-purple-500 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-white/80"></div>
      </div>
    </button>
  )
}
