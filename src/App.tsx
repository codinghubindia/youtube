import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { YouTubeProvider, useYouTube } from './context/YouTubeContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import WatchPage from './pages/WatchPage';
import ShortsPage from './pages/ShortsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import ChannelPage from './pages/ChannelPage';
import HistoryPage from './pages/HistoryPage';
import YourVideosPage from './pages/YourVideosPage';
import WatchLaterPage from './pages/WatchLaterPage';
import SearchResultsPage from './pages/SearchResultsPage';
import MiniPlayer from './components/MiniPlayer';
/* import LikedVideosPage from './pages/LikedVideosPage';
import TrendingPage from './pages/TrendingPage';
import ShoppingPage from './pages/ShoppingPage';
import MusicPage from './pages/MusicPage';
import MoviesPage from './pages/MoviesPage';
import GamingPage from './pages/GamingPage';
import NewsPage from './pages/NewsPage';
import SportsPage from './pages/SportsPage';
import LearningPage from './pages/LearningPage';
import SettingsPage from './pages/SettingsPage';
import ReportPage from './pages/ReportPage';
import HelpPage from './pages/HelpPage'; */

// Separate component for routes to access the context
const AppRoutes: React.FC = () => {
  const { miniPlayer, hideMiniPlayer } = useYouTube();

  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="watch/:id" element={<WatchPage />} />
          <Route path="shorts" element={<ShortsPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="channel/:id" element={<ChannelPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="your-videos" element={<YourVideosPage />} />
          <Route path="watch-later" element={<WatchLaterPage />} />
          <Route path="search" element={<SearchResultsPage />} />
         {/*  <Route path="liked" element={<LikedVideosPage />} />
          <Route path="trending" element={<TrendingPage />} />
          <Route path="shopping" element={<ShoppingPage />} />
          <Route path="music" element={<MusicPage />} />
          <Route path="movies" element={<MoviesPage />} />
          <Route path="gaming" element={<GamingPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="sports" element={<SportsPage />} />
          <Route path="learning" element={<LearningPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="help" element={<HelpPage />} /> */}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Mini Player */}
      {miniPlayer.active && (
        <MiniPlayer 
          videoId={miniPlayer.videoId}
          title={miniPlayer.title}
          channelTitle={miniPlayer.channelTitle}
          thumbnailUrl={miniPlayer.thumbnailUrl}
          onClose={hideMiniPlayer}
        />
      )}
    </>
  );
};

function App() {
  return (
    <Router>
      <YouTubeProvider>
        <AppRoutes />
      </YouTubeProvider>
    </Router>
  );
}

export default App;