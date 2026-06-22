import { useEffect } from 'react';
import { useWeather } from './hooks/useWeather';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import RecentSearches from './components/RecentSearches';
import './App.css';

function App() {
  const {
    weather,
    loading,
    error,
    recentSearches,
    fetchWeather,
    fetchWeatherByLocation,
    clearRecentSearches,
  } = useWeather();

  useEffect(() => {
    if (weather) {
      document.title = `Weather in ${weather.name} - ${Math.round(weather.main.temp)}°C`;
    }
    
    return () => {
      document.title = 'City Weather Search';
    };
  }, [weather]);

  return (
    <div className="app">
      <div className="container">
        <header className="app-header">
          <h1>🌤️ City Weather Search</h1>
          <p>Search any city to get current weather conditions</p>
        </header>

        {/* ✅ Pass recentSearches to SearchBar */}
        <SearchBar 
          onSearch={fetchWeather} 
          onGetLocation={fetchWeatherByLocation}
          loading={loading}
          recentSearches={recentSearches}
        />

        {loading && <LoadingSpinner />}
        
        {error && !loading && (
          <ErrorMessage 
            message={error} 
            onRetry={() => weather && fetchWeather(weather.name)}
          />
        )}
        
        {weather && !loading && !error && (
          <WeatherCard weather={weather} />
        )}

        <RecentSearches 
          searches={recentSearches}
          onSelect={fetchWeather}
          onClear={clearRecentSearches}
        />

        {!weather && !loading && !error && (
          <div className="welcome-message">
            <p>Start typing a city name to see suggestions!</p>
            <p>Or click the location icon 📍 to use your current location</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;