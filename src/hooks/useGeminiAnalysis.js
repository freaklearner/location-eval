import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyCoeilj_q-UgxvjZvmbdoc8Hxdyr0PoDdc';

const useGeminiAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const generateEvaluationPrompt = useCallback((locationData) => {
    return `
You are an expert location analyst for "The Momos Mafia" street food franchise. 
Analyze this location data and provide scores for each parameter based on our evaluation matrix.

BUSINESS CONTEXT:
- Target customers: Young people (18-35), students, office workers, urban families
- Product: Momos (dumplings) - affordable street food (₹40-80 per plate)
- Format: Small cart/cafe setup
- Key success factors: High footfall, right demographics, moderate competition

EVALUATION MATRIX (22 Parameters with weights):
1. Food Brand Presence (Weight: 4, Max: 20) - Premium food brands indicate spending capacity
2. Clothing Brand Presence (Weight: 2, Max: 10) - Market sophistication indicator
3. Footwear Brand Presence (Weight: 2, Max: 10) - Consumer spending patterns
4. Nearby Schools/Colleges (Weight: 3, Max: 15) - Target demographic proximity
5. Petrol Pump Nearby (Weight: 2, Max: 10) - Convenience and accessibility
6. Footfall (Weight: 5, Max: 25) - Critical customer traffic metric
7. Target Audience Fit (Weight: 5, Max: 25) - Demographics alignment
8. Competition Pricing (Weight: 3, Max: 15) - Market pricing analysis
9. Spending Capacity (Weight: 4, Max: 20) - Local economic conditions
10. Nearby Businesses/Offices (Weight: 4, Max: 20) - Commercial activity
11. Vehicle Mix (Weight: 2, Max: 10) - Transportation patterns
12. Residential/Society Presence (Weight: 4, Max: 20) - Customer base density
13. Shopping Preferences Nearby (Weight: 3, Max: 15) - Consumer behavior
14. Fitness/Gym Culture (Weight: 3, Max: 15) - Health-conscious demographics
15. Zomato/Swiggy Delivery Density (Weight: 4, Max: 20) - Food delivery ecosystem
16. Student vs Office Crowd Mix (Weight: 3, Max: 15) - Peak time analysis
17. Nightlife/Café Presence (Weight: 3, Max: 15) - Evening business potential
18. Local Events/Bazaars (Weight: 2, Max: 10) - Community engagement
19. Hospitals/Clinics Nearby (Weight: 2, Max: 10) - Healthcare accessibility
20. Police/Security Presence (Weight: 2, Max: 10) - Safety and security
21. Outdoor Branding Scope (Weight: 5, Max: 25) - Marketing visibility
22. Footpath/Road Width (Weight: 3, Max: 15) - Physical accessibility

LOCATION DATA COLLECTED:
Coordinates: ${locationData.coordinates.lat}, ${locationData.coordinates.lng}
Search Radius: ${locationData.coordinates.radius}m

Business Counts:
- Restaurants: ${locationData.businesses?.restaurants?.length || 0}
- Schools: ${locationData.businesses?.schools?.length || 0}
- Universities: ${locationData.businesses?.universities?.length || 0}
- Hospitals: ${locationData.businesses?.hospitals?.length || 0}
- Gas Stations: ${locationData.businesses?.gas_stations?.length || 0}
- Shopping Malls: ${locationData.businesses?.shopping_malls?.length || 0}
- Gyms: ${locationData.businesses?.gyms?.length || 0}
- Banks: ${locationData.businesses?.banks?.length || 0}

Brand Presence:
${Object.entries(locationData.brands || {}).map(([brand, places]) => 
  `- ${brand}: ${places.length > 0 ? 'Present' : 'Not found'} (${places.length} locations)`
).join('\n')}

Summary Statistics:
- Total Businesses: ${locationData.summary?.overall?.totalBusinesses || 0}
- Premium Brand Count: ${locationData.summary?.overall?.premiumBrandCount || 0}
- Average Business Rating: ${locationData.summary?.overall?.averageBusinessRating || 0}
- Business Density: ${locationData.summary?.overall?.businessDensity || 'Unknown'}
- Competition Level: ${locationData.summary?.overall?.competitionLevel || 'Unknown'}

ANALYSIS REQUIREMENTS:
1. Score each parameter 1-5 based on the data evidence
2. Provide clear reasoning for each score
3. Calculate weighted total score
4. Identify top 3 strengths and main concerns
5. Give specific, actionable recommendations
6. Analyze competition level and positioning strategy

OUTPUT STRICT JSON FORMAT:
{
  "overallAssessment": "One paragraph summary of location viability for momos business",
  "parameterScores": {
    "food_brand_presence": {"score": 4, "reasoning": "Found McDonald's, KFC within radius indicating good spending capacity", "weightedScore": 16},
    "clothing_brand_presence": {"score": 3, "reasoning": "Some fashion brands present", "weightedScore": 6},
    "footwear_brand_presence": {"score": 3, "reasoning": "Mix of footwear options available", "weightedScore": 6},
    "nearby_schools_colleges": {"score": 4, "reasoning": "Good educational institution presence", "weightedScore": 12},
    "petrol_pump_nearby": {"score": 3, "reasoning": "Gas stations within reasonable distance", "weightedScore": 6},
    "footfall": {"score": 4, "reasoning": "High business density suggests good footfall", "weightedScore": 20},
    "target_audience_fit": {"score": 4, "reasoning": "Good mix of students and office workers", "weightedScore": 20},
    "competition_pricing_momo": {"score": 3, "reasoning": "Moderate competition allows competitive pricing", "weightedScore": 9},
    "spending_capacity": {"score": 4, "reasoning": "Premium brands indicate good spending power", "weightedScore": 16},
    "nearby_businesses_offices": {"score": 4, "reasoning": "Good commercial activity", "weightedScore": 16},
    "vehicle_mix_mobility": {"score": 3, "reasoning": "Mixed transportation options", "weightedScore": 6},
    "residential_society_presence": {"score": 4, "reasoning": "Good residential density", "weightedScore": 16},
    "shopping_preferences_nearby": {"score": 3, "reasoning": "Adequate shopping options", "weightedScore": 9},
    "fitness_gym_walking_culture": {"score": 3, "reasoning": "Some fitness facilities present", "weightedScore": 9},
    "zomato_swiggy_delivery_density": {"score": 4, "reasoning": "High restaurant density supports delivery", "weightedScore": 16},
    "student_vs_office_crowd_mix": {"score": 4, "reasoning": "Good balance of target demographics", "weightedScore": 12},
    "nightlife_cafe_presence": {"score": 3, "reasoning": "Some evening options available", "weightedScore": 9},
    "local_events_weekly_bazaars": {"score": 2, "reasoning": "Limited event spaces", "weightedScore": 4},
    "hospitals_clinics_nearby": {"score": 3, "reasoning": "Healthcare facilities present", "weightedScore": 6},
    "police_security_presence": {"score": 3, "reasoning": "Adequate security presence", "weightedScore": 6},
    "outdoor_branding_scope": {"score": 4, "reasoning": "Good visibility potential", "weightedScore": 20},
    "footpath_road_width": {"score": 3, "reasoning": "Adequate space for setup", "weightedScore": 9}
  },
  "totalScore": 245,
  "maxPossibleScore": 350,
  "percentage": 70.0,
  "grade": "B+",
  "viabilityStatus": "RECOMMENDED",
  "keyStrengths": ["High footfall area", "Good target audience mix", "Premium brand presence"],
  "keyConcerns": ["Competition level", "Limited event spaces"],
  "recommendations": [
    "Focus on lunch hours (12-2 PM) for office crowd",
    "Offer student discounts during college hours",
    "Partner with nearby offices for bulk orders",
    "Consider delivery partnerships with Zomato/Swiggy"
  ],
  "competitorAnalysis": {
    "directCompetitors": ["List of nearby momo/dumpling vendors"],
    "indirectCompetitors": ["Other affordable food options"],
    "competitionLevel": "MEDIUM",
    "positioningStrategy": "Focus on fresh, authentic momos with quick service"
  },
  "targetAudienceAnalysis": {
    "primaryAudience": "Students and Office workers",
    "estimatedCustomerBase": "500-800 potential daily customers",
    "peakHours": "12-2 PM (lunch), 6-8 PM (evening snack)",
    "seasonalFactors": "Higher demand during college season and office working days"
  }
}

Be analytical, data-driven, and specific in your recommendations. Ensure all scores are between 1-5 and reasoning is based on the actual data provided.
`;
  }, []);

  const analyzeLocation = useCallback(async (locationData, onProgress) => {
    setLoading(true);
    setError(null);

    try {
      onProgress?.('🤖 Generating AI analysis prompt...');
      const prompt = generateEvaluationPrompt(locationData);
      
      onProgress?.('🧠 Analyzing location with Gemini AI...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      onProgress?.('📊 Processing AI response...');
      
      // Clean and parse the response
      let cleanText = text.trim();
      
      // Remove markdown code blocks if present
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError);
        console.log('Raw response:', text);
        
        // Return fallback response
        parsedResponse = createFallbackResponse(locationData);
      }

      // Validate and ensure all required fields are present
      const validatedResponse = validateAndFixResponse(parsedResponse, locationData);

      return validatedResponse;

    } catch (err) {
      console.error('Gemini analysis failed:', err);
      setError(err.message);
      
      // Return fallback response on error
      return createFallbackResponse(locationData);
    } finally {
      setLoading(false);
    }
  }, [generateEvaluationPrompt, model]);

  const createFallbackResponse = (locationData) => {
    const totalBusinesses = locationData.summary?.overall?.totalBusinesses || 0;
    const premiumBrandCount = locationData.summary?.overall?.premiumBrandCount || 0;
    
    // Simple scoring based on business density
    const baseScore = Math.min(Math.floor(totalBusinesses / 20) + 2, 5);
    const brandBonus = premiumBrandCount > 0 ? 1 : 0;
    
    const fallbackScores = {
      food_brand_presence: Math.min(baseScore + brandBonus, 5),
      clothing_brand_presence: Math.min(baseScore, 5),
      footwear_brand_presence: Math.min(baseScore, 5),
      nearby_schools_colleges: Math.min(baseScore, 5),
      petrol_pump_nearby: Math.min(baseScore, 5),
      footfall: Math.min(baseScore + 1, 5),
      target_audience_fit: Math.min(baseScore, 5),
      competition_pricing_momo: baseScore,
      spending_capacity: Math.min(baseScore + brandBonus, 5),
      nearby_businesses_offices: Math.min(baseScore, 5),
      vehicle_mix_mobility: baseScore,
      residential_society_presence: Math.min(baseScore, 5),
      shopping_preferences_nearby: Math.min(baseScore, 5),
      fitness_gym_walking_culture: Math.min(baseScore, 5),
      zomato_swiggy_delivery_density: Math.min(baseScore, 5),
      student_vs_office_crowd_mix: baseScore,
      nightlife_cafe_presence: Math.min(baseScore, 5),
      local_events_weekly_bazaars: Math.max(baseScore - 1, 1),
      hospitals_clinics_nearby: Math.min(baseScore, 5),
      police_security_presence: baseScore,
      outdoor_branding_scope: Math.min(baseScore, 5),
      footpath_road_width: baseScore
    };

    const parameterScores = {};
    const weights = {
      food_brand_presence: 4, clothing_brand_presence: 2, footwear_brand_presence: 2,
      nearby_schools_colleges: 3, petrol_pump_nearby: 2, footfall: 5, target_audience_fit: 5,
      competition_pricing_momo: 3, spending_capacity: 4, nearby_businesses_offices: 4,
      vehicle_mix_mobility: 2, residential_society_presence: 4, shopping_preferences_nearby: 3,
      fitness_gym_walking_culture: 3, zomato_swiggy_delivery_density: 4, student_vs_office_crowd_mix: 3,
      nightlife_cafe_presence: 3, local_events_weekly_bazaars: 2, hospitals_clinics_nearby: 2,
      police_security_presence: 2, outdoor_branding_scope: 5, footpath_road_width: 3
    };

    let totalScore = 0;
    Object.entries(fallbackScores).forEach(([param, score]) => {
      const weight = weights[param] || 1;
      const weightedScore = score * weight;
      parameterScores[param] = {
        score,
        reasoning: 'Analysis based on business density and brand presence',
        weightedScore
      };
      totalScore += weightedScore;
    });

    const percentage = Math.round((totalScore / 350) * 100);

    return {
      overallAssessment: `Based on automated analysis of ${totalBusinesses} nearby businesses and ${premiumBrandCount} premium brands, this location shows ${percentage > 70 ? 'good' : percentage > 50 ? 'moderate' : 'limited'} potential for a momos business.`,
      parameterScores,
      totalScore,
      maxPossibleScore: 350,
      percentage,
      grade: percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C+' : 'C',
      viabilityStatus: percentage >= 70 ? 'RECOMMENDED' : percentage >= 50 ? 'CONDITIONAL' : 'NOT_RECOMMENDED',
      keyStrengths: ['Automated analysis completed', 'Business data collected successfully'],
      keyConcerns: ['Manual review recommended', 'AI analysis temporarily unavailable'],
      recommendations: ['Conduct manual verification', 'Consider peak hour analysis', 'Evaluate local competition directly'],
      competitorAnalysis: {
        directCompetitors: ['Manual identification required'],
        indirectCompetitors: ['Food court analysis needed'],
        competitionLevel: 'UNKNOWN',
        positioningStrategy: 'Focus on unique selling proposition'
      },
      targetAudienceAnalysis: {
        primaryAudience: 'Mixed demographics',
        estimatedCustomerBase: 'Requires manual assessment',
        peakHours: 'Standard meal times',
        seasonalFactors: 'Weather and local events dependent'
      }
    };
  };

  const validateAndFixResponse = (response, locationData) => {
    // Ensure all required fields exist
    const validated = {
      overallAssessment: response.overallAssessment || 'Analysis completed with available data',
      parameterScores: response.parameterScores || {},
      totalScore: response.totalScore || 0,
      maxPossibleScore: response.maxPossibleScore || 350,
      percentage: response.percentage || 0,
      grade: response.grade || 'C',
      viabilityStatus: response.viabilityStatus || 'CONDITIONAL',
      keyStrengths: response.keyStrengths || ['Data analysis completed'],
      keyConcerns: response.keyConcerns || ['Further analysis recommended'],
      recommendations: response.recommendations || ['Manual verification suggested'],
      competitorAnalysis: response.competitorAnalysis || {
        directCompetitors: [],
        indirectCompetitors: [],
        competitionLevel: 'UNKNOWN',
        positioningStrategy: 'Differentiation required'
      },
      targetAudienceAnalysis: response.targetAudienceAnalysis || {
        primaryAudience: 'Mixed',
        estimatedCustomerBase: 'Unknown',
        peakHours: 'Standard',
        seasonalFactors: 'Variable'
      }
    };

    return validated;
  };

  return {
    loading,
    error,
    analyzeLocation,
    clearError: () => setError(null)
  };
};

export default useGeminiAnalysis; 