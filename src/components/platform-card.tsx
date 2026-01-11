'use client'

import { motion } from 'framer-motion'
import { PlatformData } from '@/types'
import { AnimatedNumber, formatHotValue } from './animated-number'
import { CardSkeleton } from './skeleton'

interface PlatformCardProps {
  platformData: PlatformData
  onRefresh: (platform: string) => void
  index?: number
  isFeatured?: boolean
}

export function PlatformCard({
  platformData,
  onRefresh,
  index = 0,
  isFeatured = false
}: PlatformCardProps) {
  const { platform, displayName, icon, color, data, loading, error } = platformData

  const isTimeoutOrRetryError = error?.type === 'timeout' || error?.type === 'retry-exhausted' || error?.type === 'network'

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRefresh(platform)
  }

  const getRankBadgeClass = (rank: number | undefined) => {
    if (rank === 1) return 'rank-badge rank-1'
    if (rank === 2) return 'rank-badge rank-2'
    if (rank === 3) return 'rank-badge rank-3'
    return 'rank-badge rank-default'
  }

  const maxTopics = isFeatured ? 12 : 8

  if (loading) {
    return <CardSkeleton />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={`bento-card ${isFeatured ? 'bento-featured bento-card-featured' : ''} p-5 sm:p-6`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
          <div
            className={`platform-icon ${isFeatured ? 'w-12 h-12 sm:w-14 sm:h-14 text-xl' : 'w-10 h-10 sm:w-12 sm:h-12 text-base sm:text-lg'}`}
            style={{ backgroundColor: color }}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`font-bold text-slate-800 dark:text-slate-100 truncate ${isFeatured ? 'text-lg sm:text-xl lg:text-2xl' : 'text-base sm:text-lg'}`}>
              {displayName}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {data ? `${data.topics.length} topics` : 'No data'}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 disabled:opacity-50 transition-colors duration-200"
          title="Refresh"
        >
          <svg
            className={`w-5 h-5 text-slate-500 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </motion.button>
      </div>

      {/* Content */}
      <div className={isFeatured ? 'min-h-[320px] sm:min-h-[400px]' : 'min-h-[200px] sm:min-h-[240px]'}>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-40 text-center px-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400 font-medium mb-2 text-sm">
              {isTimeoutOrRetryError ? 'Connection failed' : 'Data fetch failed'}
            </p>
            <p className="text-red-500/70 dark:text-red-300/70 text-xs mb-3">{error.message}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-red-500/25"
            >
              Retry
            </motion.button>
          </motion.div>
        )}

        {data && !error && (
          <div className="space-y-1">
            {data.topics.slice(0, maxTopics).map((topic, idx) => (
              <motion.a
                key={idx}
                href={topic.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 + 0.2 }}
                className="topic-item block"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={getRankBadgeClass(topic.rank)}>
                      {topic.rank ?? idx + 1}
                    </span>
                    <p className={`text-slate-700 dark:text-slate-200 font-medium leading-snug line-clamp-1 flex-1 ${isFeatured ? 'text-sm sm:text-base' : 'text-sm'}`}>
                      {topic.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {topic.hot && topic.hot > 0 && (
                      <span className="hot-badge">
                        <AnimatedNumber
                          value={topic.hot}
                          formatFn={formatHotValue}
                          duration={800}
                        />
                      </span>
                    )}
                    {topic.platforms && topic.platforms.length > 1 && (
                      <div className="hidden sm:flex items-center gap-1">
                        {topic.platforms.slice(0, 2).map((plat, pidx) => (
                          <span
                            key={pidx}
                            className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs rounded-full font-medium"
                          >
                            {plat}
                          </span>
                        ))}
                        {topic.platforms.length > 2 && (
                          <span className="text-slate-400 dark:text-slate-500 text-xs">
                            +{topic.platforms.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.a>
            ))}

            {data.topics.length > maxTopics && (
              <div className="text-center pt-3">
                <span className="text-slate-400 dark:text-slate-500 text-sm">
                  +{data.topics.length - maxTopics} more topics
                </span>
              </div>
            )}
          </div>
        )}

        {!data && !loading && !error && (
          <div className="flex items-center justify-center h-40 text-slate-400 dark:text-slate-500">
            No data available
          </div>
        )}
      </div>
    </motion.div>
  )
}
