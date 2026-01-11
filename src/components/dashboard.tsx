'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PlatformCard } from '@/components/platform-card'
import { ThemeToggle } from '@/components/theme-toggle'
import { FloatingRefresh } from '@/components/floating-refresh'
import { ErrorInfo, PlatformData } from '@/types'
import { ApiRequestError, ApiService } from '@/lib/api'

interface DashboardProps {
  platforms: PlatformData[]
  onPlatformsChange?: (platforms: PlatformData[]) => void
  lastUpdated?: number | null
}

export function Dashboard({ platforms, onPlatformsChange, lastUpdated }: DashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const formatRelativeTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp
    const minutes = Math.round(diffMs / 60000)
    const formatter = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' })

    if (minutes < 1) return '刚刚'

    if (minutes < 60) return formatter.format(-minutes, 'minute')

    const hours = Math.round(minutes / 60)
    if (hours < 24) return formatter.format(-hours, 'hour')

    const days = Math.round(hours / 24)
    return formatter.format(-days, 'day')
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

  const handleRefreshAll = async () => {
    setIsRefreshing(true)
    try {
      const { data, errors } = await ApiService.fetchAllPlatforms()
      const fallbackError: ErrorInfo = { message: 'Data fetch failed', type: 'unknown' }

      const updatedPlatforms = platforms.map(platform => {
        const platformData = data[platform.platform]
        const platformError = errors[platform.platform]
        return {
          ...platform,
          data: platformData || null,
          loading: false,
          error: platformData
            ? null
            : platformError
              ? buildErrorInfo(platformError)
              : fallbackError
        }
      })
      onPlatformsChange?.(updatedPlatforms)
    } catch (error) {
      console.error('Error refreshing all platforms:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Separate aggregated from other platforms
  const aggregatedPlatform = platforms.find(p => p.platform === 'aggregated')
  const otherPlatforms = platforms.filter(p => p.platform !== 'aggregated')

  return (
    <div className="min-h-screen bento-background">
      {/* Header */}
      <header className="header-modern relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="logo-glow w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl">
                <span className="text-white text-xl sm:text-2xl font-bold">P</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  PulseHub
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                  实时热点聚合
                </p>
              </div>
            </motion.div>

            {/* Right side */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4"
            >
              {/* Last Updated */}
              {lastUpdated && (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  <span className="hidden sm:inline">更新于 </span>
                  {formatRelativeTime(lastUpdated)}
                </div>
              )}

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* GitHub Link */}
              <a
                href="https://github.com/fullstackjam/pulsehub"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
                title="View Source Code"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
        {/* Bento Grid */}
        <div className="bento-grid">
          {/* Featured Card - Aggregated */}
          {aggregatedPlatform && (
            <PlatformCard
              platformData={aggregatedPlatform}
              onRefresh={handleRefresh}
              index={0}
              isFeatured={true}
            />
          )}

          {/* Other Platform Cards */}
          {otherPlatforms.map((platform, index) => (
            <PlatformCard
              key={platform.platform}
              platformData={platform}
              onRefresh={handleRefresh}
              index={index + 1}
            />
          ))}
        </div>

        {/* Empty State */}
        {platforms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-slate-400 dark:text-slate-500">
              <p className="text-lg font-medium">暂无数据</p>
              <p className="text-sm mt-2">请检查网络连接或稍后重试</p>
            </div>
          </motion.div>
        )}
      </main>

      {/* Floating Refresh Button */}
      <FloatingRefresh isLoading={isRefreshing} onClick={handleRefreshAll} />
    </div>
  )
}
