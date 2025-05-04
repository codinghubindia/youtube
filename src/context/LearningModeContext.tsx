import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface LearningModeState {
  isEnabled: boolean;
  sidebarVisible: boolean;
  lastRoute: string | null;
  lastVideoId: string | null;
  hasSeenIntro: boolean;
}

interface LearningModeContextType {
  learningMode: boolean;
  sidebarVisible: boolean;
  toggleLearningMode: () => void;
  toggleSidebar: () => void;
  lastVideoId: string | null;
}

const LearningModeContext = createContext<LearningModeContextType | undefined>(undefined);

export const LearningModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize state from localStorage with better error handling
  const [state, setState] = useState<LearningModeState>(() => {
    try {
      const savedState = localStorage.getItem('learningModeState');
      return savedState ? JSON.parse(savedState) : {
        isEnabled: false,
        sidebarVisible: false,
        lastRoute: null,
        lastVideoId: null,
        hasSeenIntro: false
      };
    } catch (error) {
      console.warn('Error loading learning mode state:', error);
      return {
        isEnabled: false,
        sidebarVisible: false,
        lastRoute: null,
        lastVideoId: null,
        hasSeenIntro: false
      };
    }
  });

  // Save state to localStorage with error handling
  useEffect(() => {
    try {
      localStorage.setItem('learningModeState', JSON.stringify(state));
    } catch (error) {
      console.warn('Error saving learning mode state:', error);
    }
  }, [state]);

  // Extract video ID from pathname
  const getVideoIdFromPath = useCallback((path: string): string | null => {
    const match = path.match(/\/watch\/([^/?]+)/);
    return match ? match[1] : null;
  }, []);

  // Show welcome message for first-time users
  const showWelcomeMessage = useCallback(() => {
    toast.custom(
      <div className="bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg max-w-md">
        <div className="flex flex-col gap-3">
          <span className="font-medium text-lg">Welcome to Learning Mode! 🎓</span>
          <div className="space-y-2 text-sm">
            <p>Learning Mode helps you get the most out of educational videos by:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Generating detailed study notes</li>
              <li>Providing interactive Q&A</li>
              <li>Creating summaries and key points</li>
              <li>Tracking your learning progress</li>
            </ul>
          </div>
          <p className="text-sm opacity-90">
            Start by selecting any educational video to begin learning!
          </p>
        </div>
      </div>,
      {
        duration: 8000,
        position: 'bottom-center',
      }
    );
  }, []);

  // Handle route changes and sidebar visibility
  useEffect(() => {
    const isWatchPage = location.pathname.startsWith('/watch');
    const isHomePage = location.pathname === '/';
    const currentVideoId = getVideoIdFromPath(location.pathname);
    
    if (state.isEnabled) {
      if (isWatchPage) {
        // Update last video ID when on watch page
        if (currentVideoId && currentVideoId !== state.lastVideoId) {
          setState(prev => ({ ...prev, lastVideoId: currentVideoId }));
        }
        
        // Ensure sidebar is visible on watch page
        if (!state.sidebarVisible) {
          setState(prev => ({ ...prev, sidebarVisible: true }));
        }
      } else if (isHomePage) {
        // Show welcome message if first time
        if (!state.hasSeenIntro) {
          showWelcomeMessage();
          setState(prev => ({ ...prev, hasSeenIntro: true }));
        }
      } else {
        // Show navigation message on other pages
        toast.custom(
          <div className="bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg">
            <div className="flex flex-col gap-2">
              <span className="font-medium">Learning Mode Active</span>
              <span className="text-sm opacity-90">
                Browse videos on the home page or return to your last video
              </span>
              {state.lastVideoId && (
                <button
                  onClick={() => navigate(`/watch/${state.lastVideoId}`)}
                  className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium mt-2 hover:bg-blue-50 transition-colors"
                >
                  Return to Last Video
                </button>
              )}
            </div>
          </div>,
          {
            duration: 5000,
            position: 'bottom-center',
          }
        );
      }
    }
  }, [location.pathname, state.isEnabled, state.lastVideoId, state.hasSeenIntro, navigate, getVideoIdFromPath, showWelcomeMessage]);

  // Toggle learning mode with improved handling
  const toggleLearningMode = useCallback(() => {
    const isWatchPage = location.pathname.startsWith('/watch');
    const isHomePage = location.pathname === '/';
    const currentVideoId = getVideoIdFromPath(location.pathname);

    setState(prev => {
      const newEnabled = !prev.isEnabled;
      
      if (newEnabled) {
        // If enabling on home page
        if (isHomePage) {
          if (!prev.hasSeenIntro) {
            showWelcomeMessage();
          }
          return {
            ...prev,
            isEnabled: true,
            sidebarVisible: true,
            hasSeenIntro: true
          };
        }
        // If enabling on watch page
        else if (isWatchPage && currentVideoId) {
          return {
            ...prev,
            isEnabled: true,
            sidebarVisible: true,
            lastRoute: location.pathname,
            lastVideoId: currentVideoId
          };
        }
        // If enabling on other pages
        else {
          toast.custom(
            <div className="bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg">
              <div className="flex flex-col gap-2">
                <span className="font-medium">Learning Mode Enabled</span>
                <span className="text-sm opacity-90">Visit the home page to browse educational videos</span>
              </div>
            </div>,
            { duration: 3000, position: 'bottom-center' }
          );
          return {
            ...prev,
            isEnabled: true,
            sidebarVisible: false
          };
        }
      }
      
      // If disabling learning mode
      return {
        ...prev,
        isEnabled: false,
        sidebarVisible: false
      };
    });
  }, [location.pathname, navigate, getVideoIdFromPath, showWelcomeMessage]);

  // Toggle sidebar with validation
  const toggleSidebar = useCallback(() => {
    const isWatchPage = location.pathname.startsWith('/watch');
    const isHomePage = location.pathname === '/';
    
    if (!isWatchPage && !isHomePage && state.isEnabled) {
      toast.custom(
        <div className="bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg">
          <span className="text-sm">Learning features are available on the home page and while watching videos</span>
        </div>,
        { duration: 2000, position: 'bottom-center' }
      );
      return;
    }

    setState(prev => ({
      ...prev,
      sidebarVisible: !prev.sidebarVisible
    }));
  }, [location.pathname, state.isEnabled]);

  return (
    <LearningModeContext.Provider 
      value={{ 
        learningMode: state.isEnabled,
        sidebarVisible: state.sidebarVisible,
        lastVideoId: state.lastVideoId,
        toggleLearningMode,
        toggleSidebar
      }}
    >
      {children}
    </LearningModeContext.Provider>
  );
};

export const useLearningMode = () => {
  const context = useContext(LearningModeContext);
  if (context === undefined) {
    throw new Error('useLearningMode must be used within a LearningModeProvider');
  }
  return context;
}; 