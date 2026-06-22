import { useState, useEffect, useCallback, useRef } from 'react';
import { getCitySuggestions, searchNearbyCities } from '../services/weatherApi';
import { fuzzySearchCities } from '../data/popularCities';

export const useCitySuggestions = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchMode, setSearchMode] = useState('local'); // 'local' or 'api'
  const timeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // ✅ Don't fetch if query is empty or too short
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
      return;
    }

    // ✅ FIRST: Try local fuzzy search (instant)
    const localResults = fuzzySearchCities(query);
    
    if (localResults.length > 0) {
      // Show local results immediately
      setSuggestions(localResults);
      setShowSuggestions(true);
      setLoading(false);
      setSearchMode('local');
      
      // Then try API for more accurate results
      fetchFromAPI(query);
    } else {
      // No local results, show loading and fetch from API
      setSuggestions([]);
      setShowSuggestions(true); // Show dropdown with loading
      setLoading(true);
      setSearchMode('api');
      
      // Debounce API call
      timeoutRef.current = setTimeout(() => {
        fetchFromAPI(query);
      }, 300);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query]);

  const fetchFromAPI = async (searchQuery) => {
    try {
      setLoading(true);
      
      // Create new AbortController
      abortControllerRef.current = new AbortController();
      
      // Try main API first, then nearby search
      let results = await getCitySuggestions(searchQuery);
      
      // If no results from main API, try nearby/broader search
      if (results.length === 0) {
        results = await searchNearbyCities(searchQuery);
      }
      
      // ✅ Merge with local results to avoid duplicates
      setSuggestions(prev => {
        const allResults = [...prev, ...results];
        const uniqueResults = allResults.filter((city, index, self) =>
          index === self.findIndex((c) => 
            c.name === city.name && c.country === city.country
          )
        );
        return uniqueResults.slice(0, 6); // Limit to 6 suggestions
      });
      
      setShowSuggestions(true);
      setSearchMode('api');
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching suggestions:', error);
        // Keep showing local results if available
        if (suggestions.length === 0) {
          setShowSuggestions(false);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuery = useCallback((newQuery) => {
    setQuery(newQuery);
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setShowSuggestions(false);
    setQuery('');
    setLoading(false);
  }, []);

  const hideSuggestions = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  return {
    query,
    suggestions,
    loading,
    showSuggestions,
    searchMode,
    updateQuery,
    clearSuggestions,
    hideSuggestions,
  };
};