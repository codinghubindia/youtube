import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useYouTube } from '../context/YouTubeContext';
import MiniPlayer from '../components/MiniPlayer';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { darkMode, miniPlayer, hideMiniPlayer } = useYouTube();
  
  // Check if we're on the watch page
  const isWatchPage = location.pathname.includes('/watch/');
  
  // Detect mobile and handle sidebar state
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile) {
        // Close sidebar on mobile by default
        setSidebarOpen(false);
      } else if (isWatchPage) {
        // On watch page, minimize sidebar but don't close it completely
        setSidebarOpen(window.innerWidth >= 1200); // Keep expanded on large screens even on watch page
      } else {
        // For all other pages on desktop, always keep sidebar expanded
        setSidebarOpen(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isWatchPage]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark bg-[#0f0f0f]' : 'bg-white'}`}>
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden mt-14">
        <Sidebar isOpen={sidebarOpen} />
        
        <main 
          className={`flex-1 overflow-auto transition-all duration-300 dark:bg-[#0f0f0f] ${
            sidebarOpen && !isMobile ? 'ml-64' : isMobile ? 'ml-0' : 'ml-[72px]'
          } ${isMobile ? 'pb-20' : ''}`}
        >
          <Outlet />
        </main>
      </div>

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
    </div>
  );
};

export default MainLayout;