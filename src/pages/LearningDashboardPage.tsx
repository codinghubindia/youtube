import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, BookOpen, Clock, Award, ChevronRight, Trash2, BarChart2, AlertTriangle } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import { convertToVideoType } from '../utils/formatUtils';
import { 
  getLearningProfile, 
  getPersonalizedRecommendations, 
  clearLearningProfile,
  isVideoInWatchHistory,
  getVideoWatchProgress
} from '../utils/learningRecommendations';
import { useLearningMode } from '../context/LearningModeContext';
import { YouTubeVideo } from '../utils/api';
import { isGeminiConfigured } from '../utils/gemini';

const LearningDashboardPage: React.FC = () => {
  const { learningMode, toggleLearningMode } = useLearningMode();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'recommendations'>('overview');
  const [recommendations, setRecommendations] = useState<YouTubeVideo[]>([]);
  const [watchHistory, setWatchHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiConfigured, setApiConfigured] = useState(isGeminiConfigured());
  const [stats, setStats] = useState({
    totalVideosWatched: 0,
    totalMinutesLearned: 0,
    completedVideos: 0,
    topTags: [] as string[]
  });

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Function to load all dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true);
    
    try {
      // Get user's learning profile
      const profile = getLearningProfile();
      
      // Set watch history
      const sortedHistory = [...profile.watchHistory].sort((a, b) => b.timestamp - a.timestamp);
      setWatchHistory(sortedHistory);
      
      // Calculate stats
      const totalVideos = profile.watchHistory.length;
      const totalMinutes = Math.round(
        profile.watchHistory.reduce((total, video) => total + (video.watchDuration / 60), 0)
      );
      const completedVideos = profile.watchHistory.filter(v => v.completionPercentage >= 90).length;
      
      setStats({
        totalVideosWatched: totalVideos,
        totalMinutesLearned: totalMinutes,
        completedVideos: completedVideos,
        topTags: profile.favoriteTags.slice(0, 5)
      });
      
      // Get personalized recommendations
      const recs = await getPersonalizedRecommendations(8);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clearing learning history
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your entire learning history? This action cannot be undone.')) {
      clearLearningProfile();
      loadDashboardData();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-learning-primary to-learning-secondary dark:from-learning-highlight dark:to-learning-accent rounded-xl p-6 mb-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Brain size={32} className="mr-3 animate-pulse" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Learning Dashboard</h1>
                {!apiConfigured && (
                  <div className="flex items-center mt-1 text-yellow-200 text-sm">
                    <AlertTriangle size={14} className="mr-1" />
                    <span>API not configured - <Link to="/docs/API_SETUP.md" className="underline hover:text-white">Setup Guide</Link></span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <button
                onClick={toggleLearningMode}
                className={`flex items-center justify-center py-2 px-4 rounded-full transition-all duration-200 ${
                  learningMode 
                    ? 'bg-white text-learning-primary' 
                    : 'bg-opacity-20 bg-white text-white hover:bg-opacity-30'
                }`}
              >
                {learningMode ? 'Learning Mode Active' : 'Enable Learning Mode'}
              </button>
              
              <button
                onClick={handleClearHistory}
                className="flex items-center justify-center py-2 px-4 rounded-full bg-opacity-20 bg-white text-white hover:bg-opacity-30 transition-all duration-200"
              >
                <Trash2 size={16} className="mr-2" />
                Clear History
              </button>
            </div>
          </div>
        </div>
        
        {!apiConfigured && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6 text-yellow-800 dark:text-yellow-300">
            <div className="flex items-start">
              <AlertTriangle className="mt-1 mr-3 h-5 w-5 flex-shrink-0" />
              <div>
                <h3 className="font-medium">API Configuration Required</h3>
                <p className="mt-1">
                  To use the full learning features, you need to configure your Gemini API key. 
                  The AI features such as summaries, notes, and chat won't work until this is set up.
                </p>
                <div className="mt-2">
                  <Link 
                    to="/docs/API_SETUP.md" 
                    className="inline-flex items-center px-3 py-1.5 bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200 rounded-md font-medium text-sm hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors"
                  >
                    View Setup Guide
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
              <BookOpen className="text-blue-500 dark:text-blue-300" size={24} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Videos Watched</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalVideosWatched}</h3>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
              <Clock className="text-green-500 dark:text-green-300" size={24} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Minutes Learned</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalMinutesLearned}</h3>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 mr-4">
              <Award className="text-purple-500 dark:text-purple-300" size={24} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Completed Videos</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.completedVideos}</h3>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900 mr-4">
              <BarChart2 className="text-orange-500 dark:text-orange-300" size={24} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Completion Rate</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats.totalVideosWatched > 0 
                  ? Math.round((stats.completedVideos / stats.totalVideosWatched) * 100) 
                  : 0}%
              </h3>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-6 font-medium text-sm flex items-center space-x-2 
              ${activeTab === 'overview' 
                ? 'text-learning-primary border-b-2 border-learning-primary dark:text-learning-accent dark:border-learning-accent' 
                : 'text-gray-500 hover:text-learning-primary dark:text-gray-400 dark:hover:text-learning-accent'}`}
          >
            <Brain size={18} />
            <span>Overview</span>
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-6 font-medium text-sm flex items-center space-x-2 
              ${activeTab === 'history' 
                ? 'text-learning-primary border-b-2 border-learning-primary dark:text-learning-accent dark:border-learning-accent' 
                : 'text-gray-500 hover:text-learning-primary dark:text-gray-400 dark:hover:text-learning-accent'}`}
          >
            <Clock size={18} />
            <span>Watch History</span>
          </button>
          
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-3 px-6 font-medium text-sm flex items-center space-x-2 
              ${activeTab === 'recommendations' 
                ? 'text-learning-primary border-b-2 border-learning-primary dark:text-learning-accent dark:border-learning-accent' 
                : 'text-gray-500 hover:text-learning-primary dark:text-gray-400 dark:hover:text-learning-accent'}`}
          >
            <BookOpen size={18} />
            <span>Recommendations</span>
          </button>
        </div>
        
        {/* Content based on active tab */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-learning-primary"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                {/* Learning progress */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Your Learning Progress</h2>
                  
                  {stats.totalVideosWatched > 0 ? (
                    <div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Top Interests</h3>
                        <div className="flex flex-wrap gap-2">
                          {stats.topTags.length > 0 ? (
                            stats.topTags.map((tag, index) => (
                              <span 
                                key={index} 
                                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400">No interests identified yet</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Recent activity */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-lg font-medium text-gray-800 dark:text-white">Recent Activity</h3>
                          <button 
                            onClick={() => setActiveTab('history')}
                            className="text-sm text-learning-primary dark:text-learning-accent flex items-center"
                          >
                            View all <ChevronRight size={16} />
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          {watchHistory.slice(0, 3).map((video) => (
                            <Link 
                              key={video.videoId} 
                              to={`/watch/${video.videoId}`}
                              className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <div className="flex-shrink-0 w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden mr-3">
                                <img 
                                  src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`} 
                                  alt={video.title} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-800 dark:text-white line-clamp-2 mb-1">{video.title}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{video.channelTitle}</p>
                                <div className="mt-1 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-learning-primary dark:bg-learning-accent rounded-full"
                                    style={{ width: `${video.completionPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                      <Brain size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No Learning Activity Yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Start watching educational videos with Learning Mode enabled to track your progress
                      </p>
                      <Link 
                        to="/"
                        className="inline-block py-2 px-4 bg-learning-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                      >
                        Discover Videos
                      </Link>
                    </div>
                  )}
                </div>
                
                {/* Personalized recommendations */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recommended For You</h2>
                    <button 
                      onClick={() => setActiveTab('recommendations')}
                      className="text-sm text-learning-primary dark:text-learning-accent flex items-center"
                    >
                      View all <ChevronRight size={16} />
                    </button>
                  </div>
                  
                  {recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {recommendations.slice(0, 4).map((video) => (
                        <VideoCard 
                          key={video.id} 
                          video={convertToVideoType(video)} 
                          layout="grid"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        Watch more educational videos to get personalized recommendations
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Your Learning History</h2>
                
                {watchHistory.length > 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {watchHistory.map((video) => (
                        <Link 
                          key={video.videoId} 
                          to={`/watch/${video.videoId}`}
                          className="flex items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex-shrink-0 w-40 h-24 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden mr-4">
                            <img 
                              src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`} 
                              alt={video.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-medium text-gray-800 dark:text-white mb-1">{video.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{video.channelTitle}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              Watched {new Date(video.timestamp).toLocaleDateString()} • 
                              {video.watchDuration > 60 
                                ? ` ${Math.floor(video.watchDuration / 60)} min ${video.watchDuration % 60} sec`
                                : ` ${video.watchDuration} sec`
                              }
                            </p>
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-learning-primary dark:bg-learning-accent h-2 rounded-full" 
                                  style={{ width: `${video.completionPercentage}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 w-10">
                                {video.completionPercentage}%
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                    <Clock size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No Watch History</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Your learning history will appear here once you start watching videos with Learning Mode enabled
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Recommendations Tab */}
            {activeTab === 'recommendations' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recommended For You</h2>
                
                {recommendations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {recommendations.map((video) => (
                      <VideoCard 
                        key={video.id} 
                        video={convertToVideoType(video)} 
                        layout="grid"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                    <BookOpen size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No Recommendations Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Watch more educational videos to get personalized recommendations based on your interests
                    </p>
                    <Link 
                      to="/"
                      className="inline-block py-2 px-4 bg-learning-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                    >
                      Browse Videos
                    </Link>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LearningDashboardPage; 