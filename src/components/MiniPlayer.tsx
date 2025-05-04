import React, { useState } from 'react';
import { X, Minimize2, Play, Pause, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MiniPlayerProps {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  onClose: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({
  videoId,
  title,
  channelTitle,
  thumbnailUrl,
  onClose
}) => {
  const [minimized, setMinimized] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [thumbnailError, setThumbnailError] = useState(false);

  const toggleMinimize = () => {
    setMinimized(!minimized);
  };

  const togglePlayPause = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPlaying(!playing);
  };

  // Fallback image component
  const FallbackImage = () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
      <ImageIcon size={24} className="text-gray-400 dark:text-gray-500" />
    </div>
  );

  if (minimized) {
    return (
      <div 
        className="fixed bottom-6 right-6 w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl cursor-pointer z-50 overflow-hidden transition-all duration-300 hover:scale-105"
        onClick={toggleMinimize}
      >
        <div className="relative w-full h-full">
          {thumbnailError ? (
            <FallbackImage />
          ) : (
            <img 
              src={thumbnailUrl} 
              alt={title}
              className="w-full h-full object-cover"
              onError={() => setThumbnailError(true)}
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            {playing ? (
              <Pause 
                size={28} 
                className="text-white bg-black bg-opacity-50 rounded-full p-1.5 hover:bg-opacity-70 transition-all" 
                onClick={togglePlayPause}
              />
            ) : (
              <Play 
                size={28} 
                className="text-white bg-black bg-opacity-50 rounded-full p-1.5 hover:bg-opacity-70 transition-all" 
                onClick={togglePlayPause}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 transition-all duration-300">
      <div className="relative w-full">
        {/* Video player */}
        <div className="relative w-full aspect-video bg-black">
          {playing ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          ) : (
            <div className="relative w-full h-full">
              {thumbnailError ? (
                <FallbackImage />
              ) : (
                <img 
                  src={thumbnailUrl} 
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={() => setThumbnailError(true)}
                />
              )}
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-20"
                onClick={togglePlayPause}
              >
                <Play size={48} className="text-white bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-all" />
              </div>
            </div>
          )}
          
          {/* Control buttons */}
          <div className="absolute top-3 right-3 flex space-x-2">
            <button 
              onClick={toggleMinimize}
              className="p-1.5 bg-black bg-opacity-50 backdrop-blur-sm rounded-full text-white hover:bg-opacity-70 transition-all"
            >
              <Minimize2 size={16} />
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 bg-black bg-opacity-50 backdrop-blur-sm rounded-full text-white hover:bg-opacity-70 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        
        {/* Video info */}
        <Link to={`/watch/${videoId}`} className="block p-3">
          <h3 className="text-sm font-medium line-clamp-1 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{title}</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{channelTitle}</p>
        </Link>
      </div>
    </div>
  );
};

export default MiniPlayer; 