# API Setup Guide

This guide will help you set up the necessary API keys for the YouTube Clone project.

## Setting up YouTube API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. In the sidebar, navigate to "APIs & Services" > "Library"
4. Search for "YouTube Data API v3" and select it
5. Click "Enable" to activate the API for your project
6. In the sidebar, navigate to "APIs & Services" > "Credentials"
7. Click "Create Credentials" and select "API key"
8. Your new API key will be displayed (copy it for later use)
9. (Optional but recommended) Click "Restrict Key" and set the following:
   - Application restrictions: HTTP referrers (websites)
   - Website restrictions: Add your local development URL (e.g., http://localhost:5173/*)
   - API restrictions: Restrict to YouTube Data API v3

## Setting up Gemini API

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click on "Get API key" or "Create API key"
4. Copy your new API key

Note: Gemini API access may require a Google Cloud account in some regions. If so, follow these steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the "Gemini API" for your project
3. Generate an API key from the Credentials section

## Configuring your Environment Variables

1. Create a file named `.env` in the root directory of this project
2. Add the following lines to the file:
   ```
   VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Replace `your_youtube_api_key_here` and `your_gemini_api_key_here` with your actual API keys
4. Save the file

Important: The `.env` file should never be committed to version control. It is already included in the `.gitignore` file.

## Testing Your API Keys

Once you've set up your environment variables:

1. Start the development server using `npm run dev` or `yarn dev`
2. Navigate to the Learning Dashboard
3. Click on any video to open its details
4. In the Learning Sidebar, you should be able to:
   - See the video summary
   - Access study notes
   - Use the chat feature to ask questions about the video

If you encounter any issues, check the browser console for error messages that might indicate problems with your API configuration.

## Troubleshooting

### YouTube API Issues

- **403 error**: Your API key might be restricted to specific domains. Make sure localhost is allowed.
- **Quota exceeded**: YouTube API has daily quotas. Check your [Google Cloud Console](https://console.cloud.google.com/) for quota usage.
- **Invalid API key**: Double-check your key and make sure it's correctly copied into the `.env` file.

### Gemini API Issues

- **API key not found**: Ensure your `.env` file is in the root directory and has the correct variable name.
- **Authorization error**: Verify that your API key is valid and active.
- **Model not found**: The application uses the "gemini-pro" model. Make sure this model is available for your API key.
- **Rate limit exceeded**: Gemini API has usage limits. Try again later if you hit these limits.

If problems persist, try creating a new API key for both services. 