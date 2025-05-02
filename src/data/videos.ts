export interface VideoType {
  id: string;
  title: string;
  thumbnailUrl: string;
  channel: {
    name: string;
    avatarUrl: string;
    verified: boolean;
  };
  views: number;
  timestamp: string;
  duration: string;
}

export const videos: VideoType[] = [
  {
    id: "1",
    title: "Building a YouTube Clone with React & Tailwind CSS",
    thumbnailUrl: "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    channel: {
      name: "WebDev Mastery",
      avatarUrl: "https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      verified: true
    },
    views: 345982,
    timestamp: "3 weeks ago",
    duration: "14:25"
  },
  {
    id: "2",
    title: "Learn Typescript in 2 Hours - Complete Beginner's Guide",
    thumbnailUrl: "https://images.pexels.com/photos/92904/pexels-photo-92904.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    channel: {
      name: "TypeScript Pro",
      avatarUrl: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      verified: true
    },
    views: 789521,
    timestamp: "5 days ago",
    duration: "2:12:40"
  },
  {
    id: "3",
    title: "10 Stunning CSS Animation Examples You Must Try",
    thumbnailUrl: "https://images.pexels.com/photos/5926389/pexels-photo-5926389.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    channel: {
      name: "CSS Wizardry",
      avatarUrl: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      verified: false
    },
    views: 129934,
    timestamp: "2 months ago",
    duration: "8:45"
  },
  {
    id: "4",
    title: "Modern JavaScript: From Zero to Hero",
    thumbnailUrl: "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    channel: {
      name: "JS Mastery",
      avatarUrl: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      verified: true
    },
    views: 562147,
    timestamp: "1 year ago",
    duration: "1:27:13"
  },
  {
    id: "5",
    title: "Tailwind CSS: Build Beautiful Interfaces Faster",
    thumbnailUrl: "https://images.pexels.com/photos/5483077/pexels-photo-5483077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    channel: {
      name: "Tailwind Fanatic",
      avatarUrl: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      verified: false
    },
    views: 234897,
    timestamp: "7 months ago",
    duration: "22:48"
  },
  {
    id: "6",
    title: "React Hooks Explained: useEffect, useState, and More",
    thumbnailUrl: "https://images.pexels.com/photos/4974915/pexels-photo-4974915.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    channel: {
      name: "React Essentials",
      avatarUrl: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      verified: true
    },
    views: 821536,
    timestamp: "3 months ago",
    duration: "31:05"
  },
  {
    id: "7",
    title: "Build a Responsive Portfolio Website | Step by Step Guide",
    thumbnailUrl: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    channel: {
      name: "Portfolio Pros",
      avatarUrl: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      verified: false
    },
    views: 152398,
    timestamp: "4 weeks ago",
    duration: "45:22"
  },
  {
    id: "8",
    title: "Full Stack Development Roadmap 2025",
    thumbnailUrl: "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    channel: {
      name: "Tech Career Guide",
      avatarUrl: "https://images.pexels.com/photos/937481/pexels-photo-937481.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      verified: true
    },
    views: 987645,
    timestamp: "2 weeks ago",
    duration: "18:32"
  }
];

export const getRelatedVideos = (videoId: string): VideoType[] => {
  // Exclude the current video and return others as "related"
  return videos.filter(video => video.id !== videoId);
};

export const getVideoById = (videoId: string): VideoType | undefined => {
  return videos.find(video => video.id === videoId);
};