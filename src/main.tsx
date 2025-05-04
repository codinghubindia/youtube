import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route } from 'react-router-dom';
import { YouTubeProvider } from './context/YouTubeContext';
import { LearningModeProvider } from './context/LearningModeContext';
import ErrorBoundary from './components/ErrorBoundary';
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
import LearningDashboardPage from './pages/LearningDashboardPage';
import './index.css';

// Check for user preference for dark mode
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (prefersDark) {
  document.documentElement.classList.add('dark');
}

// Create a component that wraps MainLayout with providers
const LayoutWithProviders = () => (
  <YouTubeProvider>
    <LearningModeProvider>
      <MainLayout />
    </LearningModeProvider>
  </YouTubeProvider>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<LayoutWithProviders />}>
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
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>
);
