'use client'

import { useState } from 'react'
import { PlatformCard } from '@/components/platform-card'
import { ThemeToggle } from '@/components/theme-toggle'
import { ErrorInfo, PlatformData } from '@/types'
import { ApiRequestError, ApiService } from '@/lib/api'

interface DashboardProps {
  platforms: PlatformData[]
  onPlatformsChange?: (platforms: PlatformData[]) => void
  lastUpdated?: number | null
}

export function Dashboard({ platforms, onPlatformsChange, lastUpdated }: DashboardProps) {
  const [draggedPlatform, setDraggedPlatform] = useState<string | null>(null)

  const formatAbsoluteTime = (timestamp: number) =>
    new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(timestamp)

  const formatRelativeTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp
    const minutes = Math.round(diffMs / 60000)
    const formatter = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' })

    if (minutes < 1) return formatter.format(0, 'minute')

    if (minutes < 60) return formatter.format(-minutes, 'minute')

    const hours = Math.round(minutes / 60)
    if (hours < 24) return formatter.format(-hours, 'hour')

    const days = Math.round(hours / 24)
    return formatter.format(-days, 'day')
  }

  const renderLastUpdated = () => {
    if (!lastUpdated) return '—'

    const absoluteTime = formatAbsoluteTime(lastUpdated)
    const relativeTime = formatRelativeTime(lastUpdated)

    return `${absoluteTime}${relativeTime ? ` (${relativeTime})` : ''}`
  }

  const buildErrorInfo = (error: ApiRequestError | Error): ErrorInfo => {
    if (error instanceof ApiRequestError) {
      if (error.type === 'timeout' || error.type === 'retry-exhausted') {
        return { message: 'Request timed out or failed after retries. Please retry.', type: error.type }
      }

      if (error.type === 'network') {
        return { message: 'Network issue detected. Try refreshing.', type: error.type }
      }

      return { message: error.message, type: error.type }
    }

    return { message: 'Refresh failed', type: 'unknown' }
  }

  const handleRefresh = async (platform: string) => {
    try {
      const data = await ApiService.fetchPlatformData(platform)
      const updatedPlatforms = platforms.map(p =>
        p.platform === platform
          ? { ...p, data, loading: false, error: null }
          : p
      )
      onPlatformsChange?.(updatedPlatforms)
    } catch (error) {
      console.error(`Error refreshing ${platform}:`, error)
      const apiError = error instanceof ApiRequestError
        ? error
        : new ApiRequestError('Refresh failed', 'unknown', false)
      const updatedPlatforms = platforms.map(p =>
        p.platform === platform
          ? { ...p, loading: false, error: buildErrorInfo(apiError) }
          : p
      )
      onPlatformsChange?.(updatedPlatforms)
    }
  }

  const handleDragStart = (_e: React.DragEvent, platform: string) => {
    setDraggedPlatform(platform)
  }

  const handleDragEnd = () => {
    setDraggedPlatform(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetPlatform: string) => {
    e.preventDefault()

    if (draggedPlatform && draggedPlatform !== targetPlatform) {
      const draggedIndex = platforms.findIndex(p => p.platform === draggedPlatform)
      const targetIndex = platforms.findIndex(p => p.platform === targetPlatform)

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newPlatforms = [...platforms]
        const [draggedItem] = newPlatforms.splice(draggedIndex, 1)
        newPlatforms.splice(targetIndex, 0, draggedItem)
        onPlatformsChange?.(newPlatforms)
      }
    }

    setDraggedPlatform(null)
  }

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="header-gradient dark:header-gradient-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 flex items-center justify-center shadow-2xl">
                <span className="text-white text-lg sm:text-xl font-bold">P</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">PulseHub</h1>
                <p className="mt-1 sm:mt-2 text-slate-300 dark:text-slate-200 text-sm sm:text-base lg:text-lg">Real-time Hot Topics Aggregation Platform</p>
              </div>
            </div>
            <div className="flex items-center justify-between lg:justify-end space-x-4 lg:space-x-6">
              <div className="text-left lg:text-right">
                <div className="text-slate-300 dark:text-slate-200 text-xs sm:text-sm mb-1">Last Updated</div>
                <div className="text-white font-medium text-sm sm:text-base">
                  {renderLastUpdated()}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* GitHub Link */}
                <a
                  href="https://github.com/fullstackjam/pulsehub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="github-link group flex-shrink-0"
                  title="View Source Code"
                >
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white/80 group-hover:text-white transition-all duration-300 group-hover:scale-110"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {platforms.map((platform) => (
            <PlatformCard
              key={platform.platform}
              platformData={platform}
              onRefresh={handleRefresh}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>

        {/* Empty State */}
        {platforms.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-slate-500 dark:text-slate-400">
              <p className="text-base sm:text-lg font-medium">No platform data available</p>
              <p className="text-xs sm:text-sm mt-2">Please check your network connection or try again later</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
