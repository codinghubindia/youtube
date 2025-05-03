// Learning Recommendations System
// This utility manages personalized educational video recommendations

import { getVideoDetails, getRelatedVideos, YouTubeVideo } from './api';

// Define interfaces for learning history
interface WatchedVideo {
  videoId: string;
  title: string;
  channelId: string;
  channelTitle: string;
  categories?: string[];
  tags?: string[];
  timestamp: number; // When the video was watched
  watchDuration: number; // Duration watched in seconds
  completionPercentage: number; // 0-100
}

interface LearningProfile {
  interests: Map<string, number>; // Tag/category -> weight
  favoriteTags: string[];
  favoriteCategories: string[];
  watchHistory: WatchedVideo[];
  recommendationHistory: Set<string>; // IDs of videos already recommended
}

// Initialize or load the user's learning profile
export const getLearningProfile = (): LearningProfile => {
  try {
    const savedProfile = localStorage.getItem('learningProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      
      // Convert interests back from object to Map
      const interests = new Map(Object.entries(parsed.interests || {}));
      
      // Convert recommendationHistory back from array to Set
      const recommendationHistory = new Set(parsed.recommendationHistory || []);
      
      return {
        ...parsed,
        interests,
        recommendationHistory,
        watchHistory: parsed.watchHistory || [],
        favoriteTags: parsed.favoriteTags || [],
        favoriteCategories: parsed.favoriteCategories || []
      };
    }
  } catch (error) {
    console.error('Error loading learning profile:', error);
  }
  
  // Default empty profile
  return {
    interests: new Map(),
    favoriteTags: [],
    favoriteCategories: [],
    watchHistory: [],
    recommendationHistory: new Set()
  };
};

// Save learning profile to localStorage
const saveLearningProfile = (profile: LearningProfile): void => {
  try {
    // Convert Map to object for JSON serialization
    const interestsObj = Object.fromEntries(profile.interests);
    
    // Convert Set to array for JSON serialization
    const recommendationHistoryArr = Array.from(profile.recommendationHistory);
    
    localStorage.setItem('learningProfile', JSON.stringify({
      ...profile,
      interests: interestsObj,
      recommendationHistory: recommendationHistoryArr
    }));
  } catch (error) {
    console.error('Error saving learning profile:', error);
  }
};

// Track a watched educational video
export const trackWatchedVideo = async (
  videoId: string, 
  watchDuration: number, 
  completionPercentage: number
): Promise<void> => {
  try {
    const profile = getLearningProfile();
    
    // Check if video details are already in watch history
    const existingEntry = profile.watchHistory.find(v => v.videoId === videoId);
    
    if (existingEntry) {
      // Update existing entry
      existingEntry.watchDuration += watchDuration;
      existingEntry.completionPercentage = Math.max(existingEntry.completionPercentage, completionPercentage);
      existingEntry.timestamp = Date.now();
    } else {
      // Get video details from API
      const videoDetails = await getVideoDetails(videoId);
      
      if (videoDetails && videoDetails.length > 0) {
        const video = videoDetails[0];
        
        // Add new entry to watch history
        profile.watchHistory.push({
          videoId,
          title: video.snippet.title,
          channelId: video.snippet.channelId,
          channelTitle: video.snippet.channelTitle,
          tags: video.snippet.tags,
          timestamp: Date.now(),
          watchDuration,
          completionPercentage
        });
        
        // Update interests based on video tags
        if (video.snippet.tags) {
          video.snippet.tags.forEach(tag => {
            const currentWeight = profile.interests.get(tag) || 0;
            profile.interests.set(tag, currentWeight + 1);
          });
          
          // Update favorite tags
          updateFavorites(profile);
        }
      }
    }
    
    // Keep only the most recent 50 videos in history
    if (profile.watchHistory.length > 50) {
      profile.watchHistory.sort((a, b) => b.timestamp - a.timestamp);
      profile.watchHistory = profile.watchHistory.slice(0, 50);
    }
    
    // Save updated profile
    saveLearningProfile(profile);
  } catch (error) {
    console.error('Error tracking watched video:', error);
  }
};

// Update favorite tags and categories based on watch history
const updateFavorites = (profile: LearningProfile): void => {
  // Sort interests by weight
  const sortedInterests = [...profile.interests.entries()]
    .sort((a, b) => b[1] - a[1]);
  
  // Update favorite tags (top 10)
  profile.favoriteTags = sortedInterests
    .slice(0, 10)
    .map(([tag]) => tag);
};

// Get personalized educational video recommendations
export const getPersonalizedRecommendations = async (
  limit: number = 10
): Promise<YouTubeVideo[]> => {
  try {
    const profile = getLearningProfile();
    
    if (profile.watchHistory.length === 0) {
      return []; // No watch history yet
    }
    
    // Strategy 1: Get recommendations based on most recently watched video
    const mostRecentVideo = profile.watchHistory
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    // Get related videos to the most recent watch
    const relatedVideos = await getRelatedVideos(mostRecentVideo.videoId, 20);
    
    // Filter out videos that are already in watch history or recommendation history
    let filteredVideos = relatedVideos.filter(video => 
      !profile.watchHistory.some(w => w.videoId === video.id) &&
      !profile.recommendationHistory.has(video.id)
    );
    
    // Score videos based on matching tags with user interests
    const scoredVideos = filteredVideos.map(video => {
      let score = 0;
      
      // Score based on matching tags with interests
      if (video.snippet.tags) {
        video.snippet.tags.forEach(tag => {
          if (profile.interests.has(tag)) {
            score += profile.interests.get(tag) || 0;
          }
          
          // Bonus for favorite tags
          if (profile.favoriteTags.includes(tag)) {
            score += 5;
          }
        });
      }
      
      // Bonus for educational content
      if (video.isEducational) {
        score += 10;
      }
      
      return { video, score };
    });
    
    // Sort by score (descending) and take top results
    const recommendations = scoredVideos
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.video);
    
    // Add these videos to recommendation history
    recommendations.forEach(video => {
      profile.recommendationHistory.add(video.id);
    });
    
    // Keep recommendation history at a reasonable size
    if (profile.recommendationHistory.size > 200) {
      profile.recommendationHistory = new Set(
        Array.from(profile.recommendationHistory).slice(-200)
      );
    }
    
    saveLearningProfile(profile);
    return recommendations;
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return [];
  }
};

// Clear learning profile and history
export const clearLearningProfile = (): void => {
  localStorage.removeItem('learningProfile');
};

// Check if a video is in the user's watch history
export const isVideoInWatchHistory = (videoId: string): boolean => {
  const profile = getLearningProfile();
  return profile.watchHistory.some(v => v.videoId === videoId);
};

// Get the completion percentage for a video if it's in watch history
export const getVideoWatchProgress = (videoId: string): number => {
  const profile = getLearningProfile();
  const videoEntry = profile.watchHistory.find(v => v.videoId === videoId);
  return videoEntry ? videoEntry.completionPercentage : 0;
}; 