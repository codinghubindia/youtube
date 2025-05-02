import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useYouTube } from '../context/YouTubeContext';
import VideoCard from '../components/VideoCard';
import { formatDuration } from '../utils/formatUtils';
import { Loader2 } from 'lucide-react';

const HomePage: React.FC = () => {
  const { videos, loading, error, fetchVideos } = useYouTube();
  const [page, setPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Load initial videos
  useEffect(() => {
    fetchVideos();
  }, []);

  // Handle load more
  const handleLoadMore = () => {
    if (!loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchVideos(false, nextPage);
    }
  };

  if (error && videos.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => fetchVideos()}
          className="mt-4 px-4 py-2 bg-youtube-red text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="pt-4 px-4 pb-16 dark:bg-[#0f0f0f]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map(video => (
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
      
      {/* Loading indicator or load more button */}
      <div ref={loadMoreRef} className="flex justify-center mt-8 pb-4">
        {loading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
            <span className="text-gray-500 dark:text-gray-400">Loading videos...</span>
          </div>
        ) : videos.length > 0 ? (
          <button 
            onClick={handleLoadMore}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-800 dark:text-gray-200 font-medium"
          >
            Load more
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default HomePage;