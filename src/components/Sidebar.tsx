import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Play, 
  Users, 
  Clock, 
  ThumbsUp, 
  FileClock, 
  Flame, 
  ShoppingBag, 
  Music2,
  Film,
  Gamepad2,
  Newspaper,
  Trophy,
  Lightbulb,
  Settings,
  Flag,
  HelpCircle,
  History,
  PlaySquare,
  Clock4,
  User as UserLucide,
  Brain
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  
  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Mobile bottom navigation
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0f0f0f] z-50 border-t border-gray-200 dark:border-gray-800 h-16">
        <div className="flex justify-around h-full">
          <NavLink
            to="/"
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-1/4 ${
                isActive ? 'text-red-600 dark:text-red-500' : 'dark:text-white'
              }`
            }
          >
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </NavLink>
          
          <NavLink
            to="/shorts"
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-1/4 ${
                isActive ? 'text-red-600 dark:text-red-500' : 'dark:text-white'
              }`
            }
          >
            <Play size={20} />
            <span className="text-xs mt-1">Shorts</span>
          </NavLink>
          
          <NavLink
            to="/subscriptions"
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-1/4 ${
                isActive ? 'text-red-600 dark:text-red-500' : 'dark:text-white'
              }`
            }
          >
            <Users size={20} />
            <span className="text-xs mt-1">Subs</span>
          </NavLink>
          
          <NavLink
            to="/you"
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-1/4 ${
                isActive ? 'text-red-600 dark:text-red-500' : 'dark:text-white'
              }`
            }
          >
            <UserLucide size={20} />
            <span className="text-xs mt-1">You</span>
          </NavLink>
        </div>
      </nav>
    );
  }

  // Default desktop sidebar
  return (
    <aside 
      className={`fixed top-14 left-0 h-full bg-white dark:bg-[#0f0f0f] z-40 overflow-y-auto transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-[72px]'
      }`}
    >
      <div className="py-2">
        {/* Main navigation section */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
          <NavLink
            to="/"
            className={({ isActive }) => 
              `flex items-center px-3 py-2 mx-2 rounded-lg ${
                isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              } ${!isOpen && 'flex-col justify-center h-16'}`
            }
          >
            <Home size={20} className={`${!isOpen ? 'mb-1' : 'min-w-5'} dark:text-white`} />
            <span className={`${!isOpen ? 'text-[10px]' : 'ml-6'} dark:text-white`}>Home</span>
          </NavLink>
          
          <NavLink
            to="/shorts"
            className={({ isActive }) => 
              `flex items-center px-3 py-2 mx-2 rounded-lg ${
                isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              } ${!isOpen && 'flex-col justify-center h-16'}`
            }
          >
            <Play size={20} className={`${!isOpen ? 'mb-1' : 'min-w-5'} dark:text-white`} />
            <span className={`${!isOpen ? 'text-[10px]' : 'ml-6'} dark:text-white`}>Shorts</span>
          </NavLink>
          
          <NavLink
            to="/subscriptions"
            className={({ isActive }) => 
              `flex items-center px-3 py-2 mx-2 rounded-lg ${
                isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              } ${!isOpen && 'flex-col justify-center h-16'}`
            }
          >
            <Users size={20} className={`${!isOpen ? 'mb-1' : 'min-w-5'} dark:text-white`} />
            <span className={`${!isOpen ? 'text-[10px]' : 'ml-6'} dark:text-white`}>Subscriptions</span>
          </NavLink>
        </div>
        
        {/* You section */}
        {isOpen ? (
          <div className="pt-2 border-b border-gray-200 dark:border-gray-700 pb-2">
            <h3 className="px-5 py-1 font-medium dark:text-white">You</h3>
            <NavLink
              to="/channel"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <UserLucide size={20} className="min-w-5 dark:text-white" />
              <span className="ml-6 dark:text-white">Your channel</span>
            </NavLink>
            
            <NavLink
              to="/history"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <History size={20} className="min-w-5 dark:text-white" />
              <span className="ml-6 dark:text-white">History</span>
            </NavLink>
            
            <NavLink
              to="/your-videos"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <PlaySquare size={20} className="min-w-5 dark:text-white" />
              <span className="ml-6 dark:text-white">Your videos</span>
            </NavLink>
            
            <NavLink
              to="/learning"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Brain size={20} className="min-w-5 dark:text-white" />
              <span className="ml-6 dark:text-white">Learning Dashboard</span>
            </NavLink>
            
            <NavLink
              to="/watch-later"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Clock4 size={20} className="min-w-5 dark:text-white" />
              <span className="ml-6 dark:text-white">Watch later</span>
            </NavLink>
            
            <NavLink
              to="/liked"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <ThumbsUp size={20} className="min-w-5 dark:text-white" />
              <span className="ml-6 dark:text-white">Liked videos</span>
            </NavLink>
          </div>
        ) : (
          <NavLink
            to="/you"
            className={({ isActive }) => 
              `flex flex-col items-center justify-center h-16 px-3 py-2 mx-2 rounded-lg ${
                isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            <UserLucide size={20} className="mb-1 dark:text-white" />
            <span className="text-[10px] dark:text-white">You</span>
          </NavLink>
        )}
        
        {/* Explore section */}
        {isOpen && (
          <div className="pt-2 border-b border-gray-200 dark:border-gray-700 pb-2">
            <h3 className="px-5 py-1 font-medium dark:text-white">Explore</h3>
            <NavLink
              to="/trending"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Flame size={20} className="min-w-5 dark:text-white" />
              <span className="ml-6 dark:text-white">Trending</span>
            </NavLink>
            
            <NavLink
              to="/shopping"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <ShoppingBag size={20} className="min-w-5 dark:text-white" />
              <span className="ml-6 dark:text-white">Shopping</span>
            </NavLink>
            
            <NavLink
              to="/music"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Music2 size={20} className="min-w-5 dark:text-white" />
              <span className="ml-6 dark:text-white">Music</span>
            </NavLink>
            
            <NavLink
              to="/movies"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Film size={20} className="min-w-5 dark:text-white" />
              <span className="ml-6 dark:text-white">Movies & TV</span>
            </NavLink>
            
            <NavLink
              to="/gaming"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Gamepad2 size={20} className="min-w-5 dark:text-white" />
              <span className="ml-6 dark:text-white">Gaming</span>
            </NavLink>
            
            <NavLink
              to="/news"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Newspaper size={20} className="min-w-5 dark:text-white" />
              <span className="ml-6 dark:text-white">News</span>
            </NavLink>
            
            <NavLink
              to="/sports"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Trophy size={20} className="min-w-5 dark:text-white" />
              <span className="ml-6 dark:text-white">Sports</span>
            </NavLink>
            
            <NavLink
              to="/learning"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Lightbulb size={20} className="min-w-5 dark:text-white" />
              <span className="ml-6 dark:text-white">Learning</span>
            </NavLink>
          </div>
        )}
        
        {/* Settings and Help section */}
        {isOpen && (
          <div className="pt-2">
            <NavLink
              to="/settings"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Settings size={20} className="min-w-5 dark:text-white" />
              <span className="ml-6 dark:text-white">Settings</span>
            </NavLink>
            
            <NavLink
              to="/report"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Flag size={20} className="min-w-5 dark:text-white" />
              <span className="ml-6 dark:text-white">Report</span>
            </NavLink>
            
            <NavLink
              to="/help"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <HelpCircle size={20} className="min-w-5 dark:text-white" />
              <span className="ml-6 dark:text-white">Help</span>
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
};

// Rename this function to avoid naming conflict with the imported User component
function UserIcon(props: any) {
  return <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
}

export default Sidebar;