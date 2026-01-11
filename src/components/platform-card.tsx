'use client'

import { motion } from 'framer-motion'
import { PlatformData } from '@/types'
import { AnimatedNumber, formatHotValue } from './animated-number'
import { CardSkeleton } from './skeleton'

interface PlatformCardProps {
  platformData: PlatformData
  onRefresh: (platform: string) => void
  index?: number
}

export function PlatformCard({
  platformData,
  onRefresh,
  index = 0
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

  const maxTopics = 8

  if (loading) {
    return <CardSkeleton />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="bento-card p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="platform-icon flex-shrink-0 w-9 h-9 text-sm"
            style={{ backgroundColor: color }}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              {displayName}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              {data ? `${data.topics.length} 条` : '暂无数据'}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={loading}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 disabled:opacity-50 transition-colors duration-200 flex-shrink-0"
          title="Refresh"
        >
          <svg
            className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-500 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`}
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
      <div>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-32 text-center px-4"
          >
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400 font-medium mb-1 text-xs sm:text-sm">
              {isTimeoutOrRetryError ? 'Connection failed' : 'Data fetch failed'}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={loading}
              className="mt-2 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-medium rounded-lg transition-all duration-200"
            >
              Retry
            </motion.button>
          </motion.div>
        )}

        {data && !error && (
          <div className="space-y-0.5">
            {data.topics.slice(0, maxTopics).map((topic, idx) => (
              <motion.a
                key={idx}
                href={topic.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 + 0.1 }}
                className="topic-item block"
              >
                <div className="flex items-center gap-2">
                  <span className={getRankBadgeClass(topic.rank)}>
                    {topic.rank ?? idx + 1}
                  </span>
                  <p className="text-slate-700 dark:text-slate-200 font-medium leading-tight flex-1 min-w-0 text-xs line-clamp-1">
                    {topic.title}
                  </p>
                  {topic.hot && topic.hot > 0 && (
                    <span className="hot-badge text-[10px] flex-shrink-0">
                      <AnimatedNumber
                        value={topic.hot}
                        formatFn={formatHotValue}
                        duration={600}
                      />
                    </span>
                  )}
                </div>
                {/* Platform tags for aggregated */}
                {topic.platforms && topic.platforms.length > 1 && (
                  <div className="flex items-center gap-1 mt-0.5 ml-7">
                    {topic.platforms.slice(0, 3).map((plat, pidx) => (
                      <span
                        key={pidx}
                        className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] rounded font-medium"
                      >
                        {plat}
                      </span>
                    ))}
                  </div>
                )}
              </motion.a>
            ))}

            {data.topics.length > maxTopics && (
              <div className="text-center pt-2">
                <span className="text-slate-400 dark:text-slate-500 text-xs">
                  +{data.topics.length - maxTopics} more
                </span>
              </div>
            )}
          </div>
        )}

        {!data && !loading && !error && (
          <div className="flex items-center justify-center h-32 text-slate-400 dark:text-slate-500 text-sm">
            No data available
          </div>
        )}
      </div>
    </motion.div>
  )
}
