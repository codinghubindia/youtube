import React from 'react';
import { useLocation } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComingSoonPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract the page name from the path for display
  const pageName = location.pathname.substring(1)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <Construction size={80} className="text-gray-400 dark:text-gray-500 mb-6" />
      
      <h1 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
        {pageName} Coming Soon
      </h1>
      
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mb-8">
        We're working hard to bring you this feature. Please check back later!
      </p>
      
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition-colors"
      >
        <ArrowLeft size={18} />
        Go Back
      </button>
    </div>
  );
};

export default ComingSoonPage; 