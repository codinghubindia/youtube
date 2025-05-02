# YouTube Clone

A modern YouTube clone built with React, TypeScript, and Tailwind CSS. This project aims to replicate the core features and UI of YouTube using the official YouTube Data API.

## Features

- 🎥 Watch videos with a YouTube-like interface
- 🌓 Dark/Light mode toggle
- 🔍 Search videos using the YouTube API
- 📱 Responsive design for all screen sizes
- 📊 View video details, comments, and related videos
- 🎞️ Video thumbnails and duration display
- 🧩 Components closely matching YouTube's UI
- 📈 View counts, likes, and timestamps formatting

## Tech Stack

- **React**: UI library
- **TypeScript**: Type-safe code
- **Tailwind CSS**: Styling
- **Vite**: Build tool
- **React Router**: Navigation
- **Lucide Icons**: Icon library
- **YouTube Data API v3**: Data source

## Getting Started

### Prerequisites

- Node.js (16.x or higher)
- YouTube Data API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/youtube-clone.git
cd youtube-clone
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root with your YouTube API key:
```
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
```

> **Note**: You need to [obtain a YouTube Data API key](https://developers.google.com/youtube/v3/getting-started) from the Google Cloud Console.

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) to view the app in your browser.

## Deployment

To build the app for production:

```bash
npm run build
```

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

## Acknowledgements

- Google's YouTube API
- React and Tailwind CSS communities
- YouTube for inspiration 