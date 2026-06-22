import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaMapMarkerAlt, FaTimes, FaSpinner } from 'react-icons/fa';
import { useCitySuggestions } from '../hooks/useCitySuggestions';
import './SearchBar.css';

const SearchBar = ({ onSearch, onGetLocation, loading }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  const {
    suggestions,
    loading: suggestionsLoading,
    showSuggestions,
    searchMode,
    updateQuery,
    clearSuggestions,
    hideSuggestions,
  } = useCitySuggestions();

  useEffect(() => {
    updateQuery(inputValue);
    setSelectedIndex(-1);
  }, [inputValue, updateQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current && 
        !inputRef.current.contains(event.target)
      ) {
        hideSuggestions();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [hideSuggestions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
      hideSuggestions();
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    const cityName = suggestion.name;
    setInputValue(cityName);
    onSearch(cityName);
    clearSuggestions();
  };

  const handleClearInput = () => {
    setInputValue('');
    clearSuggestions();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || !suggestions.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          e.preventDefault();
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      
      case 'Escape':
        hideSuggestions();
        setSelectedIndex(-1);
        break;
      
      default:
        break;
    }
  };

  // Highlight matching text in suggestion
  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? <strong key={index} className="highlight">{part}</strong> : part
    );
  };

  const shouldShowDropdown = showSuggestions && inputValue.trim().length > 0;

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="input-wrapper">
          <FaSearch className="search-icon-left" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (inputValue.trim().length >= 2 && suggestions.length > 0) {
                updateQuery(inputValue);
              }
            }}
            placeholder="Search for a city..."
            className="search-input"
            disabled={loading}
            autoComplete="off"
          />
          
          {inputValue && (
            <button 
              type="button" 
              className="clear-button-input"
              onClick={handleClearInput}
            >
              <FaTimes />
            </button>
          )}
        </div>
        
        <button type="submit" className="search-button" disabled={loading}>
          <FaSearch /> Search
        </button>
        
        <button
          type="button"
          className="location-button"
          onClick={onGetLocation}
          disabled={loading}
          title="Get current location weather"
        >
          <FaMapMarkerAlt />
        </button>
      </form>

      {/* ✅ Suggestions Dropdown with Loading State */}
      {shouldShowDropdown && (
        <div className="suggestions-dropdown" ref={suggestionsRef}>
          {/* ✅ Loading Indicator */}
          {suggestionsLoading && (
            <div className="suggestions-loading-indicator">
              <FaSpinner className="spinner-icon" />
              <span>Searching cities...</span>
            </div>
          )}
          
          {/* City Suggestions */}
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.name}-${suggestion.country}-${index}`}
              className={`suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="suggestion-city">
                {highlightMatch(suggestion.name, inputValue)}
              </span>
              <span className="suggestion-state">{suggestion.state}</span>
              <span className="suggestion-country">{suggestion.country}</span>
            </div>
          ))}
          
          {/* No Results Message */}
          {!suggestionsLoading && suggestions.length === 0 && (
            <div className="no-suggestions">
              <p>No cities found for "{inputValue}"</p>
              <p className="no-suggestions-hint">
                Try checking spelling or use a different name
              </p>
            </div>
          )}
          
          {/* Search Mode Indicator */}
          {suggestions.length > 0 && (
            <div className="suggestions-footer">
              {searchMode === 'local' ? (
                <span>⚡ Quick suggestions</span>
              ) : (
                <span>🌐 From OpenWeatherMap</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;