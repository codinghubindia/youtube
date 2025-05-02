import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useYouTube } from '../context/YouTubeContext';
import VideoCard from '../components/VideoCard';
import { Loader2 } from 'lucide-react';

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { 
    videos, 
    loading, 
    error, 
    setSearchQuery, 
    fetchVideos, 
    loadMoreVideos, 
    hasMoreVideos 
  } = useYouTube();

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      // Passing true to indicate this is a search operation
      fetchVideos(true, 1);
      
      // Track search in analytics (if implemented)
      try {
        if (window.gtag) {
          window.gtag('event', 'search', {
            search_term: query
          });
        }
      } catch (e) {
        console.error('Analytics error:', e);
      }
    }
  }, [query, setSearchQuery, fetchVideos]);

  const handleLoadMore = () => {
    loadMoreVideos();
  };

  if (loading && videos.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => fetchVideos(true)}
          className="mt-4 px-4 py-2 bg-youtube-red text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (videos.length === 0 && !loading) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-medium mb-2">No results found</h2>
        <p className="text-gray-600">
          Try different keywords or remove search filters
        </p>
      </div>
    );
  }

  return (
    <div className="pt-4 px-4 pb-16">
      <div className="mb-4">
        <h2 className="text-xl font-medium">Search results for "{query}"</h2>
        <p className="text-sm text-gray-500 mt-1">About {videos.length} results</p>
      </div>
      
      <div className="space-y-4">
        {videos.map(video => (
          <div key={video.id} className="max-w-3xl">
            <VideoCard
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
                duration: video.contentDetails?.duration || '0:00'
              }}
              layout="row"
            />
          </div>
        ))}
      </div>
      
      {hasMoreVideos && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load more'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage; 