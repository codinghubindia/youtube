import React, { useState, useEffect } from 'react';
import { Users, Filter, Clock, ListFilter, Bell, BellOff, Loader2 } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import { useYouTube } from '../context/YouTubeContext';
import { formatDuration } from '../utils/formatUtils';

// Mock subscription channels - in a real app, this would come from an API
const mockChannels = [
  { id: '1', name: 'Tech Channel', avatar: 'https://ui-avatars.com/api/?name=Tech+Channel&background=random', verified: true },
  { id: '2', name: 'Gaming Hub', avatar: 'https://ui-avatars.com/api/?name=Gaming+Hub&background=random', verified: true },
  { id: '3', name: 'Music World', avatar: 'https://ui-avatars.com/api/?name=Music+World&background=random', verified: true },
  { id: '4', name: 'Cooking Master', avatar: 'https://ui-avatars.com/api/?name=Cooking+Master&background=random', verified: false },
  { id: '5', name: 'Science Lab', avatar: 'https://ui-avatars.com/api/?name=Science+Lab&background=random', verified: true },
  { id: '6', name: 'Travel Diaries', avatar: 'https://ui-avatars.com/api/?name=Travel+Diaries&background=random', verified: false },
  { id: '7', name: 'Fitness Zone', avatar: 'https://ui-avatars.com/api/?name=Fitness+Zone&background=random', verified: true },
  { id: '8', name: 'Art Studio', avatar: 'https://ui-avatars.com/api/?name=Art+Studio&background=random', verified: false },
];

const SubscriptionsPage: React.FC = () => {
  const { videos, loading, error, fetchVideos } = useYouTube();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAllChannels, setShowAllChannels] = useState(false);
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    // Fetch videos (in a real app, this would fetch from subscribed channels)
    fetchVideos();
  }, [fetchVideos]);

  const displayedChannels = showAllChannels ? mockChannels : mockChannels.slice(0, 6);

  // Handle load more
  const handleLoadMore = () => {
    if (!loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchVideos(false, nextPage);
    }
  };

  return (
    <div className="pt-4 px-4 pb-16 dark:bg-[#0f0f0f]">
      {/* Subscribed channels row */}
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex space-x-4 min-w-max">
          <div className="flex flex-col items-center w-20">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-1">
              <ListFilter className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
            <span className="text-xs text-center dark:text-white">All</span>
          </div>
          
          {displayedChannels.map(channel => (
            <div key={channel.id} className="flex flex-col items-center w-20">
              <div className="relative w-14 h-14 mb-1">
                <img 
                  src={channel.avatar} 
                  alt={channel.name}
                  className="w-full h-full rounded-full object-cover"
                />
                {channel.id === '1' && (
                  <div className="absolute -top-1 -right-1 bg-red-600 rounded-full w-4 h-4 flex items-center justify-center">
                    <span className="text-white text-[9px]">3</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-center overflow-hidden text-ellipsis w-full dark:text-white">{channel.name}</span>
            </div>
          ))}
          
          {!showAllChannels && mockChannels.length > 6 && (
            <div className="flex flex-col items-center w-20">
              <button 
                onClick={() => setShowAllChannels(true)}
                className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-1 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <span className="text-xl font-medium text-gray-700 dark:text-gray-300">+{mockChannels.length - 6}</span>
              </button>
              <span className="text-xs text-center dark:text-white">Show more</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Filter options */}
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button 
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              selectedFilter === 'all' 
                ? 'bg-black text-white dark:bg-white dark:text-black' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}
            onClick={() => setSelectedFilter('all')}
          >
            All
          </button>
          <button 
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              selectedFilter === 'today' 
                ? 'bg-black text-white dark:bg-white dark:text-black' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}
            onClick={() => setSelectedFilter('today')}
          >
            Today
          </button>
          <button 
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              selectedFilter === 'continue' 
                ? 'bg-black text-white dark:bg-white dark:text-black' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}
            onClick={() => setSelectedFilter('continue')}
          >
            Continue watching
          </button>
          <button 
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              selectedFilter === 'unwatched' 
                ? 'bg-black text-white dark:bg-white dark:text-black' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}
            onClick={() => setSelectedFilter('unwatched')}
          >
            Unwatched
          </button>
          <button 
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              selectedFilter === 'live' 
                ? 'bg-black text-white dark:bg-white dark:text-black' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}
            onClick={() => setSelectedFilter('live')}
          >
            Live
          </button>
          <button 
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              selectedFilter === 'posts' 
                ? 'bg-black text-white dark:bg-white dark:text-black' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}
            onClick={() => setSelectedFilter('posts')}
          >
            Posts
          </button>
          <button 
            className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
              selectedFilter === 'settings' 
                ? 'bg-black text-white dark:bg-white dark:text-black' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}
            onClick={() => setSelectedFilter('settings')}
          >
            <Filter className="w-4 h-4 mr-1" />
            Manage
          </button>
        </div>
      </div>
      
      {/* Videos grid */}
      {loading && videos.length === 0 ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
        </div>
      ) : error && videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => fetchVideos()}
            className="px-4 py-2 bg-youtube-red text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-medium mb-2 dark:text-white">No subscriptions yet</h2>
          <p className="text-gray-600 dark:text-gray-400">Videos from your subscribed channels will appear here</p>
        </div>
      ) : (
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
                  verified: Math.random() > 0.5 // Randomly assign verified status for demo
                },
                views: parseInt(video.statistics?.viewCount || '0'),
                timestamp: video.snippet.publishedAt,
                duration: formatDuration(video.contentDetails?.duration || '')
              }} 
            />
          ))}
        </div>
      )}
      
      {/* Loading indicator for infinite scroll */}
      {loading && videos.length > 0 ? (
        <div className="flex justify-center mt-8 pb-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
          <span className="text-gray-500 dark:text-gray-400">Loading videos...</span>
        </div>
      ) : videos.length > 0 ? (
        <div className="flex justify-center mt-8 pb-4">
          <button 
            onClick={handleLoadMore}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-800 dark:text-gray-200 font-medium"
          >
            Load more
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default SubscriptionsPage;