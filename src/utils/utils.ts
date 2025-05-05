// Parse ISO 8601 duration to seconds
export const parseISO8601Duration = (duration: string): number => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  
  const hours = (match[1] ? parseInt(match[1]) : 0) * 3600;
  const minutes = (match[2] ? parseInt(match[2]) : 0) * 60;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  
  return hours + minutes + seconds;
};

// Check if content is educational based on metadata
export const isEducationalContent = (video: {
  snippet: {
    title: string;
    description: string;
    tags?: string[];
  };
}): boolean => {
  const educationalKeywords = [
    'learn', 'tutorial', 'course', 'education', 'educational', 'how to',
    'programming', 'coding', 'development', 'beginner', 'introduction',
    'guide', 'explained', 'for beginners', 'crash course', 'lesson'
  ];

  const title = video.snippet.title.toLowerCase();
  const description = video.snippet.description.toLowerCase();
  const tags = video.snippet.tags || [];

  // Check title and description for educational keywords
  const hasEducationalKeyword = educationalKeywords.some(keyword =>
    title.includes(keyword) || description.includes(keyword)
  );

  // Check if any tags match educational keywords
  const hasEducationalTag = tags.some(tag =>
    educationalKeywords.includes(tag.toLowerCase())
  );

  return hasEducationalKeyword || hasEducationalTag;
}; 