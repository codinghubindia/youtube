import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  Mic, 
  Video, 
  Bell, 
  User,
  Search as SearchIcon,
  Upload,
  LogOut,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  ShieldAlert,
  Languages,
  ChevronRight,
  Brain,
  Lightbulb
} from 'lucide-react';
import { useYouTube } from '../context/YouTubeContext';
import SearchBar from './SearchBar';
import { useLearningMode } from '../context/LearningModeContext';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { darkMode, toggleDarkMode } = useYouTube();
  const { learningMode, toggleLearningMode } = useLearningMode();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mobile search toggle
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-[#0f0f0f] flex items-center justify-between px-4 z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="w-full max-w-screen-2xl mx-auto flex items-center justify-between">
        {/* Left section - Logo and hamburger menu */}
        {!mobileSearchOpen && (
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={20} className="dark:text-white" />
            </button>
            <Link to="/" className="flex items-center">
              <div className="flex items-center text-youtube-red">
                <svg 
                  viewBox="0 0 90 20" 
                  preserveAspectRatio="xMidYMid meet" 
                  className="h-6"
                >
                  <g viewBox="0 0 90 20">
                    <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z" fill="#FF0000" />
                    <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white" />
                  </g>
                  <g className="dark:text-white" fill="currentColor">
                    <path d="M34.6024 13.0036L31.3945 1.41846H34.1932L35.3174 6.6701C35.6043 7.96361 35.8136 9.06662 35.95 9.97913H36.0323C36.1264 9.32532 36.3381 8.22937 36.665 6.68892L37.8291 1.41846H40.6278L37.3799 13.0036V18.561H34.6001V13.0036H34.6024Z" />
                    <path d="M41.4697 18.1937C40.9053 17.8127 40.5031 17.22 40.2632 16.4157C40.0257 15.6114 39.9058 14.5437 39.9058 13.2078V11.3898C39.9058 10.0422 40.0422 8.95805 40.315 8.14196C40.5878 7.32588 41.0135 6.72851 41.592 6.35457C42.1706 5.98063 42.9302 5.79248 43.871 5.79248C44.7976 5.79248 45.5384 5.98298 46.0981 6.36398C46.6555 6.74497 47.0647 7.34234 47.3234 8.15137C47.5821 8.96275 47.7115 10.0422 47.7115 11.3898V13.2078C47.7115 14.5437 47.5845 15.6161 47.3329 16.4251C47.0812 17.2365 46.672 17.8292 46.1075 18.2031C45.5431 18.5771 44.7764 18.7652 43.8098 18.7652C42.8126 18.7675 42.0342 18.5747 41.4697 18.1937ZM44.6353 16.2323C44.7905 15.8231 44.8705 15.1575 44.8705 14.2309V10.3292C44.8705 9.43077 44.7929 8.77225 44.6353 8.35833C44.4777 7.94206 44.2026 7.7351 43.8074 7.7351C43.4265 7.7351 43.156 7.94206 43.0008 8.35833C42.8432 8.77461 42.7656 9.43077 42.7656 10.3292V14.2309C42.7656 15.1575 42.8408 15.8254 42.9914 16.2323C43.1419 16.6415 43.4123 16.8461 43.8074 16.8461C44.2026 16.8461 44.4777 16.6415 44.6353 16.2323Z" />
                    <path d="M56.8154 18.5634H54.6094L54.3648 17.03H54.3037C53.7039 18.1871 52.8055 18.7656 51.6061 18.7656C50.7759 18.7656 50.1621 18.4928 49.767 17.9496C49.3719 17.4039 49.1743 16.5526 49.1743 15.3955V6.03751H51.9942V15.2308C51.9942 15.7906 52.0553 16.188 52.1776 16.4256C52.2999 16.6631 52.5045 16.783 52.7914 16.783C53.036 16.783 53.2712 16.7078 53.497 16.5573C53.7228 16.4067 53.8874 16.2162 53.9979 15.9858V6.03516H56.8154V18.5634Z" />
                    <path d="M64.4755 3.68758H61.6768V18.5629H58.9181V3.68758H56.1194V1.42041H64.4755V3.68758Z" />
                    <path d="M71.2768 18.5634H69.0708L68.8262 17.03H68.7651C68.1654 18.1871 67.267 18.7656 66.0675 18.7656C65.2373 18.7656 64.6235 18.4928 64.2284 17.9496C63.8333 17.4039 63.6357 16.5526 63.6357 15.3955V6.03751H66.4556V15.2308C66.4556 15.7906 66.5167 16.188 66.639 16.4256C66.7613 16.6631 66.9659 16.783 67.2529 16.783C67.4974 16.783 67.7326 16.7078 67.9584 16.5573C68.1842 16.4067 68.3488 16.2162 68.4593 15.9858V6.03516H71.2768V18.5634Z" />
                    <path d="M80.609 8.0387C80.4373 7.24849 80.1621 6.67699 79.7812 6.32186C79.4002 5.96674 78.8757 5.79035 78.2078 5.79035C77.6904 5.79035 77.2059 5.93616 76.7567 6.23014C76.3075 6.52412 75.9594 6.90747 75.7148 7.38489H75.6937V0.785645H72.9773V18.5608H75.3056L75.5925 17.3755H75.6537C75.8724 17.7988 76.1993 18.1304 76.6344 18.3774C77.0695 18.622 77.554 18.7443 78.0855 18.7443C79.038 18.7443 79.7412 18.3045 80.1904 17.4272C80.6396 16.5475 80.8653 15.1695 80.8653 13.2941V11.3347C80.8653 9.9527 80.7783 8.87475 80.609 8.0387ZM77.9894 13.1492C77.9894 14.0617 77.9504 14.7767 77.8726 15.2941C77.7948 15.8115 77.6729 16.1808 77.5071 16.3971C77.3413 16.6158 77.1283 16.724 76.8726 16.724C76.6764 16.724 76.5075 16.6699 76.3628 16.5594C76.2182 16.449 76.1009 16.2866 76.0161 16.0722V8.96062C76.0816 8.6196 76.2146 8.34209 76.4108 8.12337C76.6070 7.90465 76.8271 7.79646 77.0792 7.79646C77.3313 7.79646 77.5284 7.90935 77.6736 8.13278C77.8188 8.35855 77.9159 8.73485 77.9699 9.26636C78.0239 9.79787 78.0479 10.5528 78.0479 11.5335V13.1492H77.9894Z" />
                    <path d="M84.8657 13.8712C84.8657 14.6755 84.8892 15.2776 84.9363 15.6798C84.9833 16.0819 85.0821 16.3736 85.2326 16.5594C85.3831 16.7428 85.6136 16.8345 85.9264 16.8345C86.3474 16.8345 86.639 16.6699 86.7942 16.343C86.9518 16.0161 87.0365 15.4705 87.0506 14.7085L89.4824 14.8519C89.4965 14.9601 89.5035 15.1106 89.5035 15.3011C89.5035 16.4582 89.186 17.3237 88.5534 17.8952C87.9208 18.4667 87.0247 18.7536 85.8676 18.7536C84.4777 18.7536 83.504 18.3185 82.9466 17.446C82.3869 16.5735 82.1094 15.2259 82.1094 13.4008V11.2136C82.1094 9.33452 82.3987 7.96105 82.9772 7.09558C83.5558 6.2301 84.5459 5.79736 85.9499 5.79736C86.9165 5.79736 87.6597 5.97375 88.1771 6.32888C88.6945 6.684 89.059 7.23433 89.2707 7.98457C89.4824 8.7348 89.5882 9.76961 89.5882 11.0913V13.2362H84.8657V13.8712ZM85.2232 7.96811C85.0797 8.14449 84.9857 8.43377 84.9363 8.83593C84.8892 9.2381 84.8657 9.84722 84.8657 10.6657V11.5641H86.9283V10.6657C86.9283 9.86133 86.9001 9.25221 86.846 8.83593C86.7919 8.41966 86.6931 8.12803 86.5496 7.95635C86.4062 7.78702 86.1851 7.7 85.8864 7.7C85.5854 7.70235 85.3643 7.79172 85.2232 7.96811Z" />
                  </g>
                </svg>
              </div>
            </Link>
          </div>
        )}

        {/* Middle section - Search bar */}
        <div className={`${mobileSearchOpen ? 'flex w-full' : 'hidden md:flex'} items-center flex-grow max-w-2xl mx-4`}>
          {mobileSearchOpen && (
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="p-2 mr-2 md:hidden rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Menu size={20} className="dark:text-white" />
            </button>
          )}
          <SearchBar />
          <button
            className="p-2 ml-4 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Search with voice"
          >
            <Mic size={20} className="dark:text-white" />
          </button>
        </div>

        {/* Right section - User controls */}
        {!mobileSearchOpen && (
          <div className="flex items-center">
            <button 
              onClick={() => setMobileSearchOpen(true)}
              className="p-2 mx-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 md:hidden transition-colors"
              aria-label="Search"
            >
              <SearchIcon size={20} className="dark:text-white" />
            </button>
            
            {/* Learning Mode Toggle Button - New design */}
            <div className="hidden md:block relative mx-2">
              <button 
                onClick={toggleLearningMode}
                className={`flex items-center px-3 py-1.5 rounded-full transition-all duration-300 ${
                  learningMode 
                    ? 'bg-gradient-to-r from-learning-primary to-learning-secondary text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <div className={`flex items-center transition-all duration-300 ${
                  learningMode ? 'mr-2' : 'mr-1'
                }`}>
                  {learningMode ? (
                    <Brain size={16} className={`${learningMode ? 'animate-pulse' : ''}`} />
                  ) : (
                    <Lightbulb size={16} />
                  )}
                </div>
                <span className="text-xs font-medium whitespace-nowrap">
                  Learning Mode
                </span>
                {!learningMode && (
                  <span className="ml-1 text-xs font-semibold text-learning-accent bg-learning-accent/10 px-1 rounded">NEW</span>
                )}
                {learningMode && (
                  <div className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-learning-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-learning-accent"></span>
                  </div>
                )}
              </button>
            </div>
            
            {/* Mobile Learning Mode Button */}
            <button 
              onClick={toggleLearningMode}
              className={`p-2 mx-1 rounded-full md:hidden transition-all duration-300 ${
                learningMode 
                  ? 'bg-gradient-to-r from-learning-primary to-learning-secondary text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              aria-label="Toggle learning mode"
            >
              {learningMode ? (
                <Brain size={20} className="animate-pulse" />
              ) : (
                <Lightbulb size={20} />
              )}
              {learningMode && (
                <div className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-learning-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-learning-accent"></span>
                </div>
              )}
            </button>
            
            <Link to="/coming-soon" className="p-2 mx-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors md:block hidden">
              <Video size={20} className="dark:text-white" />
            </Link>
            
            <Link to="/coming-soon" className="p-2 mx-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors md:block hidden">
              <Bell size={20} className="dark:text-white" />
            </Link>
            
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="p-2 mx-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Profile"
              >
                <User size={20} className="dark:text-white" />
              </button>
              
              {/* Profile dropdown menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#212121] rounded-xl shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                        <User size={20} className="text-gray-600 dark:text-gray-300" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium dark:text-white">Your Name</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">your.email@example.com</p>
                        <Link to="/channel" className="text-xs text-blue-600 dark:text-blue-400 mt-1 block">
                          Manage your Google Account
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <Link to="/channel" className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <User size={18} className="mr-3 dark:text-white" />
                      <span className="dark:text-white">Your channel</span>
                    </Link>
                    
                    <Link to="/coming-soon" className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Upload size={18} className="mr-3 dark:text-white" />
                      <span className="dark:text-white">Upload video</span>
                    </Link>
                    
                    <Link to="/settings" className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Settings size={18} className="mr-3 dark:text-white" />
                      <span className="dark:text-white">Settings</span>
                    </Link>
                    
                    <button 
                      onClick={toggleDarkMode}
                      className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center">
                        {darkMode ? (
                          <Sun size={18} className="mr-3 text-white" />
                        ) : (
                          <Moon size={18} className="mr-3" />
                        )}
                        <span className="dark:text-white">Appearance</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">
                          {darkMode ? 'Dark' : 'Light'}
                        </span>
                        <ChevronRight size={16} className="text-gray-500 dark:text-gray-400" />
                      </div>
                    </button>
                    
                    {/* Learning Mode Toggle in Profile Menu - Updated Design */}
                    <button 
                      onClick={toggleLearningMode}
                      className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center">
                        {learningMode ? (
                          <Brain size={18} className="mr-3 text-learning-primary dark:text-learning-accent" />
                        ) : (
                          <Lightbulb size={18} className="mr-3 dark:text-white" />
                        )}
                        <div>
                          <span className="dark:text-white">Learning Mode</span>
                          <span className="ml-1 text-xs font-semibold text-learning-accent bg-learning-accent/10 px-1 rounded">NEW</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
                          learningMode ? 'bg-learning-primary dark:bg-learning-accent' : 'bg-gray-300 dark:bg-gray-600'
                        }`}>
                          <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow transition-transform duration-300 ${
                            learningMode ? 'transform translate-x-5' : ''
                          }`}></div>
                        </div>
                      </div>
                    </button>
                    
                    <Link to="/coming-soon" className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Languages size={18} className="mr-3 dark:text-white" />
                      <span className="dark:text-white">Language</span>
                    </Link>
                    
                    <Link to="/help" className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <HelpCircle size={18} className="mr-3 dark:text-white" />
                      <span className="dark:text-white">Help</span>
                    </Link>
                    
                    <Link to="/coming-soon" className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <ShieldAlert size={18} className="mr-3 dark:text-white" />
                      <span className="dark:text-white">Send feedback</span>
                    </Link>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                    <Link to="/" className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <LogOut size={18} className="mr-3 dark:text-white" />
                      <span className="dark:text-white">Sign out</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;