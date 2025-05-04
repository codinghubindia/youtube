import React, { useEffect, useRef, useState } from 'react';
import { useYouTube } from '../context/YouTubeContext';
import { useLearningMode } from '../context/LearningModeContext';
import VideoCard from '../components/VideoCard';
import { formatDuration } from '../utils/formatUtils';
import { Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { parseISO8601Duration } from '../utils/mockData';
import { isYouTubeConfigured } from '../utils/env';
import { VideoType } from '../data/videos';
import { YouTubeVideo } from '../utils/api';

const HomePage: React.FC = () => {
  const { videos, loading, error, fetchVideos, loadMoreVideos } = useYouTube();
  const { learningMode } = useLearningMode();
  const [page, setPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Convert YouTubeVideo to VideoType
  const convertToVideoType = (video: YouTubeVideo): VideoType => ({
    id: video.id,
    title: video.snippet.title,
    thumbnailUrl: video.snippet.thumbnails.high.url,
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
    // Check if YouTube API is configured
    if (!isYouTubeConfigured()) {
      console.warn('YouTube API is not configured - using mock data');
    }
    // Fetch educational videos only if learning mode is enabled
    fetchVideos(false, 1, learningMode);
  }, [fetchVideos, learningMode]); // Add learningMode to dependencies

  // Handle infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            loadMoreVideos(learningMode);
            return nextPage;
          });
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loading, loadMoreVideos, learningMode]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <AlertCircle className="text-youtube-red mb-4" size={48} />
        <h2 className="text-xl font-semibold mb-2 dark:text-white">Error Loading Videos</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Initial loading state */}
      {loading && videos.length === 0 && (
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-youtube-red" />
        </div>
      )}

      {/* Videos grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {processedVideos.map((video) => (
          <VideoCard key={video.id} video={convertToVideoType(video)} />
        ))}
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