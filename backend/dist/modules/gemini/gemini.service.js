"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
let GeminiService = class GeminiService {
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('Gemini API key not configured');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
    async evaluateLocation(request) {
        try {
            const prompt = this.createEvaluationPrompt(request.locationData, request.areaCharacteristics);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return this.parseEvaluationResponse(text);
        }
        catch (error) {
            console.error('Gemini analysis failed:', error);
            throw new common_1.HttpException(`AI evaluation failed: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    createEvaluationPrompt(locationData, areaCharacteristics) {
        const coordinates = locationData.coordinates || {};
        const businesses = locationData.businesses || {};
        const brands = locationData.brands || {};
        const summary = locationData.summary || {};
        return `
You are an expert location analyst for "The Momos Mafia" street food franchise. 
Analyze this location for opening a momo cart/cafe and provide scores for each parameter on a scale of 1-5.

🚨 CRITICAL: All data provided has been STRICTLY FILTERED to be within the specified radius with 100% compliance.
Every business and brand listed is confirmed to be within the search radius. Use this accurate, radius-compliant data for your analysis.

BUSINESS CONTEXT:
- Target customers: College students (18-25), Young professionals (25-35), Young parents with children, Hygiene-conscious foodies
- Product: Indian street food momos/dumplings - steamed & fried varieties (₹80-150 per plate)
- Format: Street food cart/small cafe setup with focus on hygiene and quality
- Peak hours: Evening (5-9 PM) when people crave street food snacks
- Key success factors: High evening footfall, target demographics, authentic taste, hygiene standards

LOCATION DATA:
Coordinates: ${coordinates.lat}, ${coordinates.lng}
Search Radius: ${coordinates.radius}m

Business Counts:
- Restaurants: ${businesses.restaurants?.length || 0}
- Universities/Colleges: ${businesses.universities?.length || 0}
- Hospitals: ${businesses.hospitals?.length || 0}
- Gas Stations: ${businesses.gas_stations?.length || 0}
- Shopping Malls: ${businesses.shopping_malls?.length || 0}
- Gyms: ${businesses.gyms?.length || 0}
- Banks: ${businesses.banks?.length || 0}
- Family Entertainment: ${businesses.family_entertainment?.length || 0}
- Parks: ${businesses.parks?.length || 0}

Brand Presence (All results within ${coordinates.radius}m radius):
${Object.entries(brands).map(([brand, brandData]) => {
            const places = Array.isArray(brandData) ? brandData : (brandData?.places || []);
            const found = Array.isArray(brandData) ? brandData.length > 0 : (brandData?.found || false);
            const searchRadius = brandData?.searchRadius || coordinates.radius;
            return `- ${brand}: ${found ? 'Present' : 'Not found'} (${places.length} locations within ${searchRadius}m)`;
        }).join('\n')}

Summary Statistics:
- Total Businesses: ${summary.overall?.totalBusinesses || 0}
- Premium Brand Count: ${summary.overall?.premiumBrandCount || 0}
- Average Business Rating: ${summary.overall?.averageBusinessRating || 0}
- Business Density: ${summary.overall?.businessDensity || 'Unknown'}
- Competition Level: ${summary.overall?.competitionLevel || 'Unknown'}

EVALUATION PARAMETERS (Score each 1-5):
1. Food Brand Presence (Weight: 4) - Premium food brands nearby
2. Clothing Brand Presence (Weight: 2) - Market sophistication indicator
3. Footwear Brand Presence (Weight: 2) - Consumer spending patterns
4. Nearby Colleges/Universities (Weight: 4) - Target demographic proximity (college students, young adults)
5. Petrol Pump Nearby (Weight: 2) - Convenience and accessibility
6. Footfall (Weight: 5) - Critical customer traffic metric
7. Target Audience Fit (Weight: 5) - Demographics alignment with college students, young professionals, young parents, hygiene-conscious foodies
8. Street Food Competition Analysis (Weight: 3) - Competition analysis for Indian street food momos/dumplings market
9. Spending Capacity (Weight: 4) - Local economic conditions
10. Nearby Businesses/Offices (Weight: 4) - Commercial activity
11. Vehicle Mix (Weight: 2) - Transportation patterns
12. Residential/Society Presence (Weight: 4) - Customer base density
13. Shopping Preferences Nearby (Weight: 3) - Consumer behavior
14. Fitness/Gym Culture (Weight: 3) - Health-conscious demographics
15. Zomato/Swiggy Delivery Density (Weight: 4) - Food delivery ecosystem
16. College Student vs Professional Mix (Weight: 3) - Peak evening time analysis for street food
17. Nightlife/Café Presence (Weight: 3) - Evening business potential
18. Local Events/Bazaars (Weight: 2) - Community engagement
19. Hospitals/Clinics Nearby (Weight: 2) - Healthcare accessibility
20. Police/Security Presence (Weight: 2) - Safety and security
21. Outdoor Branding Scope (Weight: 5) - Marketing visibility
22. Footpath/Road Width (Weight: 3) - Physical accessibility

OUTPUT STRICT JSON FORMAT:
{
  "overallAssessment": "One paragraph summary of location viability for momos business",
  "parameterScores": {
    "food_brand_presence": {"score": 4, "reasoning": "Found McDonald's, KFC within radius indicating good spending capacity", "weightedScore": 16},
    "clothing_brand_presence": {"score": 3, "reasoning": "Some fashion brands present", "weightedScore": 6},
    "footwear_brand_presence": {"score": 3, "reasoning": "Mix of footwear options available", "weightedScore": 6},
    "nearby_colleges_universities": {"score": 4, "reasoning": "Good college/university presence for target demographic", "weightedScore": 16},
    "petrol_pump_nearby": {"score": 3, "reasoning": "Gas stations within reasonable distance", "weightedScore": 6},
    "footfall": {"score": 4, "reasoning": "High business density suggests good footfall", "weightedScore": 20},
    "target_audience_fit": {"score": 4, "reasoning": "Good mix of college students, young professionals, and families - ideal for street food", "weightedScore": 20},
    "competition_pricing_momo": {"score": 3, "reasoning": "Moderate street food competition allows competitive pricing for momos", "weightedScore": 9},
    "spending_capacity": {"score": 4, "reasoning": "Premium brands indicate good spending power", "weightedScore": 16},
    "nearby_businesses_offices": {"score": 4, "reasoning": "Good commercial activity", "weightedScore": 16},
    "vehicle_mix_mobility": {"score": 3, "reasoning": "Mixed transportation options", "weightedScore": 6},
    "residential_society_presence": {"score": 4, "reasoning": "Good residential density", "weightedScore": 16},
    "shopping_preferences_nearby": {"score": 3, "reasoning": "Adequate shopping options", "weightedScore": 9},
    "fitness_gym_walking_culture": {"score": 3, "reasoning": "Some fitness facilities present", "weightedScore": 9},
    "zomato_swiggy_delivery_density": {"score": 4, "reasoning": "High restaurant density supports delivery", "weightedScore": 16},
    "student_vs_office_crowd_mix": {"score": 4, "reasoning": "Good balance of college students and working professionals for evening street food", "weightedScore": 12},
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

Provide only the JSON response, no additional text. Be analytical and data-driven in your recommendations.
`;
    }
    parseEvaluationResponse(responseText) {
        try {
            let cleanText = responseText.trim();
            if (cleanText.startsWith('```json')) {
                cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '');
            }
            else if (cleanText.startsWith('```')) {
                cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '');
            }
            cleanText = cleanText
                .replace(/,(\s*[}\]])/g, '$1')
                .replace(/,(\s*[}\]])/g, '$1')
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
                .replace(/"\s*,\s*]/g, '"]')
                .replace(/}\s*,\s*]/g, '}]')
                .trim();
            console.log('🧹 Cleaned JSON for parsing:', cleanText.substring(0, 200) + '...');
            const parsed = JSON.parse(cleanText);
            return parsed;
        }
        catch (error) {
            console.error('Failed to parse Gemini response:', error);
            console.log('Raw response:', responseText);
            return this.createFallbackResponse();
        }
    }
    createFallbackResponse() {
        const fallbackScores = {
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
                reasoning: 'Analysis based on available data',
                weightedScore
            };
            totalScore += weightedScore;
        });
        const percentage = Math.round((totalScore / 350) * 100);
        return {
            overallAssessment: 'Location analysis completed with available data. Manual review recommended for detailed insights.',
            parameterScores,
            totalScore,
            maxPossibleScore: 350,
            percentage,
            grade: percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C+' : 'C',
            viabilityStatus: percentage >= 70 ? 'RECOMMENDED' : percentage >= 50 ? 'CONDITIONAL' : 'NOT_RECOMMENDED',
            keyStrengths: ['Data analysis completed', 'Business information collected'],
            keyConcerns: ['AI analysis temporarily unavailable', 'Manual review recommended'],
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
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map