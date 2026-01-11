'use client'

import { useState, useEffect } from 'react'
import { Dashboard } from '@/components/dashboard'
import { RefreshButton } from '@/components/refresh-button'
import { PlatformData, ErrorInfo } from '@/types'
import { ApiRequestError, ApiService } from '@/lib/api'

interface HomeClientProps {
  initialPlatforms: PlatformData[]
}

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
]

function buildErrorInfo(error: ApiRequestError | Error): ErrorInfo {
  if (error instanceof ApiRequestError) {
    if (error.type === 'timeout' || error.type === 'retry-exhausted') {
      return { message: 'Request timed out or failed after retries. Please retry.', type: error.type }
    }

    if (error.type === 'network') {
      return { message: 'Network connection failed. Please check and try again.', type: error.type }
    }

    return { message: error.message, type: error.type }
  }

  return { message: 'Unexpected error occurred', type: 'unknown' }
}

export function HomeClient({ initialPlatforms }: HomeClientProps) {
  const [platforms, setPlatforms] = useState<PlatformData[]>(initialPlatforms)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  useEffect(() => {
    const timestamps = platforms
      .map(platform => platform.data?.timestamp)
      .filter((timestamp): timestamp is number => typeof timestamp === 'number')

    if (timestamps.length === 0) {
      setLastUpdated(null)
      return
    }

    setLastUpdated(Math.max(...timestamps))
  }, [platforms])

  const fetchAllData = async (platformList: PlatformData[]) => {
    try {
      const { data, errors } = await ApiService.fetchAllPlatforms()
      const fallbackError: ErrorInfo = { message: 'Data fetch failed', type: 'unknown' }

      const updatedPlatforms = platformList.map(platform => {
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

      setPlatforms(updatedPlatforms)
    } catch (error) {
      console.error('Error fetching platform data:', error)

      const apiError = error instanceof ApiRequestError
        ? error
        : new ApiRequestError('Network connection failed', 'network', true)

      const updatedPlatforms = platformList.map(platform => ({
        ...platform,
        loading: false,
        data: null,
        error: buildErrorInfo(apiError)
      }))

      setPlatforms(updatedPlatforms)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setLoading(true)
    const updatedPlatforms = PLATFORM_CONFIG.map(config => ({
      platform: config.platform,
      displayName: config.displayName,
      icon: config.icon,
      color: config.color,
      data: null,
      loading: true,
      error: null
    }))
    setPlatforms(updatedPlatforms)
    await fetchAllData(updatedPlatforms)
  }

  return (
    <div className="App">
      <Dashboard
        platforms={platforms}
        onPlatformsChange={setPlatforms}
        lastUpdated={lastUpdated}
      />
      <RefreshButton onClick={refreshData} loading={loading} />
    </div>
  )
}
