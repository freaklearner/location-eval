import axios from 'axios';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAAUI6vIUmLQT7qwVr_CcDI-4pZpOcEEHg';
const PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

// Define place types for different evaluation parameters
const PLACE_TYPES = {
  food_establishments: ['restaurant', 'meal_takeaway', 'food', 'bakery', 'cafe'],
  clothing_stores: ['clothing_store', 'shoe_store', 'shopping_mall'],
  schools_colleges: ['school', 'university', 'secondary_school', 'primary_school'],
  petrol_stations: ['gas_station'],
  businesses_offices: ['establishment', 'point_of_interest'],
  hospitals_clinics: ['hospital', 'doctor', 'pharmacy', 'physiotherapist'],
  gyms_fitness: ['gym', 'spa'],
  shopping: ['shopping_mall', 'supermarket', 'grocery_or_supermarket', 'store'],
  entertainment: ['movie_theater', 'night_club', 'bar', 'amusement_park']
};

class GoogleMapsService {
  constructor() {
    this.apiKey = GOOGLE_MAPS_API_KEY;
  }

  // Search for nearby places using Google Places API
  async searchNearbyPlaces(latitude, longitude, radius = 1000, type = null) {
    try {
      const url = `${PLACES_API_BASE_URL}/nearbysearch/json`;
      const params = {
        location: `${latitude},${longitude}`,
        radius: radius,
        key: this.apiKey
      };

      if (type) {
        params.type = type;
      }

      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      throw error;
    }
  }

  // Get place details including reviews and ratings
  async getPlaceDetails(placeId) {
    try {
      const url = `${PLACES_API_BASE_URL}/details/json`;
      const params = {
        place_id: placeId,
        fields: 'name,rating,user_ratings_total,price_level,types,vicinity,photos',
        key: this.apiKey
      };

      const response = await axios.get(url, { params });
      return response.data.result;
    } catch (error) {
      console.error('Error fetching place details:', error);
      throw error;
    }
  }

  // Comprehensive location analysis
  async analyzeLocation(latitude, longitude, radius = 1000) {
    try {
      const analysis = {
        coordinates: { latitude, longitude, radius },
        nearby_places: {},
        summary: {}
      };

      // Search for different types of establishments
      for (const [category, types] of Object.entries(PLACE_TYPES)) {
        analysis.nearby_places[category] = [];
        
        for (const type of types) {
          try {
            const places = await this.searchNearbyPlaces(latitude, longitude, radius, type);
            if (places.results) {
              analysis.nearby_places[category].push(...places.results);
            }
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.warn(`Error searching for ${type}:`, error);
          }
        }

        // Remove duplicates based on place_id
        analysis.nearby_places[category] = this.removeDuplicatePlaces(analysis.nearby_places[category]);
      }

      // Generate summary statistics
      analysis.summary = this.generateSummary(analysis.nearby_places);

      return analysis;
    } catch (error) {
      console.error('Error analyzing location:', error);
      throw error;
    }
  }

  // Remove duplicate places based on place_id
  removeDuplicatePlaces(places) {
    const uniquePlaces = [];
    const seenIds = new Set();

    for (const place of places) {
      if (!seenIds.has(place.place_id)) {
        seenIds.add(place.place_id);
        uniquePlaces.push(place);
      }
    }

    return uniquePlaces;
  }

  // Generate summary statistics from nearby places data
  generateSummary(nearbyPlaces) {
    const summary = {};

    for (const [category, places] of Object.entries(nearbyPlaces)) {
      summary[category] = {
        count: places.length,
        average_rating: this.calculateAverageRating(places),
        high_rated_count: places.filter(p => p.rating >= 4.0).length,
        popular_places: places.filter(p => (p.user_ratings_total || 0) > 100).length
      };
    }

    return summary;
  }

  // Calculate average rating for a list of places
  calculateAverageRating(places) {
    const ratedPlaces = places.filter(p => p.rating);
    if (ratedPlaces.length === 0) return 0;

    const totalRating = ratedPlaces.reduce((sum, place) => sum + place.rating, 0);
    return Math.round((totalRating / ratedPlaces.length) * 10) / 10;
  }

  // Get location information from coordinates
  async getLocationInfo(latitude, longitude) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json`;
      const params = {
        latlng: `${latitude},${longitude}`,
        key: this.apiKey
      };

      const response = await axios.get(url, { params });
      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0];
      }
      return null;
    } catch (error) {
      console.error('Error getting location info:', error);
      throw error;
    }
  }

  // Extract area characteristics from Google Maps data
  extractAreaCharacteristics(locationAnalysis) {
    const { summary } = locationAnalysis;
    
    return {
      // Food competition analysis
      food_competition: {
        total_restaurants: summary.food_establishments?.count || 0,
        average_rating: summary.food_establishments?.average_rating || 0,
        high_rated_restaurants: summary.food_establishments?.high_rated_count || 0,
        popular_restaurants: summary.food_establishments?.popular_places || 0
      },
      
      // Commercial activity
      commercial_activity: {
        total_businesses: summary.businesses_offices?.count || 0,
        shopping_options: summary.shopping?.count || 0,
        clothing_stores: summary.clothing_stores?.count || 0
      },
      
      // Demographics indicators
      demographics: {
        educational_institutions: summary.schools_colleges?.count || 0,
        healthcare_facilities: summary.hospitals_clinics?.count || 0,
        fitness_facilities: summary.gyms_fitness?.count || 0,
        entertainment_options: summary.entertainment?.count || 0
      },
      
      // Infrastructure
      infrastructure: {
        petrol_stations: summary.petrol_stations?.count || 0,
        accessibility_score: this.calculateAccessibilityScore(summary)
      }
    };
  }

  // Calculate accessibility score based on infrastructure
  calculateAccessibilityScore(summary) {
    let score = 0;
    
    // Points for different facilities
    if (summary.petrol_stations?.count > 0) score += 2;
    if (summary.shopping?.count > 5) score += 2;
    if (summary.businesses_offices?.count > 10) score += 2;
    if (summary.food_establishments?.count > 5) score += 2;
    if (summary.hospitals_clinics?.count > 0) score += 1;
    if (summary.schools_colleges?.count > 0) score += 1;
    
    return Math.min(score, 10); // Cap at 10
  }
}

const googleMapsService = new GoogleMapsService();
export default googleMapsService; 