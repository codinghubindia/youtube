import { YOUTUBE_API_BASE_URL, ENDPOINTS, ACTIVE_API_KEYS, ENV } from './env';
import { mockVideos, shuffleVideos, mockEducationalVideos } from './mockData';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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

interface YouTubeApiError {
  code: number;
  message: string;
  errors: Array<{
    message: string;
    domain: string;
    reason: string;
  }>;
  status: string;
}

interface YouTubeApiResponse {
  items?: YouTubeVideo[];
  error?: YouTubeApiError;
  nextPageToken?: string;
}

interface RequestOptions {
  signal?: AbortSignal;
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

// Get user's region code
export const getUserRegion = async (): Promise<string> => {
  // Try multiple IP geolocation services with fallbacks
  const geoServices = [
    'https://api.ipapi.com/api/check?access_key=YOUR_API_KEY', // Replace with your API key if using
    'https://api.ipify.org?format=json',
    'https://ipapi.co/json/',
    'https://ip-api.com/json'
  ];

  for (const service of geoServices) {
    try {
      const response = await fetch(service, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Add mode: 'cors' for services that support it
        mode: service.includes('ipapi.co') ? 'no-cors' : 'cors'
      });

      // For no-cors responses, just return default 'US'
      if (response.type === 'opaque') {
        return 'US';
      }

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      
      // Handle different response formats from different services
      const countryCode = 
        data.country_code || // ipapi.co format
        data.countryCode || // ip-api.com format
        data.country || // some other services
        'US'; // fallback

      return countryCode.toUpperCase();
    } catch (err) {
      console.warn(`Failed to get region from ${service}:`, err);
      continue;
    }
  }

  // If all services fail, return default
  console.warn('All geolocation services failed, using default region code: US');
  return 'US';
};

// Helper function to construct URL with parameters
const createUrl = (endpoint: string, params: Record<string, string | number | boolean>): string => {
  const url = new URL(`${YOUTUBE_API_BASE_URL}${endpoint}`);
  const apiKey = getCurrentApiKey();
  
  if (!apiKey) {
    console.warn('No valid API key available - falling back to mock data');
    return ''; // Return empty string instead of null
  }
  
  // Add API key to parameters
  Object.entries({ ...params, key: apiKey }).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  
  return url.toString();
};

// Get educational videos
export const getEducationalVideos = async (maxResults = 16, pageToken?: string) => {
  // Check if we have any API keys configured
  if (ACTIVE_API_KEYS.length === 0) {
    console.log('No YouTube API keys configured - using mock data');
    return { videos: shuffleVideos(mockEducationalVideos).slice(0, maxResults), nextPageToken: null };
  }

  // Check quota before making request
  if (trackApiUsage(ENDPOINTS.SEARCH)) {
    return { videos: shuffleVideos(mockEducationalVideos).slice(0, maxResults), nextPageToken: null };
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
        const params: Record<string, string | number | boolean> = {
          part: 'snippet',
          maxResults: maxResults * 2, // Request more to account for filtering
          q: randomTopic,
          type: 'video',
          videoDuration: 'short',
          relevanceLanguage: 'en',
          safeSearch: 'strict',
          order: 'relevance'
        };

        if (pageToken) {
          params.pageToken = pageToken;
        }

        const url = createUrl(ENDPOINTS.SEARCH, params);
        
        // Check if we got a valid URL
        if (!url) {
          console.warn('Failed to create URL - using mock data');
          return { videos: shuffleVideos(mockEducationalVideos).slice(0, maxResults), nextPageToken: null };
        }
        
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
      return { videos: shuffleVideos(mockEducationalVideos).slice(0, maxResults), nextPageToken: null };
    }
    
    return {
      videos: data.items as YouTubeVideo[],
      nextPageToken: data.nextPageToken || null
    };
  } catch (error) {
    console.error('Error in getEducationalVideos:', error);
    return { videos: shuffleVideos(mockEducationalVideos).slice(0, maxResults), nextPageToken: null };
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
export const getPopularVideos = async (maxResults = 16, pageToken?: string) => {
  // Check quota before making request
  if (trackApiUsage(ENDPOINTS.VIDEOS)) {
    console.log('Using shuffled mock data (quota limit approaching or all API keys failed)');
    return { videos: shuffleVideos(mockVideos).slice(0, maxResults), nextPageToken: null };
  }
  
  try {
    // Get user's region with fallback
    let regionCode = 'US'; // Default to US if region detection fails
    try {
      regionCode = await getUserRegion();
    } catch (err) {
      console.warn('Failed to get user region, using default US:', err);
    }
    
    let apiCallSuccess = false;
    let retryCount = 0;
    let data: YouTubeApiResponse = { items: [] };
    
    // Try with each API key until one works or we run out
    while (!apiCallSuccess && retryCount < ACTIVE_API_KEYS.length) {
      try {
        const currentKey = getCurrentApiKey();
        if (!currentKey) {
          console.warn('No valid API key available, using mock data');
          return { videos: shuffleVideos(mockVideos).slice(0, maxResults), nextPageToken: null };
        }

        // Add pageToken to the request if provided
        const params: Record<string, string | number | boolean> = {
          part: 'snippet,contentDetails,statistics',
          chart: 'mostPopular',
          maxResults,
          regionCode
        };
        
        if (pageToken) {
          params.pageToken = pageToken;
        }

        const url = createUrl(ENDPOINTS.VIDEOS, params);
        
        // Check if we got a valid URL
        if (!url) {
          console.warn('Failed to create URL - using mock data');
          return { videos: shuffleVideos(mockVideos).slice(0, maxResults), nextPageToken: null };
        }
        
        const response = await fetch(url);
        data = await response.json() as YouTubeApiResponse;
        
        // Check for any type of error
        if (data.error) {
          console.error(`YouTube API error with key ${currentKey.slice(0, 8)}...:`, data.error);
          handleApiKeyFailure(currentKey);
          retryCount++;
          continue;
        }
        
        // Check if we got valid items
        if (!data.items || data.items.length === 0) {
          console.warn(`No videos returned with key ${currentKey.slice(0, 8)}..., trying next key`);
          retryCount++;
          continue;
        }
        
        apiCallSuccess = true;
        console.log(`Successfully fetched videos with key ${currentKey.slice(0, 8)}...`);
      } catch (error: unknown) {
        console.error('Error fetching videos with current API key:', error);
        handleApiKeyFailure(getCurrentApiKey());
        retryCount++;
      }
    }
    
    if (!apiCallSuccess || !data?.items?.length) {
      console.warn('All API keys failed or no videos returned, using mock data');
      return { videos: shuffleVideos(mockVideos).slice(0, maxResults), nextPageToken: null };
    }
    
    return { 
      videos: data.items as YouTubeVideo[],
      nextPageToken: data.nextPageToken || null
    };
  } catch (error) {
    console.error('Error in getPopularVideos:', error);
    return { videos: shuffleVideos(mockVideos).slice(0, maxResults), nextPageToken: null };
  }
};

// Search videos
export const searchVideos = async (query: string, maxResults = 16, pageToken?: string) => {
  // Check quota before making request
  if (trackApiUsage(ENDPOINTS.SEARCH)) {
    console.log('Using mock data for search (quota limit approaching)');
    const filteredVideos = mockVideos.filter((video: YouTubeVideo) => 
      video.snippet.title.toLowerCase().includes(query.toLowerCase())
    );
    return { videos: filteredVideos.slice(0, maxResults), nextPageToken: null };
  }
  
  try {
    const params: Record<string, string | number | boolean> = {
      part: 'snippet',
      maxResults,
      q: query,
      type: 'video'
    };

    if (pageToken) {
      params.pageToken = pageToken;
    }

    const url = createUrl(ENDPOINTS.SEARCH, params);
    
    // Check if we got a valid URL
    if (!url) {
      console.warn('Failed to create URL - using mock data');
      const filteredVideos = mockVideos.filter((video: YouTubeVideo) => 
        video.snippet.title.toLowerCase().includes(query.toLowerCase())
      );
      return { videos: filteredVideos.slice(0, maxResults), nextPageToken: null };
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Check for quota errors
    if (data.error && data.error.code === 403) {
      console.warn('YouTube API quota exceeded, using mock data instead');
      handleApiKeyFailure(getCurrentApiKey());
      const filteredVideos = mockVideos.filter((video: YouTubeVideo) => 
        video.snippet.title.toLowerCase().includes(query.toLowerCase())
      );
      return { videos: filteredVideos.slice(0, maxResults), nextPageToken: null };
    }
    
    // Check for other errors
    if (data.error) {
      console.error('YouTube API error:', data.error);
      const filteredVideos = mockVideos.filter((video: YouTubeVideo) => 
        video.snippet.title.toLowerCase().includes(query.toLowerCase())
      );
      return { videos: filteredVideos.slice(0, maxResults), nextPageToken: null };
    }
    
    return {
      videos: data.items as YouTubeVideo[],
      nextPageToken: data.nextPageToken || null
    };
  } catch (error) {
    console.error('Error in searchVideos:', error);
    const filteredVideos = mockVideos.filter((video: YouTubeVideo) => 
      video.snippet.title.toLowerCase().includes(query.toLowerCase())
    );
    return { videos: filteredVideos.slice(0, maxResults), nextPageToken: null };
  }
};

// Get video details
export const getVideoDetails = async (videoId: string, options?: RequestOptions): Promise<YouTubeVideo[]> => {
  if (!videoId) return [];
  
  // Check quota before making request
  if (trackApiUsage(ENDPOINTS.VIDEOS)) {
    console.log('Using mock data for video details (quota limit approaching)');
    return mockVideos.filter((video: YouTubeVideo) => video.id === videoId);
  }
  
  try {
    const url = createUrl(ENDPOINTS.VIDEOS, {
      part: 'snippet,contentDetails,statistics',
      id: videoId
    });
    
    // Check if we got a valid URL
    if (!url) {
      console.warn('Failed to create URL - using mock data');
      return mockVideos.filter((video: YouTubeVideo) => video.id === videoId);
    }
    
    const response = await fetch(url, { signal: options?.signal });
    const data = await response.json();
    
    // Check for quota errors
    if (data.error && data.error.code === 403) {
      console.warn('YouTube API quota exceeded, using mock data instead');
      handleApiKeyFailure(getCurrentApiKey());
      return mockVideos.filter((video: YouTubeVideo) => video.id === videoId);
    }
    
    return data.items || [];
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    console.error('Error in getVideoDetails:', error);
    return mockVideos.filter((video: YouTubeVideo) => video.id === videoId);
  }
};

// Get channel details
export const getChannelDetails = async (channelId: string, options?: RequestOptions): Promise<YouTubeChannel | null> => {
  try {
    const url = createUrl(ENDPOINTS.CHANNELS, {
      part: 'snippet,statistics',
      id: channelId
    });
    
    // Check if we got a valid URL
    if (!url) {
      console.warn('Failed to create URL - using mock data');
      return null;
    }
    
    const response = await fetch(url, { signal: options?.signal });
    const data = await response.json();
    
    // Check for quota errors
    if (data.error && data.error.code === 403) {
      console.warn('YouTube API quota exceeded');
      handleApiKeyFailure(getCurrentApiKey());
      return null;
    }
    
    return data.items?.[0] || null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    console.error('Error in getChannelDetails:', error);
    return null;
  }
};

// Get video comments
export const getVideoComments = async (videoId: string, options?: RequestOptions): Promise<YouTubeComment[]> => {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/commentThreads?part=snippet&videoId=${videoId}&maxResults=20&key=${getCurrentApiKey()}`,
      { signal: options?.signal }
    );
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    console.error('Error fetching video comments:', error);
    return [];
  }
};

// Get related videos
export const getRelatedVideos = async (videoId: string, options?: RequestOptions): Promise<YouTubeVideo[]> => {
  // Check quota before making request
  if (trackApiUsage(ENDPOINTS.SEARCH)) {
    console.log('Using mock data for related videos (quota limit approaching)');
    return mockVideos.slice(0, 10);
  }

  try {
    const url = createUrl(ENDPOINTS.SEARCH, {
      part: 'snippet',
      relatedToVideoId: videoId,
      type: 'video',
      maxResults: 10
    });

    const response = await fetch(url, { signal: options?.signal });
    const data = await response.json();

    // Check for quota errors
    if (data.error && data.error.code === 403) {
      console.warn('YouTube API quota exceeded, using mock data instead');
      handleApiKeyFailure(getCurrentApiKey());
      return mockVideos.slice(0, 10);
    }

    // Check for other errors
    if (data.error) {
      console.error('YouTube API error:', data.error);
      return mockVideos.slice(0, 10);
    }

    // Get video IDs from search results
    const videoIds = data.items?.map((item: SearchResult) => item.id.videoId).join(',');
    
    if (!videoIds) {
      console.warn('No related videos found, using mock data');
      return mockVideos.slice(0, 10);
    }

    // Get full video details
    const videoDetails = await getVideoDetails(videoIds);
    return videoDetails;

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    console.error('Error fetching related videos:', error);
    return mockVideos.slice(0, 10);
  }
};

// Get transcript
export const getTranscript = async (videoId: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/transcript/${videoId}`);
    const data = await response.json();
    return data.transcript || '';
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return '';
  }
};

// Generate summary
export const generateSummary = async (transcriptText: string, videoTitle: string, videoId: string): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript: transcriptText, title: videoTitle, videoId }),
    });
    const data = await response.json();
    return data.summary || [];
  } catch (error) {
    console.error('Error generating summary:', error);
    return [];
  }
};

// Generate notes
export const generateNotes = async (transcriptText: string, videoTitle: string, videoId: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript: transcriptText, title: videoTitle, videoId }),
    });
    const data = await response.json();
    return data.notes || '';
  } catch (error) {
    console.error('Error generating notes:', error);
    return '';
  }
};

// ... rest of the code ...