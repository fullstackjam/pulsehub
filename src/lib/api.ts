import { ApiErrorType, PlatformResponse } from '@/types';

const API_BASE_URL = 'https://60s.viki.moe';

export class ApiRequestError extends Error {
  type: ApiErrorType;
  retryable: boolean;

  constructor(message: string, type: ApiErrorType = 'unknown', retryable = false) {
    super(message);
    this.name = 'ApiRequestError';
    this.type = type;
    this.retryable = retryable;
  }
}

export class ApiService {
  private static async withRetry<T>(
    fn: () => Promise<T>,
    options: { retries?: number; baseDelay?: number } = {}
  ): Promise<T> {
    const { retries = 2, baseDelay = 700 } = options;
    let attempt = 0;

    while (attempt <= retries) {
      try {
        return await fn();
      } catch (error) {
        const apiError =
          error instanceof ApiRequestError
            ? error
            : new ApiRequestError('Unknown error occurred', 'unknown', false);

        const shouldRetry = apiError.retryable && attempt < retries;

        if (!shouldRetry) {
          throw apiError.type === 'unknown'
            ? new ApiRequestError(apiError.message, apiError.type, apiError.retryable)
            : apiError;
        }

        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt += 1;
      }
    }

    throw new ApiRequestError('Failed after maximum retry attempts', 'retry-exhausted', false);
  }

  private static async fetchFrom60sAPI(endpoint: string): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'PulseHub/2.0.0',
          'Accept': 'application/json',
        },
        signal: controller.signal,
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new ApiRequestError(
          `HTTP error! status: ${response.status}`,
          'http',
          response.status >= 500
        );
      }

      return response.json();
    } catch (error) {
      console.error(`Error fetching from 60s API ${endpoint}:`, error);
      if (error instanceof ApiRequestError) {
        throw error;
      }

      if ((error as Error)?.name === 'AbortError') {
        throw new ApiRequestError('Request timed out. Please try again.', 'timeout', true);
      }

      throw new ApiRequestError(`Failed to fetch data from ${endpoint}`, 'network', true);
    } finally {
      clearTimeout(timeout);
    }
  }

  static async fetchPlatformData(platform: string): Promise<PlatformResponse> {
    const endpointMap: Record<string, string> = {
      weibo: '/v2/weibo',
      douyin: '/v2/douyin',
      bilibili: '/v2/bili',
      zhihu: '/v2/zhihu',
      baidu: '/v2/baidu/hot',
      toutiao: '/v2/toutiao',
    };

    const endpoint = endpointMap[platform];
    if (!endpoint) {
      throw new Error(`Platform ${platform} is not supported by the API`);
    }

    const data = await this.withRetry(
      () => this.fetchFrom60sAPI(endpoint),
      { retries: 1, baseDelay: 500 }
    );
    return this.transformData(platform, data);
  }

  private static generateHotValue(originalHot: unknown, rank: number): number {
    if (typeof originalHot === 'number' && originalHot > 0) {
      return originalHot;
    }

    const baseHot = 100000;
    const rankMultiplier = Math.max(1, 50 - rank);
    return baseHot * rankMultiplier;
  }

  private static transformData(platform: string, data: unknown): PlatformResponse {
    const urlTemplates: Record<string, string> = {
      weibo: 'https://s.weibo.com/weibo?q={query}&typeall=1&suball=1',
      douyin: 'https://www.douyin.com/search/{query}?type=general',
      bilibili: 'https://search.bilibili.com/all?keyword={query}&order=pubdate',
      zhihu: 'https://www.zhihu.com/search?q={query}&type=content',
      baidu: 'https://www.baidu.com/s?wd={query}&tn=baidu&ie=utf-8',
      toutiao: 'https://www.toutiao.com/search/?keyword={query}&autocomplete=true',
    };

    const urlTemplate = urlTemplates[platform] || 'https://www.baidu.com/s?wd={query}';
    const responseData = data as { data?: Array<{ title?: string; name?: string; word?: string; url?: string; hot?: number; hot_value?: number }> };

    return {
      platform,
      topics: responseData.data?.map((item, index) => ({
        title: item.title || item.name || item.word || '',
        url: item.url || urlTemplate.replace('{query}', encodeURIComponent(item.title || item.name || item.word || '')),
        hot: this.generateHotValue(item.hot || item.hot_value, index),
        rank: index + 1
      })) || [],
      timestamp: Date.now()
    };
  }

  private static async fetchAllPlatformsOnce(): Promise<{ data: Record<string, PlatformResponse>; errors: Record<string, ApiRequestError | null> }> {
    const platforms = ['weibo', 'douyin', 'bilibili', 'zhihu', 'baidu', 'toutiao'];

    const errors: Record<string, ApiRequestError | null> = {};
    const promises = platforms.map(async (platform) => {
      try {
        const data = await this.fetchPlatformData(platform);
        return { platform, data, error: null };
      } catch (error) {
        console.error(`Error fetching ${platform}:`, error);
        const apiError =
          error instanceof ApiRequestError
            ? error
            : new ApiRequestError(`Failed to fetch data from ${platform}`, 'unknown', false);
        errors[platform] = apiError;
        return { platform, data: null, error: apiError };
      }
    });

    const results = await Promise.all(promises);

    const platformData = results.reduce((acc, { platform, data }) => {
      if (data) {
        acc[platform] = data;
      }
      return acc;
    }, {} as Record<string, PlatformResponse>);

    const aggregatedData = this.generateAggregatedHotTopics(platformData);
    if (aggregatedData) {
      platformData['aggregated'] = aggregatedData;
      errors['aggregated'] = null;
    } else if (Object.keys(platformData).length > 0) {
      errors['aggregated'] = new ApiRequestError('Aggregated data unavailable', 'unknown', false);
    }

    results.forEach(({ platform }) => {
      if (!(platform in errors)) {
        errors[platform] = null;
      }
    });

    if (Object.keys(platformData).length === 0) {
      throw new ApiRequestError('All platform requests failed after retries', 'retry-exhausted', true);
    }

    return { data: platformData, errors };
  }

  static async fetchAllPlatforms(): Promise<{ data: Record<string, PlatformResponse>; errors: Record<string, ApiRequestError | null> }> {
    return this.withRetry(
      () => this.fetchAllPlatformsOnce(),
      { retries: 1, baseDelay: 500 }
    );
  }

  static generateAggregatedHotTopics(platformData: Record<string, PlatformResponse>): PlatformResponse | null {
    const topicMap = new Map<string, { platforms: string[]; hot: number; url: string }>();

    Object.entries(platformData).forEach(([platform, data]) => {
      if (data && data.topics) {
        data.topics.forEach(topic => {
          const title = topic.title.toLowerCase().trim();
          if (title.length > 2) {
            if (topicMap.has(title)) {
              const existing = topicMap.get(title)!;
              existing.platforms.push(platform);
              existing.hot = Math.max(existing.hot, topic.hot || 0);
            } else {
              topicMap.set(title, {
                platforms: [platform],
                hot: topic.hot || 0,
                url: topic.url || ''
              });
            }
          }
        });
      }
    });

    const multiPlatformTopics = Array.from(topicMap.entries())
      .filter(([, data]) => data.platforms.length >= 2)
      .map(([title, data]) => ({
        title: title,
        platforms: data.platforms,
        hot: data.hot,
        url: data.url
      }))
      .sort((a, b) => b.platforms.length - a.platforms.length || b.hot - a.hot)
      .slice(0, 10);

    if (multiPlatformTopics.length === 0) {
      return null;
    }

    return {
      platform: 'aggregated',
      topics: multiPlatformTopics.map((topic, index) => ({
        title: topic.title,
        url: topic.url || `https://www.baidu.com/s?wd=${encodeURIComponent(topic.title)}`,
        hot: topic.hot,
        rank: index + 1,
        platforms: topic.platforms
      })),
      timestamp: Date.now()
    };
  }
}
