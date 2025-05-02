import React from 'react';
import { User, Bell, Check } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import { videos } from '../data/videos';

const ChannelPage: React.FC = () => {
  return (
    <div>
      {/* Channel Header */}
      <div className="bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-full bg-gray-300 overflow-hidden">
              <img
                src="https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg"
                alt="Channel avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">Channel Name</h1>
                <Check className="text-gray-500" />
              </div>
              <div className="text-gray-600 mb-4">
                <p>@channelhandle</p>
                <p>798K subscribers • 243 videos</p>
              </div>
              <div className="flex gap-4">
                <button className="bg-black text-white px-4 py-2 rounded-full font-medium hover:bg-opacity-90">
                  Subscribe
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full">
                  <Bell size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Navigation */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto">
          <nav className="flex gap-8 px-6">
            <button className="py-4 px-2 border-b-2 border-black font-medium">Videos</button>
            <button className="py-4 px-2 text-gray-600 hover:text-black">Playlists</button>
            <button className="py-4 px-2 text-gray-600 hover:text-black">Community</button>
            <button className="py-4 px-2 text-gray-600 hover:text-black">Channels</button>
            <button className="py-4 px-2 text-gray-600 hover:text-black">About</button>
          </nav>
        </div>
      </div>

      {/* Channel Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChannelPage;