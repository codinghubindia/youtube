export const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || ''; // Get API key from environment variables

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