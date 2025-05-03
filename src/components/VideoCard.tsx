import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { VideoType } from '../data/videos';
import { formatViews, formatTimeAgo } from '../utils/formatUtils';

interface VideoCardProps {
  video: VideoType;
  layout?: 'grid' | 'row';
}

const VideoCard: React.FC<VideoCardProps> = ({ video, layout = 'grid' }) => {
  // Make sure we have a channel object with all required properties
  const channel = video.channel || { name: 'Unknown Channel', avatarUrl: '', verified: false };
  const avatarUrl = channel.avatarUrl || 'https://ui-avatars.com/api/?name=Unknown';

  if (layout === 'row') {
    return (
      <Link to={`/watch/${video.id}`} className="flex mb-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-1">
        <div className="relative w-40 h-24 min-w-[160px] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          <img 
            src={video.thumbnailUrl} 
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
            {video.duration}
          </div>
        </div>
        
        <div className="ml-2 flex-1">
          <h3 className="text-sm font-medium line-clamp-2 dark:text-white">{video.title}</h3>
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-1">
            <p>{channel.name}</p>
            {channel.verified && (
              <Check size={14} className="ml-1 text-gray-500" />
            )}
          </div>
          <div className="flex text-xs text-gray-600 dark:text-gray-400 mt-1">
            <p>{formatViews(video.views)} • {formatTimeAgo(video.timestamp)}</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="flex flex-col">
      <Link to={`/watch/${video.id}`} className="group">
        <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden mb-2">
          <img 
            src={video.thumbnailUrl} 
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
          <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
            {video.duration}
          </div>
        </div>
        
        <div className="flex">
          <div className="h-9 w-9 rounded-full overflow-hidden mr-3 mt-1">
            <img
              src={avatarUrl}
              alt={channel.name}
              className="h-full w-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-sm line-clamp-2 leading-5 mb-1 dark:text-white">{video.title}</h3>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <p>{channel.name}</p>
              {channel.verified && (
                <Check size={16} className="ml-1 text-gray-500" />
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>{formatViews(video.views)} • {formatTimeAgo(video.timestamp)}</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default VideoCard;