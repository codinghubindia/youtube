import React, { useEffect, useRef, useState } from 'react';
import { useYouTube } from '../context/YouTubeContext';
import { useLearningMode } from '../context/LearningModeContext';
import VideoCard from '../components/VideoCard';
import HomeLearningGuide from '../components/HomeLearningGuide';
import { formatDuration } from '../utils/formatUtils';
import { Loader2, BookOpen, AlertCircle, Brain, ChevronDown, ChevronUp, X } from 'lucide-react';
import { parseISO8601Duration, isEducationalContent } from '../utils/utils';
import { isYouTubeConfigured } from '../utils/env';
import { VideoType } from '../data/videos';
import { YouTubeVideo } from '../utils/api';

const HomePage: React.FC = () => {
  const { videos, loading, error, fetchVideos, loadMoreVideos, hasMoreVideos } = useYouTube();
  const { learningMode, sidebarVisible, toggleSidebar } = useLearningMode();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth >= 1024);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [chatMaximized, setChatMaximized] = useState(false);
  const [errorState, setError] = useState<string | null>(null);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth >= 1024);
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Convert YouTubeVideo to VideoType
  const convertToVideoType = (video: YouTubeVideo): VideoType => ({
    id: video.id?.videoId || video.id, // Handle both search results and direct video IDs
    title: video.snippet.title,
    thumbnailUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
    channel: {
      name: video.snippet.channelTitle,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(video.snippet.channelTitle)}&background=random`,
      verified: true
    },
    views: parseInt(video.statistics?.viewCount || '0'),
    timestamp: video.snippet.publishedAt,
    duration: video.contentDetails?.duration ? formatDuration(video.contentDetails.duration) : ''
  });

  // Process videos for learning mode
  const processedVideos = React.useMemo(() => {
    if (!learningMode) return videos;

    // First deduplicate videos based on ID
    const uniqueVideos = videos.reduce((acc, current) => {
      const exists = acc.find(video => video.id === current.id);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, [] as YouTubeVideo[]);

    // Then filter for educational content
    return uniqueVideos.filter(video => {
      // Check if video is educational based on tags, title, and description
      const isEducational = video.isEducational || isEducationalContent(video);
      return isEducational;
    });
  }, [videos, learningMode]);

  // Load initial videos
  useEffect(() => {
    let mounted = true;

    const loadVideos = async () => {
      try {
        // Check if YouTube API is configured
        if (!isYouTubeConfigured()) {
          console.warn('YouTube API is not configured - using mock data');
        }
        
        // Fetch videos with proper error handling
        if (mounted) {
          await fetchVideos(false, 1, learningMode);
        }
      } catch (error) {
        console.error('Error loading videos:', error);
        setError('Failed to load videos. Please try again.');
      }
    };

    loadVideos();

    return () => {
      mounted = false;
    };
  }, [fetchVideos, learningMode]);

  // Handle infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Only trigger if element is intersecting and we're not already loading
        if (entries[0].isIntersecting && !loading) {
          loadMoreVideos(learningMode);
        }
      },
      { 
        threshold: 0.1,  // Reduced threshold
        rootMargin: '100px' // Add some margin to trigger before reaching the very bottom
      }
    );

    // Only observe if we have a ref and we're not loading
    if (loadMoreRef.current && !loading) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
      observer.disconnect();
    };
  }, [loading, loadMoreVideos, learningMode]);

  if (errorState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <AlertCircle className="text-youtube-red mb-4" size={48} />
        <h2 className="text-xl font-semibold mb-2 dark:text-white">Error Loading Videos</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-4">{errorState}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Main content */}
      <div className={`flex-1 ${learningMode && sidebarVisible && isWideScreen ? 'mr-[350px]' : ''}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Initial loading state */}
          {loading && videos.length === 0 && (
            <div className="flex justify-center items-center min-h-[50vh]">
              <Loader2 className="h-8 w-8 animate-spin text-youtube-red" />
            </div>
          )}

          {/* Videos grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {processedVideos.map((video, index) => {
              // Create a unique key combining video ID and index
              const uniqueKey = `${video.id}-${index}`;
              return (
                <VideoCard 
                  key={uniqueKey} 
                  video={convertToVideoType(video)} 
                />
              );
            })}
          </div>

          {/* No videos found message */}
          {processedVideos.length === 0 && !loading && learningMode && (
            <div className="p-8 text-center">
              <BookOpen className="mx-auto text-youtube-red mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-2 dark:text-white">No educational videos found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No short educational videos were found. Try disabling Learning Mode to see all videos.
              </p>
            </div>
          )}

          {/* Loading indicator for infinite scroll */}
          {hasMoreVideos && (
            <div ref={loadMoreRef} className="flex justify-center mt-8 pb-4">
              {loading && (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
                  <span className="text-gray-500 dark:text-gray-400">Loading more videos...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Learning Mode Sidebar */}
      {learningMode && sidebarVisible && (
        <div 
          className={`fixed ${isMobileView ? 'inset-x-0 bottom-0 z-50' : 
            chatMaximized ? 'top-16 right-4 bottom-4 w-[450px] z-40' : 'top-16 right-4 w-[350px] h-[calc(100vh-5rem)] z-40'}`}
        >
          <div className={`bg-white dark:bg-gray-900 ${isMobileView ? 'rounded-t-xl' : 'rounded-xl'} shadow-xl flex flex-col h-full overflow-hidden border border-blue-200 dark:border-blue-800`}>
            {/* Header with maximize and close buttons */}
            <div className="bg-blue-600 dark:bg-blue-700 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center text-white space-x-2">
                <Brain size={20} />
                <h3 className="font-medium">Learning Assistant</h3>
              </div>
              <div className="flex items-center space-x-2">
                {!isMobileView && (
                  <button 
                    onClick={() => setChatMaximized(!chatMaximized)}
                    className="text-white p-1 rounded hover:bg-blue-700 transition-colors"
                    title={chatMaximized ? "Minimize" : "Maximize"}
                  >
                    {chatMaximized ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  </button>
                )}
                <button 
                  onClick={toggleSidebar}
                  className="text-white p-1 rounded hover:bg-blue-700 transition-colors"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            {/* Learning guide content */}
            <div className="flex-1 overflow-hidden">
              <HomeLearningGuide onClose={toggleSidebar} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;