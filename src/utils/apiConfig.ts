// API key configuration and management

// Constants
const isDev = import.meta.env.MODE === 'development';

// Interface for environment configuration
interface EnvConfig {
  YOUTUBE_API_KEYS: string[];
  YOUTUBE_API_KEY: string;
}

// Load environment variables with validation
const loadEnvConfig = (): EnvConfig => {
  const config = {
    YOUTUBE_API_KEYS: [] as string[],
    YOUTUBE_API_KEY: '',
  };

  try {
    // Load API keys from different sources
    const envKeys = [
      import.meta.env.VITE_YOUTUBE_API_KEY,
      import.meta.env.VITE_YOUTUBE_API_KEY_2,
      import.meta.env.VITE_YOUTUBE_API_KEY_3,
      import.meta.env.VITE_YOUTUBE_API_KEY_4,
      import.meta.env.VITE_YOUTUBE_API_KEY_5,
    ].filter(Boolean);

    const localStorageKeys = JSON.parse(localStorage.getItem('youtube_api_keys') || '[]');
    const combinedKeys = [...new Set([...envKeys, ...localStorageKeys])];

    // Validate each key
    config.YOUTUBE_API_KEYS = combinedKeys.filter(key => {
      if (!key || typeof key !== 'string') return false;
      if (key.length < 20) {
        console.warn(`Invalid YouTube API key length: ${key.slice(0, 8)}...`);
        return false;
      }
      return true;
    });

    // Set primary key
    config.YOUTUBE_API_KEY = config.YOUTUBE_API_KEYS[0] || '';

    // Save valid keys to localStorage
    if (config.YOUTUBE_API_KEYS.length > 0) {
      localStorage.setItem('youtube_api_keys', JSON.stringify(config.YOUTUBE_API_KEYS));
    }

  } catch (error) {
    console.error('Error loading environment config:', error);
  }

  return config;
};

// Initialize environment configuration
export const ENV = loadEnvConfig();

// API configuration
export const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// YouTube API endpoints
export const ENDPOINTS = {
  SEARCH: '/search',
  VIDEOS: '/videos',
  CHANNELS: '/channels',
  COMMENTS: '/commentThreads',
  PLAYLISTS: '/playlists',
  PLAYLIST_ITEMS: '/playlistItems',
};

// Helper functions for API key management
export const isYouTubeConfigured = () => {
  const hasValidKeys = ENV.YOUTUBE_API_KEYS.length > 0;
  
  if (isDev) {
    if (!hasValidKeys) {
      console.warn(`
        YouTube API is not configured. Please add valid API keys to your .env file:
        VITE_YOUTUBE_API_KEY=your_key_here
        VITE_YOUTUBE_API_KEY_2=another_key_here
        ...etc
        
        You can get API keys from: https://console.cloud.google.com/apis/credentials
      `);
    } else {
      // Log API key status only once per session
      if (!sessionStorage.getItem('youtube_api_keys_logged')) {
        console.log(`YouTube API Keys configured: ${ENV.YOUTUBE_API_KEYS.length}`);
        ENV.YOUTUBE_API_KEYS.forEach((key, index) => {
          console.log(`Key ${index + 1}: ${key.slice(0, 8)}...${key.slice(-4)}`);
        });
        sessionStorage.setItem('youtube_api_keys_logged', 'true');
      }
    }
  }
  
  return hasValidKeys;
};

// Function to add a new API key at runtime
export const addApiKey = (newKey: string): boolean => {
  if (!newKey || typeof newKey !== 'string' || newKey.length < 20) {
    console.warn('Invalid API key format');
    return false;
  }

  try {
    const existingKeys = ENV.YOUTUBE_API_KEYS;
    if (!existingKeys.includes(newKey)) {
      ENV.YOUTUBE_API_KEYS.push(newKey);
      localStorage.setItem('youtube_api_keys', JSON.stringify(ENV.YOUTUBE_API_KEYS));
      console.log(`Added new API key: ${newKey.slice(0, 8)}...${newKey.slice(-4)}`);
      return true;
    }
  } catch (error) {
    console.error('Error adding new API key:', error);
  }
  return false;
};

// Function to remove a failed API key
export const removeApiKey = (keyToRemove: string): boolean => {
  try {
    ENV.YOUTUBE_API_KEYS = ENV.YOUTUBE_API_KEYS.filter(key => key !== keyToRemove);
    localStorage.setItem('youtube_api_keys', JSON.stringify(ENV.YOUTUBE_API_KEYS));
    console.log(`Removed API key: ${keyToRemove.slice(0, 8)}...${keyToRemove.slice(-4)}`);
    return true;
  } catch (error) {
    console.error('Error removing API key:', error);
    return false;
  }
};

// Function to test an API key
export const testApiKey = async (key: string): Promise<boolean> => {
  try {
    const url = `${YOUTUBE_API_BASE_URL}/videos?part=snippet&chart=mostPopular&maxResults=1&key=${key}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.warn(`API key test failed: ${data.error.message}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error testing API key:', error);
    return false;
  }
};

// Export active API keys
export const ACTIVE_API_KEYS = ENV.YOUTUBE_API_KEYS;
export const YOUTUBE_API_KEY = ENV.YOUTUBE_API_KEY;

// Quota tracking interface
export interface QuotaInfo {
  remaining: number;
  total: number;
  resetTime: number;
}

// Function to get quota information
export const getQuotaInfo = (): QuotaInfo => {
  const stored = localStorage.getItem('youtubeApiQuota');
  if (!stored) {
    return {
      remaining: 10000,
      total: 10000,
      resetTime: Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
    };
  }

  try {
    const quota = JSON.parse(stored) as {
      dailyQuotaLimit: number;
      quotaPerKey: { [key: string]: number };
      lastResetDate: string;
    };
    
    const totalUsed = Object.values(quota.quotaPerKey).reduce((a, b) => a + b, 0);
    
    return {
      remaining: quota.dailyQuotaLimit - totalUsed,
      total: quota.dailyQuotaLimit,
      resetTime: new Date(quota.lastResetDate).getTime() + 24 * 60 * 60 * 1000
    };
  } catch (error) {
    console.error('Error parsing quota info:', error);
    return {
      remaining: 10000,
      total: 10000,
      resetTime: Date.now() + 24 * 60 * 60 * 1000
    };
  }
};