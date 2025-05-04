// YouTube API configuration
import { ENV, YOUTUBE_API_BASE_URL } from './env';

// API configuration
export const API_KEY = ENV.YOUTUBE_API_KEY;
export const API_KEYS = ENV.YOUTUBE_API_KEYS;

// API endpoints
export const ENDPOINTS = {
  SEARCH: '/search',
  VIDEOS: '/videos',
  CHANNELS: '/channels',
  COMMENTS: '/commentThreads',
  PLAYLISTS: '/playlists',
  PLAYLIST_ITEMS: '/playlistItems',
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint: keyof typeof ENDPOINTS, params: Record<string, string>) => {
  const url = new URL(`${YOUTUBE_API_BASE_URL}${ENDPOINTS[endpoint]}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  url.searchParams.append('key', API_KEY);
  return url.toString();
};