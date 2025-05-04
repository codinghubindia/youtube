import React, { useEffect, useRef, useState } from 'react';
import { useYouTube } from '../context/YouTubeContext';
import { useLearningMode } from '../context/LearningModeContext';
import VideoCard from '../components/VideoCard';
import { formatDuration } from '../utils/formatUtils';
import { Loader2, BookOpen } from 'lucide-react';
import { parseISO8601Duration } from '../utils/mockData';

const HomePage: React.FC = () => {
  const { videos, loading, error, fetchVideos, loadMoreVideos } = useYouTube();
  const { learningMode } = useLearningMode();
  const [page, setPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Process videos for learning mode
  const processedVideos = React.useMemo(() => {
    if (!learningMode) return videos;

    // In learning mode, filter videos:
    // 1. Must be educational
    // 2. Duration must be <= 5 minutes (300 seconds)
    return videos.filter(video => {
      // Calculate duration in seconds if not already calculated
      const durationInSeconds = video.durationInSeconds || 
        (video.contentDetails?.duration ? parseISO8601Duration(video.contentDetails.duration) : 0);
      
      return video.isEducational && durationInSeconds <= 300;
    });
  }, [videos, learningMode]);

  // Load initial videos
  useEffect(() => {
    fetchVideos(false, 1, true); // Third parameter true to fetch educational videos
  }, [fetchVideos]);

  // Implement infinite scrolling with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // If the loadMoreRef element is intersecting (visible)
        if (entries[0].isIntersecting && !loading) {
          loadMoreVideos(true); // true to fetch educational videos
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the element is visible
    );

    // If we have a reference to the element, observe it
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    // Cleanup: disconnect the observer when component unmounts
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
      observer.disconnect();
    };
  }, [loading, loadMoreVideos]);

  if (error && videos.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => fetchVideos(false, 1, true)}
          className="mt-4 px-4 py-2 bg-youtube-red text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="pt-4 px-4 pb-16 dark:bg-[#0f0f0f]">
      {learningMode && (
        <div className="mb-4 flex items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <BookOpen className="text-youtube-red mr-2" size={20} />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Learning Mode Active</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing educational videos under 5 minutes for focused learning
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {processedVideos.map(video => (
          <VideoCard 
            key={video.id} 
            video={{
              id: video.id,
              title: video.snippet.title,
              thumbnailUrl: video.snippet.thumbnails.high.url,
              channel: {
                name: video.snippet.channelTitle,
                avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(video.snippet.channelTitle)}&background=random`,
                verified: true // This would need to come from actual channel data
              },
              views: parseInt(video.statistics?.viewCount || '0'),
              timestamp: video.snippet.publishedAt,
              duration: formatDuration(video.contentDetails?.duration || '')
            }} 
          />
        ))}
      </div>
      
      {processedVideos.length === 0 && !loading && (
        <div className="p-8 text-center">
          <BookOpen className="mx-auto text-youtube-red mb-4" size={48} />
          <h3 className="text-xl font-semibold mb-2 dark:text-white">No educational videos found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No short educational videos were found. Try disabling Learning Mode to see all videos.
          </p>
        </div>
      )}
      
      {/* Loading indicator for infinite scroll */}
      <div ref={loadMoreRef} className="flex justify-center mt-8 pb-4">
        {loading && videos.length > 0 && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
            <span className="text-gray-500 dark:text-gray-400">Loading more videos...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;