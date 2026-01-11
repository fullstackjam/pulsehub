import { ApiService } from '@/lib/api'
import { PlatformData, ErrorInfo } from '@/types'
import { ApiRequestError } from '@/lib/api'
import { HomeClient } from '@/components/home-client'

export const dynamic = 'force-dynamic'

const PLATFORM_CONFIG = [
  {
    platform: 'weibo',
    displayName: '微博热搜',
    icon: 'W',
    color: '#ff6b35'
  },
  {
    platform: 'douyin',
    displayName: '抖音热榜',
    icon: 'D',
    color: '#161823'
  },
  {
    platform: 'bilibili',
    displayName: 'B站热榜',
    icon: 'B',
    color: '#00a1d6'
  },
  {
    platform: 'zhihu',
    displayName: '知乎热榜',
    icon: 'Z',
    color: '#0084ff'
  },
  {
    platform: 'baidu',
    displayName: '百度热搜',
    icon: 'B',
    color: '#2932e1'
  },
  {
    platform: 'toutiao',
    displayName: '头条热榜',
    icon: 'T',
    color: '#ff6600'
  },
  {
    platform: 'aggregated',
    displayName: '热点聚合',
    icon: '🔥',
    color: '#6366f1'
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

async function getInitialData(): Promise<PlatformData[]> {
  const initialPlatforms: PlatformData[] = PLATFORM_CONFIG.map(config => ({
    platform: config.platform,
    displayName: config.displayName,
    icon: config.icon,
    color: config.color,
    data: null,
    loading: false,
    error: null
  }))

  try {
    const { data, errors } = await ApiService.fetchAllPlatforms()
    const fallbackError: ErrorInfo = { message: 'Data fetch failed', type: 'unknown' }

    return initialPlatforms.map(platform => {
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
  } catch (error) {
    console.error('Error fetching platform data:', error)

    const apiError = error instanceof ApiRequestError
      ? error
      : new ApiRequestError('Network connection failed', 'network', true)

    return initialPlatforms.map(platform => ({
      ...platform,
      loading: false,
      data: null,
      error: buildErrorInfo(apiError)
    }))
  }
}

export default async function Home() {
  const platforms = await getInitialData()

  return <HomeClient initialPlatforms={platforms} />
}
