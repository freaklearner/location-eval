import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyCoeilj_q-UgxvjZvmbdoc8Hxdyr0PoDdc';

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  // Generate evaluation scores based on location analysis
  async evaluateLocation(locationData, areaCharacteristics) {
    try {
      const prompt = this.createEvaluationPrompt(locationData, areaCharacteristics);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseEvaluationResponse(text);
    } catch (error) {
      console.error('Error evaluating location with Gemini:', error);
      throw error;
    }
  }

  // Create detailed prompt for Gemini evaluation
  createEvaluationPrompt(locationData, areaCharacteristics) {
    return `
You are an expert business analyst for "The Momos Mafia", a food franchise specializing in momos (dumplings). 
Analyze this location for opening a momo cart/cafe and provide scores for each parameter on a scale of 1-5.

LOCATION DATA:
Coordinates: ${locationData.coordinates.latitude}, ${locationData.coordinates.longitude}
Search Radius: ${locationData.coordinates.radius}m

AREA ANALYSIS:
Food Competition:
- Total restaurants nearby: ${areaCharacteristics.food_competition.total_restaurants}
- Average restaurant rating: ${areaCharacteristics.food_competition.average_rating}
- High-rated restaurants (4.0+): ${areaCharacteristics.food_competition.high_rated_restaurants}
- Popular restaurants (100+ reviews): ${areaCharacteristics.food_competition.popular_restaurants}

Commercial Activity:
- Total businesses: ${areaCharacteristics.commercial_activity.total_businesses}
- Shopping options: ${areaCharacteristics.commercial_activity.shopping_options}
- Clothing stores: ${areaCharacteristics.commercial_activity.clothing_stores}

Demographics:
- Educational institutions: ${areaCharacteristics.demographics.educational_institutions}
- Healthcare facilities: ${areaCharacteristics.demographics.healthcare_facilities}
- Fitness facilities: ${areaCharacteristics.demographics.fitness_facilities}
- Entertainment options: ${areaCharacteristics.demographics.entertainment_options}

Infrastructure:
- Petrol stations: ${areaCharacteristics.infrastructure.petrol_stations}
- Accessibility score: ${areaCharacteristics.infrastructure.accessibility_score}/10

EVALUATION PARAMETERS (Score each 1-5):

1. Food Brand Presence: Based on nearby restaurants and food establishments
2. Clothing Brand Presence: Based on clothing stores and shopping malls
3. Footwear Brand Presence: Based on shoe stores and retail presence
4. Nearby Schools/Colleges: Based on educational institutions count
5. Petrol Pump Nearby: Based on petrol stations within radius
6. Footfall: Estimate based on business density and location type
7. Target Audience Fit: Analyze if area suits young professionals/students/families
8. Competition Pricing (Momo): Estimate based on restaurant types and ratings
9. Spending Capacity: Estimate based on business types and area characteristics
10. Nearby Businesses/Offices: Based on commercial activity
11. Vehicle Mix (Mobility): Estimate based on infrastructure and area type
12. Residential/Society Presence: Estimate based on area characteristics
13. Shopping Preferences Nearby: Based on shopping options count
14. Fitness/Gym/Walking Culture: Based on fitness facilities
15. Zomato/Swiggy Delivery Density: Estimate based on restaurant density
16. Student vs Office Crowd Mix: Based on schools vs businesses ratio
17. Nightlife/Café Presence: Based on entertainment options
18. Local Events/Weekly Bazaars: Estimate based on area type
19. Hospitals/Clinics Nearby: Based on healthcare facilities
20. Police/Security Presence: Estimate based on area development
21. Outdoor Branding Scope: Estimate based on commercial activity
22. Footpath/Road Width: Estimate based on area development level

RESPONSE FORMAT (JSON):
{
  "scores": {
    "food_brand_presence": 4,
    "clothing_brand_presence": 3,
    "footwear_brand_presence": 3,
    "nearby_schools_colleges": 5,
    "petrol_pump_nearby": 4,
    "footfall": 4,
    "target_audience_fit": 5,
    "competition_pricing_momo": 3,
    "spending_capacity": 4,
    "nearby_businesses_offices": 4,
    "vehicle_mix_mobility": 4,
    "residential_society_presence": 4,
    "shopping_preferences_nearby": 3,
    "fitness_gym_walking_culture": 3,
    "zomato_swiggy_delivery_density": 4,
    "student_vs_office_crowd_mix": 3,
    "nightlife_cafe_presence": 3,
    "local_events_weekly_bazaars": 2,
    "hospitals_clinics_nearby": 4,
    "police_security_presence": 4,
    "outdoor_branding_scope": 5,
    "footpath_road_width": 4
  },
  "analysis": {
    "strengths": ["List key strengths of this location"],
    "weaknesses": ["List potential challenges"],
    "recommendation": "HIGHLY RECOMMENDED/RECOMMENDED/CONDITIONAL/NOT RECOMMENDED",
    "reasoning": "Detailed explanation of the recommendation",
    "key_insights": ["Important insights about the location"],
    "market_potential": "High/Medium/Low",
    "risk_factors": ["List main risk factors"],
    "success_probability": "85%"
  }
}

Provide only the JSON response, no additional text.
`;
  }

  // Parse Gemini's response and extract structured data
  parseEvaluationResponse(responseText) {
    try {
      // Clean the response text
      let cleanText = responseText.trim();
      
      // Remove markdown code blocks if present
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      const parsed = JSON.parse(cleanText);
      return parsed;
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      console.log('Raw response:', responseText);
      
      // Return a fallback structure if parsing fails
      return {
        scores: this.getDefaultScores(),
        analysis: {
          strengths: ["Analysis temporarily unavailable"],
          weaknesses: ["Please try again"],
          recommendation: "CONDITIONAL",
          reasoning: "Unable to complete AI analysis at this time",
          key_insights: ["Manual evaluation recommended"],
          market_potential: "Medium",
          risk_factors: ["AI analysis unavailable"],
          success_probability: "50%"
        }
      };
    }
  }

  // Get default scores as fallback
  getDefaultScores() {
    return {
      food_brand_presence: 3,
      clothing_brand_presence: 3,
      footwear_brand_presence: 3,
      nearby_schools_colleges: 3,
      petrol_pump_nearby: 3,
      footfall: 3,
      target_audience_fit: 3,
      competition_pricing_momo: 3,
      spending_capacity: 3,
      nearby_businesses_offices: 3,
      vehicle_mix_mobility: 3,
      residential_society_presence: 3,
      shopping_preferences_nearby: 3,
      fitness_gym_walking_culture: 3,
      zomato_swiggy_delivery_density: 3,
      student_vs_office_crowd_mix: 3,
      nightlife_cafe_presence: 3,
      local_events_weekly_bazaars: 3,
      hospitals_clinics_nearby: 3,
      police_security_presence: 3,
      outdoor_branding_scope: 3,
      footpath_road_width: 3
    };
  }

  // Generate additional insights about the location
  async generateInsights(locationData, evaluationScores) {
    try {
      const prompt = `
Based on this momo franchise location evaluation, provide 3-5 actionable business insights:

Location: ${locationData.coordinates.latitude}, ${locationData.coordinates.longitude}
Total Score: ${this.calculateTotalScore(evaluationScores)}
Percentage: ${this.calculatePercentage(evaluationScores)}%

Key Scores:
- Footfall: ${evaluationScores.footfall}/5
- Target Audience Fit: ${evaluationScores.target_audience_fit}/5
- Competition: ${evaluationScores.food_brand_presence}/5
- Commercial Activity: ${evaluationScores.nearby_businesses_offices}/5

Provide insights in this format:
1. [Insight about customer base]
2. [Insight about competition]
3. [Insight about operations]
4. [Insight about marketing]
5. [Insight about timing/seasonality]

Keep each insight concise and actionable.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating insights:', error);
      return "Additional insights unavailable at this time.";
    }
  }

  // Calculate total score from individual scores
  calculateTotalScore(scores) {
    const weights = {
      food_brand_presence: 4,
      clothing_brand_presence: 2,
      footwear_brand_presence: 2,
      nearby_schools_colleges: 3,
      petrol_pump_nearby: 2,
      footfall: 5,
      target_audience_fit: 5,
      competition_pricing_momo: 3,
      spending_capacity: 4,
      nearby_businesses_offices: 4,
      vehicle_mix_mobility: 2,
      residential_society_presence: 4,
      shopping_preferences_nearby: 3,
      fitness_gym_walking_culture: 3,
      zomato_swiggy_delivery_density: 4,
      student_vs_office_crowd_mix: 3,
      nightlife_cafe_presence: 3,
      local_events_weekly_bazaars: 2,
      hospitals_clinics_nearby: 2,
      police_security_presence: 2,
      outdoor_branding_scope: 5,
      footpath_road_width: 3
    };

    let total = 0;
    for (const [param, score] of Object.entries(scores)) {
      const weight = weights[param] || 1;
      total += score * weight;
    }

    return total;
  }

  // Calculate percentage score
  calculatePercentage(scores) {
    const totalScore = this.calculateTotalScore(scores);
    const maxScore = 350; // Total possible score
    return Math.round((totalScore / maxScore) * 100);
  }
}

const geminiService = new GeminiService();
export default geminiService; 