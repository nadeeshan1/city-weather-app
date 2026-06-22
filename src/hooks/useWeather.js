import { useState, useCallback } from 'react';
import { getWeatherByCity } from '../services/weatherApi';

export const useWeather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });

  const saveToRecentSearches = (city) => {
    setRecentSearches(prev => {
      const updated = [city, ...prev.filter(c => c !== city)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  };

  const fetchWeather = useCallback(async (city) => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getWeatherByCity(city.trim());
      setWeather(data);
      saveToRecentSearches(city.trim());
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearWeather = () => {
    setWeather(null);
    setError(null);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return {
    weather,
    loading,
    error,
    recentSearches,
    fetchWeather,
    clearWeather,
    clearRecentSearches,
  };
};