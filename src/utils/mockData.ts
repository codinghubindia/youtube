import { YouTubeVideo } from './api';

// Generate random view counts between 10K and 10M
const getRandomViews = () => Math.floor(10000 + Math.random() * 10000000).toString();

// Generate random durations in PT#M#S format
const getRandomDuration = () => {
  const minutes = Math.floor(1 + Math.random() * 15);
  const seconds = Math.floor(Math.random() * 59);
  return `PT${minutes}M${seconds}S`;
};

// Generate a date within the last year
const getRandomDate = () => {
  const now = new Date();
  const pastDate = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
  return pastDate.toISOString();
};

// Mock video data to use when API quota is exceeded
export const mockVideos: YouTubeVideo[] = [
  {
    id: 'mock-video-1',
    snippet: {
      title: 'Building a Modern Web Application with React',
      description: 'Learn how to build a modern web application using React, TypeScript, and modern tooling.',
      thumbnails: {
        default: { url: 'https://placehold.co/120x90/333/fff?text=React+App', width: 120, height: 90 },
        medium: { url: 'https://placehold.co/320x180/333/fff?text=React+App', width: 320, height: 180 },
        high: { url: 'https://placehold.co/480x360/333/fff?text=React+App', width: 480, height: 360 }
      },
      channelTitle: 'CodeMaster',
      channelId: 'mock-channel-1',
      publishedAt: getRandomDate()
    },
    contentDetails: {
      duration: getRandomDuration()
    },
    statistics: {
      viewCount: getRandomViews(),
      likeCount: Math.floor(parseInt(getRandomViews()) / 20).toString(),
      commentCount: Math.floor(parseInt(getRandomViews()) / 100).toString()
    }
  },
  {
    id: 'mock-video-2',
    snippet: {
      title: 'Web Development Crash Course 2023',
      description: 'Complete crash course for web development in 2023 covering HTML, CSS, JavaScript, React, and more.',
      thumbnails: {
        default: { url: 'https://placehold.co/120x90/5333ed/fff?text=Web+Dev+Course', width: 120, height: 90 },
        medium: { url: 'https://placehold.co/320x180/5333ed/fff?text=Web+Dev+Course', width: 320, height: 180 },
        high: { url: 'https://placehold.co/480x360/5333ed/fff?text=Web+Dev+Course', width: 480, height: 360 }
      },
      channelTitle: 'Dev Simplified',
      channelId: 'mock-channel-2',
      publishedAt: getRandomDate()
    },
    contentDetails: {
      duration: getRandomDuration()
    },
    statistics: {
      viewCount: getRandomViews(),
      likeCount: Math.floor(parseInt(getRandomViews()) / 20).toString(),
      commentCount: Math.floor(parseInt(getRandomViews()) / 100).toString()
    }
  },
  {
    id: 'mock-video-3',
    snippet: {
      title: 'Creating a YouTube Clone with React - Full Tutorial',
      description: 'In this comprehensive tutorial, learn how to build a YouTube clone using React, complete with video playback, comments, and more.',
      thumbnails: {
        default: { url: 'https://placehold.co/120x90/c4302b/fff?text=YT+Clone', width: 120, height: 90 },
        medium: { url: 'https://placehold.co/320x180/c4302b/fff?text=YT+Clone', width: 320, height: 180 },
        high: { url: 'https://placehold.co/480x360/c4302b/fff?text=YT+Clone', width: 480, height: 360 }
      },
      channelTitle: 'ReactMasters',
      channelId: 'mock-channel-3',
      publishedAt: getRandomDate()
    },
    contentDetails: {
      duration: getRandomDuration()
    },
    statistics: {
      viewCount: getRandomViews(),
      likeCount: Math.floor(parseInt(getRandomViews()) / 20).toString(),
      commentCount: Math.floor(parseInt(getRandomViews()) / 100).toString()
    }
  },
  {
    id: 'mock-video-4',
    snippet: {
      title: 'Advanced React Hooks - useEffect Deep Dive',
      description: 'Master the useEffect hook in React, dealing with dependencies, cleanup, and common pitfalls.',
      thumbnails: {
        default: { url: 'https://placehold.co/120x90/61dafb/000?text=React+Hooks', width: 120, height: 90 },
        medium: { url: 'https://placehold.co/320x180/61dafb/000?text=React+Hooks', width: 320, height: 180 },
        high: { url: 'https://placehold.co/480x360/61dafb/000?text=React+Hooks', width: 480, height: 360 }
      },
      channelTitle: 'React Experts',
      channelId: 'mock-channel-4',
      publishedAt: getRandomDate()
    },
    contentDetails: {
      duration: getRandomDuration()
    },
    statistics: {
      viewCount: getRandomViews(),
      likeCount: Math.floor(parseInt(getRandomViews()) / 20).toString(),
      commentCount: Math.floor(parseInt(getRandomViews()) / 100).toString()
    }
  },
  {
    id: 'mock-video-5',
    snippet: {
      title: 'CSS Grid and Flexbox Mastery',
      description: 'Learn to create responsive layouts easily with CSS Grid and Flexbox, complete with practical examples.',
      thumbnails: {
        default: { url: 'https://placehold.co/120x90/2965f1/fff?text=CSS+Layout', width: 120, height: 90 },
        medium: { url: 'https://placehold.co/320x180/2965f1/fff?text=CSS+Layout', width: 320, height: 180 },
        high: { url: 'https://placehold.co/480x360/2965f1/fff?text=CSS+Layout', width: 480, height: 360 }
      },
      channelTitle: 'CSS Wizards',
      channelId: 'mock-channel-5',
      publishedAt: getRandomDate()
    },
    contentDetails: {
      duration: getRandomDuration()
    },
    statistics: {
      viewCount: getRandomViews(),
      likeCount: Math.floor(parseInt(getRandomViews()) / 20).toString(),
      commentCount: Math.floor(parseInt(getRandomViews()) / 100).toString()
    }
  },
  {
    id: 'mock-video-6',
    snippet: {
      title: 'TypeScript for Beginners - Full Course',
      description: 'Start your TypeScript journey with this beginner-friendly course covering all the basics you need to know.',
      thumbnails: {
        default: { url: 'https://placehold.co/120x90/007acc/fff?text=TypeScript', width: 120, height: 90 },
        medium: { url: 'https://placehold.co/320x180/007acc/fff?text=TypeScript', width: 320, height: 180 },
        high: { url: 'https://placehold.co/480x360/007acc/fff?text=TypeScript', width: 480, height: 360 }
      },
      channelTitle: 'TypeScript Tutors',
      channelId: 'mock-channel-6',
      publishedAt: getRandomDate()
    },
    contentDetails: {
      duration: getRandomDuration()
    },
    statistics: {
      viewCount: getRandomViews(),
      likeCount: Math.floor(parseInt(getRandomViews()) / 20).toString(),
      commentCount: Math.floor(parseInt(getRandomViews()) / 100).toString()
    }
  },
  {
    id: 'mock-video-7',
    snippet: {
      title: 'Modern JavaScript: ES6 and Beyond',
      description: 'Explore modern JavaScript features from ES6 and beyond, including arrow functions, destructuring, async/await, and more.',
      thumbnails: {
        default: { url: 'https://placehold.co/120x90/f0db4f/000?text=Modern+JS', width: 120, height: 90 },
        medium: { url: 'https://placehold.co/320x180/f0db4f/000?text=Modern+JS', width: 320, height: 180 },
        high: { url: 'https://placehold.co/480x360/f0db4f/000?text=Modern+JS', width: 480, height: 360 }
      },
      channelTitle: 'JS Academy',
      channelId: 'mock-channel-7',
      publishedAt: getRandomDate()
    },
    contentDetails: {
      duration: getRandomDuration()
    },
    statistics: {
      viewCount: getRandomViews(),
      likeCount: Math.floor(parseInt(getRandomViews()) / 20).toString(),
      commentCount: Math.floor(parseInt(getRandomViews()) / 100).toString()
    }
  },
  {
    id: 'mock-video-8',
    snippet: {
      title: 'Full Stack Development with MERN Stack',
      description: 'Build full-stack applications with MongoDB, Express, React, and Node.js - the popular MERN stack.',
      thumbnails: {
        default: { url: 'https://placehold.co/120x90/589636/fff?text=MERN+Stack', width: 120, height: 90 },
        medium: { url: 'https://placehold.co/320x180/589636/fff?text=MERN+Stack', width: 320, height: 180 },
        high: { url: 'https://placehold.co/480x360/589636/fff?text=MERN+Stack', width: 480, height: 360 }
      },
      channelTitle: 'Web Dev Pro',
      channelId: 'mock-channel-8',
      publishedAt: getRandomDate()
    },
    contentDetails: {
      duration: getRandomDuration()
    },
    statistics: {
      viewCount: getRandomViews(),
      likeCount: Math.floor(parseInt(getRandomViews()) / 20).toString(),
      commentCount: Math.floor(parseInt(getRandomViews()) / 100).toString()
    }
  },
  {
    id: 'mock-video-9',
    snippet: {
      title: 'Tailwind CSS Crash Course',
      description: 'Learn how to rapidly build modern websites without ever leaving your HTML with Tailwind CSS.',
      thumbnails: {
        default: { url: 'https://placehold.co/120x90/38bdf8/fff?text=Tailwind', width: 120, height: 90 },
        medium: { url: 'https://placehold.co/320x180/38bdf8/fff?text=Tailwind', width: 320, height: 180 },
        high: { url: 'https://placehold.co/480x360/38bdf8/fff?text=Tailwind', width: 480, height: 360 }
      },
      channelTitle: 'CSS Simplified',
      channelId: 'mock-channel-9',
      publishedAt: getRandomDate()
    },
    contentDetails: {
      duration: getRandomDuration()
    },
    statistics: {
      viewCount: getRandomViews(),
      likeCount: Math.floor(parseInt(getRandomViews()) / 20).toString(),
      commentCount: Math.floor(parseInt(getRandomViews()) / 100).toString()
    }
  },
  {
    id: 'mock-video-10',
    snippet: {
      title: 'GitHub Actions for CI/CD Explained',
      description: 'Set up automated CI/CD pipelines using GitHub Actions with practical examples for web developers.',
      thumbnails: {
        default: { url: 'https://placehold.co/120x90/2088ff/fff?text=GitHub+Actions', width: 120, height: 90 },
        medium: { url: 'https://placehold.co/320x180/2088ff/fff?text=GitHub+Actions', width: 320, height: 180 },
        high: { url: 'https://placehold.co/480x360/2088ff/fff?text=GitHub+Actions', width: 480, height: 360 }
      },
      channelTitle: 'DevOps Demystified',
      channelId: 'mock-channel-10',
      publishedAt: getRandomDate()
    },
    contentDetails: {
      duration: getRandomDuration()
    },
    statistics: {
      viewCount: getRandomViews(),
      likeCount: Math.floor(parseInt(getRandomViews()) / 20).toString(),
      commentCount: Math.floor(parseInt(getRandomViews()) / 100).toString()
    }
  },
  {
    id: 'mock-video-11',
    snippet: {
      title: 'Responsive Web Design Fundamentals',
      description: 'Learn the core principles of responsive web design to make your websites look great on any device.',
      thumbnails: {
        default: { url: 'https://placehold.co/120x90/ff6347/fff?text=Responsive', width: 120, height: 90 },
        medium: { url: 'https://placehold.co/320x180/ff6347/fff?text=Responsive', width: 320, height: 180 },
        high: { url: 'https://placehold.co/480x360/ff6347/fff?text=Responsive', width: 480, height: 360 }
      },
      channelTitle: 'Design Masters',
      channelId: 'mock-channel-11',
      publishedAt: getRandomDate()
    },
    contentDetails: {
      duration: getRandomDuration()
    },
    statistics: {
      viewCount: getRandomViews(),
      likeCount: Math.floor(parseInt(getRandomViews()) / 20).toString(),
      commentCount: Math.floor(parseInt(getRandomViews()) / 100).toString()
    }
  },
  {
    id: 'mock-video-12',
    snippet: {
      title: 'State Management in React with Redux Toolkit',
      description: 'Simplify your React state management using Redux Toolkit with practical examples and best practices.',
      thumbnails: {
        default: { url: 'https://placehold.co/120x90/764abc/fff?text=Redux', width: 120, height: 90 },
        medium: { url: 'https://placehold.co/320x180/764abc/fff?text=Redux', width: 320, height: 180 },
        high: { url: 'https://placehold.co/480x360/764abc/fff?text=Redux', width: 480, height: 360 }
      },
      channelTitle: 'React State Pros',
      channelId: 'mock-channel-12',
      publishedAt: getRandomDate()
    },
    contentDetails: {
      duration: getRandomDuration()
    },
    statistics: {
      viewCount: getRandomViews(),
      likeCount: Math.floor(parseInt(getRandomViews()) / 20).toString(),
      commentCount: Math.floor(parseInt(getRandomViews()) / 100).toString()
    }
  }
]; 