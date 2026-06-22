// ✅ Local database of popular cities for instant suggestions
export const popularCities = [
  { name: "London", country: "GB", state: "England", fullName: "London, England, GB" },
  { name: "New York", country: "US", state: "New York", fullName: "New York, New York, US" },
  { name: "Tokyo", country: "JP", state: "", fullName: "Tokyo, JP" },
  { name: "Paris", country: "FR", state: "Île-de-France", fullName: "Paris, Île-de-France, FR" },
  { name: "Dubai", country: "AE", state: "", fullName: "Dubai, AE" },
  { name: "Singapore", country: "SG", state: "", fullName: "Singapore, SG" },
  { name: "Sydney", country: "AU", state: "New South Wales", fullName: "Sydney, New South Wales, AU" },
  { name: "Mumbai", country: "IN", state: "Maharashtra", fullName: "Mumbai, Maharashtra, IN" },
  { name: "Toronto", country: "CA", state: "Ontario", fullName: "Toronto, Ontario, CA" },
  { name: "Berlin", country: "DE", state: "", fullName: "Berlin, DE" },
  { name: "Moscow", country: "RU", state: "", fullName: "Moscow, RU" },
  { name: "Beijing", country: "CN", state: "", fullName: "Beijing, CN" },
  { name: "Rome", country: "IT", state: "Lazio", fullName: "Rome, Lazio, IT" },
  { name: "Madrid", country: "ES", state: "", fullName: "Madrid, ES" },
  { name: "Amsterdam", country: "NL", state: "", fullName: "Amsterdam, NL" },
  { name: "Bangkok", country: "TH", state: "", fullName: "Bangkok, TH" },
  { name: "Istanbul", country: "TR", state: "", fullName: "Istanbul, TR" },
  { name: "Seoul", country: "KR", state: "", fullName: "Seoul, KR" },
  { name: "Los Angeles", country: "US", state: "California", fullName: "Los Angeles, California, US" },
  { name: "Chicago", country: "US", state: "Illinois", fullName: "Chicago, Illinois, US" },
  { name: "Colombo", country: "LK", state: "Western", fullName: "Colombo, Western, LK" },
  { name: "Kandy", country: "LK", state: "Central", fullName: "Kandy, Central, LK" },
  { name: "Delhi", country: "IN", state: "Delhi", fullName: "Delhi, Delhi, IN" },
  { name: "Shanghai", country: "CN", state: "", fullName: "Shanghai, CN" },
  { name: "São Paulo", country: "BR", state: "São Paulo", fullName: "São Paulo, São Paulo, BR" },
];

// ✅ Fuzzy search function
export const fuzzySearchCities = (query) => {
  if (!query || query.trim().length < 2) return [];
  
  const normalizedQuery = query.trim().toLowerCase();
  
  // Score each city based on match quality
  const scored = popularCities.map(city => {
    let score = 0;
    const cityName = city.name.toLowerCase();
    const country = city.country.toLowerCase();
    const fullName = city.fullName.toLowerCase();
    
    // Exact match
    if (cityName === normalizedQuery) score += 100;
    
    // Starts with
    if (cityName.startsWith(normalizedQuery)) score += 50;
    
    // Contains
    if (cityName.includes(normalizedQuery)) score += 30;
    
    // Country match
    if (country.includes(normalizedQuery)) score += 20;
    
    // Full name contains
    if (fullName.includes(normalizedQuery)) score += 10;
    
    // Levenshtein distance (fuzzy matching)
    const distance = levenshteinDistance(cityName, normalizedQuery);
    if (distance <= 2) score += (3 - distance) * 15; // Bonus for close matches
    
    return { city, score };
  });
  
  // Filter and sort by score
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.city);
};

// ✅ Levenshtein distance for fuzzy matching
function levenshteinDistance(str1, str2) {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) track[0][i] = i;
  for (let j = 0; j <= str2.length; j++) track[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  
  return track[str2.length][str1.length];
}