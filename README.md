# YouTube Clone Project

A modern YouTube clone built with React, TypeScript, and Tailwind CSS that mimics the core functionality and UI of YouTube, with an enhanced Learning Mode for educational content.

## Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Mode**: Toggle between light and dark themes
- **Video Playback**: Watch videos with controls similar to YouTube
- **Search Functionality**: Search for videos by keywords
- **YouTube API Integration**: Fetch real video data from YouTube
- **Educational Focus**: Displays educational content for programming and web development
- **API Fallback Mechanism**: Multiple API keys with fallback to prevent quota limits
- **Infinite Scrolling**: Load more videos as you scroll down the page
- **Quota Management**: Track YouTube API usage to prevent exceeding daily limits
- **Mock Data**: Fallback to mock data when API quota is exceeded or all keys fail
- **Learning Mode**: AI-powered assistant to help understand educational content
- **Learning Dashboard**: Track watched educational videos and get personalized recommendations

## Learning Mode

The Learning Mode is a key feature that enhances educational videos:

- **Video Summaries**: Get AI-generated summaries of video content
- **Study Notes**: Convert video content into structured study notes
- **AI Chat**: Ask questions about the video content and get AI-powered responses
- **Progress Tracking**: Track your watch history and completion percentage
- **Personalized Recommendations**: Get video recommendations based on your learning interests

## Tech Stack

- **React**: UI library
- **TypeScript**: Type-safe code
- **Tailwind CSS**: Styling
- **Vite**: Build tool
- **React Router**: Navigation
- **Lucide Icons**: Icon library
- **YouTube Data API v3**: Video data source
- **Google Gemini API**: AI features for Learning Mode

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/youtube-clone.git
   cd youtube-clone
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with your API keys:
   ```
   # YouTube API key
   VITE_YOUTUBE_API_KEY=your_youtube_api_key_here

   # Gemini API key for Learning Mode
   VITE_GEMINI_API_KEY=your_gemini_api_key_here

   # Optional: Multiple YouTube API keys for fallback mechanism
   VITE_YOUTUBE_API_KEY_1=your_first_api_key_here
   VITE_YOUTUBE_API_KEY_2=your_second_api_key_here
   ```

4. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## API Setup

### YouTube API Setup

To use this application with the YouTube API:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the YouTube Data API v3
4. Create credentials (API Key)
5. Add the API key to your `.env` file as shown above

### Gemini API Setup (for Learning Mode)

To enable the Learning Mode features:

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Get or create a Gemini API key
4. Add the key to your `.env` file as `VITE_GEMINI_API_KEY`

For detailed instructions, see the [API Setup Guide](docs/API_SETUP.md).

## API Quota Management

The YouTube Data API has a daily quota limit (typically 10,000 units). Different operations cost different amounts:

- Search operation: 100 units
- Video details: 1 unit per video
- Most other operations: 1-5 units

The application includes a quota tracking system to:
- Monitor API usage
- Switch to alternative API keys when quota is approaching limits
- Fall back to mock data when all API keys have reached their quota

## Features Implemented

- [x] Educational video focus with real YouTube video IDs
- [x] Multiple API keys with fallback mechanism
- [x] Randomization of videos on refresh
- [x] Infinite scrolling instead of "Load More" button
- [x] Efficient API usage to maximize quota
- [x] AI-powered Learning Mode for educational videos
- [x] Learning Dashboard with progress tracking
- [x] Personalized video recommendations based on learning history

## License

This project is licensed under the MIT License.

## Acknowledgements

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Google Gemini API](https://ai.google.dev/docs/gemini_api_overview) 