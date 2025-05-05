import { YouTubeVideo } from './api';

// Helper function to parse ISO 8601 duration to seconds
export const parseISO8601Duration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  
  return hours * 3600 + minutes * 60 + seconds;
};

// Export all helper functions to avoid linter warnings
export const getRandomViews = () => Math.floor(10000 + Math.random() * 10000000).toString();

export const getRandomDuration = () => {
  const minutes = Math.floor(1 + Math.random() * 15);
  const seconds = Math.floor(Math.random() * 59);
  return `PT${minutes}M${seconds}S`;
};

export const getRandomDate = () => {
  const now = new Date();
  const pastDate = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
  return pastDate.toISOString();
};

// Shuffle function to randomize videos order on refresh
export const shuffleVideos = (array: YouTubeVideo[]): YouTubeVideo[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Filter videos for learning mode
export const getEducationalVideos = (videos: YouTubeVideo[], maxDurationSeconds = 300): YouTubeVideo[] => {
  return videos.filter(video => 
    video.isEducational && 
    video.durationInSeconds && 
    video.durationInSeconds <= maxDurationSeconds
  );
};

// Enhanced educational content detection
export const isEducationalContent = (video: YouTubeVideo): boolean => {
  const educationalKeywords = [
    // Tutorial and Learning Keywords
    'learn', 'tutorial', 'course', 'education', 'educational', 'how to', 
    'guide', 'explained', 'for beginners', 'crash course', 'lesson',
    
    // Programming and Development Keywords
    'programming', 'coding', 'development', 'code', 'developer', 'web dev',
    'javascript', 'python', 'java', 'react', 'node.js', 'angular', 'vue',
    'html', 'css', 'backend', 'frontend', 'full stack', 'api', 'rest',
    
    // Technology Keywords
    'tech', 'software', 'computer science', 'data structure', 'algorithm',
    'database', 'cloud', 'devops', 'machine learning', 'artificial intelligence',
    
    // Project Keywords
    'project', 'build', 'create', 'implement', 'develop', 'setup', 'configure',
    
    // Specific Technologies
    'react.js', 'node.js', 'express.js', 'mongodb', 'sql', 'docker',
    'kubernetes', 'aws', 'azure', 'git', 'github', 'typescript'
  ];

  const nonEducationalKeywords = [
    'gameplay', 'reaction', 'vlog', 'prank', 'funny', 'meme', 'music video',
    'trailer', 'movie', 'entertainment', 'gaming', 'stream', 'live', 'podcast'
  ];

  const title = video.snippet.title.toLowerCase();
  const description = video.snippet.description.toLowerCase();
  const tags = video.snippet.tags?.map(tag => tag.toLowerCase()) || [];
  
  // Check for educational indicators
  const hasEducationalKeyword = educationalKeywords.some(keyword => 
    title.includes(keyword) || description.includes(keyword) || tags.includes(keyword)
  );
  
  // Check for non-educational indicators
  const hasNonEducationalKeyword = nonEducationalKeywords.some(keyword =>
    title.includes(keyword) || description.includes(keyword) || tags.includes(keyword)
  );
  
  // Additional checks for educational content
  const isFromEducationalChannel = [
    'freecodecamp',
    'traversy media',
    'web dev simplified',
    'fireship',
    'academind',
    'net ninja',
    'dev ed',
    'coding train',
    'programming with mosh',
    'kevin powell'
  ].some(channel => video.snippet.channelTitle.toLowerCase().includes(channel));

  const hasTutorialStructure = 
    title.includes('#') || // Part of a series
    title.match(/part\s*\d+/i) || // Part numbering
    title.match(/\d+\s*-/i) || // Numbered series
    description.includes('github.com') || // Has code repository
    description.includes('source code') || // References code
    tags.some(tag => tag.includes('tutorial') || tag.includes('education')); // Educational tags

  // Scoring system for educational content
  let educationalScore = 0;
  if (hasEducationalKeyword) educationalScore += 2;
  if (isFromEducationalChannel) educationalScore += 2;
  if (hasTutorialStructure) educationalScore += 1;
  if (hasNonEducationalKeyword) educationalScore -= 2;

  return educationalScore > 0;
};

// Enhanced video categorization
export interface VideoCategory {
  id: string;
  name: string;
  keywords: string[];
}

export const videoCategories: VideoCategory[] = [
  {
    id: 'web_development',
    name: 'Web Development',
    keywords: ['html', 'css', 'javascript', 'web dev', 'frontend', 'backend', 'react', 'vue', 'angular']
  },
  {
    id: 'programming',
    name: 'Programming',
    keywords: ['python', 'java', 'c++', 'programming', 'coding', 'algorithms', 'data structures']
  },
  {
    id: 'devops',
    name: 'DevOps',
    keywords: ['docker', 'kubernetes', 'aws', 'azure', 'devops', 'ci/cd', 'jenkins']
  },
  {
    id: 'database',
    name: 'Database',
    keywords: ['sql', 'mongodb', 'postgresql', 'mysql', 'database', 'nosql']
  },
  {
    id: 'mobile_dev',
    name: 'Mobile Development',
    keywords: ['android', 'ios', 'react native', 'flutter', 'mobile dev', 'swift']
  }
];

// Get video category
export const getVideoCategory = (video: YouTubeVideo): string => {
  const content = `${video.snippet.title} ${video.snippet.description} ${video.snippet.tags?.join(' ')}`.toLowerCase();
  
  for (const category of videoCategories) {
    if (category.keywords.some(keyword => content.includes(keyword))) {
      return category.name;
    }
  }
  
  return 'General Programming';
};

// Mock video data to use when API quota is exceeded
export const mockVideos: YouTubeVideo[] = [
  // Programming and Development
  {
    id: 'DHjqpvDnNGE',
    snippet: {
      title: 'JavaScript Tutorial for Beginners: Learn JavaScript in 1 Hour',
      description: 'Watch this JavaScript tutorial for beginners to learn JavaScript basics in one hour. 🔥 Want to master JavaScript? Get my complete JavaScript course: https://bit.ly/3VFVf30.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/DHjqpvDnNGE/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/DHjqpvDnNGE/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/DHjqpvDnNGE/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'Programming with Mosh',
      channelId: 'UCWv7vMbMWH4-V0ZXdmDpPBA',
      publishedAt: '2018-12-09T17:00:09Z',
      tags: ['javascript', 'javascript tutorial', 'learn javascript', 'javascript for beginners', 'beginners', 'tutorial', 'programming', 'web development']
    },
    contentDetails: {
      duration: 'PT48M16S'
    },
    statistics: {
      viewCount: '4882313',
      likeCount: '103204',
      commentCount: '4291'
    },
    isEducational: true,
    durationInSeconds: 2896 // 48m 16s
  },
  {
    id: 'w7ejDZ8SWv8',
    snippet: {
      title: 'React JS Crash Course 2023',
      description: 'Get started with React in this crash course. You will learn the fundamentals including components, state, props, hooks, context API, and more.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/w7ejDZ8SWv8/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/w7ejDZ8SWv8/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/w7ejDZ8SWv8/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'Traversy Media',
      channelId: 'UC29ju8bIPH5as8OGnQzwJyA',
      publishedAt: '2023-01-18T19:00:11Z',
      tags: ['react', 'react js', 'react tutorial', 'react crash course', 'javascript', 'web development', 'frontend', 'jsx', 'hooks', 'components']
    },
    contentDetails: {
      duration: 'PT1H48M47S'
    },
    statistics: {
      viewCount: '3257492',
      likeCount: '71324',
      commentCount: '2634'
    },
    isEducational: true,
    durationInSeconds: 6527 // 1h 48m 47s
  },
  {
    id: 'pEbIhUySqbk',
    snippet: {
      title: 'Next.js App Router Full Course | Learn the App Router for Next.js Applications',
      description: 'Get up and running with the latest Next.js App Router features. Perfect for building your own full-stack apps with the latest Next.js features including server components, server actions, and more.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/pEbIhUySqbk/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/pEbIhUySqbk/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/pEbIhUySqbk/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'Jack Herrington',
      channelId: 'UC6vRUjYqDuoMCoyO73krJrQ',
      publishedAt: '2023-09-04T15:00:10Z',
      tags: ['nextjs', 'react', 'app router', 'server components', 'web development', 'javascript', 'typescript', 'tutorial', 'education']
    },
    contentDetails: {
      duration: 'PT1H34M22S'
    },
    statistics: {
      viewCount: '398275',
      likeCount: '12862',
      commentCount: '472'
    },
    isEducational: true,
    durationInSeconds: 5662 // 1h 34m 22s
  },
  {
    id: 'rJesac0_Ftw',
    snippet: {
      title: 'Learn HTML in 12 Minutes',
      description: 'Learn the basics of HTML in just 12 minutes. This is a quick intro to HTML for beginners.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/rJesac0_Ftw/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/rJesac0_Ftw/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/rJesac0_Ftw/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'Jake Wright',
      channelId: 'UCc1Pn7FxieMohCZFPYEbs7w',
      publishedAt: '2011-04-02T06:33:39Z',
      tags: ['html', 'tutorial', 'beginners', 'web development', 'coding', 'education', 'quick', 'introduction', 'learn']
    },
    contentDetails: {
      duration: 'PT12M14S'
    },
    statistics: {
      viewCount: '3482972',
      likeCount: '82937',
      commentCount: '3428'
    },
    isEducational: true,
    durationInSeconds: 734 // 12m 14s
  },
  {
    id: 'QXeEoD0pB3E',
    snippet: {
      title: 'CSS-in-JS — The Future of Styling Components',
      description: 'This talk explores the benefits and downsides of different CSS-in-JS libraries, shares lessons learned building styled-components, and demonstrates how you can make your applications feel more responsive with creative usage of these principles.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/QXeEoD0pB3E/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/QXeEoD0pB3E/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/QXeEoD0pB3E/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'CSSconf',
      channelId: 'UCzoVCacndDCfGDf41P-z0iA',
      publishedAt: '2021-06-01T14:25:15Z',
      tags: ['css', 'javascript', 'css-in-js', 'styled-components', 'web development', 'frontend', 'educational', 'react']
    },
    contentDetails: {
      duration: 'PT25M9S'
    },
    statistics: {
      viewCount: '163948',
      likeCount: '5735',
      commentCount: '306'
    },
    isEducational: true,
    durationInSeconds: 1509 // 25m 9s
  },
  {
    id: 'rfscVS0vtbw',
    snippet: {
      title: 'Learn Python - Full Course for Beginners',
      description: 'This course will give you a full introduction into all of the core concepts in Python. Follow along with the videos and you\'ll be a Python programmer in no time!',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/rfscVS0vtbw/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/rfscVS0vtbw/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/rfscVS0vtbw/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'freeCodeCamp.org',
      channelId: 'UC8butISFwT-Wl7EV0hUK0BQ',
      publishedAt: '2018-07-11T14:00:00Z',
      tags: ['python', 'programming', 'tutorial', 'python tutorial', 'learn python', 'python course', 'python for beginners', 'coding', 'education']
    },
    contentDetails: {
      duration: 'PT4H26M51S'
    },
    statistics: {
      viewCount: '39837465',
      likeCount: '697283',
      commentCount: '27345'
    },
    isEducational: true,
    durationInSeconds: 16011 // 4h 26m 51s
  },
  {
    id: '7CqJlxBYj-M',
    snippet: {
      title: 'Learn Git In 15 Minutes',
      description: 'Git is the industry standard version control system for developers. In this video, I\'ll teach the most used Git commands in 15 minutes.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/7CqJlxBYj-M/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/7CqJlxBYj-M/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/7CqJlxBYj-M/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'Colt Steele',
      channelId: 'UCrqAGUPPMOdo0jfQ6grikZw',
      publishedAt: '2019-08-12T16:02:44Z',
      tags: ['git', 'version control', 'tutorial', 'beginners', 'developer tools', 'coding', 'programming', 'learn', 'github']
    },
    contentDetails: {
      duration: 'PT16M10S'
    },
    statistics: {
      viewCount: '2734542',
      likeCount: '73218',
      commentCount: '3156'
    },
    isEducational: true,
    durationInSeconds: 970 // 16m 10s
  },
  {
    id: 'fis26HvvDII',
    snippet: {
      title: 'Docker Tutorial for Beginners',
      description: 'A complete Docker tutorial for beginners. You\'ll learn what Docker is, why it\'s popular, Docker containers, and how to use Docker commands effectively.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/fis26HvvDII/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/fis26HvvDII/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/fis26HvvDII/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'TechWorld with Nana',
      channelId: 'UCdngmbVKX1Tgre699-XLlUA',
      publishedAt: '2020-10-01T11:47:18Z',
      tags: ['docker', 'containers', 'devops', 'tutorial', 'docker tutorial', 'beginner', 'containerization', 'education', 'development']
    },
    contentDetails: {
      duration: 'PT1H26M47S'
    },
    statistics: {
      viewCount: '1645726',
      likeCount: '37921',
      commentCount: '1837'
    },
    isEducational: true,
    durationInSeconds: 5207 // 1h 26m 47s
  },
  {
    id: 'PkZNo7MFNFg',
    snippet: {
      title: 'Learn JavaScript - Full Course for Beginners',
      description: 'This complete 134-part JavaScript tutorial for beginners will teach you everything you need to know to get started with the JavaScript programming language.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/PkZNo7MFNFg/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/PkZNo7MFNFg/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/PkZNo7MFNFg/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'freeCodeCamp.org',
      channelId: 'UC8butISFwT-Wl7EV0hUK0BQ',
      publishedAt: '2018-12-10T14:15:38Z',
      tags: ['javascript', 'learn javascript', 'javascript full course', 'beginners', 'es6', 'programming', 'web development', 'coding', 'tutorial']
    },
    contentDetails: {
      duration: 'PT3H26M43S'
    },
    statistics: {
      viewCount: '8762519',
      likeCount: '234521',
      commentCount: '12473'
    },
    isEducational: true,
    durationInSeconds: 12403 // 3h 26m 43s
  },
  {
    id: 'tPYj3fFJGjk',
    snippet: {
      title: 'TensorFlow 2.0 Complete Course - Python Neural Networks for Beginners',
      description: 'This TensorFlow course provides a comprehensive introduction to TensorFlow 2.0 and Deep Learning. After finishing this course, you will be able to build Deep Neural Networks for Classification and Regression tasks using TensorFlow and Keras.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/tPYj3fFJGjk/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/tPYj3fFJGjk/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/tPYj3fFJGjk/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'freeCodeCamp.org',
      channelId: 'UC8butISFwT-Wl7EV0hUK0BQ',
      publishedAt: '2019-07-11T15:21:52Z',
      tags: ['tensorflow', 'deep learning', 'neural networks', 'machine learning', 'python', 'data science', 'artificial intelligence', 'programming', 'tutorial', 'education']
    },
    contentDetails: {
      duration: 'PT6H32M32S'
    },
    statistics: {
      viewCount: '1234567',
      likeCount: '28745',
      commentCount: '1523'
    },
    isEducational: true,
    durationInSeconds: 23552 // 6h 32m 32s
  },
  {
    id: '1Rs2ND1ryYc',
    snippet: {
      title: 'CSS Tutorial - Zero to Hero (Complete Course)',
      description: 'Learn CSS in this full course for beginners. CSS, or Cascading Style Sheet, is responsible for the styling and looks of a website.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/1Rs2ND1ryYc/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/1Rs2ND1ryYc/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/1Rs2ND1ryYc/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'freeCodeCamp.org',
      channelId: 'UC8butISFwT-Wl7EV0hUK0BQ',
      publishedAt: '2019-07-05T14:49:33Z',
      tags: ['css', 'css tutorial', 'css course', 'web development', 'html css', 'styling', 'web design', 'frontend', 'education']
    },
    contentDetails: {
      duration: 'PT6H18M37S'
    },
    statistics: {
      viewCount: '2134876',
      likeCount: '54987',
      commentCount: '3278'
    },
    isEducational: true,
    durationInSeconds: 22717 // 6h 18m 37s
  },
  {
    id: 'pQN-pnXPaVg',
    snippet: {
      title: 'HTML Full Course - Build a Website Tutorial',
      description: 'Learn the basics of HTML5 and web development in this awesome course for beginners.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/pQN-pnXPaVg/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/pQN-pnXPaVg/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/pQN-pnXPaVg/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'freeCodeCamp.org',
      channelId: 'UC8butISFwT-Wl7EV0hUK0BQ',
      publishedAt: '2019-03-12T14:00:00Z',
      tags: ['html', 'html5', 'website', 'tutorial', 'build website', 'web development', 'coding', 'beginners', 'education']
    },
    contentDetails: {
      duration: 'PT2H1M32S'
    },
    statistics: {
      viewCount: '5643297',
      likeCount: '146982',
      commentCount: '7856'
    },
    isEducational: true,
    durationInSeconds: 7292 // 2h 1m 32s
  },
  {
    id: 'yRpLlJmRo2w',
    snippet: {
      title: 'CSS Animation Tutorial #1 - Introduction',
      description: 'Learn how to create animations using pure CSS in this tutorial series. This first video introduces the concept of CSS animations.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/yRpLlJmRo2w/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/yRpLlJmRo2w/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/yRpLlJmRo2w/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'The Net Ninja',
      channelId: 'UCW5YeuERMmlnqo4oq8vwUpg',
      publishedAt: '2017-07-31T08:29:56Z',
      tags: ['css', 'animation', 'tutorial', 'web development', 'front-end', 'coding', 'learn', 'education', 'css animations']
    },
    contentDetails: {
      duration: 'PT11M13S'
    },
    statistics: {
      viewCount: '328964',
      likeCount: '5721',
      commentCount: '142'
    },
    isEducational: true,
    durationInSeconds: 673 // 11m 13s
  },
  {
    id: 'jS4aFq5-91M',
    snippet: {
      title: 'JavaScript Programming - Full Course',
      description: 'Learn JavaScript from scratch by solving 50+ interactive coding exercises and building three fun projects.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/jS4aFq5-91M/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/jS4aFq5-91M/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/jS4aFq5-91M/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'freeCodeCamp.org',
      channelId: 'UC8butISFwT-Wl7EV0hUK0BQ',
      publishedAt: '2022-05-17T15:15:28Z',
      tags: ['javascript', 'programming', 'coding', 'course', 'interactive', 'projects', 'beginner', 'web development', 'frontend', 'education']
    },
    contentDetails: {
      duration: 'PT3H35M12S'
    },
    statistics: {
      viewCount: '2183957',
      likeCount: '58624',
      commentCount: '1532'
    },
    isEducational: true,
    durationInSeconds: 12912 // 3h 35m 12s
  },
  {
    id: 'Zftx68K-1D4',
    snippet: {
      title: 'CSS Variables in 100 Seconds',
      description: 'Learn how to use CSS Custom Properties (Variables) in 100 seconds. An introduction to CSS variables, how they work, and why they\'re useful.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/Zftx68K-1D4/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/Zftx68K-1D4/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/Zftx68K-1D4/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'Fireship',
      channelId: 'UCsBjURrPoezykLs9EqgamOA',
      publishedAt: '2020-11-15T15:30:12Z',
      tags: ['css', 'variables', 'custom properties', 'web development', 'tutorial', 'learning', 'education', 'quick']
    },
    contentDetails: {
      duration: 'PT1M51S'
    },
    statistics: {
      viewCount: '187623',
      likeCount: '8932',
      commentCount: '129'
    },
    isEducational: true,
    durationInSeconds: 111 // 1m 51s
  },
  {
    id: 'ysEN5RaKOlA',
    snippet: {
      title: 'Learn JavaScript With This ONE Project!',
      description: 'This project-based JavaScript tutorial will teach you all of the real-world JS skills you need to know to start your programming journey.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/ysEN5RaKOlA/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/ysEN5RaKOlA/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/ysEN5RaKOlA/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'Traversy Media',
      channelId: 'UC29ju8bIPH5as8OGnQzwJyA',
      publishedAt: '2023-01-10T14:00:08Z',
      tags: ['javascript', 'javascript tutorial', 'javascript project', 'learn javascript', 'web development', 'coding', 'programming', 'beginners']
    },
    contentDetails: {
      duration: 'PT2H42M11S'
    },
    statistics: {
      viewCount: '426712',
      likeCount: '15423',
      commentCount: '827'
    },
    isEducational: true,
    durationInSeconds: 9731 // 2h 42m 11s
  },
  {
    id: 'wm5gMKuwSYk',
    snippet: {
      title: 'Learn React With This One Project',
      description: 'Learn React by building one project - a movie database application. This complete guide takes you from setup to deployment covering props, state, hooks, and more.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/wm5gMKuwSYk/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/wm5gMKuwSYk/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/wm5gMKuwSYk/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'Traversy Media',
      channelId: 'UC29ju8bIPH5as8OGnQzwJyA',
      publishedAt: '2022-06-15T17:00:18Z',
      tags: ['react', 'react tutorial', 'react project', 'learn react', 'javascript', 'web development', 'coding', 'programming', 'frontend']
    },
    contentDetails: {
      duration: 'PT2H29M37S'
    },
    statistics: {
      viewCount: '381246',
      likeCount: '12987',
      commentCount: '583'
    },
    isEducational: true,
    durationInSeconds: 8977 // 2h 29m 37s
  },
  {
    id: 'dQw4w9WgXcQ',
    snippet: {
      title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
      description: 'The official music video for "Never Gonna Give You Up" by Rick Astley.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'Rick Astley',
      channelId: 'UCuAXFkgsw1L7xaCfnd5JJOw',
      publishedAt: '2009-10-25T06:57:33Z',
      tags: ['music', 'rick astley', 'pop', '80s', 'official video']
    },
    contentDetails: {
      duration: 'PT3M33S'
    },
    statistics: {
      viewCount: '1318243499',
      likeCount: '15371871',
      commentCount: '1648941'
    },
    isEducational: false,
    durationInSeconds: 213 // 3m 33s
  },
  {
    id: '9bZkp7q19f0',
    snippet: {
      title: 'PSY - GANGNAM STYLE(강남스타일) M/V',
      description: 'PSY - GANGNAM STYLE(강남스타일) M/V. 2012 PSY featuring HYUNA.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/9bZkp7q19f0/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'officialpsy',
      channelId: 'UCrDkAvwZum-UTjHmzDI2iIw',
      publishedAt: '2012-07-15T07:46:32Z',
      tags: ['PSY', 'Gangnam Style', 'Music Video', 'K-pop']
    },
    contentDetails: {
      duration: 'PT4M13S'
    },
    statistics: {
      viewCount: '4829245173',
      likeCount: '24878747',
      commentCount: '5923482'
    },
    isEducational: false,
    durationInSeconds: 253 // 4m 13s
  },
  {
    id: 'hXI8RQYC36Q',
    snippet: {
      title: 'Most Expensive Car in the World - Full Documentary',
      description: 'Explore the world of the most expensive luxury cars, supercars, and hypercars.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/hXI8RQYC36Q/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/hXI8RQYC36Q/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/hXI8RQYC36Q/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'Luxury Life',
      channelId: 'UCdX9GkMQpKMd2iUWfpGXlqg',
      publishedAt: '2021-12-15T15:38:40Z',
      tags: ['luxury cars', 'supercars', 'Bugatti', 'Ferrari', 'Lamborghini', 'expensive cars']
    },
    contentDetails: {
      duration: 'PT28M46S'
    },
    statistics: {
      viewCount: '8237465',
      likeCount: '197283',
      commentCount: '12345'
    },
    isEducational: false,
    durationInSeconds: 1726 // 28m 46s
  },
  {
    id: 'node-express-course',
    snippet: {
      title: 'Node.js and Express.js - Full Course',
      description: 'Learn how to use Node and Express in this comprehensive course. First, you will learn the fundamentals of Node and Express. Then, you will learn to build a complex REST API.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/Oe421EPjeBE/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/Oe421EPjeBE/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/Oe421EPjeBE/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'freeCodeCamp.org',
      channelId: 'UC8butISFwT-Wl7EV0hUK0BQ',
      publishedAt: '2021-04-16T15:56:58Z',
      tags: ['node.js', 'express.js', 'backend', 'web development', 'rest api', 'javascript', 'full course', 'education', 'tutorial']
    },
    contentDetails: {
      duration: 'PT8H30M41S'
    },
    statistics: {
      viewCount: '1900000',
      likeCount: '44876',
      commentCount: '2524'
    },
    isEducational: true,
    durationInSeconds: 30641 // 8h 30m 41s
  },
  {
    id: 'flexbox-tutorial',
    snippet: {
      title: 'Flexbox Tutorial (CSS): Real Layout Examples',
      description: 'In this flexbox tutorial, we\'ll look at more complex, real-world layouts you can create using flexbox.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/K74l26pE4YA/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/K74l26pE4YA/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/K74l26pE4YA/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'Kevin Powell',
      channelId: 'UCJZv4d5rbIKd4QHMPkcABCw',
      publishedAt: '2021-05-06T12:30:15Z',
      tags: ['flexbox', 'css', 'layout', 'web development', 'tutorial', 'css tutorial', 'learn css', 'education', 'css flexbox']
    },
    contentDetails: {
      duration: 'PT14M52S'
    },
    statistics: {
      viewCount: '273900',
      likeCount: '9187',
      commentCount: '256'
    },
    isEducational: true,
    durationInSeconds: 892 // 14m 52s
  },
  {
    id: 'react-todo-list',
    snippet: {
      title: 'Build a Todo List App in React | React Tutorial for Beginners',
      description: 'Learn to build a simple todo list app in React while learning the fundamentals of React hooks like useState and useEffect.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/pCA4qpQDZD8/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/pCA4qpQDZD8/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/pCA4qpQDZD8/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'Web Dev Simplified',
      channelId: 'UCFbNIlppjAuEX4znoulh0Cw',
      publishedAt: '2020-10-15T13:00:16Z',
      tags: ['react', 'todo list', 'hooks', 'useState', 'useEffect', 'web development', 'javascript', 'tutorial', 'project', 'education']
    },
    contentDetails: {
      duration: 'PT20M31S'
    },
    statistics: {
      viewCount: '354725',
      likeCount: '8932',
      commentCount: '421'
    },
    isEducational: true,
    durationInSeconds: 1231 // 20m 31s
  }
];

// Additional short educational videos for learning mode
export const mockEducationalVideos: YouTubeVideo[] = [
  {
    id: 'qz0aGYrrlhU',  // HTML Crash Course For Absolute Beginners
    snippet: {
      title: 'HTML Basics in 5 Minutes',
      description: 'Learn the basics of HTML in just 5 minutes. This quick tutorial covers the essential elements you need to know.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/qz0aGYrrlhU/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/qz0aGYrrlhU/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/qz0aGYrrlhU/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'Web Tutorials',
      channelId: 'UCFbNIlppjAuEX4znoulh0Cw',
      publishedAt: '2023-03-15T12:00:00Z',
      tags: ['html', 'web development', 'tutorial', 'beginner', 'education', 'coding', 'short tutorial']
    },
    contentDetails: {
      duration: 'PT4M45S'
    },
    statistics: {
      viewCount: '127832',
      likeCount: '12873',
      commentCount: '432'
    },
    isEducational: true,
    durationInSeconds: 285 // 4m 45s
  },
  {
    id: 'K74l26pE4YA',  // CSS Flexbox Tutorial by Kevin Powell
    snippet: {
      title: 'CSS Flexbox in 3 Minutes',
      description: 'Master CSS Flexbox layout in just 3 minutes with this quick and focused tutorial.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/K74l26pE4YA/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/K74l26pE4YA/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/K74l26pE4YA/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'Kevin Powell',
      channelId: 'UCJZv4d5rbIKd4QHMPkcABCw',
      publishedAt: '2023-02-10T10:15:00Z',
      tags: ['css', 'flexbox', 'web development', 'quick tutorial', 'layout', 'education']
    },
    contentDetails: {
      duration: 'PT3M20S'
    },
    statistics: {
      viewCount: '98564',
      likeCount: '8732',
      commentCount: '243'
    },
    isEducational: true,
    durationInSeconds: 200 // 3m 20s
  },
  {
    id: 'h33Srr5J9nY',  // JavaScript Arrow Functions by Web Dev Simplified
    snippet: {
      title: 'JavaScript Arrow Functions Explained',
      description: 'Learn all about arrow functions in JavaScript in under 5 minutes.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/h33Srr5J9nY/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/h33Srr5J9nY/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/h33Srr5J9nY/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'Web Dev Simplified',
      channelId: 'UCFbNIlppjAuEX4znoulh0Cw',
      publishedAt: '2023-01-05T14:30:00Z',
      tags: ['javascript', 'arrow functions', 'es6', 'web development', 'programming', 'tutorial', 'education']
    },
    contentDetails: {
      duration: 'PT4M15S'
    },
    statistics: {
      viewCount: '112453',
      likeCount: '9876',
      commentCount: '325'
    },
    isEducational: true,
    durationInSeconds: 255 // 4m 15s
  },
  {
    id: 'HkdAHXoRtos',  // Git & GitHub Tutorial by freeCodeCamp
    snippet: {
      title: 'Git Basics in 4 Minutes',
      description: 'A quick tutorial on the most essential Git commands you need to know',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/HkdAHXoRtos/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/HkdAHXoRtos/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/HkdAHXoRtos/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'Code Academy',
      channelId: 'UC8butISFwT-Wl7EV0hUK0BQ',
      publishedAt: '2023-04-12T09:30:00Z',
      tags: ['git', 'version control', 'programming', 'coding', 'tutorial', 'beginner', 'education']
    },
    contentDetails: {
      duration: 'PT4M12S'
    },
    statistics: {
      viewCount: '87652',
      likeCount: '7123',
      commentCount: '198'
    },
    isEducational: true,
    durationInSeconds: 252 // 4m 12s
  },
  {
    id: 'TNhaISOUy6Q',  // React Hooks Tutorial by Web Dev Simplified
    snippet: {
      title: 'React Hooks in 5 Minutes',
      description: 'Learn the basics of React Hooks including useState and useEffect in this quick tutorial for beginners.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/TNhaISOUy6Q/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/TNhaISOUy6Q/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/TNhaISOUy6Q/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'Web Dev Simplified',
      channelId: 'UCFbNIlppjAuEX4znoulh0Cw',
      publishedAt: '2023-05-18T14:30:00Z',
      tags: ['react', 'hooks', 'useState', 'useEffect', 'tutorial', 'web development', 'javascript', 'education']
    },
    contentDetails: {
      duration: 'PT4M45S'
    },
    statistics: {
      viewCount: '147652',
      likeCount: '9982',
      commentCount: '231'
    },
    isEducational: true,
    durationInSeconds: 285 // 4m 45s
  },
  {
    id: 'UBOj6rqRUME',  // Tailwind CSS Tutorial by Tailwind Labs
    snippet: {
      title: 'Tailwind CSS Crash Course in 4 Minutes',
      description: 'Get up to speed with Tailwind CSS basics in just 4 minutes. Learn the core concepts and utility-first approach.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/UBOj6rqRUME/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/UBOj6rqRUME/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/UBOj6rqRUME/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'TailwindLabs',
      channelId: 'UCOe-8z68tgw9ioqVvYM4ddQ',
      publishedAt: '2023-03-22T10:00:00Z',
      tags: ['tailwind', 'css', 'tailwindcss', 'utility-first', 'web development', 'frontend', 'tutorial', 'education']
    },
    contentDetails: {
      duration: 'PT3M58S'
    },
    statistics: {
      viewCount: '98763',
      likeCount: '7865',
      commentCount: '184'
    },
    isEducational: true,
    durationInSeconds: 238 // 3m 58s
  },
  {
    id: 'ahCwqrYpIuM',  // TypeScript Tutorial by Fireship
    snippet: {
      title: 'TypeScript in 5 Minutes - Quick Start Guide',
      description: 'A rapid introduction to TypeScript basics including types, interfaces, and how to set up a project.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/ahCwqrYpIuM/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/ahCwqrYpIuM/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/ahCwqrYpIuM/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'TypeScript Academy',
      channelId: 'UCjFO_UfS8VlGnXcVJ5F7a1A',
      publishedAt: '2023-04-05T16:45:00Z',
      tags: ['typescript', 'javascript', 'types', 'interfaces', 'web development', 'programming', 'tutorial', 'education']
    },
    contentDetails: {
      duration: 'PT4M52S'
    },
    statistics: {
      viewCount: '112435',
      likeCount: '8546',
      commentCount: '203'
    },
    isEducational: true,
    durationInSeconds: 292 // 4m 52s
  },
  {
    id: 'pGYAg7TMmp0',  // Docker Tutorial by Fireship
    snippet: {
      title: 'Docker Containers Explained in 3 Minutes',
      description: 'Learn the fundamentals of Docker containers and why they are so important in modern development.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/pGYAg7TMmp0/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/pGYAg7TMmp0/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/pGYAg7TMmp0/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'DevOps Directive',
      channelId: 'UC4MdpjzjPuop_qWNAvR23JA',
      publishedAt: '2023-02-10T11:30:00Z',
      tags: ['docker', 'containers', 'devops', 'cloud', 'virtualization', 'tutorial', 'education']
    },
    contentDetails: {
      duration: 'PT3M12S'
    },
    statistics: {
      viewCount: '87452',
      likeCount: '6234',
      commentCount: '142'
    },
    isEducational: true,
    durationInSeconds: 192 // 3m 12s
  },
  {
    id: 'lsMQRaeKNDk',  // Node.js API Tutorial by Traversy Media
    snippet: {
      title: 'How to Build an API with Node.js in 5 Minutes',
      description: 'Quick tutorial on building a simple REST API using Node.js and Express in just 5 minutes.',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/lsMQRaeKNDk/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/lsMQRaeKNDk/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/lsMQRaeKNDk/hqdefault.jpg', width: 480, height: 360 }
      },
      channelTitle: 'Backend Basics',
      channelId: 'UC8butISFwT-Wl7EV0hUK0BQ',
      publishedAt: '2023-05-05T09:15:00Z',
      tags: ['node.js', 'express', 'api', 'rest', 'backend', 'web development', 'tutorial', 'javascript', 'education']
    },
    contentDetails: {
      duration: 'PT4M48S'
    },
    statistics: {
      viewCount: '76543',
      likeCount: '5487',
      commentCount: '165'
    },
    isEducational: true,
    durationInSeconds: 288 // 4m 48s
  }
];

// Add educational videos to the main mock videos array
mockVideos.push(...mockEducationalVideos);

interface EducationalVideo {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  channel: string;
}

// Collection of real educational videos
export const educationalVideos: EducationalVideo[] = [
  {
    id: 'w7ejDZ8SWv8',
    title: 'React JS Course for Beginners - 2023 Tutorial',
    description: 'Comprehensive React tutorial covering components, hooks, and modern practices',
    category: 'Web Development',
    duration: '11:55:27',
    channel: 'freeCodeCamp.org'
  },
  {
    id: 'bMknfKXIFA8',
    title: 'React Course - Beginner\'s Tutorial for React JavaScript Library [2022]',
    description: 'Learn React fundamentals, state management, and component architecture',
    category: 'Web Development',
    duration: '11:55:27',
    channel: 'freeCodeCamp.org'
  },
  {
    id: 'Rh3tobg7hEo',
    title: 'React Hooks Course - All React Hooks Explained',
    description: 'Deep dive into React hooks including useState, useEffect, and custom hooks',
    category: 'Web Development',
    duration: '3:00:46',
    channel: 'PedroTech'
  },
  {
    id: 'f55qeKGgB_M',
    title: 'React Testing Library Tutorial',
    description: 'Learn how to test React applications using React Testing Library',
    category: 'Testing',
    duration: '1:50:35',
    channel: 'The Net Ninja'
  },
  {
    id: '4UZrsTqkcW4',
    title: 'Full React Course 2020 - Learn Fundamentals, Hooks, Context API, React Router, Custom Hooks',
    description: 'Complete React course covering all essential concepts and advanced topics',
    category: 'Web Development',
    duration: '10:07:54',
    channel: 'freeCodeCamp.org'
  }
];

// Get a random educational video
export const getRandomVideo = (): EducationalVideo => {
  const randomIndex = Math.floor(Math.random() * educationalVideos.length);
  return educationalVideos[randomIndex];
};

// Get video by ID
export const getVideoById = (id: string): EducationalVideo | undefined => {
  return educationalVideos.find(video => video.id === id);
};

// Enhanced mock transcript generation
export const getMockTranscript = (videoId: string): string => {
  const video = getVideoById(videoId);
  
  if (!video) {
    return 'Transcript not available.';
  }

  const category = getVideoCategory({ 
    id: videoId, 
    snippet: { 
      title: video.title, 
      description: video.description,
      tags: [],
      channelTitle: video.channel,
      channelId: '',
      publishedAt: '',
      thumbnails: { default: { url: '', width: 0, height: 0 } }
    },
    contentDetails: { duration: video.duration },
    statistics: { viewCount: '0', likeCount: '0', commentCount: '0' },
    isEducational: true,
    durationInSeconds: 0
  });

  // Return category-specific mock transcript
  switch (category) {
    case 'Web Development':
      return `Welcome to this web development tutorial on ${video.title}.
      
In this video, we'll cover essential web development concepts and practical implementation.

Key topics include:
1. Setting up the development environment
2. Understanding the core concepts
3. Building the application step by step
4. Best practices and common pitfalls
5. Testing and deployment strategies

By the end of this tutorial, you'll have hands-on experience with these concepts.`;
    
    case 'Programming':
      return `Welcome to this programming tutorial on ${video.title}.
      
We'll explore fundamental programming concepts and their practical applications.

Topics covered:
1. Core programming principles
2. Code organization and structure
3. Efficient algorithms and patterns
4. Error handling and debugging
5. Performance optimization

You'll learn how to write clean, efficient, and maintainable code.`;
    
    case 'DevOps':
      return `Welcome to this DevOps tutorial on ${video.title}.
      
Learn about modern DevOps practices and tools for efficient development and deployment.

We'll cover:
1. Container orchestration and management
2. CI/CD pipeline setup
3. Cloud infrastructure deployment
4. Monitoring and logging
5. Security best practices

Master the tools and practices used in modern DevOps workflows.`;
    
    case 'Database':
      return `Welcome to this database tutorial on ${video.title}.
      
Explore database concepts and practical implementation strategies.

Key areas covered:
1. Database design principles
2. Query optimization
3. Data modeling
4. Transaction management
5. Performance tuning

Learn how to build and maintain efficient database systems.`;
    
    case 'Mobile Development':
      return `Welcome to this mobile development tutorial on ${video.title}.
      
Learn mobile app development concepts and best practices.

Topics include:
1. UI/UX design principles
2. State management
3. API integration
4. Performance optimization
5. Platform-specific features

Build professional-quality mobile applications with confidence.`;
    
    default:
      return `Welcome to this comprehensive tutorial on ${video.title}.
      
We'll cover fundamental concepts and practical applications in software development.

Key topics include:
1. Core principles and concepts
2. Best practices and patterns
3. Implementation strategies
4. Testing and validation
5. Deployment and maintenance

By the end of this tutorial, you'll have a solid understanding of the subject matter.`;
  }
};
