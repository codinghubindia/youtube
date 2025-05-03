import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Share, 
  Download, 
  Loader2, 
  CheckCircle,
  Brain,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { formatViews, formatTimeAgo, formatSubscribers, convertToVideoType } from '../utils/formatUtils';
import { getVideoDetails, getRelatedVideos, getChannelDetails, getVideoComments, YouTubeVideo, YouTubeChannel, YouTubeComment } from '../utils/api';
import { useLearningMode } from '../context/LearningModeContext';
import LearningSidebar from '../components/LearningSidebar';
import { VideoType } from '../data/videos';
import { trackWatchedVideo, getPersonalizedRecommendations } from '../utils/learningRecommendations';

const WatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<YouTubeVideo | null>(null);
  const [channel, setChannel] = useState<YouTubeChannel | null>(null);
  const [convertedRelatedVideos, setConvertedRelatedVideos] = useState<VideoType[]>([]);
  const [comments, setComments] = useState<YouTubeComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { learningMode, toggleLearningMode } = useLearningMode();
  const videoPlayerRef = useRef<HTMLDivElement>(null);
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth >= 1024);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);
  const [watchDuration, setWatchDuration] = useState(0);
  const [watchProgressInterval, setWatchProgressInterval] = useState<number | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [chatMaximized, setChatMaximized] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const wideScreen = window.innerWidth >= 1024;
      const mobileView = window.innerWidth < 768;
      
      setIsWideScreen(wideScreen);
      setIsMobileView(mobileView);
      
      // Auto-show sidebar on desktop if in learning mode
      if (learningMode && !mobileView) {
        setIsSidebarVisible(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [learningMode]);

  // Show sidebar when toggling to learning mode
  useEffect(() => {
    if (learningMode) {
      setIsSidebarVisible(true);
      // Start tracking watch time when learning mode is enabled
      startWatchTimeTracking();
    } else {
      // Stop tracking if learning mode is disabled
      stopWatchTimeTracking();
    }
    // Get learning-based recommendations if learning mode is active
    if (learningMode && video) {
      fetchLearningRecommendations();
    }
  }, [learningMode, video]);

  // Track watch time
  const startWatchTimeTracking = () => {
    if (!watchStartTime) {
      setWatchStartTime(Date.now());
    }
    
    // Clear any existing interval
    if (watchProgressInterval) {
      window.clearInterval(watchProgressInterval);
    }
    
    // Set new interval to update watch duration every 30 seconds
    const intervalId = window.setInterval(() => {
      if (watchStartTime) {
        const newDuration = Math.floor((Date.now() - watchStartTime) / 1000);
        setWatchDuration(newDuration);
        
        // Save progress periodically (every 30 seconds)
        saveWatchProgress(newDuration);
      }
    }, 30000);
    
    setWatchProgressInterval(intervalId);
  };
  
  // Stop tracking watch time
  const stopWatchTimeTracking = () => {
    if (watchProgressInterval) {
      window.clearInterval(watchProgressInterval);
      setWatchProgressInterval(null);
    }
    
    // Save final progress
    if (watchStartTime) {
      const finalDuration = Math.floor((Date.now() - watchStartTime) / 1000);
      saveWatchProgress(finalDuration);
      setWatchStartTime(null);
      setWatchDuration(0);
    }
  };
  
  // Save watch progress to user's learning profile
  const saveWatchProgress = async (duration: number) => {
    if (!id || !video) return;
    
    // Calculate estimated completion percentage based on video duration if available
    let completionPercentage = 0;
    if (video.contentDetails?.duration) {
      const totalDuration = convertISO8601ToSeconds(video.contentDetails.duration);
      completionPercentage = Math.min(Math.round((duration / totalDuration) * 100), 100);
    } else {
      // Estimate based on typical video length (8 minutes)
      completionPercentage = Math.min(Math.round((duration / 480) * 100), 100);
    }
    
    // Track the watched video
    await trackWatchedVideo(id, duration, completionPercentage);
  };
  
  // Convert ISO 8601 duration to seconds
  const convertISO8601ToSeconds = (duration: string): number => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    
    if (match) {
      if (match[1]) hours = parseInt(match[1].replace('H', ''));
      if (match[2]) minutes = parseInt(match[2].replace('M', ''));
      if (match[3]) seconds = parseInt(match[3].replace('S', ''));
    }
    
    return hours * 3600 + minutes * 60 + seconds;
  };
  
  // Fetch learning-based recommendations
  const fetchLearningRecommendations = async () => {
    try {
      await getPersonalizedRecommendations(8);
      // We're calling this function but not using the results anymore
    } catch (error) {
      console.error('Error fetching learning recommendations:', error);
    }
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (watchProgressInterval) {
        window.clearInterval(watchProgressInterval);
      }
      
      // Save final progress on unmount
      if (watchStartTime) {
        const finalDuration = Math.floor((Date.now() - watchStartTime) / 1000);
        saveWatchProgress(finalDuration);
      }
    };
  }, [watchProgressInterval, watchStartTime]);

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
          
          // Convert related videos to VideoType format
          const converted = relatedVideosData.map(convertToVideoType);
          setConvertedRelatedVideos(converted);
          
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

  // Toggle learning sidebar
  const toggleLearningSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  // Toggle comment section visibility
  const toggleComments = () => {
    setShowComments(!showComments);
  };

  // Toggle chat window maximize/minimize
  const toggleChatSize = () => {
    setChatMaximized(!chatMaximized);
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

  // Determine if the video has educational content
  const hasEducationalContent = video.snippet.tags && video.snippet.tags.some(tag => 
    ['education', 'tutorial', 'how-to', 'learn', 'course', 'training', 'educational'].includes(tag.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-screen-2xl mx-auto gap-5 p-4 pb-16 relative">
      {/* Main content area */}
      <div className={`flex-1 ${isSidebarVisible && isWideScreen ? 'max-w-[calc(100%-350px)]' : 'w-full'}`}>
        {/* Video player with shadow and rounded corners */}
        <div ref={videoPlayerRef} className="rounded-xl overflow-hidden shadow-lg bg-black">
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${id}?autoplay=1`}
              title={video.snippet.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>

        {/* Video info - redesigned with better spacing and modern look */}
        <div className="mt-4 space-y-4">
          <h1 className="text-xl md:text-2xl font-semibold dark:text-white">{video.snippet.title}</h1>
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Channel info */}
            <div className="flex items-center space-x-2">
              {channel?.snippet?.thumbnails?.default?.url && (
                <img 
                  src={channel.snippet.thumbnails.default.url} 
                  alt={channel.snippet.title}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <div className="flex items-center">
                  <h3 className="font-medium dark:text-white">{channel?.snippet?.title || video.snippet.channelTitle}</h3>
                  {channel?.statistics && (
                    <CheckCircle size={16} className="ml-1 text-gray-500" />
                  )}
                </div>
                {channel?.statistics?.subscriberCount && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatSubscribers(parseInt(channel.statistics.subscriberCount))} subscribers
                  </p>
                )}
              </div>
              <button className="ml-4 bg-black dark:bg-white text-white dark:text-black font-medium rounded-full px-4 py-2 text-sm">
                Subscribe
              </button>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700">
                <ThumbsUp size={18} className="dark:text-white" />
                <span className="text-sm font-medium dark:text-white">
                  {video.statistics && formatViews(parseInt(video.statistics.likeCount || '0'))}
                </span>
              </button>
              
              <button className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700">
                <ThumbsDown size={18} className="dark:text-white" />
              </button>
              
              <button className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700">
                <Share size={18} className="dark:text-white" />
                <span className="text-sm font-medium ml-1 dark:text-white">Share</span>
              </button>
              
              <button className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700">
                <Download size={18} className="dark:text-white" />
                <span className="text-sm font-medium ml-1 dark:text-white">Download</span>
              </button>

              {hasEducationalContent && (
                <button 
                  onClick={toggleLearningMode}
                  className={`flex items-center gap-1 ${learningMode ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800'} rounded-full px-4 py-2 hover:opacity-90`}
                >
                  <Brain size={18} className={learningMode ? 'text-white' : 'dark:text-white'} />
                  <span className={`text-sm font-medium ml-1 ${learningMode ? 'text-white' : 'dark:text-white'}`}>
                    {learningMode ? 'Learning Mode On' : 'Enter Learning Mode'}
                  </span>
                </button>
              )}
            </div>
          </div>
          
          {/* Video details - now in a card with better contrast */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mt-4">
            <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
              <span>
                {video.statistics && formatViews(parseInt(video.statistics.viewCount || '0'))} views
              </span>
              <span>•</span>
              <span>{formatTimeAgo(video.snippet.publishedAt)}</span>
            </div>
            
            <p className="text-sm dark:text-white whitespace-pre-line">
              {video.snippet.description.split('\n').slice(0, 3).join('\n')}
              {video.snippet.description.split('\n').length > 3 && '...'}
            </p>
          </div>
          
          {/* Comment section toggle for mobile */}
          <div className="lg:hidden">
            <button 
              onClick={toggleComments}
              className="w-full flex justify-between items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mt-2"
            >
              <span className="font-medium dark:text-white">
                {video.statistics && parseInt(video.statistics.commentCount || '0')} Comments
              </span>
              {showComments ? <ChevronUp size={20} className="dark:text-white" /> : <ChevronDown size={20} className="dark:text-white" />}
            </button>
            
            {/* Comments displayed below on mobile when expanded */}
            {showComments && (
              <div className="mt-4 space-y-4">
                {comments.slice(0, 5).map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <img 
                      src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl} 
                      alt={comment.snippet.topLevelComment.snippet.authorDisplayName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium dark:text-white">
                          {comment.snippet.topLevelComment.snippet.authorDisplayName}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(comment.snippet.topLevelComment.snippet.publishedAt)}
                        </span>
                      </div>
                      <p className="text-sm mt-1 dark:text-white">
                        {comment.snippet.topLevelComment.snippet.textDisplay}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <button className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <ThumbsUp size={14} />
                          <span className="text-xs">
                            {comment.snippet.topLevelComment.snippet.likeCount}
                          </span>
                        </button>
                        <button className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <ThumbsDown size={14} />
                        </button>
                        <button className="text-xs text-gray-600 dark:text-gray-400">Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right sidebar for related videos */}
      <div className={`w-full lg:w-[350px] lg:flex-shrink-0 space-y-4 ${isMobileView && !showComments ? 'mt-4' : ''}`}>
        {/* Desktop comment section (first 2 comments) */}
        <div className="hidden lg:block bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium dark:text-white">
              {video.statistics && parseInt(video.statistics.commentCount || '0')} Comments
            </h3>
          </div>
          
          <div className="space-y-4">
            {comments.slice(0, 2).map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <img 
                  src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl} 
                  alt={comment.snippet.topLevelComment.snippet.authorDisplayName}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium dark:text-white text-sm">
                      {comment.snippet.topLevelComment.snippet.authorDisplayName}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(comment.snippet.topLevelComment.snippet.publishedAt)}
                    </span>
                  </div>
                  <p className="text-xs mt-1 dark:text-white">
                    {comment.snippet.topLevelComment.snippet.textDisplay.length > 120 
                      ? `${comment.snippet.topLevelComment.snippet.textDisplay.substring(0, 120)}...` 
                      : comment.snippet.topLevelComment.snippet.textDisplay}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Related videos */}
        <div>
          <h3 className="font-medium mb-3 dark:text-white">Related videos</h3>
          <div className="grid gap-4">
            {convertedRelatedVideos.map((relatedVideo) => (
              <VideoCard key={relatedVideo.id} video={relatedVideo} layout="row" />
            ))}
          </div>
        </div>
      </div>

      {/* Learning Mode Sidebar - now in a more modern floating card design */}
      {isSidebarVisible && (
        <div 
          className={`fixed ${isMobileView ? 'bottom-0 left-0 right-0 z-50' : 
            chatMaximized ? 'top-16 right-4 bottom-4 w-[450px] z-40' : 'bottom-4 right-4 w-[350px] h-[450px] z-40'}`}
        >
          <div className={`bg-white dark:bg-gray-900 rounded-t-xl ${!isMobileView && 'rounded-b-xl'} shadow-xl flex flex-col h-full overflow-hidden`}>
            {/* Header with close and maximize buttons */}
            <div className="bg-blue-600 dark:bg-blue-700 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center text-white space-x-2">
                <Brain size={20} />
                <h3 className="font-medium">Learning Assistant</h3>
              </div>
              <div className="flex items-center space-x-2">
                {!isMobileView && (
                  <button onClick={toggleChatSize} className="text-white p-1 rounded hover:bg-blue-700">
                    {chatMaximized ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  </button>
                )}
                <button onClick={toggleLearningSidebar} className="text-white p-1 rounded hover:bg-blue-700">
                  <X size={18} />
                </button>
              </div>
            </div>
            
            {/* Learning sidebar content */}
            <div className="flex-1 overflow-hidden">
              <LearningSidebar 
                videoId={id || ''} 
                videoTitle={video.snippet.title} 
                isVisible={isSidebarVisible}
                onClose={toggleLearningSidebar}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchPage;