import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { useYouTube } from '../context/YouTubeContext';
import { searchVideos } from '../utils/api';
import SearchHistory from './SearchHistory';

interface SearchSuggestion {
  title: string;
  thumbnail?: string;
}

const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery, searchHistory } = useYouTube();
  const [inputValue, setInputValue] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const suggestionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle click outside suggestions to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch suggestions when input changes
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (inputValue.trim().length > 2) {
      setLoading(true);
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const videos = await searchVideos(inputValue, 5);
          
          const newSuggestions = videos.map(video => ({
            title: video.snippet.title,
            thumbnail: video.snippet.thumbnails.default.url
          }));
          
          setSuggestions(newSuggestions);
          setShowSuggestions(true);
          setShowHistory(false);
        } catch (error) {
          console.error("Failed to fetch suggestions:", error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, 500);
    } else if (inputValue.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      // Show history instead if we have any
      setShowHistory(searchHistory.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setShowHistory(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, searchHistory]);

  const handleSearch = (e: React.FormEvent | string) => {
    if (typeof e !== 'string') {
      e.preventDefault();
    }
    
    const query = typeof e === 'string' ? e : inputValue;
    
    if (query.trim()) {
      setSearchQuery(query);
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
      setShowHistory(false);
      setInputValue(query); // Update input value for history selections
    }
  };

  const clearInput = () => {
    setInputValue('');
    inputRef.current?.focus();
    // Show history when clearing
    setShowHistory(searchHistory.length > 0);
    setShowSuggestions(false);
  };

  const handleHistorySelect = (query: string) => {
    setInputValue(query);
    handleSearch(query);
  };

  const handleInputFocus = () => {
    // If input is empty, show search history instead of suggestions
    if (inputValue.trim() === '') {
      setShowHistory(searchHistory.length > 0);
      setShowSuggestions(false);
    } else if (inputValue.trim().length > 2) {
      setShowSuggestions(true);
      setShowHistory(false);
    }
  };

  return (
    <div className="relative flex-grow max-w-2xl" ref={suggestionRef}>
      <form onSubmit={handleSearch} className="flex w-full">
        <div className="relative flex-grow">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={handleInputFocus}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-l-full focus:outline-none focus:border-blue-500"
          />
          {inputValue && (
            <button
              type="button"
              onClick={clearInput}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-full hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <Search size={20} className="dark:text-white" />
        </button>
      </form>

      {/* Search history dropdown */}
      <SearchHistory 
        isVisible={showHistory} 
        onSelect={handleHistorySelect}
      />

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((suggestion, index) => (
                <li 
                  key={index}
                  onClick={() => handleSearch(suggestion.title)}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center"
                >
                  <Search size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
                  <div className="flex items-center">
                    {suggestion.thumbnail && (
                      <img 
                        src={suggestion.thumbnail} 
                        alt="" 
                        className="w-8 h-8 rounded mr-2 object-cover"
                      />
                    )}
                    <span className="line-clamp-1">{suggestion.title}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : inputValue.trim().length > 0 ? (
            <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
              No results found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 