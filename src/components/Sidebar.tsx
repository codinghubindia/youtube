import React from 'react';
import { NavLink } from 'react-router-dom';
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
  User as UserLucide
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
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
          <div className="pt-2 border-b border-gray-200 pb-2">
            <h3 className="px-5 py-1 font-medium">Explore</h3>
            <NavLink
              to="/trending"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100' : 'hover:bg-gray-100'
                }`
              }
            >
              <Flame size={20} className="min-w-5" />
              <span className="ml-6">Trending</span>
            </NavLink>
            
            <NavLink
              to="/shopping"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100' : 'hover:bg-gray-100'
                }`
              }
            >
              <ShoppingBag size={20} className="min-w-5" />
              <span className="ml-6">Shopping</span>
            </NavLink>
            
            <NavLink
              to="/music"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100' : 'hover:bg-gray-100'
                }`
              }
            >
              <Music2 size={20} className="min-w-5" />
              <span className="ml-6">Music</span>
            </NavLink>
            
            <NavLink
              to="/movies"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100' : 'hover:bg-gray-100'
                }`
              }
            >
              <Film size={20} className="min-w-5" />
              <span className="ml-6">Movies & TV</span>
            </NavLink>
            
            <NavLink
              to="/gaming"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100' : 'hover:bg-gray-100'
                }`
              }
            >
              <Gamepad2 size={20} className="min-w-5" />
              <span className="ml-6">Gaming</span>
            </NavLink>
            
            <NavLink
              to="/news"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100' : 'hover:bg-gray-100'
                }`
              }
            >
              <Newspaper size={20} className="min-w-5" />
              <span className="ml-6">News</span>
            </NavLink>
            
            <NavLink
              to="/sports"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100' : 'hover:bg-gray-100'
                }`
              }
            >
              <Trophy size={20} className="min-w-5" />
              <span className="ml-6">Sports</span>
            </NavLink>
            
            <NavLink
              to="/learning"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100' : 'hover:bg-gray-100'
                }`
              }
            >
              <Lightbulb size={20} className="min-w-5" />
              <span className="ml-6">Learning</span>
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
                  isActive ? 'bg-gray-100' : 'hover:bg-gray-100'
                }`
              }
            >
              <Settings size={20} className="min-w-5" />
              <span className="ml-6">Settings</span>
            </NavLink>
            
            <NavLink
              to="/report"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100' : 'hover:bg-gray-100'
                }`
              }
            >
              <Flag size={20} className="min-w-5" />
              <span className="ml-6">Report history</span>
            </NavLink>
            
            <NavLink
              to="/help"
              className={({ isActive }) => 
                `flex items-center px-3 py-2 mx-2 rounded-lg ${
                  isActive ? 'bg-gray-100' : 'hover:bg-gray-100'
                }`
              }
            >
              <HelpCircle size={20} className="min-w-5" />
              <span className="ml-6">Help</span>
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