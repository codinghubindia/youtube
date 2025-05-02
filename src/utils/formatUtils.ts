export const formatViews = (views: number | string): string => {
  const viewCount = typeof views === 'string' ? parseInt(views) : views;
  
  if (viewCount >= 1000000000) {
    return `${(viewCount / 1000000000).toFixed(1)}B views`;
  } else if (viewCount >= 1000000) {
    return `${(viewCount / 1000000).toFixed(1)}M views`;
  } else if (viewCount >= 1000) {
    return `${(viewCount / 1000).toFixed(1)}K views`;
  } else {
    return `${viewCount} views`;
  }
};

export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? '1 year ago' : `${interval} years ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? '1 month ago' : `${interval} months ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? '1 day ago' : `${interval} days ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
  }
  
  return 'Just now';
};

export const formatDuration = (isoDuration: string): string => {
  // ISO 8601 duration format: PT1H23M45S (1 hour, 23 minutes, 45 seconds)
  if (!isoDuration) return '';
  
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  if (!match) return '';
  
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};

export const formatSubscribers = (count: string | number): string => {
  const subscriberCount = typeof count === 'string' ? parseInt(count) : count;
  
  if (subscriberCount >= 1000000) {
    return `${(subscriberCount / 1000000).toFixed(1)}M subscribers`;
  } else if (subscriberCount >= 1000) {
    return `${(subscriberCount / 1000).toFixed(1)}K subscribers`;
  } else {
    return `${subscriberCount} subscribers`;
  }
};

// Legacy function maintained for compatibility
export const formatTimestamp = (timestamp: string): string => {
  return formatTimeAgo(timestamp);
};