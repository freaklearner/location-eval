import { useState, useCallback } from 'react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAAUI6vIUmLQT7qwVr_CcDI-4pZpOcEEHg';
const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

// Note: Direct API calls from frontend will face CORS issues
// In production, these calls should be made from a backend server
// DEMO_MODE REMOVED - Application will only work with live backend or fail with proper error

const useGoogleMapsAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to add delay between API calls
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Helper functions for calculations
  const calculateAverageRating = (places) => {
    const ratedPlaces = places.filter(p => p.rating);
    if (ratedPlaces.length === 0) return 0;
    const total = ratedPlaces.reduce((sum, place) => sum + place.rating, 0);
    return Math.round((total / ratedPlaces.length) * 10) / 10;
  };

  const calculateOverallAverageRating = (businesses) => {
    const allPlaces = Object.values(businesses).flat();
    return calculateAverageRating(allPlaces);
  };

  const calculateBusinessDensity = (businesses) => {
    const totalBusinesses = Object.values(businesses).reduce((sum, places) => sum + places.length, 0);
    if (totalBusinesses > 100) return 'High';
    if (totalBusinesses > 50) return 'Medium';
    if (totalBusinesses > 20) return 'Low';
    return 'Very Low';
  };

  const calculateCompetitionLevel = (restaurants, food) => {
    const totalFoodPlaces = (restaurants?.length || 0) + (food?.length || 0);
    if (totalFoodPlaces > 20) return 'High';
    if (totalFoodPlaces > 10) return 'Medium';
    if (totalFoodPlaces > 5) return 'Low';
    return 'Very Low';
  };

  // Generate demo data for testing
  const generateDemoData = (lat, lng, radius) => {
    const demoBusinesses = {
      restaurants: [
        { name: "McDonald's", rating: 4.2, vicinity: "Near location", place_id: "demo1", user_ratings_total: 150 },
        { name: "Subway", rating: 4.0, vicinity: "0.3 km away", place_id: "demo2", user_ratings_total: 89 },
        { name: "Local Dhaba", rating: 4.5, vicinity: "0.5 km away", place_id: "demo3", user_ratings_total: 45 },
        { name: "Pizza Hut", rating: 3.8, vicinity: "0.7 km away", place_id: "demo4", user_ratings_total: 200 }
      ],
      food: [
        { name: "Street Food Corner", rating: 4.3, vicinity: "0.2 km away", place_id: "demo5", user_ratings_total: 67 },
        { name: "Fresh Juice Bar", rating: 4.1, vicinity: "0.4 km away", place_id: "demo6", user_ratings_total: 34 }
      ],
      schools: [
        { name: "ABC Public School", rating: 4.0, vicinity: "0.8 km away", place_id: "demo7", user_ratings_total: 25 },
        { name: "XYZ College", rating: 4.2, vicinity: "1.2 km away", place_id: "demo8", user_ratings_total: 45 }
      ],
      universities: [
        { name: "City University", rating: 4.4, vicinity: "2.0 km away", place_id: "demo9", user_ratings_total: 156 }
      ],
      hospitals: [
        { name: "City Hospital", rating: 4.1, vicinity: "1.5 km away", place_id: "demo10", user_ratings_total: 89 },
        { name: "Health Clinic", rating: 4.0, vicinity: "0.9 km away", place_id: "demo11", user_ratings_total: 23 }
      ],
      gas_stations: [
        { name: "HP Petrol Pump", rating: 4.0, vicinity: "0.6 km away", place_id: "demo12", user_ratings_total: 45 },
        { name: "Indian Oil", rating: 3.9, vicinity: "1.1 km away", place_id: "demo13", user_ratings_total: 67 }
      ],
      shopping_malls: [
        { name: "City Mall", rating: 4.3, vicinity: "1.8 km away", place_id: "demo14", user_ratings_total: 234 }
      ],
      gyms: [
        { name: "Fitness First", rating: 4.2, vicinity: "0.7 km away", place_id: "demo15", user_ratings_total: 78 },
        { name: "Local Gym", rating: 3.8, vicinity: "0.4 km away", place_id: "demo16", user_ratings_total: 34 }
      ],
      banks: [
        { name: "SBI Bank", rating: 3.9, vicinity: "0.5 km away", place_id: "demo17", user_ratings_total: 89 },
        { name: "HDFC Bank", rating: 4.1, vicinity: "0.8 km away", place_id: "demo18", user_ratings_total: 123 }
      ],
      atms: [
        { name: "SBI ATM", rating: 3.7, vicinity: "0.3 km away", place_id: "demo19", user_ratings_total: 12 },
        { name: "ICICI ATM", rating: 3.8, vicinity: "0.6 km away", place_id: "demo20", user_ratings_total: 8 }
      ]
    };

    const demoBrands = {
      "McDonald's": [{ name: "McDonald's", rating: 4.2, vicinity: "Near location" }],
      "KFC": [],
      "Domino's": [{ name: "Domino's Pizza", rating: 4.0, vicinity: "1.2 km away" }],
      "Pizza Hut": [{ name: "Pizza Hut", rating: 3.8, vicinity: "0.7 km away" }],
      "Subway": [{ name: "Subway", rating: 4.0, vicinity: "0.3 km away" }],
      "Haldiram's": [],
      "CCD": [],
      "Starbucks": [],
      "Burger King": [],
      "H&M": [],
      "Zara": [],
      "Reliance Trends": [{ name: "Reliance Trends", rating: 4.1, vicinity: "1.5 km away" }],
      "Max Fashion": [],
      "Nike": [],
      "Adidas": [],
      "Bata": [{ name: "Bata Store", rating: 3.9, vicinity: "1.0 km away" }],
      "Liberty Shoes": [],
      "DMart": [],
      "Big Bazaar": [],
      "Reliance Fresh": [{ name: "Reliance Fresh", rating: 4.2, vicinity: "0.9 km away" }]
    };

    return { businesses: demoBusinesses, brands: demoBrands };
  };

  // Generate summary statistics
  const generateSummary = useCallback((businesses, brands) => {
    const summary = {};

    // Business type summaries
    Object.entries(businesses).forEach(([key, places]) => {
      summary[key] = {
        count: places.length,
        averageRating: calculateAverageRating(places),
        highRatedCount: places.filter(p => p.rating >= 4.0).length,
        popularPlaces: places.filter(p => (p.user_ratings_total || 0) > 100).length
      };
    });

    // Brand presence summary
    summary.brandPresence = {};
    Object.entries(brands).forEach(([brand, places]) => {
      summary.brandPresence[brand] = {
        present: places.length > 0,
        count: places.length,
        locations: places.map(p => ({
          name: p.name,
          rating: p.rating,
          vicinity: p.vicinity
        }))
      };
    });

    // Calculate overall metrics
    summary.overall = {
      totalBusinesses: Object.values(businesses).reduce((sum, places) => sum + places.length, 0),
      premiumBrandCount: Object.values(brands).reduce((sum, places) => sum + places.length, 0),
      averageBusinessRating: calculateOverallAverageRating(businesses),
      businessDensity: calculateBusinessDensity(businesses),
      competitionLevel: calculateCompetitionLevel(businesses.restaurants, businesses.food)
    };

    return summary;
  }, [calculateOverallAverageRating, calculateBusinessDensity, calculateCompetitionLevel]);

  // Helper function to make API calls with error handling
  const makeAPICall = useCallback(async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.status === 'OVER_QUERY_LIMIT') {
        throw new Error('API quota exceeded. Please try again later.');
      }
      
      if (data.status === 'REQUEST_DENIED') {
        throw new Error('API request denied. Please check your API key.');
      }
      
      return data;
    } catch (err) {
      console.error('API call failed:', err);
      throw err;
    }
  }, []);

  // Find nearby businesses by type
  const findNearbyBusinesses = useCallback(async (lat, lng, type, radius = 1000) => {
    console.log(`🔍 Searching for ${type} near ${lat},${lng} within ${radius}m`);
    const url = `${BASE_URL}/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_MAPS_API_KEY}`;
    const result = await makeAPICall(url);
    console.log(`✅ Found ${result?.results?.length || 0} ${type} locations`);
    return result;
  }, [makeAPICall]);

  // Search for specific brands or keywords
  const searchByText = useCallback(async (lat, lng, query, radius = 1000) => {
    console.log(`🏷️ Searching for "${query}" near ${lat},${lng} within ${radius}m`);
    const url = `${BASE_URL}/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=${radius}&key=${GOOGLE_MAPS_API_KEY}`;
    const result = await makeAPICall(url);
    console.log(`✅ Found ${result?.results?.length || 0} "${query}" locations`);
    return result;
  }, [makeAPICall]);

  // Get place details
  const getPlaceDetails = useCallback(async (placeId) => {
    console.log(`📍 Getting details for place: ${placeId}`);
    const url = `${BASE_URL}/details/json?place_id=${placeId}&fields=name,rating,price_level,types,vicinity,user_ratings_total&key=${GOOGLE_MAPS_API_KEY}`;
    const result = await makeAPICall(url);
    console.log(`✅ Retrieved details for: ${result?.result?.name || 'Unknown'}`);
    return result;
  }, [makeAPICall]);

  // Get location info from coordinates
  const getLocationInfo = useCallback(async (lat, lng) => {
    console.log(`🗺️ Getting location info for coordinates: ${lat},${lng}`);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    const result = await makeAPICall(url);
    console.log(`✅ Retrieved location: ${result?.results?.[0]?.formatted_address || 'Unknown'}`);
    return result;
  }, [makeAPICall]);

  // Comprehensive location analysis
  const analyzeLocation = useCallback(async (lat, lng, radius = 1000, onProgress) => {
    setLoading(true);
    setError(null);

    try {
      const analysis = {
        coordinates: { lat, lng, radius },
        businesses: {},
        summary: {},
        brands: {},
        rawData: {}
      };

      // Always use live backend - no demo mode fallback
      {
        const searchTypes = [
          { key: 'restaurants', type: 'restaurant' },
          { key: 'food', type: 'food' },
          { key: 'schools', type: 'school' },
          { key: 'universities', type: 'university' },
          { key: 'hospitals', type: 'hospital' },
          { key: 'gas_stations', type: 'gas_station' },
          { key: 'shopping_malls', type: 'shopping_mall' },
          { key: 'gyms', type: 'gym' },
          { key: 'banks', type: 'bank' },
          { key: 'atms', type: 'atm' }
        ];

        const brandSearches = [
          'McDonald\'s', 'KFC', 'Domino\'s', 'Pizza Hut', 'Subway',
          'Haldiram\'s', 'CCD', 'Starbucks', 'Burger King',
          'H&M', 'Zara', 'Reliance Trends', 'Max Fashion',
          'Nike', 'Adidas', 'Bata', 'Liberty Shoes',
          'DMart', 'Big Bazaar', 'Reliance Fresh'
        ];

        let progressCount = 0;
        const totalSteps = searchTypes.length + brandSearches.length;

        // Search by business types
        for (const { key, type } of searchTypes) {
          try {
            onProgress?.(`Searching for ${type.replace('_', ' ')}...`);
            const result = await findNearbyBusinesses(lat, lng, type, radius);
            analysis.businesses[key] = result.results || [];
            analysis.rawData[key] = result;
            
            progressCount++;
            onProgress?.(`Progress: ${Math.round((progressCount / totalSteps) * 100)}%`);
            
            await delay(200);
          } catch (err) {
            console.warn(`Failed to search for ${type}:`, err);
            analysis.businesses[key] = [];
          }
        }

        // Search for specific brands
        for (const brand of brandSearches) {
          try {
            onProgress?.(`Searching for ${brand}...`);
            const result = await searchByText(lat, lng, brand, radius);
            analysis.brands[brand] = result.results || [];
            
            progressCount++;
            onProgress?.(`Progress: ${Math.round((progressCount / totalSteps) * 100)}%`);
            
            await delay(200);
          } catch (err) {
            console.warn(`Failed to search for ${brand}:`, err);
            analysis.brands[brand] = [];
          }
        }
      }

      // Generate summary statistics
      analysis.summary = generateSummary(analysis.businesses, analysis.brands);

      return analysis;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [findNearbyBusinesses, searchByText, generateSummary, calculateOverallAverageRating]);

  return {
    loading,
    error,
    findNearbyBusinesses,
    searchByText,
    getPlaceDetails,
    getLocationInfo,
    analyzeLocation,
    clearError: () => setError(null),
    isDemoMode: false // Demo mode completely removed
  };
};

export default useGoogleMapsAPI; 