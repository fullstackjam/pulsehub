export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4 transition-colors duration-300">
      <div className="text-center max-w-md w-full">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
          <span className="text-white text-xl sm:text-2xl font-bold">P</span>
        </div>
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg font-medium">Loading hot topics data...</p>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-2">Please wait, aggregating the latest hot topics for you</p>
      </div>
    </div>
  )
}
