import React from 'react';
import { HotTopic, PlatformData } from '../types';

interface PlatformCardProps {
  platformData: PlatformData;
  filteredTopics: HotTopic[];
  searchQuery: string;
  onRefresh: (platform: string) => void;
  onDragStart: (e: React.DragEvent, platform: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetPlatform: string) => void;
}

const PlatformCard: React.FC<PlatformCardProps> = ({
  platformData,
  filteredTopics,
  searchQuery,
  onRefresh,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop
}) => {
  const { platform, displayName, icon, color, data, loading, error } = platformData;
  const visibleTopicCount = 8;

  const highlightText = (text: string, query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return text;

    const lowerText = text.toLowerCase();
    const lowerQuery = trimmedQuery.toLowerCase();
    const segments: React.ReactNode[] = [];
    let startIndex = 0;
    let matchIndex = lowerText.indexOf(lowerQuery, startIndex);

    while (matchIndex !== -1) {
      if (matchIndex > startIndex) {
        segments.push(text.slice(startIndex, matchIndex));
      }

      const matchedText = text.slice(matchIndex, matchIndex + trimmedQuery.length);
      segments.push(
        <mark
          key={segments.length}
          className="bg-yellow-200 dark:bg-yellow-500/40 text-slate-900 dark:text-slate-900 rounded px-0.5"
        >
          {matchedText}
        </mark>
      );

      startIndex = matchIndex + trimmedQuery.length;
      matchIndex = lowerText.indexOf(lowerQuery, startIndex);
    }

    if (startIndex < text.length) {
      segments.push(text.slice(startIndex));
    }

    return segments;
  };

  const topicsToDisplay = searchQuery
    ? filteredTopics
    : filteredTopics.slice(0, visibleTopicCount);

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRefresh(platform);
  };

  return (
    <div
      className="platform-card group relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-5 sm:p-6 lg:p-8 hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-move"
      draggable
      onDragStart={(e) => onDragStart(e, platform)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, platform)}
      style={{ borderTopColor: color, borderTopWidth: '4px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
          <div 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg lg:text-xl truncate">{displayName}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
              {data ? `${data.topics.length} topics` : 'No data'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="refresh-btn opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 flex-shrink-0"
          title="Refresh"
        >
          <svg 
            className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300 ${loading ? 'animate-spin' : ''}`} 
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
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[200px] sm:min-h-[240px] lg:min-h-[280px]">
        {loading && (
          <div className="flex items-center justify-center h-32 sm:h-40 lg:h-48">
            <div className="loading-spinner"></div>
          </div>
        )}
        
        {error && (
          <div className="flex flex-col items-center justify-center h-32 sm:h-40 lg:h-48 text-center px-2">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Data fetch failed</p>
            <p className="text-red-500 dark:text-red-300 text-xs sm:text-sm">{error}</p>
          </div>
        )}
        
        {data && !loading && !error && (
          <div className="space-y-1.5">
            {topicsToDisplay.map((topic, index) => (
              <a
                key={index}
                href={topic.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2.5 rounded-md bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 group/link"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="text-slate-400 dark:text-slate-500 text-sm font-mono flex-shrink-0 w-6 text-center">
                      {topic.rank}
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 font-medium text-sm leading-snug group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors duration-200 line-clamp-1 flex-1">
                      {highlightText(topic.title, searchQuery)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
                    {topic.hot && topic.hot > 0 && (
                      <span className="text-xs text-red-500 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                        {topic.hot > 10000 ? `${(topic.hot / 10000).toFixed(1)}w` : topic.hot}
                      </span>
                    )}
                    {topic.platforms && topic.platforms.length > 1 && (
                      <div className="flex items-center space-x-1">
                        {topic.platforms.slice(0, 2).map((platform, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-full"
                          >
                            {platform}
                          </span>
                        ))}
                        {topic.platforms.length > 2 && (
                          <span className="text-slate-500 dark:text-slate-400 text-xs">+{topic.platforms.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </a>
            ))}
            
            {searchQuery && filteredTopics.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/40 rounded-lg">
                <p className="text-sm font-medium">无匹配结果</p>
                <p className="text-xs mt-1">尝试调整关键词或查看其他平台</p>
              </div>
            )}

            {!searchQuery && data.topics.length > visibleTopicCount && (
              <div className="text-center pt-2">
                <span className="text-slate-500 dark:text-slate-400 text-sm">
                  +{data.topics.length - visibleTopicCount} more topics
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformCard;
