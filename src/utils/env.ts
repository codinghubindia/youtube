// Environment variable configuration
const getEnv = (key: string): string => import.meta.env[key] || '';

// Helper to validate API key format
const isValidApiKey = (key: string): boolean => {
  // Allow any non-empty string that's at least 20 characters
  return typeof key === 'string' && key.trim().length >= 20;
};

// Helper to get unique, valid API keys
const getUniqueValidKeys = (keys: string[], isDev: boolean = false): string[] => {
  const validKeys = [...new Set(keys)]
    .filter(key => key && key.trim())  // Remove empty strings
    .filter(key => isValidApiKey(key));

  if (isDev && keys.length > 0 && validKeys.length === 0) {
    console.warn('Found API keys but none are valid. Keys must be at least 20 characters long.');
    keys.forEach((key, index) => {
      if (key) {
        console.log(`Key ${index + 1} length: ${key.length} characters`);
      }
    });
  }

  return validKeys;
};

const isDev = import.meta.env.DEV;

// Initialize environment configuration
export const ENV = {
  YOUTUBE_API_KEY: getEnv('VITE_YOUTUBE_API_KEY'),
  YOUTUBE_API_KEYS: getUniqueValidKeys([
    getEnv('VITE_YOUTUBE_API_KEY'),
    getEnv('VITE_YOUTUBE_API_KEY_1'),
    getEnv('VITE_YOUTUBE_API_KEY_2'),
    getEnv('VITE_YOUTUBE_API_KEY_3'),
    getEnv('VITE_YOUTUBE_API_KEY_4'),
  ], isDev),
  
  GEMINI_API_KEY: getEnv('VITE_GEMINI_API_KEY'),
  GEMINI_API_KEYS: getUniqueValidKeys([
    getEnv('VITE_GEMINI_API_KEY'),
    getEnv('VITE_GEMINI_API_KEY_1'),
    getEnv('VITE_GEMINI_API_KEY_2'),
    getEnv('VITE_GEMINI_API_KEY_3'),
  ], isDev),
  
  isDev,
};

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

// Helper functions with better validation
export const isYouTubeConfigured = () => {
  const hasValidKeys = ENV.YOUTUBE_API_KEYS.length > 0;
  if (isDev) {
    if (!hasValidKeys) {
      console.warn('YouTube API is not configured. Please add a valid API key to your .env file.');
    } else {
      // Only log this once
      if (!window.localStorage.getItem('youtube_api_keys_logged')) {
        console.log('YouTube API Keys found:', ENV.YOUTUBE_API_KEYS.length);
        ENV.YOUTUBE_API_KEYS.forEach((key, index) => {
          console.log(`YouTube API Key ${index + 1}: ${key.slice(0, 8)}...${key.slice(-4)}`);
        });
        window.localStorage.setItem('youtube_api_keys_logged', 'true');
      }
    }
  }
  return hasValidKeys;
};

export const isGeminiConfigured = () => {
  const hasValidKeys = ENV.GEMINI_API_KEYS.length > 0;
  
  // Only log in dev mode and only once per session
  if (isDev && !window.localStorage.getItem('gemini_config_logged')) {
    if (!hasValidKeys) {
      console.warn('Gemini API is not configured. Please add a valid API key to your .env file.');
    } else {
      console.log('Gemini API Keys found:', ENV.GEMINI_API_KEYS.length);
      ENV.GEMINI_API_KEYS.forEach((key, index) => {
        console.log(`Gemini API Key ${index + 1}: ${key.slice(0, 8)}...${key.slice(-4)}`);
      });
    }
    window.localStorage.setItem('gemini_config_logged', 'true');
  }
  
  return hasValidKeys;
};

// Export active API keys with validation
export const ACTIVE_API_KEYS = ENV.YOUTUBE_API_KEYS;
export const YOUTUBE_API_KEY = ACTIVE_API_KEYS[0] || '';

// Log configuration status in development only once
if (isDev && !window.localStorage.getItem('api_config_logged')) {
  console.log('=== API Configuration Status ===');
  console.log(`YouTube API Status: ${isYouTubeConfigured() ? 'Configured' : 'Not Configured'}`);
  console.log(`Gemini API Status: ${isGeminiConfigured() ? 'Configured' : 'Not Configured'}`);
  if (isYouTubeConfigured()) {
    console.log(`Active YouTube API Keys: ${ACTIVE_API_KEYS.length}`);
    console.log('First YouTube API Key:', YOUTUBE_API_KEY ? `${YOUTUBE_API_KEY.slice(0, 8)}...${YOUTUBE_API_KEY.slice(-4)}` : 'None');
  }
  console.log('============================');
  window.localStorage.setItem('api_config_logged', 'true');
}