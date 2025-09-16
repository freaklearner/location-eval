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
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Gemini API timeout after 2 minutes')), 120000);
            });
            const geminiPromise = this.model.generateContent(prompt);
            const result = await Promise.race([geminiPromise, timeoutPromise]);
            const response = await result.response;
            const text = response.text();
            return this.parseEvaluationResponse(text);
        }
        catch (error) {
            console.error('Gemini analysis failed:', error);
            if (error.message.includes('timeout')) {
                throw new common_1.HttpException(`AI evaluation timed out. Please try again or use a smaller search radius.`, common_1.HttpStatus.REQUEST_TIMEOUT);
            }
            throw new common_1.HttpException(`AI evaluation failed: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async evaluateWithBaseline(locationData, areaCharacteristics, baselineScores) {
        try {
            console.log('🎯 GEMINI: Starting evaluation with data-driven baseline scores');
            const prompt = this.createEvaluationPrompt(locationData, areaCharacteristics, baselineScores);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Gemini API timeout after 2 minutes')), 120000);
            });
            const geminiPromise = this.model.generateContent(prompt);
            const result = await Promise.race([geminiPromise, timeoutPromise]);
            const response = await result.response;
            const text = response.text();
            const aiAnalysis = this.parseEvaluationResponse(text);
            if (aiAnalysis.parameterScores && baselineScores) {
                aiAnalysis.parameterScores = this.validateAIScores(aiAnalysis.parameterScores, baselineScores);
            }
            return aiAnalysis;
        }
        catch (error) {
            console.error('Gemini baseline evaluation failed:', error);
            if (error.message.includes('timeout')) {
                throw new common_1.HttpException(`AI evaluation timed out. Please try again or use a smaller search radius.`, common_1.HttpStatus.REQUEST_TIMEOUT);
            }
            throw new common_1.HttpException(`AI baseline evaluation failed: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    createEvaluationPrompt(locationData, areaCharacteristics, baselineScores) {
        const coordinates = locationData.coordinates || {};
        const businesses = locationData.businesses || {};
        const brands = locationData.brands || {};
        const summary = locationData.summary || {};
        const config = locationData.config || {};
        const evaluationParameters = config.evaluationParameters || [];
        const enhancedMetrics = summary.overall?.enhancedMetrics || {};
        const cityTier = this.getCityTier(areaCharacteristics?.city || '');
        const region = this.getRegionFromCity(areaCharacteristics?.city || '');
        const regionalContext = this.addRegionalContext(cityTier, region, config);
        const contextualGuidelines = this.generateContextualScoringGuidelines(locationData, cityTier);
        const baselineSection = baselineScores ? this.generateBaselineScoresSection(baselineScores) : '';
        return `
You are an expert location analyst for "The Momos Mafia" street food franchise specializing in Indian street food market analysis.

🚨 CRITICAL SCORING INSTRUCTION: Use VARIED scores (1-5) based on actual data quality differences.
AVOID clustering scores around 3-4. Use the full 1-5 range based on data evidence.

${baselineSection}

INDIAN STREET FOOD MARKET CONTEXT:
- Average momo price: ₹60-120 per plate (8-10 pieces)
- Peak consumption: Evening (5-9 PM), lunch (12-2 PM)
- Primary demographics: Students (budget ₹50-80), Office workers (budget ₹80-150)
- Seasonal factors: Higher demand in winter, monsoon challenges
- Competition: Local vendors (₹30-50), organized chains (₹80-150)
- Success factors: Taste authenticity, hygiene standards, quick service

TARGET DEMOGRAPHIC INSIGHTS:
- College students: Price-sensitive, evening consumption, group orders
- Office workers: Quality-focused, lunch orders, convenience priority
- Young families: Hygiene-conscious, weekend visits, value for money
- Food enthusiasts: Authenticity-focused, willing to travel, word-of-mouth influence

COMPETITION ANALYSIS PHILOSOPHY:
- Moderate competition indicates proven market demand
- Food clusters create destination areas that benefit all vendors
- High footfall areas often have competition but also high customer volume
- Balance market saturation against proven customer demand

LOCATION DATA:
Coordinates: ${coordinates.lat}, ${coordinates.lng}
Search Radius: ${coordinates.radius}m

DETAILED BUSINESS ANALYSIS:
${this.generateDetailedBusinessAnalysis(businesses)}

BRAND PRESENCE ANALYSIS (All results within ${coordinates.radius}m radius):
${this.generateBrandPresenceAnalysis(brands)}

Summary Statistics:
- Total Businesses: ${summary.overall?.totalBusinesses || 0}
- Premium Brand Count: ${summary.overall?.premiumBrandCount || 0}
- Average Business Rating: ${summary.overall?.averageBusinessRating || 0}
- Business Density: ${summary.overall?.businessDensity || 'Unknown'}
- Competition Level: ${summary.overall?.competitionLevel || 'Unknown'}

ENHANCED ANALYTICS:
- Total Weighted Footfall Score: ${enhancedMetrics.totalWeightedFootfallScore?.toFixed(2) || 0}
- Competition Score (1-5): ${enhancedMetrics.competitionScore || 3}
- Direct Competitors: ${enhancedMetrics.directCompetitors || 0}
- Indirect Competitors: ${enhancedMetrics.indirectCompetitors || 0}
- Competition Density: ${enhancedMetrics.competitionDensity?.toFixed(2) || 0} per km
- Quality Index: ${enhancedMetrics.qualityIndex?.toFixed(1) || 0}/5.0

${regionalContext}

${contextualGuidelines}

🎯 SCORING INSTRUCTIONS:
${baselineScores ? `
1. Start with the recommended baseline scores above (calculated from data)
2. Adjust ±1 point based on qualitative factors only
3. Explain WHY each score differs from baseline (if it does)
4. Use specific business names and counts as evidence
5. MANDATORY: Provide varied scores reflecting actual location quality differences
` : `
1. Use specific data evidence to determine scores
2. AVOID clustering scores around 3-4
3. Use the full 1-5 range based on actual data quality
4. Mention specific business names and counts
5. Explain reasoning with concrete evidence
`}

🧮 CALCULATION REQUIREMENTS:
- Individual Score = Score (1-5) × Weight
- Total Maximum = 350 points (FIXED)
- Percentage = (Total Score ÷ 350) × 100

EVALUATION PARAMETERS (Score each 1-5 based on provided data):
${evaluationParameters.map((param, index) => `${index + 1}. ${param.name} (Weight: ${param.weight}) - ${param.description}`).join('\n')}

OUTPUT STRICT JSON FORMAT - Calculate weighted scores dynamically:
{
  "overallAssessment": "One paragraph summary of location viability for authentic Indian momo street food business considering market context, competition benefits, and target demographics",
  "parameterScores": {
${evaluationParameters.map(param => {
            const baselineScore = baselineScores?.[param.id]?.score || 3;
            return `    "${param.id}": {
      "score": "CALCULATE_1_TO_5_BASED_ON_DATA_ANALYSIS",
      "reasoning": "Specific evidence: Found X businesses including [names], Y brands detected. ${baselineScores ? `Data baseline suggests ${baselineScore}/5.` : ''} Explain your final score with concrete evidence.",
      "weightedScore": "CALCULATE_AS_score_times_${param.weight}",
      "dataBaseline": ${baselineScores ? baselineScore : 'null'}
    }`;
        }).join(',\n')}
  },
  "totalScore": "SUM_ALL_WEIGHTED_SCORES",
  "maxPossibleScore": 350,
  "percentage": "CALCULATE_totalScore_divided_by_350_times_100",
  "grade": "CALCULATE_BASED_ON_PERCENTAGE",
  "viabilityStatus": "DETERMINE_FROM_PERCENTAGE",
  "keyStrengths": ["Based on analysis of actual data", "Consider competition as footfall generator", "Focus on Indian street food context"],
  "keyConcerns": ["Base on actual limitations found", "Consider seasonal factors", "Address specific local challenges"],
  "recommendations": [
    "Leverage evening peak hours (5-9 PM) for maximum student and office worker traffic",
    "Price competitively at ₹80-120 per plate to match market expectations",
    "Focus on hygiene and authenticity to differentiate from local vendors",
    "Consider partnerships with food delivery platforms for wider reach",
    "Utilize moderate competition as validation of market demand"
  ],
  "competitorAnalysis": {
    "directCompetitors": ["Based on detected momo/dumpling vendors in data"],
    "indirectCompetitors": ["Other street food and quick service options found"],
    "competitionLevel": "Use enhanced competition score: ${enhancedMetrics.competitionScore || 3}/5",
    "positioningStrategy": "Differentiate through superior quality, authentic taste, hygiene standards, and strategic pricing in proven market"
  },
  "targetAudienceAnalysis": {
    "primaryAudience": "College students, Young professionals, Young parents, Hygiene-conscious foodies",
    "estimatedCustomerBase": "Base estimate on actual footfall indicators and business density",
    "peakHours": "12:00 PM - 2:00 PM (lunch), 5:00 PM - 9:00 PM (evening street food peak)",
    "seasonalFactors": "Higher demand in winter months, consider monsoon accessibility challenges"
  },
  "confidenceLevel": {
    "dataQuality": "HIGH - All data radius-compliant and validated",
    "marketAnalysis": "HIGH - Based on comprehensive business and brand analysis",
    "recommendations": "HIGH - Grounded in Indian street food market realities"
  }
}

🚨 MANDATORY: Provide varied scores reflecting actual location quality differences!
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
        return {
            overallAssessment: "Analysis completed with limited AI processing. Please review location data manually.",
            parameterScores: {},
            totalScore: 0,
            maxPossibleScore: 100,
            percentage: 0,
            grade: "N/A",
            viabilityStatus: "MANUAL_REVIEW_REQUIRED",
            keyStrengths: ["Location data collected successfully"],
            keyConcerns: ["AI analysis failed - manual review recommended"],
            recommendations: ["Review location data manually", "Retry analysis if needed"]
        };
    }
    getCityTier(city) {
        const cityLower = city.toLowerCase();
        const regionalIntel = this.configService.get('REGIONAL_MARKET_INTELLIGENCE') || {};
        const cityTiers = regionalIntel.cityTiers || {};
        for (const [tier, tierData] of Object.entries(cityTiers)) {
            const cities = tierData.cities || [];
            if (cities.some(c => cityLower.includes(c.toLowerCase()))) {
                return tier;
            }
        }
        const tier1Cities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune'];
        const tier2Cities = ['jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'bhopal', 'ludhiana', 'agra'];
        if (tier1Cities.some(c => cityLower.includes(c)))
            return 'tier1';
        if (tier2Cities.some(c => cityLower.includes(c)))
            return 'tier2';
        return 'tier3';
    }
    getRegionFromCity(city) {
        const cityLower = city.toLowerCase();
        const northCities = ['delhi', 'jaipur', 'lucknow', 'kanpur', 'agra', 'ludhiana', 'chandigarh'];
        const southCities = ['bangalore', 'chennai', 'hyderabad', 'kochi', 'trivandrum', 'mysore'];
        const eastCities = ['kolkata', 'bhubaneswar', 'guwahati', 'patna', 'ranchi'];
        const westCities = ['mumbai', 'pune', 'ahmedabad', 'surat', 'nagpur', 'indore', 'bhopal'];
        if (northCities.some(c => cityLower.includes(c)))
            return 'north';
        if (southCities.some(c => cityLower.includes(c)))
            return 'south';
        if (eastCities.some(c => cityLower.includes(c)))
            return 'east';
        if (westCities.some(c => cityLower.includes(c)))
            return 'west';
        return 'north';
    }
    addRegionalContext(cityTier, region, config) {
        const marketIntel = config.regionalMarketIntelligence || {};
        const tierData = marketIntel.cityTiers?.[cityTier] || {};
        const regionalData = marketIntel.regionalPreferences?.[region] || {};
        const city = cityTier === 'tier1' ? 'TIER-1' : cityTier === 'tier2' ? 'TIER-2' : 'TIER-3';
        return `
REGIONAL MARKET INTELLIGENCE:
- City Classification: ${city} city, ${region.toUpperCase()} region
- Business Viability: ${tierData.businessViability?.toUpperCase() || 'STANDARD'}
- Market Pricing: ${tierData.characteristics?.averageMomoPrice || '₹60-100'}
- Competition Level: ${tierData.characteristics?.competitionLevel || 'moderate'}
- Setup Cost Range: ${tierData.characteristics?.setupCost || '₹3-5 lakhs'}
- Market Saturation: ${tierData.characteristics?.marketSaturation || 'moderate'}
- Tier Viability Score: ${tierData.characteristics?.viabilityScore || 3.5}/5.0

PROVEN BUSINESS INSIGHTS:
${this.getTierSpecificBusinessInsights(cityTier)}

REGIONAL FOOD PREFERENCES:
- Preferred Varieties: ${regionalData.momoVarieties?.join(', ') || 'veg, chicken'}
- Local Spice Preference: ${regionalData.spiceLevel || 'medium'}
- Popular Sides: ${regionalData.preferredSides?.join(', ') || 'chutney, soup'}`;
    }
    generateDetailedBusinessAnalysis(businesses) {
        let analysis = '';
        const restaurants = businesses.restaurants || [];
        if (restaurants.length > 0) {
            analysis += `\n📍 RESTAURANTS & FOOD PLACES (${restaurants.length} found):\n`;
            const topRated = restaurants
                .filter(r => r.rating && r.rating >= 4.0)
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 5);
            topRated.forEach(restaurant => {
                analysis += `- ${restaurant.name} (${restaurant.rating}⭐, ${restaurant.user_ratings_total || 0} reviews)\n`;
            });
            const avgRating = restaurants.reduce((sum, r) => sum + (r.rating || 0), 0) / restaurants.length;
            analysis += `Average Rating: ${avgRating.toFixed(1)}⭐ | Quality Level: ${avgRating >= 4.0 ? 'HIGH' : avgRating >= 3.5 ? 'GOOD' : 'AVERAGE'}\n`;
        }
        const universities = businesses.universities || [];
        if (universities.length > 0) {
            analysis += `\n🎓 EDUCATIONAL INSTITUTIONS (${universities.length} found):\n`;
            universities.slice(0, 5).forEach(uni => {
                analysis += `- ${uni.name} (${uni.rating ? uni.rating + '⭐' : 'No rating'})\n`;
            });
        }
        const malls = businesses.shopping_malls || [];
        if (malls.length > 0) {
            analysis += `\n🛒 SHOPPING CENTERS (${malls.length} found):\n`;
            malls.slice(0, 3).forEach(mall => {
                analysis += `- ${mall.name} (${mall.rating ? mall.rating + '⭐' : 'No rating'})\n`;
            });
        }
        const hospitals = businesses.hospitals || [];
        if (hospitals.length > 0) {
            analysis += `\n🏥 HOSPITALS & CLINICS (${hospitals.length} found):\n`;
            hospitals.slice(0, 3).forEach(hospital => {
                analysis += `- ${hospital.name}\n`;
            });
        }
        return analysis || 'No detailed business data available.';
    }
    generateBrandPresenceAnalysis(brands) {
        let analysis = '';
        const foundBrands = Object.entries(brands).filter(([brand, brandData]) => {
            const places = Array.isArray(brandData) ? brandData : (brandData?.places || []);
            return places.length > 0;
        });
        const notFoundBrands = Object.entries(brands).filter(([brand, brandData]) => {
            const places = Array.isArray(brandData) ? brandData : (brandData?.places || []);
            return places.length === 0;
        });
        if (foundBrands.length > 0) {
            analysis += `\n✅ BRANDS PRESENT (${foundBrands.length} brands found):\n`;
            foundBrands.forEach(([brand, brandData]) => {
                const places = Array.isArray(brandData) ? brandData : (brandData?.places || []);
                analysis += `- ${brand}: ${places.length} location${places.length > 1 ? 's' : ''}\n`;
                places.slice(0, 2).forEach(place => {
                    analysis += `  • ${place.name} (${place.rating ? place.rating + '⭐' : 'No rating'})\n`;
                });
            });
        }
        if (notFoundBrands.length > 0) {
            const notFoundNames = notFoundBrands.map(([brand]) => brand).slice(0, 10);
            analysis += `\n❌ BRANDS NOT FOUND: ${notFoundNames.join(', ')}${notFoundBrands.length > 10 ? ` and ${notFoundBrands.length - 10} more` : ''}\n`;
        }
        return analysis || 'No brand data available.';
    }
    getTierSpecificBusinessInsights(cityTier) {
        switch (cityTier) {
            case 'tier1':
                return `
- TIER-1 CHALLENGES: High competition from established players, premium rent costs, sophisticated customer expectations
- MARKET REALITY: Over-saturated with organized food chains, higher customer acquisition costs
- SUCCESS FACTORS: Requires premium positioning, unique value proposition, high investment
- VIABILITY: CHALLENGING - Only recommend exceptional high-footfall locations`;
            case 'tier2':
                return `
- TIER-2 SWEET SPOT: Optimal balance of market demand and competition levels
- MARKET REALITY: Growing food culture, emerging disposable income, moderate competition  
- SUCCESS FACTORS: Quality focus, reasonable pricing, good location selection
- VIABILITY: EXCELLENT - Highest probability of business success`;
            case 'tier3':
                return `
- TIER-3 OPPORTUNITY: Untapped markets with low competition, cost advantages
- MARKET REALITY: Limited organized food options, novelty factor for momos
- SUCCESS FACTORS: Market education, consistent quality, affordable pricing
- VIABILITY: VERY GOOD - Strong growth potential with lower risks`;
            default:
                return "Standard market analysis applicable";
        }
    }
    generateContextualScoringGuidelines(locationData, cityTier) {
        const { businesses, brands, summary } = locationData;
        const totalBusinesses = summary.overall?.totalBusinesses || 0;
        const brandCount = Object.values(brands).filter((b) => Array.isArray(b) ? b.length > 0 : (b?.found || false)).length;
        const competitionLevel = summary.overall?.enhancedMetrics?.competitionScore || 3;
        return `
CONTEXT-AWARE SCORING GUIDELINES:

CITY TIER BUSINESS VIABILITY (Critical Factor):
${this.getCityTierScoringGuideline(cityTier)}

FOOTFALL PARAMETER (Weight: 5):
${totalBusinesses >= 80 ? `Score 5: Excellent (${totalBusinesses} businesses = high density area)` :
            totalBusinesses >= 50 ? `Score 4: Good (${totalBusinesses} businesses = moderate density)` :
                totalBusinesses >= 25 ? `Score 3: Average (${totalBusinesses} businesses = developing area)` :
                    `Score 2: Poor (${totalBusinesses} businesses = low activity area)`}

FOOD BRAND PRESENCE (Weight: 4):
${this.getFoodBrandScoringGuideline(brandCount, cityTier)}

COMPETITION ANALYSIS (Weight: 5):
${this.getCompetitionScoringGuideline(competitionLevel, cityTier)}

UNIVERSITY PROXIMITY (Weight: 4):
${this.getUniversityProximityGuideline(businesses.universities || [])}

TARGET AUDIENCE FIT (Weight: 5):
${this.getTargetAudienceScoringGuideline(cityTier)}`;
    }
    getCityTierScoringGuideline(cityTier) {
        switch (cityTier) {
            case 'tier1':
                return `Score 2-3: TIER-1 CITY (Challenging market - high competition, costs, saturation)
- Requires exceptional location and differentiation for success
- Consider only premium high-footfall locations`;
            case 'tier2':
                return `Score 4-5: TIER-2 CITY (OPTIMAL MARKET - proven business success zone)
- Excellent balance of demand and competition
- Higher probability of business success`;
            case 'tier3':
                return `Score 4: TIER-3 CITY (GOOD MARKET - untapped potential)
- Low competition advantage with growth opportunity
- Cost advantages for sustainable business`;
            default:
                return `Score 3: Standard market analysis`;
        }
    }
    getFoodBrandScoringGuideline(brandCount, cityTier) {
        if (cityTier === 'tier1') {
            return brandCount >= 8 ? `Score 4: Good for Tier-1 (${brandCount} brands = sophisticated but saturated)` :
                brandCount >= 5 ? `Score 3: Average for Tier-1 (${brandCount} brands = competitive market)` :
                    `Score 2: Poor for Tier-1 (${brandCount} brands = insufficient market sophistication)`;
        }
        if (cityTier === 'tier2') {
            return brandCount >= 5 ? `Score 5: Excellent for Tier-2 (${brandCount} brands = optimal market sophistication)` :
                brandCount >= 3 ? `Score 5: Excellent for Tier-2 (${brandCount} brands = emerging market opportunity)` :
                    brandCount >= 1 ? `Score 4: Good for Tier-2 (${brandCount} brands = developing market)` :
                        `Score 3: Average for Tier-2 (untested but potential market)`;
        }
        return brandCount >= 3 ? `Score 5: Excellent for Tier-3 (${brandCount} brands = sophisticated market)` :
            brandCount >= 1 ? `Score 5: Excellent for Tier-3 (${brandCount} brands = emerging market)` :
                `Score 4: Good for Tier-3 (untapped market with potential)`;
    }
    getCompetitionScoringGuideline(competitionLevel, cityTier) {
        if (cityTier === 'tier1') {
            return competitionLevel === 5 ? `Score 3: Moderate for Tier-1 (optimal density but high competition)` :
                competitionLevel === 4 ? `Score 3: Moderate for Tier-1 (emerging but competitive)` :
                    competitionLevel <= 2 ? `Score 4: Good for Tier-1 (low competition advantage)` :
                        `Score 2: Poor for Tier-1 (oversaturated market)`;
        }
        if (cityTier === 'tier2') {
            return competitionLevel === 5 ? `Score 5: Excellent for Tier-2 (optimal market conditions)` :
                competitionLevel === 4 ? `Score 5: Excellent for Tier-2 (growing market)` :
                    competitionLevel === 3 ? `Score 4: Good for Tier-2 (manageable competition)` :
                        competitionLevel === 2 ? `Score 4: Good for Tier-2 (market development opportunity)` :
                            `Score 3: Average for Tier-2 (high saturation)`;
        }
        return competitionLevel <= 3 ? `Score 5: Excellent for Tier-3 (low competition advantage)` :
            competitionLevel === 4 ? `Score 4: Good for Tier-3 (healthy competition)` :
                `Score 3: Average for Tier-3 (higher than expected competition)`;
    }
    getUniversityProximityGuideline(universities) {
        const count = universities.length;
        const avgDistance = count > 0 ? this.calculateAverageDistance(universities) : 1000;
        if (count >= 3 && avgDistance <= 500)
            return `Score 5: Excellent (${count} universities within 500m)`;
        if (count >= 2 && avgDistance <= 800)
            return `Score 4: Good (${count} universities within 800m)`;
        if (count >= 1 && avgDistance <= 1000)
            return `Score 3: Average (${count} university within 1km)`;
        return `Score 2: Poor (${count} universities, distant or none)`;
    }
    calculateAverageDistance(places) {
        if (!places.length)
            return 0;
        return 600;
    }
    getTargetAudienceScoringGuideline(cityTier) {
        const baseGuidelines = `
- Score 5: 3+ colleges + 20+ offices + residential areas within 1km
- Score 4: 2+ colleges + 10+ offices OR high footfall area  
- Score 3: 1 college + moderate commercial activity
- Score 2: Limited educational institutions + low commercial activity
- Score 1: No colleges/universities + very low commercial activity`;
        const tierAdjustment = {
            'tier1': '\n+ Tier-1 Adjustment: Reduce scores by 0.5 due to higher competition',
            'tier2': '\n+ Tier-2 Advantage: Add 0.5 to scores due to optimal market conditions',
            'tier3': '\n+ Tier-3 Advantage: Add 0.3 to scores due to low competition'
        };
        return baseGuidelines + (tierAdjustment[cityTier] || '');
    }
    generateBaselineScoresSection(baselineScores) {
        let section = `
📊 QUANTITATIVE BASELINE (Google API Data Analysis):
DATA-DRIVEN SCORE RECOMMENDATIONS (Use as starting point, adjust ±1 based on qualitative factors):
`;
        Object.entries(baselineScores).forEach(([param, scoreData]) => {
            section += `${param}: Recommended ${scoreData.score}/5 based on: ${scoreData.reasoning}\n`;
        });
        section += `
🎯 BASELINE USAGE INSTRUCTIONS:
- These scores are calculated from actual Google API data using proven thresholds
- Start with these baseline scores as your foundation
- Adjust ±1 point only if you have strong qualitative evidence
- Explain any deviation from baseline in your reasoning
- This ensures varied scores based on actual location quality differences
`;
        return section;
    }
    validateAIScores(aiScores, baselineScores) {
        const validatedScores = {};
        Object.keys(baselineScores).forEach(param => {
            const aiScoreData = aiScores[param] || {};
            const aiScore = typeof aiScoreData === 'object' ? (aiScoreData.score || 3) : aiScoreData;
            const dataScore = baselineScores[param]?.score || 3;
            const maxScore = Math.min(5, dataScore + 1);
            const minScore = Math.max(1, dataScore - 1);
            const finalScore = Math.max(minScore, Math.min(maxScore, aiScore));
            const adjustment = finalScore - dataScore;
            validatedScores[param] = {
                score: finalScore,
                reasoning: aiScoreData.reasoning || `Data-driven baseline score of ${dataScore}/5`,
                weightedScore: aiScoreData.weightedScore || (finalScore * this.getParameterWeight(param)),
                dataBaseline: dataScore,
                aiOriginal: aiScore,
                adjustment: adjustment,
                adjustmentReason: adjustment !== 0 ?
                    `Adjusted ${adjustment > 0 ? '+' : ''}${adjustment} from baseline based on qualitative factors` :
                    'Matches data baseline'
            };
            if (Math.abs(adjustment) > 1) {
                console.log(`⚠️ VALIDATION: ${param} AI score ${aiScore} adjusted to ${finalScore} (max ±1 from baseline ${dataScore})`);
            }
        });
        console.log(`✅ VALIDATION: AI scores validated against data baseline for ${Object.keys(validatedScores).length} parameters`);
        return validatedScores;
    }
    getParameterWeight(parameterId) {
        const weights = {
            'food_brand_presence': 4,
            'clothing_brand_presence': 2,
            'footwear_brand_presence': 2,
            'nearby_schools_colleges': 3,
            'petrol_pump_nearby': 2,
            'footfall': 5,
            'target_audience_fit': 5,
            'competition_pricing_momo': 3,
            'spending_capacity': 4,
            'nearby_businesses_offices': 4,
            'vehicle_mix_mobility': 2,
            'residential_society_presence': 4,
            'shopping_preferences_nearby': 3,
            'fitness_gym_walking_culture': 3,
            'zomato_swiggy_delivery_density': 4,
            'student_vs_office_crowd_mix': 3,
            'nightlife_cafe_presence': 3,
            'local_events_weekly_bazaars': 2,
            'hospitals_clinics_nearby': 2,
            'police_security_presence': 2,
            'outdoor_branding_scope': 5,
            'footpath_road_width': 3
        };
        return weights[parameterId] || 3;
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map