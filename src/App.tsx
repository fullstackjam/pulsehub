import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import { ThemeProvider } from './contexts/ThemeContext';
import { PlatformData } from './types';
import { ApiService } from './services/api';

const PLATFORM_CONFIG = [
  {
    platform: 'weibo',
    displayName: 'Weibo Hot Search',
    icon: 'W',
    color: '#ff6b35'
  },
  {
    platform: 'douyin',
    displayName: 'Douyin Hot List',
    icon: 'D',
    color: '#000000'
  },
  {
    platform: 'bilibili',
    displayName: 'Bilibili Hot List',
    icon: 'B',
    color: '#00a1d6'
  },
  {
    platform: 'zhihu',
    displayName: 'Zhihu Hot List',
    icon: 'Z',
    color: '#0084ff'
  },
  {
    platform: 'baidu',
    displayName: 'Baidu Hot Search',
    icon: 'B',
    color: '#2932e1'
  },
  {
    platform: 'toutiao',
    displayName: 'Toutiao Hot List',
    icon: 'T',
    color: '#ff6600'
  },
  {
    platform: 'aggregated',
    displayName: 'Aggregated Hot Topics',
    icon: '🔥',
    color: '#ff6b35'
  }
];

function App() {
  const [platforms, setPlatforms] = useState<PlatformData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    initializePlatforms();
  }, []);

  useEffect(() => {
    const timestamps = platforms
      .map(platform => platform.data?.timestamp)
      .filter((timestamp): timestamp is number => typeof timestamp === 'number');

    if (timestamps.length === 0) {
      setLastUpdated(null);
      return;
    }

    setLastUpdated(Math.max(...timestamps));
  }, [platforms]);

  const initializePlatforms = () => {
    const initialPlatforms: PlatformData[] = PLATFORM_CONFIG.map(config => ({
      platform: config.platform,
      displayName: config.displayName,
      icon: config.icon,
      color: config.color,
      data: null,
      loading: true,
      error: null
    }));

    setPlatforms(initialPlatforms);
    fetchAllData(initialPlatforms);
  };

  const fetchAllData = async (platformList: PlatformData[]) => {
    try {
      const data = await ApiService.fetchAllPlatforms();
      
      const updatedPlatforms = platformList.map(platform => {
        const platformData = data[platform.platform];
        return {
          ...platform,
          data: platformData || null,
          loading: false,
          error: platformData ? null : 'Data fetch failed'
        };
      });

      setPlatforms(updatedPlatforms);
    } catch (error) {
      console.error('Error fetching platform data:', error);
      
      const updatedPlatforms = platformList.map(platform => ({
        ...platform,
        loading: false,
        error: 'Network connection failed'
      }));

      setPlatforms(updatedPlatforms);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    const updatedPlatforms = platforms.map(platform => ({
      ...platform,
      loading: true,
      error: null
    }));
    setPlatforms(updatedPlatforms);
    await fetchAllData(updatedPlatforms);
  };

  if (loading && platforms.length === 0) {
    return (
      <ThemeProvider>
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
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="App">
        <Dashboard
          platforms={platforms}
          onPlatformsChange={setPlatforms}
          lastUpdated={lastUpdated}
        />
        
        {/* Refresh Button */}
        <button
          onClick={refreshData}
          disabled={loading}
          className="refresh-button group fixed top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16"
          title="Refresh Data"
        >
          <svg 
            className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 transition-all duration-300 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} 
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
    </ThemeProvider>
  );
}

export default App;
