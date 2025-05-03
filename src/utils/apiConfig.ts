// Get all possible API keys from environment variables
// Format in env: VITE_YOUTUBE_API_KEY_1=key1 VITE_YOUTUBE_API_KEY_2=key2, etc.
export const YOUTUBE_API_KEYS = [
  import.meta.env.VITE_YOUTUBE_API_KEY_1 || '',
  import.meta.env.VITE_YOUTUBE_API_KEY_2 || '',
  import.meta.env.VITE_YOUTUBE_API_KEY_3 || '',
  import.meta.env.VITE_YOUTUBE_API_KEY_4 || '',
];

// Filter out empty API keys
export const ACTIVE_API_KEYS = YOUTUBE_API_KEYS.filter(key => key !== '');

// Use fallback to original key if no numbered keys are defined
export const YOUTUBE_API_KEY = ACTIVE_API_KEYS.length > 0 ? 
  ACTIVE_API_KEYS[0] : 
  (import.meta.env.VITE_YOUTUBE_API_KEY || '');

export const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// API endpoints
export const ENDPOINTS = {
  SEARCH: '/search',
  VIDEOS: '/videos',
  CHANNELS: '/channels',
  COMMENTS: '/commentThreads',
  PLAYLISTS: '/playlists',
  PLAYLIST_ITEMS: '/playlistItems',
}; 