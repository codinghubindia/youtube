import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { YouTubeVideo, getPopularVideos, searchVideos, resetQuotaTracking, getEducationalVideos } from '../utils/api';

interface MiniPlayerState {
  active: boolean;
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
}

interface YouTubeContextType {
  videos: YouTubeVideo[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  fetchVideos: (isSearch?: boolean, page?: number, educational?: boolean) => Promise<void>;
  loadMoreVideos: (educational?: boolean) => Promise<void>;
  miniPlayer: MiniPlayerState;
  showMiniPlayer: (videoId: string, title: string, channelTitle: string, thumbnailUrl: string) => void;
  hideMiniPlayer: () => void;
  searchHistory: string[];
  clearSearchHistory: () => void;
  hasMoreVideos: boolean;
  resetApiQuota: () => void;
}

const YouTubeContext = createContext<YouTubeContextType | undefined>(undefined);

export const YouTubeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreVideos, setHasMoreVideos] = useState<boolean>(true);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [isEducationalMode, setIsEducationalMode] = useState<boolean>(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [miniPlayer, setMiniPlayer] = useState<MiniPlayerState>({
    active: false,
    videoId: '',
    title: '',
    channelTitle: '',
    thumbnailUrl: ''
  });

  // Save search history to localStorage
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true' || 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setDarkMode(isDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', String(newValue));
      
      if (newValue) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return newValue;
    });
  }, []);

  const fetchVideos = useCallback(async (isSearch = false, page = 1, educational = false) => {
    setLoading(true);
    setError(null);
    setIsEducationalMode(educational);
    
    try {
      const pageSize = 12;
      let fetchedVideos;
      
      if (isSearch && searchQuery.trim()) {
        setIsSearchActive(true);
        
        // Add to search history if it's a new search
        if (page === 1 && !searchHistory.includes(searchQuery)) {
          setSearchHistory(prev => {
            const newHistory = [searchQuery, ...prev.slice(0, 9)];
            return newHistory;
          });
        }
        
        fetchedVideos = await searchVideos(searchQuery, pageSize);
      } else if (educational) {
        setIsSearchActive(false);
        fetchedVideos = await getEducationalVideos(pageSize);
      } else {
        setIsSearchActive(false);
        fetchedVideos = await getPopularVideos(pageSize);
      }
      
      // Check if we have more videos to load
      setHasMoreVideos(fetchedVideos.length >= pageSize);
      
      if (page === 1) {
        // First page, replace existing videos
        setVideos(fetchedVideos || []);
        setCurrentPage(1);
      } else {
        // Subsequent pages, append new videos
        setVideos(prevVideos => {
          // Filter out duplicates by ID
          const existingIds = new Set(prevVideos.map(v => v.id));
          const newVideos = fetchedVideos.filter(v => !existingIds.has(v.id));
          
          // If no new videos were loaded, we've reached the end
          if (newVideos.length === 0) {
            setHasMoreVideos(false);
          }
          
          return [...prevVideos, ...newVideos];
        });
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to fetch videos. Please try again later.');
      setHasMoreVideos(false);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchHistory]);

  const loadMoreVideos = useCallback(async (educational = false) => {
    if (loading || !hasMoreVideos) return;
    // Use the educational mode from state if it's not explicitly passed
    const useEducational = educational !== undefined ? educational : isEducationalMode;
    await fetchVideos(isSearchActive, currentPage + 1, useEducational);
  }, [loading, hasMoreVideos, fetchVideos, isSearchActive, currentPage, isEducationalMode]);

  const showMiniPlayer = useCallback((videoId: string, title: string, channelTitle: string, thumbnailUrl: string) => {
    setMiniPlayer({
      active: true,
      videoId,
      title,
      channelTitle,
      thumbnailUrl
    });
  }, []);

  const hideMiniPlayer = useCallback(() => {
    setMiniPlayer(prev => ({
      ...prev,
      active: false
    }));
  }, []);
  
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);
  
  const resetApiQuota = useCallback(() => {
    resetQuotaTracking();
  }, []);

  return (
    <YouTubeContext.Provider 
      value={{ 
        videos, 
        loading, 
        error, 
        searchQuery, 
        setSearchQuery, 
        darkMode,
        toggleDarkMode,
        fetchVideos,
        loadMoreVideos,
        miniPlayer,
        showMiniPlayer,
        hideMiniPlayer,
        searchHistory,
        clearSearchHistory,
        hasMoreVideos,
        resetApiQuota
      }}
    >
      {children}
    </YouTubeContext.Provider>
  );
};

export const useYouTube = () => {
  const context = useContext(YouTubeContext);
  if (context === undefined) {
    throw new Error('useYouTube must be used within a YouTubeProvider');
  }
  return context;
}; 