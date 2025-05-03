# Deploying to Netlify

This guide walks you through deploying your YouTube clone application to Netlify, providing continuous deployment from your Git repository.

## Prerequisites

- A GitHub, GitLab, or Bitbucket account with your project repository
- A Netlify account (you can sign up for free at [netlify.com](https://netlify.com))
- Your YouTube API key and Gemini API key

## Deployment Steps

### 1. Push Your Code to a Git Repository

Ensure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push
```

### 2. Connect to Netlify

1. Log in to your Netlify account
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your YouTube clone repository

### 3. Configure Build Settings

Netlify should automatically detect that this is a Vite project, but verify these settings:

- **Build command**: `npm run build` (or `yarn build`)
- **Publish directory**: `dist`

These settings are already configured in your `netlify.toml` file, but it's good to verify them in the Netlify UI.

### 4. Configure Environment Variables

1. In the Netlify deployment settings, go to "Site settings" → "Environment variables"
2. Add the following environment variables:

   - `VITE_YOUTUBE_API_KEY`: Your YouTube API key
   - `VITE_GEMINI_API_KEY`: Your Gemini API key

   If you're using multiple API keys for fallback, also add:
   - `VITE_YOUTUBE_API_KEY_1`, `VITE_YOUTUBE_API_KEY_2`, etc.
   - `VITE_GEMINI_API_KEY_1`, `VITE_GEMINI_API_KEY_2`, etc.

### 5. Deploy Your Site

1. Click "Deploy site"
2. Netlify will start building and deploying your project
3. Once complete, you'll receive a unique Netlify URL (e.g., `your-youtube-clone.netlify.app`)

## Using Netlify CLI (Alternative Method)

For more control over your deployments, you can use the Netlify CLI:

### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

### 2. Login to Netlify

```bash
netlify login
```

### 3. Initialize Your Project

If you're setting up a new site:

```bash
netlify init
```

This will guide you through connecting your project to Netlify, including setting up the build settings.

### 4. Deploy Manually

To deploy your site without pushing to Git:

```bash
# Run the build script
npm run build

# Deploy to production
npm run netlify
```

Or for a preview deployment:

```bash
npm run netlify:preview
```

### 5. Set Environment Variables

```bash
netlify env:set VITE_YOUTUBE_API_KEY "your-api-key-here"
netlify env:set VITE_GEMINI_API_KEY "your-gemini-api-key-here"
```

## Custom Domain (Optional)

To use your own domain:

1. Go to "Site settings" → "Domain management"
2. Click "Add custom domain"
3. Follow the instructions to configure DNS settings for your domain

## Continuous Deployment

Netlify automatically sets up continuous deployment. When you push changes to your Git repository:

1. Netlify detects the changes
2. It automatically builds and deploys the updated site
3. The new version goes live once the build completes

## Deployment Preview

Netlify creates preview deployments for pull requests, allowing you to test changes before merging.

## Troubleshooting

If your deployment fails:

1. Check the build logs in Netlify for specific error messages
2. Common issues include:
   - Missing environment variables
   - Build errors in your code
   - Permissions issues with your Git repository

3. For routing issues:
   - Ensure the redirects in `netlify.toml` are correctly configured
   - Verify that all your React Router paths are working correctly

## Testing After Deployment

After deploying, test these features:

1. Navigation between pages
2. Search functionality
3. Video playback
4. Learning mode toggle
5. Dark mode toggle
6. Mobile responsiveness

## Environment-Specific Configurations

Your application should use mock data when API keys are not available. Verify that your fallback mechanisms work correctly in the production environment.

## Performance Monitoring

Netlify provides analytics and performance monitoring:

1. Go to "Analytics" in your Netlify dashboard
2. Review page load times, visitor statistics, and bandwidth usage
3. Use this data to optimize your application further

## Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#netlify)
- [Environment Variables in Netlify](https://docs.netlify.com/configure-builds/environment-variables/) 