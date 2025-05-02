import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { Check, ThumbsUp, ThumbsDown, Share, Download, Flag, MoreHorizontal, Loader2, Minimize2 } from 'lucide-react';
import { formatViews, formatTimeAgo, formatDuration, formatSubscribers } from '../utils/formatUtils';
import { getVideoDetails, getRelatedVideos, getChannelDetails, getVideoComments, YouTubeVideo, YouTubeChannel, YouTubeComment } from '../utils/api';
import { useYouTube } from '../context/YouTubeContext';

const WatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<YouTubeVideo | null>(null);
  const [channel, setChannel] = useState<YouTubeChannel | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<YouTubeVideo[]>([]);
  const [comments, setComments] = useState<YouTubeComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showMiniPlayer } = useYouTube();
  const navigate = useNavigate();
  const videoPlayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchVideoData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch video details
        const videoData = await getVideoDetails(id);
        if (videoData && videoData.length > 0) {
          setVideo(videoData[0]);
          
          // Fetch channel details
          const channelId = videoData[0].snippet.channelId;
          const channelData = await getChannelDetails(channelId);
          setChannel(channelData);
          
          // Fetch related videos
          const relatedVideosData = await getRelatedVideos(id);
          setRelatedVideos(relatedVideosData);
          
          // Fetch comments
          const commentsData = await getVideoComments(id);
          setComments(commentsData);
        } else {
          setError('Video not found');
        }
      } catch (err) {
        console.error('Error fetching video data:', err);
        setError('Failed to load video data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    // Scroll to top when video changes
    window.scrollTo(0, 0);
    fetchVideoData();
  }, [id]);

  // Handle minimize to mini player
  const handleMinimize = () => {
    if (video) {
      showMiniPlayer(
        video.id,
        video.snippet.title,
        video.snippet.channelTitle,
        video.snippet.thumbnails.high.url
      );
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error || 'Video not found'}</p>
      </div>
    );
  }

  return (
    <div className="pt-4 pb-16 px-4 lg:flex gap-6 dark:bg-[#0f0f0f]">
      <div className="lg:flex-grow lg:max-w-[70%]">
        {/* Video player */}
        <div ref={videoPlayerRef} className="relative w-full aspect-video bg-black mb-3 rounded-xl overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${id}?autoplay=1`}
            title={video.snippet.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
          
          {/* Minimize button */}
          <button 
            onClick={handleMinimize}
            className="absolute top-3 right-3 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
          >
            <Minimize2 size={20} />
          </button>
        </div>

        {/* Video info */}
        <div className="mb-4">
          <h1 className="text-xl font-medium mb-2 dark:text-white">{video.snippet.title}</h1>
          
          <div className="flex flex-wrap justify-between items-center mb-3">
            <div className="flex items-center">
              <img
                src={channel?.snippet.thumbnails.default.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(video.snippet.channelTitle)}`}
                alt={video.snippet.channelTitle}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <div className="flex items-center">
                  <span className="font-medium dark:text-white">{video.snippet.channelTitle}</span>
                  <Check size={16} className="ml-1 text-gray-500" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {channel?.statistics?.subscriberCount && formatSubscribers(channel.statistics.subscriberCount)}
                </span>
              </div>
              <button className="ml-4 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-opacity-90">
                Subscribe
              </button>
            </div>
            
            <div className="flex items-center mt-3 sm:mt-0">
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full mr-2">
                <button className="flex items-center px-4 py-2 rounded-l-full hover:bg-gray-200 dark:hover:bg-gray-700">
                  <ThumbsUp size={18} className="dark:text-white" />
                  <span className="ml-2 text-sm dark:text-white">{video.statistics?.likeCount ? parseInt(video.statistics.likeCount).toLocaleString() : '0'}</span>
                </button>
                <div className="w-px bg-gray-300 dark:bg-gray-600 my-2"></div>
                <button className="flex items-center px-4 py-2 rounded-r-full hover:bg-gray-200 dark:hover:bg-gray-700">
                  <ThumbsDown size={18} className="dark:text-white" />
                </button>
              </div>
              
              <button className="flex items-center bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full mr-2 hover:bg-gray-200 dark:hover:bg-gray-700">
                <Share size={18} className="dark:text-white" />
                <span className="ml-2 text-sm hidden sm:inline dark:text-white">Share</span>
              </button>
              
              <button className="flex items-center bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full mr-2 hover:bg-gray-200 dark:hover:bg-gray-700">
                <Download size={18} className="dark:text-white" />
                <span className="ml-2 text-sm hidden sm:inline dark:text-white">Download</span>
              </button>
              
              <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <MoreHorizontal size={18} className="dark:text-white" />
              </button>
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl">
            <div className="flex text-sm mb-1">
              <span className="font-medium mr-2 dark:text-white">
                {formatViews(video.statistics?.viewCount || '0')}
              </span>
              <span className="dark:text-gray-400">{formatTimeAgo(video.snippet.publishedAt)}</span>
            </div>
            <p className="text-sm dark:text-white whitespace-pre-line">
              {video.snippet.description?.slice(0, 300) + (video.snippet.description?.length > 300 ? '...' : '')}
            </p>
          </div>
        </div>
        
        {/* Comments section */}
        <div className="mt-6">
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-medium mr-2 dark:text-white">Comments</h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {video.statistics?.commentCount ? parseInt(video.statistics.commentCount).toLocaleString() : '0'}
            </span>
          </div>
          
          <div className="flex mb-4">
            <img
              src="https://ui-avatars.com/api/?name=You&background=random"
              alt="User"
              className="w-10 h-10 rounded-full mr-3"
            />
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Add a comment..."
                className="w-full p-2 border-b border-gray-200 dark:border-gray-700 dark:bg-transparent dark:text-white focus:border-black dark:focus:border-white focus:outline-none"
              />
            </div>
          </div>
          
          {/* Comments */}
          {comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} className="flex mb-4">
                <img
                  src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl}
                  alt={comment.snippet.topLevelComment.snippet.authorDisplayName}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-sm dark:text-white">
                      {comment.snippet.topLevelComment.snippet.authorDisplayName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {formatTimeAgo(comment.snippet.topLevelComment.snippet.publishedAt)}
                    </span>
                  </div>
                  <p 
                    className="text-sm mt-1 dark:text-white"
                    dangerouslySetInnerHTML={{ 
                      __html: comment.snippet.topLevelComment.snippet.textDisplay 
                    }}
                  ></p>
                  <div className="flex items-center mt-1">
                    <button className="flex items-center mr-4">
                      <ThumbsUp size={14} className="dark:text-white" />
                      <span className="ml-1 text-xs dark:text-white">
                        {comment.snippet.topLevelComment.snippet.likeCount}
                      </span>
                    </button>
                    <button className="mr-4">
                      <ThumbsDown size={14} className="dark:text-white" />
                    </button>
                    <button className="text-xs font-medium dark:text-white">Reply</button>
                  </div>
                  {comment.snippet.totalReplyCount > 0 && (
                    <button className="text-xs text-blue-600 mt-2 font-medium">
                      View {comment.snippet.totalReplyCount} {comment.snippet.totalReplyCount === 1 ? 'reply' : 'replies'}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No comments yet</p>
          )}
        </div>
      </div>
      
      {/* Related videos */}
      <div className="lg:w-[350px] mt-6 lg:mt-0">
        <h2 className="text-lg font-medium mb-3 hidden lg:block dark:text-white">Related videos</h2>
        <div className="flex flex-col">
          {relatedVideos.map(relatedVideo => (
            <VideoCard 
              key={relatedVideo.id} 
              video={{
                id: relatedVideo.id,
                title: relatedVideo.snippet.title,
                thumbnailUrl: relatedVideo.snippet.thumbnails.high.url,
                channel: {
                  name: relatedVideo.snippet.channelTitle,
                  avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(relatedVideo.snippet.channelTitle)}&background=random`,
                  verified: true
                },
                views: parseInt(relatedVideo.statistics?.viewCount || '0'),
                timestamp: relatedVideo.snippet.publishedAt,
                duration: formatDuration(relatedVideo.contentDetails?.duration || '')
              }}
              layout="row" 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WatchPage;