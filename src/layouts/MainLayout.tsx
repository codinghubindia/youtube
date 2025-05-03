import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useYouTube } from '../context/YouTubeContext';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { darkMode } = useYouTube();
  
  // Check if we're on the watch page
  const isWatchPage = location.pathname.includes('/watch/');
  
  // Detect mobile and close sidebar on mobile by default, and when on watch page
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile || isWatchPage) {
        setSidebarOpen(false);
      } else {
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
    </div>
  );
};

export default MainLayout;