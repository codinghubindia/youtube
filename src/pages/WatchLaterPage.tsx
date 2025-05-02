import React from 'react';
import { Clock } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import { videos } from '../data/videos';

const WatchLaterPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Clock className="w-6 h-6 mr-2" />
        <h1 className="text-2xl font-semibold">Watch Later</h1>
      </div>

      {videos.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {videos.map(video => (
            <VideoCard key={video.id} video={video} layout="row" />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-medium mb-2">No videos to watch later</h2>
          <p className="text-gray-600">Save videos to watch later</p>
        </div>
      )}
    </div>
  );
};

export default WatchLaterPage;