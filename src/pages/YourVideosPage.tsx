import React from 'react';
import { Video } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import { videos } from '../data/videos';

const YourVideosPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Video className="w-6 h-6 mr-2" />
        <h1 className="text-2xl font-semibold">Your Videos</h1>
      </div>

      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-medium mb-2">No videos uploaded</h2>
          <p className="text-gray-600">Your uploaded videos will appear here</p>
        </div>
      )}
    </div>
  );
};

export default YourVideosPage;