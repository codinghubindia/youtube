import React from 'react';
import { Clock, X } from 'lucide-react';
import { useYouTube } from '../context/YouTubeContext';

interface SearchHistoryProps {
  onSelect: (query: string) => void;
  isVisible: boolean;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ onSelect, isVisible }) => {
  const { searchHistory, clearSearchHistory } = useYouTube();

  if (!isVisible || searchHistory.length === 0) {
    return null;
  }

  return (
    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium">Recent searches</h3>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            clearSearchHistory();
          }}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Clear all
        </button>
      </div>
      <ul>
        {searchHistory.map((query, index) => (
          <li 
            key={index}
            onClick={() => onSelect(query)}
            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center">
              <Clock size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
              <span className="line-clamp-1">{query}</span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                // Remove this query from history
                const newHistory = [...searchHistory];
                newHistory.splice(index, 1);
                // This is a bit of a hack since we don't have a function to remove single items
                clearSearchHistory();
                if (newHistory.length > 0) {
                  // Force re-render with timeout
                  setTimeout(() => {
                    newHistory.forEach(q => {
                      onSelect(q);
                    });
                  }, 0);
                }
              }}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchHistory; 