// Demo service for fallback when backend is unavailable
class DemoService {
  constructor() {
    this.isDemo = true;
  }

  // Generate demo location data
  generateDemoLocationData(lat, lng, radius) {
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
  }

  // Generate demo summary
  generateSummary(businesses, brands) {
    const summary = {};

    // Business type summaries
    Object.entries(businesses).forEach(([key, places]) => {
      summary[key] = {
        count: places.length,
        averageRating: this.calculateAverageRating(places),
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
      averageBusinessRating: this.calculateOverallAverageRating(businesses),
      businessDensity: this.calculateBusinessDensity(businesses),
      competitionLevel: this.calculateCompetitionLevel(businesses.restaurants, businesses.food)
    };

    return summary;
  }

  // Generate demo AI analysis
  generateDemoAIAnalysis(locationData) {
    const parameterScores = {
      food_brand_presence: { score: 4, reasoning: "Found McDonald's, Pizza Hut within radius indicating good spending capacity", weightedScore: 16 },
      clothing_brand_presence: { score: 3, reasoning: "Some fashion brands present like Reliance Trends", weightedScore: 6 },
      footwear_brand_presence: { score: 3, reasoning: "Bata store available in the area", weightedScore: 6 },
      nearby_schools_colleges: { score: 4, reasoning: "Good educational institution presence with college nearby", weightedScore: 12 },
      petrol_pump_nearby: { score: 4, reasoning: "Multiple gas stations within reasonable distance", weightedScore: 8 },
      footfall: { score: 4, reasoning: "High business density suggests good footfall", weightedScore: 20 },
      target_audience_fit: { score: 4, reasoning: "Good mix of students and office workers", weightedScore: 20 },
      competition_pricing_momo: { score: 3, reasoning: "Moderate competition allows competitive pricing", weightedScore: 9 },
      spending_capacity: { score: 4, reasoning: "Premium brands indicate good spending power", weightedScore: 16 },
      nearby_businesses_offices: { score: 4, reasoning: "Good commercial activity with shopping mall", weightedScore: 16 },
      vehicle_mix_mobility: { score: 3, reasoning: "Mixed transportation options available", weightedScore: 6 },
      residential_society_presence: { score: 4, reasoning: "Good residential density inferred from business mix", weightedScore: 16 },
      shopping_preferences_nearby: { score: 4, reasoning: "Shopping mall and retail stores present", weightedScore: 12 },
      fitness_gym_walking_culture: { score: 3, reasoning: "Some fitness facilities present", weightedScore: 9 },
      zomato_swiggy_delivery_density: { score: 4, reasoning: "High restaurant density supports delivery ecosystem", weightedScore: 16 },
      student_vs_office_crowd_mix: { score: 4, reasoning: "Good balance with college and commercial areas", weightedScore: 12 },
      nightlife_cafe_presence: { score: 3, reasoning: "Some evening dining options available", weightedScore: 9 },
      local_events_weekly_bazaars: { score: 2, reasoning: "Limited event spaces identified", weightedScore: 4 },
      hospitals_clinics_nearby: { score: 4, reasoning: "Healthcare facilities present including major hospital", weightedScore: 8 },
      police_security_presence: { score: 3, reasoning: "Adequate security presence in commercial area", weightedScore: 6 },
      outdoor_branding_scope: { score: 4, reasoning: "Good visibility potential near main road", weightedScore: 20 },
      footpath_road_width: { score: 3, reasoning: "Adequate space for setup near commercial establishments", weightedScore: 9 }
    };

    const totalScore = Object.values(parameterScores).reduce((sum, param) => sum + param.weightedScore, 0);
    const percentage = Math.round((totalScore / 350) * 100);

    return {
      overallAssessment: "This location shows strong potential for a momos cart/cafe with good footfall, target audience presence, and moderate competition. The area has premium brand presence indicating spending capacity, educational institutions providing student customers, and commercial activity ensuring consistent traffic throughout the day.",
      parameterScores,
      totalScore,
      maxPossibleScore: 350,
      percentage,
      grade: percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C+' : 'C',
      viabilityStatus: percentage >= 70 ? 'RECOMMENDED' : percentage >= 50 ? 'CONDITIONAL' : 'NOT_RECOMMENDED',
      keyStrengths: [
        "High footfall area with shopping mall nearby",
        "Good target audience mix (students + shoppers)",
        "Premium brand presence indicates spending capacity",
        "Multiple food delivery options support ecosystem"
      ],
      keyConcerns: [
        "Competition from established food outlets",
        "Limited event spaces for promotional activities",
        "Need to establish brand presence in competitive market"
      ],
      recommendations: [
        "Focus on lunch hours (12-2 PM) for office and shopping crowd",
        "Offer student discounts during college hours (10-12 AM, 4-6 PM)",
        "Partner with nearby businesses for bulk orders",
        "Consider delivery partnerships with Zomato/Swiggy",
        "Position near the shopping mall entrance for maximum visibility"
      ],
      competitorAnalysis: {
        directCompetitors: ["Street Food Corner", "Local food vendors"],
        indirectCompetitors: ["McDonald's", "Subway", "Pizza Hut"],
        competitionLevel: "MEDIUM",
        positioningStrategy: "Focus on fresh, authentic momos with quick service and competitive pricing"
      },
      targetAudienceAnalysis: {
        primaryAudience: "Students, shoppers, and office workers",
        estimatedCustomerBase: "300-500 potential daily customers",
        peakHours: "12-2 PM (lunch), 4-6 PM (evening snack), 7-9 PM (dinner)",
        seasonalFactors: "Higher demand during college season, festivals, and weekend shopping"
      }
    };
  }

  // Helper methods
  calculateAverageRating(places) {
    const ratedPlaces = places.filter(p => p.rating);
    if (ratedPlaces.length === 0) return 0;
    const total = ratedPlaces.reduce((sum, place) => sum + place.rating, 0);
    return Math.round((total / ratedPlaces.length) * 10) / 10;
  }

  calculateOverallAverageRating(businesses) {
    const allPlaces = Object.values(businesses).flat();
    return this.calculateAverageRating(allPlaces);
  }

  calculateBusinessDensity(businesses) {
    const totalBusinesses = Object.values(businesses).reduce((sum, places) => sum + places.length, 0);
    if (totalBusinesses > 100) return 'High';
    if (totalBusinesses > 50) return 'Medium';
    if (totalBusinesses > 20) return 'Low';
    return 'Very Low';
  }

  calculateCompetitionLevel(restaurants = [], food = []) {
    const totalFoodPlaces = restaurants.length + food.length;
    if (totalFoodPlaces > 20) return 'High';
    if (totalFoodPlaces > 10) return 'Medium';
    if (totalFoodPlaces > 5) return 'Low';
    return 'Very Low';
  }

  // Main analysis method
  async analyzeLocation(coordinates, locationInfo, onProgress) {
    const { lat, lng, radius } = coordinates;
    
    // Simulate API delays
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    onProgress?.('🎯 Running in demo mode with sample data...');
    await delay(1000);

    // Generate demo location data
    onProgress?.('🗺️ Collecting demo location data...');
    const { businesses, brands } = this.generateDemoLocationData(lat, lng, radius);
    await delay(800);

    // Generate summary
    onProgress?.('📊 Processing demo data...');
    const summary = this.generateSummary(businesses, brands);
    await delay(500);

    const locationAnalysis = {
      coordinates: { lat, lng, radius },
      businesses,
      brands,
      summary,
      rawData: { demo: true }
    };

    // Generate AI analysis
    onProgress?.('🤖 Analyzing data with AI (demo mode)...');
    const aiEvaluation = this.generateDemoAIAnalysis(locationAnalysis);
    await delay(1200);

    // Combine results
    return {
      locationAnalysis,
      aiEvaluation,
      locationInfo: {
        clientName: locationInfo?.clientName || '',
        address: locationInfo?.address || '',
        formattedAddress: `Demo Location near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      },
      areaCharacteristics: {
        food_competition: {
          total_restaurants: businesses.restaurants.length,
          average_rating: this.calculateAverageRating(businesses.restaurants),
          high_rated_restaurants: businesses.restaurants.filter(p => p.rating >= 4.0).length,
          popular_restaurants: businesses.restaurants.filter(p => (p.user_ratings_total || 0) > 100).length,
        },
        commercial_activity: {
          total_businesses: Object.values(businesses).reduce((sum, places) => sum + places.length, 0),
          shopping_options: businesses.shopping_malls.length,
        },
        demographics: {
          educational_institutions: businesses.schools.length + businesses.universities.length,
          healthcare_facilities: businesses.hospitals.length,
          fitness_facilities: businesses.gyms.length,
        },
        infrastructure: {
          petrol_stations: businesses.gas_stations.length,
          accessibility_score: 7,
        }
      },
      coordinates: { lat, lng, radius },
      timestamp: new Date().toISOString(),
      source: 'demo'
    };
  }
}

const demoService = new DemoService();
export default demoService; 