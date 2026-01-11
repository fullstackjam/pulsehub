'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface FloatingRefreshProps {
  isLoading: boolean
  onClick: () => void
}

export function FloatingRefresh({ isLoading, onClick }: FloatingRefreshProps) {
  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        disabled={isLoading}
        className={`floating-refresh ${isLoading ? 'loading' : ''}`}
        title="Refresh all"
      >
        <svg
          className="w-6 h-6"
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
    </AnimatePresence>
  )
}
