import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { YouTubeProvider, useYouTube } from './context/YouTubeContext';
import { LearningModeProvider } from './context/LearningModeContext';
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
import ComingSoonPage from './pages/ComingSoonPage';
import MiniPlayer from './components/MiniPlayer';
import ErrorBoundary from './components/ErrorBoundary';
import LearningDashboardPage from './pages/LearningDashboardPage';

// Separate component for routes to access the context
const AppRoutes: React.FC = () => {
  const { miniPlayer, hideMiniPlayer } = useYouTube();

  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="watch/:id" element={
            <ErrorBoundary>
              <WatchPage />
            </ErrorBoundary>
          } />
          <Route path="shorts" element={<ShortsPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="channel/:id" element={<ChannelPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="your-videos" element={<YourVideosPage />} />
          <Route path="watch-later" element={<WatchLaterPage />} />
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="coming-soon" element={<ComingSoonPage />} />
          
          {/* Routes using ComingSoonPage */}
          <Route path="liked" element={<ComingSoonPage />} />
          <Route path="trending" element={<ComingSoonPage />} />
          <Route path="shopping" element={<ComingSoonPage />} />
          <Route path="music" element={<ComingSoonPage />} />
          <Route path="movies" element={<ComingSoonPage />} />
          <Route path="gaming" element={<ComingSoonPage />} />
          <Route path="news" element={<ComingSoonPage />} />
          <Route path="sports" element={<ComingSoonPage />} />
          <Route path="learning" element={<LearningDashboardPage />} />
          <Route path="settings" element={<ComingSoonPage />} />
          <Route path="report" element={<ComingSoonPage />} />
          <Route path="help" element={<ComingSoonPage />} />
          <Route path="you" element={<ComingSoonPage />} />
          
          {/* Catch-all route for any other paths within MainLayout */}
          <Route path="*" element={<ComingSoonPage />} />
        </Route>
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
      <ErrorBoundary>
        <YouTubeProvider>
          <LearningModeProvider>
            <AppRoutes />
          </LearningModeProvider>
        </YouTubeProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;