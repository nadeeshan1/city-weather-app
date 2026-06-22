import axios from 'axios';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = import.meta.env.VITE_WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

const weatherApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

const geoApi = axios.create({
  baseURL: GEO_URL,
  timeout: 5000,
});

// ✅ Cache for suggestions to reduce API calls
const suggestionsCache = new Map();

export const getWeatherByCity = async (city) => {
  try {
    const response = await weatherApi.get('/weather', {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('City not found. Please check the city name.');
      } else if (error.response.status === 401) {
        throw new Error('Invalid API key. Please check your configuration.');
      }
    }
    throw new Error('Failed to fetch weather data. Please try again.');
  }
};

export const getWeatherByCoordinates = async (lat, lon) => {
  try {
    const response = await weatherApi.get('/weather', {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch weather data for your location.');
  }
};

// ✅ IMPROVED: Fuzzy city search with caching
export const getCitySuggestions = async (query) => {
  try {
    // Normalize the query
    const normalizedQuery = query.trim().toLowerCase();
    
    // Check cache first
    const cacheKey = normalizedQuery;
    if (suggestionsCache.has(cacheKey)) {
      console.log('🟢 Using cached suggestions for:', normalizedQuery);
      return suggestionsCache.get(cacheKey);
    }
    
    // Try multiple search strategies
    let suggestions = [];
    
    // Strategy 1: Direct search
    const response = await geoApi.get('/direct', {
      params: {
        q: query.trim(),
        limit: 5,
        appid: API_KEY,
      },
    });
    
    suggestions = response.data;
    
    // Strategy 2: If no results, try with common corrections
    if (suggestions.length === 0) {
      // Remove extra spaces and special characters
      const cleanedQuery = query.trim().replace(/[^a-zA-Z\s]/g, '');
      
      if (cleanedQuery !== query.trim()) {
        const retryResponse = await geoApi.get('/direct', {
          params: {
            q: cleanedQuery,
            limit: 5,
            appid: API_KEY,
          },
        });
        suggestions = retryResponse.data;
      }
    }
    
    // Format the response
    const formattedSuggestions = suggestions.map(city => ({
      name: city.name,
      country: city.country,
      state: city.state || '',
      fullName: `${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}`,
      lat: city.lat,
      lon: city.lon,
    }));
    
    // ✅ Remove duplicates based on name+country
    const uniqueSuggestions = formattedSuggestions.filter((city, index, self) =>
      index === self.findIndex((c) => 
        c.name === city.name && c.country === city.country
      )
    );
    
    // Cache the results (expire after 5 minutes)
    suggestionsCache.set(cacheKey, uniqueSuggestions);
    setTimeout(() => {
      suggestionsCache.delete(cacheKey);
    }, 5 * 60 * 1000);
    
    return uniqueSuggestions;
  } catch (error) {
    console.error('Error fetching city suggestions:', error);
    return [];
  }
};

// ✅ NEW: Search by partial match (for nearby/related cities)
export const searchNearbyCities = async (query) => {
  try {
    // Use both direct and contains search
    const [directResults, broadResults] = await Promise.all([
      geoApi.get('/direct', {
        params: {
          q: query.trim(),
          limit: 3,
          appid: API_KEY,
        },
      }),
      // Add a broader search if needed
      geoApi.get('/direct', {
        params: {
          q: query.trim().split(' ')[0], // Search by first word
          limit: 3,
          appid: API_KEY,
        },
      }).catch(() => ({ data: [] })),
    ]);
    
    // Combine and deduplicate
    const allResults = [...directResults.data, ...broadResults.data];
    const uniqueResults = allResults.filter((city, index, self) =>
      index === self.findIndex((c) => 
        c.name === city.name && c.country === city.country
      )
    );
    
    return uniqueResults.slice(0, 5).map(city => ({
      name: city.name,
      country: city.country,
      state: city.state || '',
      fullName: `${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}`,
      lat: city.lat,
      lon: city.lon,
    }));
  } catch (error) {
    console.error('Error in broad search:', error);
    return [];
  }
};