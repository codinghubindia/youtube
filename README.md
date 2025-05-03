# YouTube Clone Project

A modern YouTube clone built with React, TypeScript, and Tailwind CSS that mimics the core functionality and UI of YouTube, with an enhanced Learning Mode for educational content.

## 🏆 Hackathon Highlights

This project introduces a revolutionary **Learning Mode** feature that transforms YouTube from a casual viewing platform into a powerful educational tool:

- **Smart Content Filtering** - Automatically surfaces educational videos under 5 minutes for focused learning
- **AI-Powered Learning** - Uses Google Gemini to generate summaries, notes, and answer questions
- **Personalized Education** - Builds a learning profile that adapts to your interests over time
- **Continuous Learning** - Tracks progress and recommends new content based on your learning patterns
- **Beautiful UX** - Seamless integration with a vibrant, accessible UI that makes learning engaging

> 💡 **Key Innovation**: The project reimagines video consumption from passive entertainment to active learning through intelligent filtering and AI assistance.

![Learning Mode Demo](docs/assets/learning-mode-demo.png)
*Add a screenshot of the Learning Mode in action here*

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

The Learning Mode is the standout feature that transforms this YouTube clone into an educational platform:

### 🧠 Intelligent Content Filtering

- **Duration-Based Selection**: Automatically filters for videos under 5 minutes - perfect for microlearning
- **Educational Content Detection**: Uses tag analysis and content markers to identify truly educational content
- **Visual Indicators**: Clear UI elements show which videos are educational and their completion status

### 🤖 AI-Powered Learning Assistance

- **Video Summaries**: Get concise AI-generated summaries of educational videos
- **Key Points Extraction**: Important concepts from videos are highlighted and organized
- **Interactive Learning**: Ask the AI questions about the video content for deeper understanding
- **Study Notes Generation**: Convert videos into structured, downloadable study materials

### 📊 Personalized Learning Dashboard

![Learning Dashboard](docs/assets/learning-dashboard.png)
*Add a screenshot of the Learning Dashboard here*

- **Progress Tracking**: Visual metrics show your learning journey
- **Interest Analysis**: The system identifies your learning patterns and preferred topics
- **History Management**: Easily browse and continue previously watched educational content
- **Smart Recommendations**: Get personalized suggestions based on your learning profile

### 🔄 Adaptive Learning System

- **Profile Building**: The more you watch, the smarter the system becomes about your interests
- **Content Scoring**: Videos are ranked based on relevance to your learning profile
- **Tag Analysis**: Detailed analysis of content tags builds a weighted map of your preferences
- **Multi-Model AI Support**: Uses multiple Gemini AI models with automatic fallback mechanisms

### ⚡ Technical Implementation

- **Multiple API Fallbacks**: System automatically rotates between API keys to prevent quota limits
- **Model Redundancy**: Falls back between Gemini models (2.0-flash-lite → 1.5-flash → 1.0-pro)
- **Local Storage Persistence**: Learning profile maintained even between sessions
- **Throttled API Usage**: Intelligent request management to optimize AI quota

![Learning Mode Architecture](docs/assets/learning-mode-architecture.png)
*Add a diagram of the Learning Mode architecture here*

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

## Deployment

### Netlify Deployment

This project is configured for easy deployment to [Netlify](https://www.netlify.com/):

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Sign up or log in to Netlify
3. Connect your repository and deploy
4. Configure your API keys as environment variables in the Netlify dashboard

The included `netlify.toml` file contains all necessary configuration for:
- Build settings
- SPA routing
- Caching optimization
- Environment variable setup

For detailed deployment instructions, see the [Netlify Deployment Guide](docs/NETLIFY_DEPLOY.md).

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