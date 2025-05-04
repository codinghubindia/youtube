// Environment variable configuration
const getEnv = (key: string): string => import.meta.env[key] || '';

export const ENV = {
  YOUTUBE_API_KEY: getEnv('VITE_YOUTUBE_API_KEY'),
  YOUTUBE_API_KEYS: [
    getEnv('VITE_YOUTUBE_API_KEY'),
    getEnv('VITE_YOUTUBE_API_KEY_1'),
    getEnv('VITE_YOUTUBE_API_KEY_2'),
    getEnv('VITE_YOUTUBE_API_KEY_3'),
    getEnv('VITE_YOUTUBE_API_KEY_4'),
  ].filter(Boolean),
  
  GEMINI_API_KEY: getEnv('VITE_GEMINI_API_KEY'),
  GEMINI_API_KEYS: [
    getEnv('VITE_GEMINI_API_KEY'),
    getEnv('VITE_GEMINI_API_KEY_1'),
    getEnv('VITE_GEMINI_API_KEY_2'),
    getEnv('VITE_GEMINI_API_KEY_3'),
  ].filter(Boolean),
  
  isDev: import.meta.env.DEV,
};

// API configuration
export const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
export const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1';

// YouTube API endpoints
export const ENDPOINTS = {
  SEARCH: '/search',
  VIDEOS: '/videos',
  CHANNELS: '/channels',
  COMMENTS: '/commentThreads',
  PLAYLISTS: '/playlists',
  PLAYLIST_ITEMS: '/playlistItems',
};

// Helper functions
export const isYouTubeConfigured = () => ENV.YOUTUBE_API_KEYS.length > 0;
export const isGeminiConfigured = () => ENV.GEMINI_API_KEYS.length > 0;

// Export active API keys
export const ACTIVE_API_KEYS = ENV.YOUTUBE_API_KEYS.filter(Boolean);
export const YOUTUBE_API_KEY = ACTIVE_API_KEYS[0] || '';