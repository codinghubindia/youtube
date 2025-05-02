import { YOUTUBE_API_KEY, YOUTUBE_API_BASE_URL, ENDPOINTS } from './apiConfig';
import { mockVideos } from './mockData';

// Add quota tracking system
interface QuotaManager {
  dailyQuotaLimit: number;
  currentDailyUsage: number;
  lastResetDate: string;
  isQuotaExceeded: boolean;
}

// Initialize quota from localStorage or with defaults
const initQuotaManager = (): QuotaManager => {
  const savedQuota = localStorage.getItem('youtubeApiQuota');
  
  if (savedQuota) {
    const parsed = JSON.parse(savedQuota) as QuotaManager;
    // Reset daily count if it's a new day
    const today = new Date().toISOString().split('T')[0];
    
    if (parsed.lastResetDate !== today) {
      parsed.currentDailyUsage = 0;
      parsed.lastResetDate = today;
      parsed.isQuotaExceeded = false;
    }
    
    return parsed;
  }
  
  // Default values - YouTube has a default of 10,000 units per day
  return {
    dailyQuotaLimit: 10000,
    currentDailyUsage: 0,
    lastResetDate: new Date().toISOString().split('T')[0],
    isQuotaExceeded: false
  };
};

// Global quota manager
const quotaManager = initQuotaManager();

// Save quota state to localStorage
const saveQuotaState = () => {
  localStorage.setItem('youtubeApiQuota', JSON.stringify(quotaManager));
};

// Track API request cost - different endpoints have different costs
const trackApiUsage = (endpoint: string) => {
  // Cost values based on YouTube API documentation
  // https://developers.google.com/youtube/v3/determine_quota_cost
  const costMap: Record<string, number> = {
    '/search': 100,        // Search endpoint costs 100 units
    '/videos': 1,          // Videos endpoint costs 1 unit per video
    '/channels': 1,        // Channels endpoint costs 1 unit
    '/commentThreads': 1,  // Comments endpoint costs 1 unit
    '/playlists': 1,       // Playlists endpoint costs 1 unit
    '/playlistItems': 1    // Playlist items endpoint costs 1 unit
  };
  
  const cost = costMap[endpoint] || 1;
  quotaManager.currentDailyUsage += cost;
  
  // Check if we're approaching quota limit (90% usage)
  if (quotaManager.currentDailyUsage >= quotaManager.dailyQuotaLimit * 0.9) {
    quotaManager.isQuotaExceeded = true;
  }
  
  saveQuotaState();
  
  // Log current usage
  console.log(`YouTube API usage: ${quotaManager.currentDailyUsage}/${quotaManager.dailyQuotaLimit} units (${(quotaManager.currentDailyUsage/quotaManager.dailyQuotaLimit*100).toFixed(2)}%)`);
  
  return quotaManager.isQuotaExceeded;
};

// Force reset of quota tracking (for debugging)
export const resetQuotaTracking = () => {
  quotaManager.currentDailyUsage = 0;
  quotaManager.isQuotaExceeded = false;
  quotaManager.lastResetDate = new Date().toISOString().split('T')[0];
  saveQuotaState();
};

export interface YouTubeVideo {
  id: string;
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
  url.searchParams.append('key', YOUTUBE_API_KEY);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  
  return url.toString();
};

// Get popular videos
export const getPopularVideos = async (maxResults = 16) => {
  // Check quota before making request
  if (quotaManager.isQuotaExceeded) {
    console.log('Using mock data (quota limit approaching)');
    return mockVideos.slice(0, maxResults);
  }
  
  try {
    // Get user's region
    const regionCode = await getUserRegion();
    
    // Track this request (before making it)
    if (trackApiUsage(ENDPOINTS.VIDEOS)) {
      return mockVideos.slice(0, maxResults);
    }
    
    const url = createUrl(ENDPOINTS.VIDEOS, {
      part: 'snippet,contentDetails,statistics',
      chart: 'mostPopular',
      maxResults,
      regionCode,
    });
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Check for quota errors
    if (data.error && data.error.code === 403) {
      console.warn('YouTube API quota exceeded, using mock data instead');
      quotaManager.isQuotaExceeded = true;
      saveQuotaState();
      return mockVideos.slice(0, maxResults);
    }
    
    // Check for other errors
    if (data.error) {
      console.error('YouTube API error:', data.error);
      return mockVideos.slice(0, maxResults);
    }
    
    return data.items as YouTubeVideo[] || [];
  } catch (err) {
    console.error('Error fetching popular videos:', err);
    return mockVideos.slice(0, maxResults);
  }
};

// Search videos
export const searchVideos = async (query: string, maxResults = 16) => {
  // Check quota before making request
  if (quotaManager.isQuotaExceeded) {
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
      quotaManager.isQuotaExceeded = true;
      saveQuotaState();
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
    const videoIds = data.items?.map((item: { id: { videoId: string } }) => item.id.videoId).join(',') || '';
    
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
  if (quotaManager.isQuotaExceeded) {
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
      quotaManager.isQuotaExceeded = true;
      saveQuotaState();
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
  if (quotaManager.isQuotaExceeded) {
    console.log('Using mock data for channel (quota limit approaching)');
    // Create a mock channel
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
      quotaManager.isQuotaExceeded = true;
      saveQuotaState();
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
  if (quotaManager.isQuotaExceeded) {
    console.log('Using mock comments (quota limit approaching)');
    // Generate mock comments
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
      quotaManager.isQuotaExceeded = true;
      saveQuotaState();
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
export const getRelatedVideos = async (videoId: string, maxResults = 10) => {
  if (!videoId) return [];
  
  // Check quota before making request
  if (quotaManager.isQuotaExceeded) {
    console.log('Using mock data for related videos (quota limit approaching)');
    // Shuffle mock videos and return a subset, excluding the current video
    const filteredVideos = mockVideos.filter((video: YouTubeVideo) => video.id !== videoId);
    return filteredVideos
      .sort(() => Math.random() - 0.5)
      .slice(0, maxResults);
  }
  
  try {
    // Track this request (search is expensive - 100 units)
    if (trackApiUsage(ENDPOINTS.SEARCH)) {
      const filteredVideos = mockVideos.filter((video: YouTubeVideo) => video.id !== videoId);
      return filteredVideos
        .sort(() => Math.random() - 0.5)
        .slice(0, maxResults);
    }
    
    const url = createUrl(ENDPOINTS.SEARCH, {
      part: 'snippet',
      relatedToVideoId: videoId,
      type: 'video',
      maxResults,
    });
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Check for quota errors
    if (data.error && data.error.code === 403) {
      console.warn('YouTube API quota exceeded, using mock data instead');
      quotaManager.isQuotaExceeded = true;
      saveQuotaState();
      const filteredVideos = mockVideos.filter((video: YouTubeVideo) => video.id !== videoId);
      return filteredVideos
        .sort(() => Math.random() - 0.5)
        .slice(0, maxResults);
    }
    
    // Check for other errors
    if (data.error) {
      console.error('YouTube API error:', data.error);
      return [];
    }
    
    // Get video IDs from search results
    const videoIds = data.items?.map((item: { id: { videoId: string } }) => item.id.videoId).join(',') || '';
    
    if (!videoIds) return [];
    
    // Get full video details
    return getVideoDetails(videoIds);
  } catch (err) {
    console.error('Error fetching related videos:', err);
    return [];
  }
}; 