# API Setup Guide

This guide will walk you through setting up the necessary API keys for the YouTube Clone application's Learning Mode feature.

## YouTube API Setup

To enable fetching real video data from YouTube:

1. **Create a Google Cloud Project**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Click "New Project" and follow the steps to create a project

2. **Enable the YouTube Data API v3**:
   - In your new project, navigate to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click the API and then click "Enable"

3. **Create API Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your new API key

4. **Configure API Key Restrictions** (Recommended):
   - Click on your newly created API key
   - Under "API restrictions," select "YouTube Data API v3"
   - Under "Application restrictions," choose "HTTP referrers" and add your development URL (e.g., `http://localhost:5173/*`)

5. **Add to Environment Variables**:
   - Create a `.env` file in your project root if it doesn't exist
   - Add your API key as follows:
     ```
     VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
     ```

6. **Multiple API Keys for Fallback** (Optional):
   - You can add multiple YouTube API keys to avoid quota limits:
     ```
     VITE_YOUTUBE_API_KEY_1=your_first_api_key_here
     VITE_YOUTUBE_API_KEY_2=your_second_api_key_here
     VITE_YOUTUBE_API_KEY_3=your_third_api_key_here
     ```

## Gemini API Setup for Learning Mode

To enable AI-powered features like video summaries, study notes, and chat:

1. **Get a Gemini API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy your API key

2. **Add to Environment Variables**:
   - In your `.env` file, add:
     ```
     VITE_GEMINI_API_KEY=your_gemini_api_key_here
     ```

3. **Multiple Gemini API Keys for Fallback** (Optional):
   - Similar to YouTube API keys, you can add multiple Gemini API keys:
     ```
     VITE_GEMINI_API_KEY_1=your_first_gemini_key_here
     VITE_GEMINI_API_KEY_2=your_second_gemini_key_here
     ```

## Quota Management

### YouTube API Quota

The YouTube Data API has a daily quota limit (typically 10,000 units):
- Search operation: 100 units per call
- Video details: 1 unit per video
- Related videos: 1-5 units

Tips to manage quota:
- Use the mock data when developing
- Limit unnecessary API calls during development
- Consider creating multiple projects with separate API keys for higher quotas

### Gemini API Quota

Gemini API also has usage limits based on your account:
- Free tier: Limited number of tokens per minute
- Paid tier: Higher limits based on your plan

## Troubleshooting

If you encounter issues:

1. **API Keys Not Working**:
   - Ensure your API keys are correctly entered in the `.env` file
   - Check that the API is enabled in your Google Cloud Console
   - Verify any API restrictions are properly configured

2. **Quota Exceeded**:
   - The application will automatically fall back to mock data
   - Wait until your quota resets (usually the next day)
   - Add additional API keys if available

3. **No Access to Learning Mode Features**:
   - Verify your Gemini API key is correct
   - Check the console for any API-related errors
   - Ensure your account has access to the Gemini API (check regional availability)

## Learning Mode without API Keys

If you cannot set up API keys, the application will still function:
- Mock video data will be used instead of fetching from YouTube
- Basic learning mode features will work without AI capabilities
- The learning dashboard will track your progress with mock videos

For a full experience with all features, proper API configuration is recommended. 