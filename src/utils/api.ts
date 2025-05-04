import { YOUTUBE_API_BASE_URL, ENDPOINTS, ACTIVE_API_KEYS, ENV } from './env';
import { mockVideos, shuffleVideos, mockEducationalVideos } from './mockData';

// Add quota and key tracking system
interface QuotaManager {
  dailyQuotaLimit: number;
  quotaPerKey: { [key: string]: number };  // Track quota per key
  lastResetDate: string;
  failedApiKeys: string[];
  currentKeyIndex: number;
  keyFailures: { [key: string]: number };
  keyUsageLogged: { [key: string]: boolean };
  lastFailureReset: number;
}

interface SearchResult {
  id: {
    videoId: string;
  };
}

// Initialize quota from localStorage or with defaults
const initQuotaManager = (): QuotaManager => {
  const stored = localStorage.getItem('youtubeApiQuota');
  if (stored) {
    const parsed = JSON.parse(stored);
    // Reset if it's a new day
    const today = new Date().toISOString().split('T')[0];
    if (parsed.lastResetDate !== today) {
      return {
        dailyQuotaLimit: 10000,
        quotaPerKey: {},
        lastResetDate: today,
        failedApiKeys: [],
        currentKeyIndex: 0,
        keyFailures: {},
        keyUsageLogged: {},
        lastFailureReset: Date.now()
      };
    }
    return {
      ...parsed,
      // Always ensure these properties exist
      keyFailures: parsed.keyFailures || {},
      keyUsageLogged: parsed.keyUsageLogged || {},
      lastFailureReset: parsed.lastFailureReset || Date.now()
    };
  }
  
  return {
    dailyQuotaLimit: 10000,
    quotaPerKey: {},
    lastResetDate: new Date().toISOString().split('T')[0],
    failedApiKeys: [],
    currentKeyIndex: 0,
    keyFailures: {},
    keyUsageLogged: {},
    lastFailureReset: Date.now()
  };
};

// Global quota manager
const quotaManager = initQuotaManager();

// Save quota state to localStorage
const saveQuotaState = () => {
  localStorage.setItem('youtubeApiQuota', JSON.stringify(quotaManager));
};

// Track API usage for the current key
const trackApiUsage = (endpoint: string): boolean => {
  // If no API keys are configured, return true to use mock data
  if (ACTIVE_API_KEYS.length === 0) {
    console.log('No YouTube API keys configured - using mock data');
    return true;
  }

  const currentKey = getCurrentApiKey();
  if (!currentKey) {
    console.log('No valid API key available - using mock data');
    return true;
  }

  // Initialize quota for this key if not exists
  if (!quotaManager.quotaPerKey[currentKey]) {
    quotaManager.quotaPerKey[currentKey] = 0;
  }

  // Calculate cost based on endpoint
  let cost = 1;
  switch (endpoint) {
    case ENDPOINTS.SEARCH:
      cost = 100;
      break;
    case ENDPOINTS.VIDEOS:
      cost = 1;
      break;
    case ENDPOINTS.COMMENTS:
      cost = 1;
      break;
    case ENDPOINTS.CHANNELS:
      cost = 1;
      break;
    default:
      cost = 1;
  }

  // Check if adding this cost would exceed the quota or if we're close to the limit
  const currentQuota = quotaManager.quotaPerKey[currentKey];
  const quotaLimit = quotaManager.dailyQuotaLimit;
  const quotaWarningThreshold = quotaLimit * 0.8; // 80% of quota

  if (currentQuota + cost > quotaLimit) {
    console.warn(`API key ${currentKey.slice(0, 8)}... has exceeded quota limit - switching to next key`);
    handleApiKeyFailure(currentKey);
    return true;
  }

  // Warn if approaching quota limit
  if (currentQuota + cost > quotaWarningThreshold) {
    console.warn(`API key ${currentKey.slice(0, 8)}... is approaching quota limit (${currentQuota}/${quotaLimit})`);
  }

  // Add the cost to the quota
  quotaManager.quotaPerKey[currentKey] += cost;
  console.log(`API Usage - Key: ${currentKey.slice(0, 8)}..., Endpoint: ${endpoint}, Cost: ${cost}, Total: ${quotaManager.quotaPerKey[currentKey]}/${quotaManager.dailyQuotaLimit}`);
  saveQuotaState();
  return false;
};

// Get current active API key with better rotation and retry logic
const getCurrentApiKey = (): string => {
  // If we have no API keys, return empty to use mock data
  if (!ACTIVE_API_KEYS || ACTIVE_API_KEYS.length === 0) {
    console.log('No YouTube API keys configured - using mock data');
    return '';
  }
  
  // Reset all failed keys after 5 minutes
  const now = Date.now();
  if (quotaManager.lastFailureReset && (now - quotaManager.lastFailureReset > 5 * 60 * 1000)) {
    console.log('Resetting all failed API keys after timeout');
    quotaManager.failedApiKeys = [];
    quotaManager.keyFailures = {};
    quotaManager.lastFailureReset = now;
    saveQuotaState();
  }
  
  // Try to get a key that hasn't failed yet and has quota available
  let attempts = 0;
  const maxAttempts = ACTIVE_API_KEYS.length * 2; // Allow two full rotations
  
  while (attempts < maxAttempts) {
    const keyIndex = quotaManager.currentKeyIndex % ACTIVE_API_KEYS.length;
    const key = ACTIVE_API_KEYS[keyIndex];
    
    // Skip invalid keys
    if (!key || key.length < 20) {
      console.warn(`Invalid API key at index ${keyIndex} - skipping`);
      quotaManager.currentKeyIndex = (quotaManager.currentKeyIndex + 1) % ACTIVE_API_KEYS.length;
      attempts++;
      continue;
    }
    
    // If this key hasn't completely failed and hasn't exceeded quota
    const failureCount = quotaManager.keyFailures?.[key] || 0;
    if (!quotaManager.failedApiKeys.includes(key) && failureCount < 3) {
      const currentQuota = quotaManager.quotaPerKey[key] || 0;
      if (currentQuota < quotaManager.dailyQuotaLimit) {
        if (ENV.isDev && !quotaManager.keyUsageLogged?.[key]) {
          console.log(`Using API key: ${key.slice(0, 8)}...${key.slice(-4)}`);
          quotaManager.keyUsageLogged = { ...quotaManager.keyUsageLogged, [key]: true };
          saveQuotaState();
        }
        return key;
      }
    }
    
    // Try the next key
    quotaManager.currentKeyIndex = (quotaManager.currentKeyIndex + 1) % ACTIVE_API_KEYS.length;
    attempts++;
  }
  
  // If all keys have failed, but it's been a while since the first failure, reset and try again
  if (quotaManager.failedApiKeys.length > 0) {
    quotaManager.failedApiKeys = [];
    quotaManager.keyFailures = {};
    quotaManager.lastFailureReset = now;
    quotaManager.currentKeyIndex = 0;
    saveQuotaState();
    
    // Try one more time with reset state
    const key = ACTIVE_API_KEYS[0];
    if (key && key.length >= 20) {
      return key;
    }
  }
  
  // All keys have failed or exceeded quota
  console.warn('No valid API keys available - using mock data');
  return '';
};

// Handle API key failure with better retry logic
const handleApiKeyFailure = (key: string) => {
  if (!key) return;
  
  // Don't mark as failed if it's just a temporary error
  const failureCount = (quotaManager.keyFailures?.[key] || 0) + 1;
  quotaManager.keyFailures = { ...quotaManager.keyFailures, [key]: failureCount };
  
  // Only mark as failed after multiple consecutive failures
  if (failureCount >= 3) {
    if (!quotaManager.failedApiKeys.includes(key)) {
      console.warn(`API key ${key.slice(0, 8)}... marked as failed after ${failureCount} consecutive failures. ${ACTIVE_API_KEYS.length - quotaManager.failedApiKeys.length - 1} keys remaining.`);
      quotaManager.failedApiKeys.push(key);
    }
  }
  
  // Move to next key
  quotaManager.currentKeyIndex = (quotaManager.currentKeyIndex + 1) % ACTIVE_API_KEYS.length;
  
  // Reset failures for this key after 5 minutes
  setTimeout(() => {
    if (quotaManager.keyFailures?.[key]) {
      delete quotaManager.keyFailures[key];
      quotaManager.failedApiKeys = quotaManager.failedApiKeys.filter(k => k !== key);
      console.log(`Reset failure count for API key ${key.slice(0, 8)}...`);
    }
  }, 5 * 60 * 1000); // 5 minutes
  
  saveQuotaState();
};

// Force reset of quota tracking (for debugging)
export const resetQuotaTracking = () => {
  quotaManager.quotaPerKey = {};
  quotaManager.lastResetDate = new Date().toISOString().split('T')[0];
  quotaManager.failedApiKeys = [];
  quotaManager.currentKeyIndex = 0;
  saveQuotaState();
};

export interface YouTubeVideo {
  id: string;
  isEducational?: boolean;
  durationInSeconds?: number;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
      standard?: { url: string; width: number; height: number };
      maxres?: { url: string; width: number; height: number };
    };
    channelTitle: string;
    channelId: string;
    publishedAt: string;
    tags?: string[];
  };
  contentDetails?: {
    duration: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

export interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
  };
  statistics?: {
    subscriberCount: string;
    videoCount: string;
    viewCount: string;
  };
  brandingSettings?: {
    image?: {
      bannerExternalUrl: string;
    }
  };
}

export interface YouTubeComment {
  id: string;
  snippet: {
    topLevelComment: {
      snippet: {
        authorDisplayName: string;
        authorProfileImageUrl: string;
        textDisplay: string;
        publishedAt: string;
        likeCount: number;
      }
    };
    totalReplyCount: number;
  };
}

// Get user's region code automatically
const getUserRegion = async (): Promise<string> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country_code || 'US';
  } catch (err) {
    console.error('Error getting user region:', err);
    return 'US'; // Default to US if region detection fails
  }
};

// Helper function to construct URL with parameters
const createUrl = (endpoint: string, params: Record<string, string | number | boolean>) => {
  const url = new URL(`${YOUTUBE_API_BASE_URL}${endpoint}`);
  const apiKey = getCurrentApiKey();
  
  if (!apiKey) {
    throw new Error('No valid API key available - using mock data');
  }
  
  // Add API key to parameters
  Object.entries({ ...params, key: apiKey }).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  
  return url.toString();
};

// Get educational videos - this is a new function specifically for education content
export const getEducationalVideos = async (maxResults = 16) => {
  // Check if we have any API keys configured
  if (ACTIVE_API_KEYS.length === 0) {
    console.log('No YouTube API keys configured - using mock data');
    return shuffleVideos(mockEducationalVideos).slice(0, maxResults);
  }

  // Check quota before making request
  if (trackApiUsage(ENDPOINTS.SEARCH)) {
    return shuffleVideos(mockEducationalVideos).slice(0, maxResults);
  }
  
  try {
    // Educational topics for search
    const educationTopics = [
      'web development tutorial',
      'programming tutorial',
      'learn javascript',
      'coding for beginners',
      'html css tutorial',
      'react tutorial',
      'python programming',
      'web design'
    ];
    
    // Randomly select a topic for variety
    const randomTopic = educationTopics[Math.floor(Math.random() * educationTopics.length)];
    
    let apiCallSuccess = false;
    let retryCount = 0;
    let data;
    
    // Try with each API key until one works or we run out
    while (!apiCallSuccess && retryCount < ACTIVE_API_KEYS.length) {
      try {
        const url = createUrl(ENDPOINTS.SEARCH, {
          part: 'snippet',
          maxResults: maxResults * 2, // Request more to account for filtering
          q: randomTopic,
          type: 'video',
          videoDuration: 'short', // Only get videos under 4 minutes
          relevanceLanguage: 'en',
          safeSearch: 'strict',
          order: 'relevance'
        });
        
        const response = await fetch(url);
        data = await response.json();
        
        // Check for quota errors
        if (data.error && (data.error.code === 403 || data.error.message?.includes('quota'))) {
          handleApiKeyFailure(getCurrentApiKey());
          retryCount++;
          continue;
        }
        
        // Check for other errors
        if (data.error) {
          console.error('YouTube API error:', data.error);
          handleApiKeyFailure(getCurrentApiKey());
          retryCount++;
          continue;
        }
        
        apiCallSuccess = true;
      } catch (err) {
        console.error('Error fetching videos with current API key:', err);
        retryCount++;
      }
    }
    
    if (!apiCallSuccess) {
      return shuffleVideos(mockEducationalVideos).slice(0, maxResults);
    }
    
    // If we have search results, get the full video details for each
    if (data?.items?.length > 0) {
      const videoIds = data.items.map((item: SearchResult) => item.id.videoId).join(',');
      
      try {
        const url = createUrl(ENDPOINTS.VIDEOS, {
          part: 'snippet,contentDetails,statistics',
          id: videoIds
        });
        
        const videoResponse = await fetch(url);
        const videoData = await videoResponse.json();
        
        if (videoData.error) {
          console.error('Error fetching video details:', videoData.error);
          return shuffleVideos(mockEducationalVideos).slice(0, maxResults);
        }

        // Process and filter videos
        const processedVideos = (videoData.items || []).map((video: YouTubeVideo) => {
          // Parse duration and convert to seconds
          const durationMatch = video.contentDetails?.duration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
          if (durationMatch) {
            const [, hours, minutes, seconds] = durationMatch;
            const durationInSeconds = 
              (parseInt(hours || '0') * 3600) +
              (parseInt(minutes || '0') * 60) +
              parseInt(seconds || '0');
            video.durationInSeconds = durationInSeconds;
          }

          // Mark as educational based on title and description
          video.isEducational = isEducationalContent(video);
          
          return video;
        }).filter((video: YouTubeVideo) => {
          // Keep only educational videos under 5 minutes (300 seconds)
          return video.isEducational && 
                 video.durationInSeconds && 
                 video.durationInSeconds <= 300;
        });

        // Return filtered and limited results
        return processedVideos.slice(0, maxResults);
      } catch (err) {
        console.error('Error fetching video details:', err);
        return shuffleVideos(mockEducationalVideos).slice(0, maxResults);
      }
    }
    
    return shuffleVideos(mockEducationalVideos).slice(0, maxResults);
  } catch (err) {
    console.error('Error fetching educational videos:', err);
    return shuffleVideos(mockEducationalVideos).slice(0, maxResults);
  }
};

// Helper function to determine if a video is educational
const isEducationalContent = (video: YouTubeVideo): boolean => {
  const educationalKeywords = [
    'learn', 'tutorial', 'course', 'education', 'educational', 'how to',
    'programming', 'coding', 'development', 'beginner', 'introduction',
    'guide', 'explained', 'for beginners', 'crash course', 'lesson'
  ];

  const title = video.snippet.title.toLowerCase();
  const description = video.snippet.description.toLowerCase();
  const tags = video.snippet.tags || [];

  // Check title and description for educational keywords
  const hasEducationalKeyword = educationalKeywords.some(keyword =>
    title.includes(keyword) || description.includes(keyword)
  );

  // Check if any tags match educational keywords
  const hasEducationalTag = tags.some(tag =>
    educationalKeywords.includes(tag.toLowerCase())
  );

  return hasEducationalKeyword || hasEducationalTag;
};

// Get popular videos
export const getPopularVideos = async (maxResults = 16) => {
  // Check quota before making request
  if (trackApiUsage(ENDPOINTS.VIDEOS)) {
    console.log('Using shuffled mock data (quota limit approaching or all API keys failed)');
    return shuffleVideos(mockVideos).slice(0, maxResults);
  }
  
  try {
    // Get user's region
    const regionCode = await getUserRegion();
    
    // Track this request (before making it)
    if (trackApiUsage(ENDPOINTS.VIDEOS)) {
      return shuffleVideos(mockVideos).slice(0, maxResults);
    }
    
    let apiCallSuccess = false;
    let retryCount = 0;
    let data;
    
    // Try with each API key until one works or we run out
    while (!apiCallSuccess && retryCount < ACTIVE_API_KEYS.length) {
      try {
        const url = createUrl(ENDPOINTS.VIDEOS, {
          part: 'snippet,contentDetails,statistics',
          chart: 'mostPopular',
          maxResults,
          regionCode,
          videoCategoryId: '27' // Education category
        });
        
        const response = await fetch(url);
        data = await response.json();
        
        // Check for quota errors
        if (data.error && (data.error.code === 403 || data.error.message?.includes('quota'))) {
          console.warn(`YouTube API quota exceeded for key, trying next key...`);
          handleApiKeyFailure(getCurrentApiKey());
          retryCount++;
          continue;
        }
        
        // Check for other errors
        if (data.error) {
          console.error('YouTube API error:', data.error);
          handleApiKeyFailure(getCurrentApiKey());
          retryCount++;
          continue;
        }
        
        apiCallSuccess = true;
      } catch (err) {
        console.error('Error fetching videos with current API key:', err);
        retryCount++;
      }
    }
    
    if (!apiCallSuccess) {
      console.warn('All API keys failed, using mock data');
      return shuffleVideos(mockVideos).slice(0, maxResults);
    }
    
    return data.items as YouTubeVideo[] || [];
  } catch (err) {
    console.error('Error fetching popular videos:', err);
    return shuffleVideos(mockVideos).slice(0, maxResults);
  }
};

// Search videos
export const searchVideos = async (query: string, maxResults = 16) => {
  // Check quota before making request
  if (trackApiUsage(ENDPOINTS.SEARCH)) {
    console.log('Using mock data for search (quota limit approaching)');
    const filteredVideos = mockVideos.filter((video: YouTubeVideo) => 
      video.snippet.title.toLowerCase().includes(query.toLowerCase())
    );
    return filteredVideos.slice(0, maxResults);
  }
  
  try {
    // Track this request (search is expensive - 100 units)
    if (trackApiUsage(ENDPOINTS.SEARCH)) {
      const filteredVideos = mockVideos.filter((video: YouTubeVideo) => 
        video.snippet.title.toLowerCase().includes(query.toLowerCase())
      );
      return filteredVideos.slice(0, maxResults);
    }
    
    const url = createUrl(ENDPOINTS.SEARCH, {
      part: 'snippet',
      maxResults,
      q: query,
      type: 'video',
    });
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Check for quota errors
    if (data.error && data.error.code === 403) {
      console.warn('YouTube API quota exceeded, using mock data instead');
      handleApiKeyFailure(getCurrentApiKey());
      const filteredVideos = mockVideos.filter((video: YouTubeVideo) => 
        video.snippet.title.toLowerCase().includes(query.toLowerCase())
      );
      return filteredVideos.slice(0, maxResults);
    }
    
    // Check for other errors
    if (data.error) {
      console.error('YouTube API error:', data.error);
      const filteredVideos = mockVideos.filter((video: YouTubeVideo) => 
        video.snippet.title.toLowerCase().includes(query.toLowerCase())
      );
      return filteredVideos.slice(0, maxResults);
    }
    
    // Get video IDs from search results
    const videoIds = data.items?.map((item: SearchResult) => item.id.videoId).join(',');
    
    if (!videoIds) return [];
    
    // Get full video details
    return getVideoDetails(videoIds);
  } catch (err) {
    console.error('Error searching videos:', err);
    const filteredVideos = mockVideos.filter((video: YouTubeVideo) => 
      video.snippet.title.toLowerCase().includes(query.toLowerCase())
    );
    return filteredVideos.slice(0, maxResults);
  }
};

// Get video details by ID
export const getVideoDetails = async (videoId: string) => {
  if (!videoId) return [];
  
  // Check quota before making request
  if (trackApiUsage(ENDPOINTS.VIDEOS)) {
    console.log('Using mock data for video details (quota limit approaching)');
    if (videoId.includes(',')) {
      // Multiple IDs
      const ids = videoId.split(',');
      return mockVideos.filter((video: YouTubeVideo) => ids.includes(video.id));
    } else {
      // Single ID
      return mockVideos.filter((video: YouTubeVideo) => video.id === videoId);
    }
  }
  
  try {
    // Track this request (cost is 1 unit per video, so count how many videos we're requesting)
    const videoCount = videoId.includes(',') ? videoId.split(',').length : 1;
    // We need to track this cost for each video ID
    for (let i = 0; i < videoCount; i++) {
      if (trackApiUsage(ENDPOINTS.VIDEOS)) {
        if (videoId.includes(',')) {
          const ids = videoId.split(',');
          return mockVideos.filter((video: YouTubeVideo) => ids.includes(video.id));
        } else {
          return mockVideos.filter((video: YouTubeVideo) => video.id === videoId);
        }
      }
    }
    
    const url = createUrl(ENDPOINTS.VIDEOS, {
      part: 'snippet,contentDetails,statistics',
      id: videoId,
    });
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Check for quota errors
    if (data.error && data.error.code === 403) {
      console.warn('YouTube API quota exceeded, using mock data instead');
      handleApiKeyFailure(getCurrentApiKey());
      if (videoId.includes(',')) {
        // Multiple IDs
        const ids = videoId.split(',');
        return mockVideos.filter((video: YouTubeVideo) => ids.includes(video.id));
      } else {
        // Single ID
        return mockVideos.filter((video: YouTubeVideo) => video.id === videoId);
      }
    }
    
    // Check for other errors
    if (data.error) {
      console.error('YouTube API error:', data.error);
      if (videoId.includes(',')) {
        // Multiple IDs
        const ids = videoId.split(',');
        return mockVideos.filter((video: YouTubeVideo) => ids.includes(video.id));
      } else {
        // Single ID
        return mockVideos.filter((video: YouTubeVideo) => video.id === videoId);
      }
    }
    
    return data.items as YouTubeVideo[] || [];
  } catch (err) {
    console.error('Error fetching video details:', err);
    if (videoId.includes(',')) {
      // Multiple IDs
      const ids = videoId.split(',');
      return mockVideos.filter((video: YouTubeVideo) => ids.includes(video.id));
    } else {
      // Single ID
      return mockVideos.filter((video: YouTubeVideo) => video.id === videoId);
    }
  }
};

// Get channel details
export const getChannelDetails = async (channelId: string) => {
  if (!channelId) return null;
  
  // Check quota before making request
  if (trackApiUsage(ENDPOINTS.CHANNELS)) {
    return {
      id: channelId,
      snippet: {
        title: `Channel ${channelId}`,
        description: 'This is a mock channel description.',
        thumbnails: {
          default: { url: `https://ui-avatars.com/api/?name=Channel&background=random`, width: 88, height: 88 },
          medium: { url: `https://ui-avatars.com/api/?name=Channel&background=random&size=240`, width: 240, height: 240 },
          high: { url: `https://ui-avatars.com/api/?name=Channel&background=random&size=800`, width: 800, height: 800 }
        }
      },
      statistics: {
        subscriberCount: '1000000',
        videoCount: '500',
        viewCount: '25000000'
      }
    } as YouTubeChannel;
  }
  
  try {
    // Track this request
    if (trackApiUsage(ENDPOINTS.CHANNELS)) {
      return {
        id: channelId,
        snippet: {
          title: `Channel ${channelId}`,
          description: 'This is a mock channel description.',
          thumbnails: {
            default: { url: `https://ui-avatars.com/api/?name=Channel&background=random`, width: 88, height: 88 },
            medium: { url: `https://ui-avatars.com/api/?name=Channel&background=random&size=240`, width: 240, height: 240 },
            high: { url: `https://ui-avatars.com/api/?name=Channel&background=random&size=800`, width: 800, height: 800 }
          }
        },
        statistics: {
          subscriberCount: '1000000',
          videoCount: '500',
          viewCount: '25000000'
        }
      } as YouTubeChannel;
    }
    
    const url = createUrl(ENDPOINTS.CHANNELS, {
      part: 'snippet,statistics,brandingSettings',
      id: channelId,
    });
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Check for quota errors
    if (data.error && data.error.code === 403) {
      console.warn('YouTube API quota exceeded, using mock data instead');
      handleApiKeyFailure(getCurrentApiKey());
      return {
        id: channelId,
        snippet: {
          title: `Channel ${channelId}`,
          description: 'This is a mock channel description.',
          thumbnails: {
            default: { url: `https://ui-avatars.com/api/?name=Channel&background=random`, width: 88, height: 88 },
            medium: { url: `https://ui-avatars.com/api/?name=Channel&background=random&size=240`, width: 240, height: 240 },
            high: { url: `https://ui-avatars.com/api/?name=Channel&background=random&size=800`, width: 800, height: 800 }
          }
        },
        statistics: {
          subscriberCount: '1000000',
          videoCount: '500',
          viewCount: '25000000'
        }
      } as YouTubeChannel;
    }
    
    // Check for other errors
    if (data.error) {
      console.error('YouTube API error:', data.error);
      return null;
    }
    
    return data.items?.[0] as YouTubeChannel || null;
  } catch (err) {
    console.error('Error fetching channel details:', err);
    return null;
  }
};

// Get video comments
export const getVideoComments = async (videoId: string, maxResults = 20) => {
  if (!videoId) return [];
  
  // Check quota before making request
  if (trackApiUsage(ENDPOINTS.COMMENTS)) {
    return Array.from({ length: maxResults }, (_, i) => ({
      id: `comment-${i}`,
      snippet: {
        topLevelComment: {
          snippet: {
            authorDisplayName: `User ${i + 1}`,
            authorProfileImageUrl: `https://ui-avatars.com/api/?name=User+${i + 1}&background=random`,
            textDisplay: `This is a mock comment number ${i + 1}. Great video!`,
            publishedAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
            likeCount: Math.floor(Math.random() * 100)
          }
        },
        totalReplyCount: Math.floor(Math.random() * 5)
      }
    })) as YouTubeComment[];
  }
  
  try {
    // Track this request
    if (trackApiUsage(ENDPOINTS.COMMENTS)) {
      return Array.from({ length: maxResults }, (_, i) => ({
        id: `comment-${i}`,
        snippet: {
          topLevelComment: {
            snippet: {
              authorDisplayName: `User ${i + 1}`,
              authorProfileImageUrl: `https://ui-avatars.com/api/?name=User+${i + 1}&background=random`,
              textDisplay: `This is a mock comment number ${i + 1}. Great video!`,
              publishedAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
              likeCount: Math.floor(Math.random() * 100)
            }
          },
          totalReplyCount: Math.floor(Math.random() * 5)
        }
      })) as YouTubeComment[];
    }
    
    const url = createUrl(ENDPOINTS.COMMENTS, {
      part: 'snippet',
      videoId,
      maxResults,
    });
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Check for quota errors
    if (data.error && data.error.code === 403) {
      console.warn('YouTube API quota exceeded, using mock data instead');
      handleApiKeyFailure(getCurrentApiKey());
      return Array.from({ length: maxResults }, (_, i) => ({
        id: `comment-${i}`,
        snippet: {
          topLevelComment: {
            snippet: {
              authorDisplayName: `User ${i + 1}`,
              authorProfileImageUrl: `https://ui-avatars.com/api/?name=User+${i + 1}&background=random`,
              textDisplay: `This is a mock comment number ${i + 1}. Great video!`,
              publishedAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
              likeCount: Math.floor(Math.random() * 100)
            }
          },
          totalReplyCount: Math.floor(Math.random() * 5)
        }
      })) as YouTubeComment[];
    }
    
    // Check for other errors
    if (data.error) {
      console.error('YouTube API error:', data.error);
      return [];
    }
    
    return data.items as YouTubeComment[] || [];
  } catch (err) {
    console.error('Error fetching video comments:', err);
    return [];
  }
};

// Get related videos
export async function getRelatedVideos(videoId: string, maxResults = 10): Promise<YouTubeVideo[]> {
  if (!videoId || typeof videoId !== 'string' || videoId.length < 5) {
    console.warn('Invalid video ID provided to getRelatedVideos');
    return getMockRelatedVideos();
  }

  try {
    const apiKey = getCurrentApiKey();
    if (!apiKey) {
      console.warn('No valid API key available - using mock data');
      return getMockRelatedVideos();
    }

    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/search?part=snippet&relatedToVideoId=${videoId}&type=video&maxResults=${maxResults}&key=${apiKey}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      const error = await response.json();
      console.warn('YouTube API error:', error);
      
      // If the video ID is invalid, use mock data
      if (error.error?.errors?.some((e: any) => e.reason === 'invalidVideoId')) {
        console.warn('Invalid video ID or request, using mock data');
        return getMockRelatedVideos();
      }
      
      throw new Error(`YouTube API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.items.map(transformVideoResponse);
  } catch (error) {
    console.error('Error fetching related videos:', error);
    return getMockRelatedVideos();
  }
}

// Helper function to get mock related videos
function getMockRelatedVideos(): YouTubeVideo[] {
  return shuffleVideos(mockVideos).slice(0, 10);
}

// Transform YouTube API response to our VideoType
function transformVideoResponse(item: any): YouTubeVideo {
  const defaultThumbnail = {
    url: item.snippet.thumbnails.default?.url || '',
    width: item.snippet.thumbnails.default?.width || 120,
    height: item.snippet.thumbnails.default?.height || 90
  };

  const mediumThumbnail = {
    url: item.snippet.thumbnails.medium?.url || '',
    width: item.snippet.thumbnails.medium?.width || 320,
    height: item.snippet.thumbnails.medium?.height || 180
  };

  const highThumbnail = {
    url: item.snippet.thumbnails.high?.url || '',
    width: item.snippet.thumbnails.high?.width || 480,
    height: item.snippet.thumbnails.high?.height || 360
  };

  return {
    id: item.id.videoId,
    snippet: {
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnails: {
        default: defaultThumbnail,
        medium: mediumThumbnail,
        high: highThumbnail
      },
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    },
    contentDetails: {
      duration: 'PT0S' // Will be populated by getVideoDetails
    },
    statistics: {
      viewCount: '0', // Will be populated by getVideoDetails
      likeCount: '0', // Will be populated by getVideoDetails
      commentCount: '0' // Will be populated by getVideoDetails
    }
  };
}

// ... rest of the code ...