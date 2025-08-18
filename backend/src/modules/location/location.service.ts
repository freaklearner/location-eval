import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

interface LocationAnalysisRequest {
  lat: number;
  lng: number;
  radius?: number;
}

export interface BusinessSearchResult {
  results: any[];
  status: string;
}

interface EvaluationConfig {
  evaluationParameters: any[];
  businessSearchTypes: any[];
  brandCategories: any;
  scoringRules: any;
  viabilityThresholds: any;
  competitionScoringRules?: any;
  footfallScoringRules?: any;
  validFoodTypes?: string[];
  excludedFromFoodSearch?: string[];
  foodKeywords?: string[];
  confidenceFactors?: any;
}

interface FilteredResult {
  place: any;
  distance: number;
  isValid: boolean;
}

@Injectable()
export class LocationService {
  private readonly googleMapsApiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api/place';
  private evaluationConfig: EvaluationConfig;
  
  // 🚨 CRITICAL: Maximum tolerance for radius compliance (5%)
  private readonly RADIUS_TOLERANCE_PERCENT = 0.05;

  constructor(private configService: ConfigService) {
    this.googleMapsApiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    if (!this.googleMapsApiKey) {
      throw new Error('Google Maps API key not configured');
    }
    
    // Load evaluation configuration
    this.loadEvaluationConfig();
  }

  private loadEvaluationConfig() {
    try {
      const configPath = path.join(__dirname, '../../config/evaluation.config.json');
      const configData = fs.readFileSync(configPath, 'utf8');
      this.evaluationConfig = JSON.parse(configData);
      console.log('✅ Evaluation configuration loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load evaluation configuration:', error);
      // Fallback to default configuration
      this.evaluationConfig = this.getDefaultConfig();
    }
  }

  private getDefaultConfig(): EvaluationConfig {
    return {
      evaluationParameters: [],
      businessSearchTypes: [
        { key: 'restaurants', type: 'restaurant', description: 'All restaurants and eateries' },
        { key: 'food', type: 'meal_takeaway', description: 'Food takeaway establishments' },
        { key: 'cafes', type: 'cafe', description: 'Coffee shops and cafes' },
        { key: 'universities', type: 'university', description: 'Higher education institutions' },
        { key: 'hospitals', type: 'hospital', description: 'Healthcare facilities' },
        { key: 'gas_stations', type: 'gas_station', description: 'Fuel stations' },
        { key: 'shopping_malls', type: 'shopping_mall', description: 'Shopping centers and malls' },
        { key: 'gyms', type: 'gym', description: 'Fitness centers and gyms' },
        { key: 'banks', type: 'bank', description: 'Banking facilities' },
        { key: 'atms', type: 'atm', description: 'ATM locations' }
      ],
      brandCategories: {},
      scoringRules: {},
      viabilityThresholds: {}
    };
  }

  getEvaluationConfig(): EvaluationConfig {
    return this.evaluationConfig;
  }

  /**
   * 🚨 CRITICAL: Calculate Haversine distance between two points in meters
   * Used for strict radius compliance validation
   */
  private calculateHaversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 🚨 CRITICAL: Validate all results are within user-specified radius + tolerance
   * Maximum tolerance: 5% of user radius
   */
  private validateRadiusCompliance(results: any[], centerLat: number, centerLng: number, userRadius: number): FilteredResult[] {
    const maxAllowedDistance = userRadius + (userRadius * this.RADIUS_TOLERANCE_PERCENT);
    
    return results.map(place => {
      const distance = this.calculateHaversineDistance(
        centerLat,
        centerLng,
        place.geometry.location.lat,
        place.geometry.location.lng
      );
      
      const isValid = distance <= maxAllowedDistance;
      
      if (!isValid) {
        console.log(`🚫 RADIUS VIOLATION: ${place.name} at ${distance.toFixed(0)}m exceeds max allowed ${maxAllowedDistance.toFixed(0)}m`);
      }
      
      return {
        place,
        distance,
        isValid
      };
    }).filter(result => result.isValid);
  }

  /**
   * 🚨 CRITICAL: Filter results by business type to remove irrelevant businesses
   * E.g., remove banks from food searches
   */
  private filterByBusinessType(results: any[], allowedTypes: string[], excludedTypes: string[] = []): any[] {
    return results.filter(place => {
      const placeTypes = place.types || [];
      
      // Exclude explicitly banned types
      const hasExcludedType = excludedTypes.some(excludedType => 
        placeTypes.includes(excludedType)
      );
      
      if (hasExcludedType) {
        console.log(`🚫 TYPE FILTER: Excluding ${place.name} - contains excluded type: ${placeTypes.join(', ')}`);
        return false;
      }
      
      // Include if has allowed type
      const hasAllowedType = allowedTypes.some(allowedType => 
        placeTypes.includes(allowedType)
      );
      
      return hasAllowedType;
    });
  }

  /**
   * 🚨 CRITICAL: Validate exact brand matches to avoid false positives
   */
  private isValidBrandMatch(brandName: string, foundPlace: any): boolean {
    const placeName = foundPlace.name?.toLowerCase() || '';
    const brandLower = brandName.toLowerCase();
    
    // Strict matching for major brands to avoid false positives
    const strictBrands = {
      'h&m': ['h&m', 'h & m'],
      'zara': ['zara'],
      'uniqlo': ['uniqlo'],
      'marks & spencer': ['marks & spencer', 'marks and spencer', 'm&s'],
      'forever 21': ['forever 21', 'forever21'],
      'mcdonald\'s': ['mcdonald\'s', 'mcdonalds', 'mcd'],
      'kfc': ['kfc', 'kentucky fried chicken'],
      'pizza hut': ['pizza hut', 'pizzahut'],
      'burger king': ['burger king', 'burgerking'],
      'domino\'s': ['domino\'s', 'dominos'],
      'starbucks': ['starbucks'],
      'costa coffee': ['costa coffee', 'costa'],
      'cafe coffee day': ['cafe coffee day', 'ccd'],
      'shoppers stop': ['shoppers stop', 'shoppersstop'],
      'wow! momo': ['wow! momo', 'wow momo', 'wowmomo']
    };

    if (strictBrands[brandLower]) {
      const isMatch = strictBrands[brandLower].some(validName => 
        placeName.includes(validName) || placeName === validName
      );
      
      if (!isMatch) {
        console.log(`🚫 BRAND MISMATCH: "${placeName}" doesn't match "${brandName}"`);
      }
      
      return isMatch;
    }

    // For other brands, use contains check but avoid obvious false positives
    const isMatch = placeName.includes(brandLower) && 
           !placeName.includes('fashion hub') && 
           !placeName.includes('garment') &&
           !placeName.includes('tailor') &&
           !placeName.includes('boutique');
           
    if (!isMatch) {
      console.log(`🚫 BRAND MISMATCH: "${placeName}" doesn't match "${brandName}" or contains false positive terms`);
    }
    
    return isMatch;
  }

  /**
   * 🎯 ENHANCED: Calculate weighted footfall score based on business quality and distance
   */
  private calculateWeightedFootfallScore(businesses: any[], centerLat: number, centerLng: number, radius: number): number {
    const config = this.evaluationConfig;
    const businessWeights = config.footfallScoringRules?.businessWeights || {};
    const ratingRules = config.footfallScoringRules?.ratingMultipliers || {};
    
    let totalScore = 0;
    
    businesses.forEach(business => {
      // Get business type weight
      const businessType = this.getPrimaryBusinessType(business.types || []);
      const typeWeight = businessWeights[businessType] || 1;
      
      // Get rating multiplier
      const rating = business.rating || 0;
      const reviewCount = business.user_ratings_total || 0;
      const ratingMultiplier = this.getRatingMultiplier(rating, reviewCount, ratingRules);
      
      // Calculate distance decay factor
      const distance = this.calculateHaversineDistance(
        centerLat, centerLng, 
        business.geometry.location.lat, business.geometry.location.lng
      );
      const distanceWeight = this.getDistanceWeight(distance, radius);
      
      // Calculate final weighted score for this business
      const businessScore = typeWeight * ratingMultiplier * distanceWeight;
      totalScore += businessScore;
      
      console.log(`📊 ${business.name}: type=${businessType}(${typeWeight}), rating=${rating}(${ratingMultiplier}), distance=${distance}m(${distanceWeight.toFixed(2)}) = ${businessScore.toFixed(2)}`);
    });
    
    return totalScore;
  }

  /**
   * Get primary business type from types array
   */
  private getPrimaryBusinessType(types: string[]): string {
    const priorityOrder = ['restaurant', 'university', 'hospital', 'shopping_mall', 'cafe', 'bank', 'gym', 'gas_station'];
    
    for (const priority of priorityOrder) {
      if (types.includes(priority)) {
        return priority;
      }
    }
    
    return types[0] || 'establishment';
  }

  /**
   * Calculate rating-based multiplier
   */
  private getRatingMultiplier(rating: number, reviewCount: number, rules: any): number {
    if (!rating || reviewCount < (rules.lowConfidence?.minReviews || 0)) {
      return rules.lowConfidence?.multiplier || 0.8;
    }
    
    if (rating >= (rules.highQuality?.minRating || 4.0) && reviewCount >= (rules.highQuality?.minReviews || 100)) {
      return rules.highQuality?.multiplier || 1.3;
    }
    
    if (rating >= (rules.goodQuality?.minRating || 3.5) && reviewCount >= (rules.goodQuality?.minReviews || 50)) {
      return rules.goodQuality?.multiplier || 1.1;
    }
    
    if (rating >= (rules.average?.minRating || 3.0)) {
      return rules.average?.multiplier || 1.0;
    }
    
    return rules.poor?.multiplier || 0.7;
  }

  /**
   * Calculate distance decay factor
   */
  private getDistanceWeight(distance: number, maxRadius: number): number {
    const ratio = distance / maxRadius;
    return Math.max(0.3, 1 - (ratio * 0.7)); // Closer = higher impact
  }

  /**
   * 🎯 SMART COMPETITION ANALYSIS: Calculate balanced competition score
   */
  private calculateCompetitionScore(competitors: any[], radius: number): number {
    const density = competitors.length / (radius / 1000); // competitors per km
    const rules = this.evaluationConfig.competitionScoringRules;
    
    if (!rules) {
      // Fallback logic
      if (density >= 8 && density <= 15) return 5; // Optimal
      if (density >= 5 && density < 8) return 4;   // Good
      if (density >= 15 && density < 25) return 3; // Moderate
      if (density < 5) return 2;                   // Low
      if (density >= 25) return 1;                 // Oversaturated
      return 3;
    }
    
    // Use configured rules
    for (const [key, rule] of Object.entries(rules)) {
      const r = rule as any;
      if (density >= r.minDensity && density < r.maxDensity) {
        console.log(`🏆 Competition Level: ${key} (density: ${density.toFixed(2)}/km, score: ${r.score}) - ${r.description}`);
        return r.score;
      }
    }
    
    return 3; // Default moderate score
  }

  /**
   * 🎯 ENHANCED: Identify direct vs indirect competitors
   */
  private categorizeCompetitors(competitors: any[]): { direct: any[], indirect: any[] } {
    const config = this.evaluationConfig;
    const competitionParam = config.evaluationParameters.find(p => p.id === 'competition_pricing_momo');
    
    if (!competitionParam?.competitionTypes) {
      return { direct: [], indirect: competitors };
    }
    
    const directTerms = competitionParam.competitionTypes.direct || [];
    const indirectTerms = competitionParam.competitionTypes.indirect || [];
    
    const direct: any[] = [];
    const indirect: any[] = [];
    
    competitors.forEach(competitor => {
      const name = competitor.name.toLowerCase();
      const types = (competitor.types || []).join(' ').toLowerCase();
      
      const isDirect = directTerms.some(term => 
        name.includes(term.toLowerCase()) || types.includes(term.toLowerCase())
      );
      
      if (isDirect) {
        direct.push(competitor);
      } else {
        const isIndirect = indirectTerms.some(term => 
          name.includes(term.toLowerCase()) || types.includes(term.toLowerCase())
        );
        
        if (isIndirect) {
          indirect.push(competitor);
        }
      }
    });
    
    console.log(`🎯 Competition Analysis: ${direct.length} direct, ${indirect.length} indirect competitors`);
    return { direct, indirect };
  }

  /**
   * 🚨 FIXED: Use EXACT user-provided radius for nearby search
   * NO hardcoded radius values allowed
   */
  async findNearbyBusinesses(lat: number, lng: number, type: string, userRadius: number): Promise<BusinessSearchResult> {
    try {
      console.log(`🔍 NEARBY SEARCH: ${type} within ${userRadius}m radius`);
      
      const url = `${this.baseUrl}/nearbysearch/json`;
      const params = {
        location: `${lat},${lng}`,
        radius: userRadius.toString(), // 🚨 CRITICAL: Use EXACT user radius
        type,
        key: this.googleMapsApiKey,
      };

      const response = await axios.get(url, { params });
      
      if (response.data.status === 'OVER_QUERY_LIMIT') {
        throw new HttpException('API quota exceeded', HttpStatus.TOO_MANY_REQUESTS);
      }
      
      if (response.data.status === 'REQUEST_DENIED') {
        throw new HttpException('API request denied', HttpStatus.FORBIDDEN);
      }

      return response.data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to fetch nearby businesses: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 🚨 FIXED: Use EXACT user-provided radius for text search
   * NO hardcoded radius values allowed
   */
  async searchByText(lat: number, lng: number, query: string, userRadius: number): Promise<BusinessSearchResult> {
    try {
      console.log(`🔍 TEXT SEARCH: "${query}" within ${userRadius}m radius`);
      
      const url = `${this.baseUrl}/textsearch/json`;
      const params = {
        query: encodeURIComponent(query),
        location: `${lat},${lng}`,
        radius: userRadius.toString(), // 🚨 CRITICAL: Use EXACT user radius
        key: this.googleMapsApiKey,
      };

      const response = await axios.get(url, { params });
      
      if (response.data.status === 'OVER_QUERY_LIMIT') {
        throw new HttpException('API quota exceeded', HttpStatus.TOO_MANY_REQUESTS);
      }
      
      if (response.data.status === 'REQUEST_DENIED') {
        throw new HttpException('API request denied', HttpStatus.FORBIDDEN);
      }

      return response.data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to search by text: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getLocationInfo(lat: number, lng: number): Promise<any> {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json`;
      const params = {
        latlng: `${lat},${lng}`,
        key: this.googleMapsApiKey,
      };

      const response = await axios.get(url, { params });
      
      if (response.data.status === 'OVER_QUERY_LIMIT') {
        throw new HttpException('API quota exceeded', HttpStatus.TOO_MANY_REQUESTS);
      }
      
      if (response.data.status === 'REQUEST_DENIED') {
        throw new HttpException('API request denied', HttpStatus.FORBIDDEN);
      }

      return response.data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to get location info: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 🚀 PROGRESSIVE ANALYSIS: Phase-based loading for 15-20 second initial insights
   */
  async analyzeLocationProgressive(lat: number, lng: number, radius: number = 1000, progressCallback?: (phase: number, data: any) => void): Promise<any> {
    console.log(`🚀 PROGRESSIVE ANALYSIS: Starting phased analysis for lat=${lat}, lng=${lng}, radius=${radius}m`);

    try {
      const analysis = {
        coordinates: { lat, lng, radius },
        businesses: {},
        brands: {},
        summary: {},
        rawData: {},
        config: this.evaluationConfig,
        progressiveResults: []
      };

      // Phase 1: Critical Data (15-20 seconds) - High priority business types and top brands
      console.log('📊 PHASE 1: Critical data collection starting...');
      const phase1Start = Date.now();
      
      const criticalBusinessTypes = ['restaurants', 'universities', 'hospitals', 'shopping_malls'];
      const topBrands = ['McDonald\'s', 'KFC', 'Domino\'s', 'Pizza Hut', 'Starbucks', 'Wow! Momo', 'Haldiram\'s', 'Cafe Coffee Day'];

      // Collect critical business data
      for (const type of criticalBusinessTypes) {
        try {
          const result = await this.findNearbyBusinesses(lat, lng, type, radius);
          const validatedResults = this.validateRadiusCompliance(result.results || [], lat, lng, radius);
          const filteredResults = validatedResults.map(r => r.place);

          analysis.businesses[type] = filteredResults;
          analysis.rawData[type] = {
            ...result,
            filteredCount: filteredResults.length,
            originalCount: result.results?.length || 0,
            radiusCompliant: true
          };

          await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
        } catch (error) {
          console.warn(`Phase 1 - Failed to search for ${type}:`, error.message);
          analysis.businesses[type] = [];
        }
      }

      // Collect top brand data
      for (const brand of topBrands) {
        try {
          const result = await this.searchByText(lat, lng, brand, radius);
          const validatedResults = this.validateRadiusCompliance(result.results || [], lat, lng, radius);
          const validPlaces = validatedResults
            .map(r => r.place)
            .filter(place => this.isValidBrandMatch(brand, place));

          analysis.brands[brand] = {
            found: validPlaces.length > 0,
            places: validPlaces,
            searchRadius: radius,
            radiusCompliant: true
          };

          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          console.warn(`Phase 1 - Failed to search for ${brand}:`, error.message);
          analysis.brands[brand] = { found: false, places: [], searchRadius: radius, radiusCompliant: true };
        }
      }

      // Generate Phase 1 summary
      const phase1Summary = this.generateSummary(analysis.businesses, analysis.brands, lat, lng, radius);
      analysis.summary = phase1Summary;
      analysis.progressiveResults.push({
        phase: 1,
        timestamp: new Date().toISOString(),
        duration: Date.now() - phase1Start,
        data: { ...analysis }
      });

      console.log(`✅ PHASE 1 COMPLETE: ${Date.now() - phase1Start}ms - Critical data collected`);
      
      if (progressCallback) {
        progressCallback(1, {
          phase: 1,
          message: '📊 Phase 1 complete: Critical business data collected',
          timeEstimate: '15-20 seconds',
          data: analysis,
          isComplete: false
        });
      }

      // Phase 2: Enhanced Data (30-45 seconds) - Additional business types and mid-tier brands
      console.log('📈 PHASE 2: Enhanced data collection starting...');
      const phase2Start = Date.now();
      
      const enhancedBusinessTypes = ['cafes', 'gyms', 'banks', 'gas_stations', 'pharmacies', 'bakery'];
      const midTierBrands = ['H&M', 'Zara', 'Nike', 'Adidas', 'DMart', 'Reliance Trends', 'Big Bazaar', 'Bata'];

      // Collect enhanced business data
      for (const type of enhancedBusinessTypes) {
        try {
          const result = await this.findNearbyBusinesses(lat, lng, type, radius);
          const validatedResults = this.validateRadiusCompliance(result.results || [], lat, lng, radius);
          const filteredResults = validatedResults.map(r => r.place);

          analysis.businesses[type] = filteredResults;
          analysis.rawData[type] = {
            ...result,
            filteredCount: filteredResults.length,
            originalCount: result.results?.length || 0,
            radiusCompliant: true
          };

          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          console.warn(`Phase 2 - Failed to search for ${type}:`, error.message);
          analysis.businesses[type] = [];
        }
      }

      // Collect mid-tier brand data
      for (const brand of midTierBrands) {
        try {
          const result = await this.searchByText(lat, lng, brand, radius);
          const validatedResults = this.validateRadiusCompliance(result.results || [], lat, lng, radius);
          const validPlaces = validatedResults
            .map(r => r.place)
            .filter(place => this.isValidBrandMatch(brand, place));

          analysis.brands[brand] = {
            found: validPlaces.length > 0,
            places: validPlaces,
            searchRadius: radius,
            radiusCompliant: true
          };

          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          console.warn(`Phase 2 - Failed to search for ${brand}:`, error.message);
          analysis.brands[brand] = { found: false, places: [], searchRadius: radius, radiusCompliant: true };
        }
      }

      // Update summary with Phase 2 data
      const phase2Summary = this.generateSummary(analysis.businesses, analysis.brands, lat, lng, radius);
      analysis.summary = phase2Summary;
      analysis.progressiveResults.push({
        phase: 2,
        timestamp: new Date().toISOString(),
        duration: Date.now() - phase2Start,
        data: { ...analysis }
      });

      console.log(`✅ PHASE 2 COMPLETE: ${Date.now() - phase2Start}ms - Enhanced data collected`);
      
      if (progressCallback) {
        progressCallback(2, {
          phase: 2,
          message: '📈 Phase 2 complete: Enhanced business analysis',
          timeEstimate: '30-45 seconds',
          data: analysis,
          isComplete: false
        });
      }

      // Phase 3: Comprehensive Data (60-90 seconds) - Remaining business types and brands
      console.log('🔍 PHASE 3: Comprehensive data collection starting...');
      const phase3Start = Date.now();
      
      const remainingBusinessTypes = ['atms', 'parks', 'bus_stations', 'metro_stations', 'railway_stations', 'temples', 'places_of_worship'];
      const remainingBrands = this.getAllBrandsFromConfig().filter(brand => 
        !topBrands.includes(brand) && !midTierBrands.includes(brand)
      );

      // Collect remaining business data
      for (const type of remainingBusinessTypes) {
        try {
          const result = await this.findNearbyBusinesses(lat, lng, type, radius);
          const validatedResults = this.validateRadiusCompliance(result.results || [], lat, lng, radius);
          const filteredResults = validatedResults.map(r => r.place);

          analysis.businesses[type] = filteredResults;
          analysis.rawData[type] = {
            ...result,
            filteredCount: filteredResults.length,
            originalCount: result.results?.length || 0,
            radiusCompliant: true
          };

          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          console.warn(`Phase 3 - Failed to search for ${type}:`, error.message);
          analysis.businesses[type] = [];
        }
      }

      // Collect remaining brand data (in batches to avoid overwhelming)
      const brandBatches = this.chunkArray(remainingBrands, 5);
      for (const brandBatch of brandBatches) {
        await Promise.all(brandBatch.map(async (brand) => {
          try {
            const result = await this.searchByText(lat, lng, brand, radius);
            const validatedResults = this.validateRadiusCompliance(result.results || [], lat, lng, radius);
            const validPlaces = validatedResults
              .map(r => r.place)
              .filter(place => this.isValidBrandMatch(brand, place));

            analysis.brands[brand] = {
              found: validPlaces.length > 0,
              places: validPlaces,
              searchRadius: radius,
              radiusCompliant: true
            };
          } catch (error) {
            console.warn(`Phase 3 - Failed to search for ${brand}:`, error.message);
            analysis.brands[brand] = { found: false, places: [], searchRadius: radius, radiusCompliant: true };
          }
        }));
        
        await new Promise(resolve => setTimeout(resolve, 200)); // Longer delay between batches
      }

      // Final summary
      const finalSummary = this.generateSummary(analysis.businesses, analysis.brands, lat, lng, radius);
      analysis.summary = finalSummary;
      analysis.progressiveResults.push({
        phase: 3,
        timestamp: new Date().toISOString(),
        duration: Date.now() - phase3Start,
        data: { ...analysis }
      });

      console.log(`✅ PHASE 3 COMPLETE: ${Date.now() - phase3Start}ms - Comprehensive analysis finished`);
      
      if (progressCallback) {
        progressCallback(3, {
          phase: 3,
          message: '🔍 Phase 3 complete: Comprehensive analysis finished',
          timeEstimate: '60-90 seconds',
          data: analysis,
          isComplete: true
        });
      }

      console.log(`🎯 PROGRESSIVE ANALYSIS COMPLETE: All phases finished - ${analysis.progressiveResults.length} phases`);
      return analysis;

    } catch (error) {
      throw new HttpException(
        `Progressive analysis failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Utility method to chunk arrays for batch processing
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * 🎯 COMPLETELY REWRITTEN: Strict radius compliance and accurate filtering
   */
  async analyzeLocation(request: LocationAnalysisRequest): Promise<any> {
    const { lat, lng, radius = 1000 } = request;

    console.log(`🎯 LOCATION ANALYSIS: lat=${lat}, lng=${lng}, radius=${radius}m (STRICT COMPLIANCE MODE)`);

    try {
      const analysis = {
        coordinates: { lat, lng, radius },
        businesses: {},
        brands: {},
        summary: {},
        rawData: {},
        config: this.evaluationConfig
      };

      // 🚨 CRITICAL: Use configured search types with proper filtering
      const searchTypes = this.evaluationConfig.businessSearchTypes;

      // Search by business types with strict radius compliance
      for (const { key, type } of searchTypes) {
        try {
          console.log(`🔍 Searching for ${type} within ${radius}m...`);
          
          const result = await this.findNearbyBusinesses(lat, lng, type, radius);
          let filteredResults = result.results || [];
          
          // 🚨 CRITICAL: Validate radius compliance for ALL results
          const validatedResults = this.validateRadiusCompliance(filteredResults, lat, lng, radius);
          filteredResults = validatedResults.map(r => r.place);
          
          // 🚨 CRITICAL: Apply business type filtering
          if (key === 'restaurants' || key === 'food' || key === 'cafes') {
            // Remove banks, ATMs, and other non-food businesses from food searches
            const excludedTypes = ['bank', 'atm', 'finance', 'insurance_agency', 'real_estate_agency'];
            const allowedTypes = ['restaurant', 'food', 'meal_takeaway', 'cafe', 'bakery'];
            filteredResults = this.filterByBusinessType(filteredResults, allowedTypes, excludedTypes);
          }
          
          analysis.businesses[key] = filteredResults;
          analysis.rawData[key] = {
            ...result,
            filteredCount: filteredResults.length,
            originalCount: result.results?.length || 0,
            radiusCompliant: true
          };
          
          console.log(`✅ ${type}: Found ${filteredResults.length} valid businesses (filtered from ${result.results?.length || 0} total)`);
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`Failed to search for ${type}:`, error.message);
          analysis.businesses[key] = [];
        }
      }

      // 🚨 CRITICAL: Brand search with EXACT user radius (NO hardcoded multipliers)
      const allBrands = this.getAllBrandsFromConfig();
      
      console.log(`🏷️ Searching for ${allBrands.length} brands with EXACT user radius: ${radius}m`);
      
      for (const brand of allBrands) {
        try {
          // 🚨 CRITICAL: Use EXACT user radius, NOT hardcoded multipliers
          let result = await this.searchByText(lat, lng, brand, radius);
          let validPlaces = [];
          
          // Validate primary search results
          if (result.results && result.results.length > 0) {
            // 🚨 CRITICAL: Validate radius compliance FIRST
            const radiusValidatedResults = this.validateRadiusCompliance(result.results, lat, lng, radius);
            // Then validate brand match
            validPlaces = radiusValidatedResults
              .map(r => r.place)
              .filter(place => this.isValidBrandMatch(brand, place));
          }
          
          // If no valid results found, try alternative search strategies
          if (validPlaces.length === 0) {
            const alternativeQueries = this.getAlternativeBrandQueries(brand);
            for (const altQuery of alternativeQueries) {
              // 🚨 CRITICAL: Use EXACT user radius for alternative queries too
              const altResult = await this.searchByText(lat, lng, altQuery, radius);
              if (altResult.results && altResult.results.length > 0) {
                // 🚨 CRITICAL: Validate radius compliance for alternative results
                const altRadiusValidated = this.validateRadiusCompliance(altResult.results, lat, lng, radius);
                const validAltPlaces = altRadiusValidated
                  .map(r => r.place)
                  .filter(place => this.isValidBrandMatch(brand, place));
                  
                if (validAltPlaces.length > 0) {
                  validPlaces = validAltPlaces;
                  console.log(`✅ Found ${brand} using alternative query: "${altQuery}" (${validPlaces.length} valid locations within ${radius}m)`);
                  break;
                }
              }
              // Small delay between alternative queries
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
          
          analysis.brands[brand] = {
            found: validPlaces.length > 0,
            places: validPlaces,
            searchRadius: radius, // 🚨 CRITICAL: Record ACTUAL search radius used
            radiusCompliant: true
          };
          
          if (validPlaces.length > 0) {
            console.log(`✅ Found ${brand}: ${validPlaces.length} valid locations within ${radius}m radius`);
          } else {
            console.log(`❌ Not found: ${brand} (searched within ${radius}m radius, ${result.results?.length || 0} results but none valid)`);
          }
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`Failed to search for ${brand}:`, error.message);
          analysis.brands[brand] = {
            found: false,
            places: [],
            searchRadius: radius,
            radiusCompliant: true,
            error: error.message
          };
        }
      }

      // Generate summary statistics with radius-compliant data
      analysis.summary = this.generateSummary(analysis.businesses, analysis.brands, lat, lng, radius);

      console.log(`🎯 ANALYSIS COMPLETE: All results within ${radius}m radius (±${(radius * this.RADIUS_TOLERANCE_PERCENT).toFixed(0)}m tolerance)`);
      
      return analysis;
    } catch (error) {
      throw new HttpException(
        `Failed to analyze location: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getAllBrandsFromConfig(): string[] {
    const brands = new Set<string>();
    
    // Get brands from evaluation parameters
    this.evaluationConfig.evaluationParameters.forEach(param => {
      if (param.brands) {
        param.brands.forEach(brand => brands.add(brand));
      }
    });

    // Get brands from brand categories
    Object.values(this.evaluationConfig.brandCategories).forEach((category: any) => {
      Object.values(category).forEach((brandList: any) => {
        if (Array.isArray(brandList)) {
          brandList.forEach(brand => brands.add(brand));
        }
      });
    });

    return Array.from(brands);
  }

  private getAlternativeBrandQueries(brand: string): string[] {
    // Minimal alternative queries - only exact brand name variations to avoid false positives
    const brandVariations = {
      'McDonald\'s': ['McDonalds'],
      'Domino\'s': ['Dominos'],
      'Cafe Coffee Day': ['CCD'],
      'Forever 21': ['Forever21'],
      'Shoppers Stop': ['ShoppersStop'],
      'Marks & Spencer': ['Marks and Spencer'],
      'Wow! Momo': ['Wow Momo']
    };
    return brandVariations[brand] || [];
  }

  /**
   * 🚨 ENHANCED: Generate summary with advanced footfall and competition analysis
   */
  private generateSummary(businesses: any, brands: any, lat?: number, lng?: number, radius?: number): any {
    const summary = {};

    // Business type summaries with enhanced scoring
    Object.entries(businesses).forEach(([key, places]: [string, any[]]) => {
      const weightedScore = lat && lng && radius ? 
        this.calculateWeightedFootfallScore(places, lat, lng, radius) : 0;
        
      summary[key] = {
        count: places.length,
        averageRating: this.calculateAverageRating(places),
        highRatedCount: places.filter(p => p.rating >= 4.0).length,
        popularPlaces: places.filter(p => (p.user_ratings_total || 0) > 100).length,
        weightedFootfallScore: weightedScore,
        qualityDistribution: this.getQualityDistribution(places)
      };
    });

    // Brand presence summary with competition analysis
    summary['brandPresence'] = {};
    const competitorPlaces: any[] = [];
    
    Object.entries(brands).forEach(([brand, brandData]: [string, any]) => {
      // Handle both old array format and new object format
      const places = Array.isArray(brandData) ? brandData : (brandData?.places || []);
      const found = Array.isArray(brandData) ? brandData.length > 0 : (brandData?.found || false);
      
      // Add to competitor analysis if it's a food brand
      if (found && this.isFoodBrand(brand)) {
        competitorPlaces.push(...places);
      }
      
      summary['brandPresence'][brand] = {
        present: found,
        count: places.length,
        searchRadius: brandData?.searchRadius,
        radiusCompliant: brandData?.radiusCompliant || true,
        locations: places.map(p => ({
          name: p.name,
          rating: p.rating,
          vicinity: p.vicinity,
          userRatingsTotal: p.user_ratings_total
        }))
      };
    });

    // Enhanced competition analysis
    const { direct, indirect } = this.categorizeCompetitors(competitorPlaces);
    const competitionScore = radius ? this.calculateCompetitionScore([...direct, ...indirect], radius) : 3;

    // Calculate overall metrics with enhanced algorithms
    const allBusinessPlaces = Object.values(businesses).flat() as any[];
    const totalWeightedScore = lat && lng && radius ? 
      this.calculateWeightedFootfallScore(allBusinessPlaces, lat, lng, radius) : 0;

    summary['overall'] = {
      totalBusinesses: allBusinessPlaces.length,
      premiumBrandCount: Object.values(brands).reduce((sum: number, brandData: any) => {
        const places = Array.isArray(brandData) ? brandData : (brandData?.places || []);
        return sum + places.length;
      }, 0),
      averageBusinessRating: this.calculateOverallAverageRating(businesses),
      businessDensity: this.calculateBusinessDensity(businesses),
      competitionLevel: this.calculateCompetitionLevel(businesses['restaurants'], businesses['meal_takeaway']),
      enhancedMetrics: {
        totalWeightedFootfallScore: totalWeightedScore,
        competitionScore: competitionScore,
        directCompetitors: direct.length,
        indirectCompetitors: indirect.length,
        competitionDensity: radius ? (direct.length + indirect.length) / (radius / 1000) : 0,
        qualityIndex: this.calculateQualityIndex(allBusinessPlaces)
      }
    };

    return summary;
  }

  /**
   * Get quality distribution of places
   */
  private getQualityDistribution(places: any[]): any {
    const distribution = { excellent: 0, good: 0, average: 0, poor: 0, unrated: 0 };
    
    places.forEach(place => {
      if (!place.rating) {
        distribution.unrated++;
      } else if (place.rating >= 4.5) {
        distribution.excellent++;
      } else if (place.rating >= 3.5) {
        distribution.good++;
      } else if (place.rating >= 2.5) {
        distribution.average++;
      } else {
        distribution.poor++;
      }
    });
    
    return distribution;
  }

  /**
   * Check if brand is a food brand
   */
  private isFoodBrand(brand: string): boolean {
    const foodBrands = [
      'McDonald\'s', 'KFC', 'Pizza Hut', 'Domino\'s', 'Subway', 'Burger King',
      'Starbucks', 'Costa Coffee', 'Cafe Coffee Day', 'Haldiram\'s', 'Bikanervala',
      'Sagar Ratna', 'Wow! Momo', 'Faasos', 'Box8', 'Behrouz Biryani'
    ];
    
    return foodBrands.includes(brand);
  }

  /**
   * Calculate overall quality index
   */
  private calculateQualityIndex(places: any[]): number {
    if (places.length === 0) return 0;
    
    const ratedPlaces = places.filter(p => p.rating && p.user_ratings_total);
    if (ratedPlaces.length === 0) return 0;
    
    const weightedScore = ratedPlaces.reduce((sum, place) => {
      const reviewWeight = Math.min(place.user_ratings_total / 100, 2); // Cap at 2x weight
      return sum + (place.rating * reviewWeight);
    }, 0);
    
    const totalWeight = ratedPlaces.reduce((sum, place) => {
      return sum + Math.min(place.user_ratings_total / 100, 2);
    }, 0);
    
    return totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 10) / 10 : 0;
  }

  private calculateAverageRating(places: any[]): number {
    const ratedPlaces = places.filter(p => p.rating);
    if (ratedPlaces.length === 0) return 0;
    const total = ratedPlaces.reduce((sum, place) => sum + place.rating, 0);
    return Math.round((total / ratedPlaces.length) * 10) / 10;
  }

  private calculateOverallAverageRating(businesses: any): number {
    const allPlaces = Object.values(businesses).flat() as any[];
    return this.calculateAverageRating(allPlaces);
  }

  private calculateBusinessDensity(businesses: any): string {
    const totalBusinesses = Object.values(businesses).reduce((sum: number, places: any[]) => sum + places.length, 0) as number;
    if ((totalBusinesses as number) > 100) return 'High';
    if ((totalBusinesses as number) > 50) return 'Medium';
    if ((totalBusinesses as number) > 20) return 'Low';
    return 'Very Low';
  }

  private calculateCompetitionLevel(restaurants: any[] = [], food: any[] = []): string {
    const totalFoodPlaces = restaurants.length + food.length;
    if (totalFoodPlaces > 20) return 'High';
    if (totalFoodPlaces > 10) return 'Medium';
    if (totalFoodPlaces > 5) return 'Low';
    return 'Very Low';
  }

  /**
   * 💰 PRICING INTELLIGENCE: Extract pricing information from reviews
   */
  private extractPricingFromReviews(reviews: any[]): any {
    if (!reviews || reviews.length === 0) {
      return { category: 'unknown', averagePrice: 0, confidence: 'low' };
    }

    const pricePatterns = [
      /₹\s*(\d+)/g,           // ₹100
      /rs\.?\s*(\d+)/gi,      // Rs 100 or Rs. 100
      /rupees?\s*(\d+)/gi,    // 100 rupees
      /(\d+)\s*rs\.?/gi,      // 100 rs or 100 rs.
      /inr\s*(\d+)/gi,        // INR 100
      /(\d+)\s*inr/gi         // 100 INR
    ];
    
    const extractedPrices: number[] = [];
    
    reviews.forEach(review => {
      const text = review.text?.toLowerCase() || '';
      pricePatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
          matches.forEach(match => {
            const price = parseInt(match.replace(/[^\d]/g, ''));
            // Reasonable food price range for Indian market
            if (price >= 20 && price <= 500) {
              extractedPrices.push(price);
            }
          });
        }
      });
    });
    
    return this.analyzePriceDistribution(extractedPrices);
  }

  /**
   * Analyze price distribution from extracted prices
   */
  private analyzePriceDistribution(prices: number[]): any {
    if (prices.length === 0) {
      return { 
        category: 'unknown', 
        averagePrice: 0, 
        confidence: 'low',
        priceRange: { min: 0, max: 0 },
        sampleSize: 0
      };
    }
    
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // Categorize based on Indian momo market pricing
    let category = 'unknown';
    if (avgPrice < 60) {
      category = 'budget';        // Local vendors, street food
    } else if (avgPrice < 120) {
      category = 'mid-range';     // Organized vendors, food courts
    } else {
      category = 'premium';       // Restaurants, premium outlets
    }
    
    // Confidence based on sample size
    let confidence = 'low';
    if (prices.length >= 10) {
      confidence = 'high';
    } else if (prices.length >= 5) {
      confidence = 'medium';
    }
    
    return {
      category,
      averagePrice: Math.round(avgPrice),
      priceRange: { min: minPrice, max: maxPrice },
      confidence,
      sampleSize: prices.length
    };
  }

  /**
   * Identify pricing gaps in the market
   */
  private identifyPricingGaps(competitorPricing: any[], targetPricePoints: number[]): number[] {
    const occupiedPricePoints = new Set();
    
    competitorPricing.forEach(pricing => {
      if (pricing.averagePrice > 0) {
        // Find closest target price point
        const closestPoint = targetPricePoints.reduce((prev, curr) => 
          Math.abs(curr - pricing.averagePrice) < Math.abs(prev - pricing.averagePrice) ? curr : prev
        );
        occupiedPricePoints.add(closestPoint);
      }
    });
    
    return targetPricePoints.filter(point => !occupiedPricePoints.has(point));
  }

  /**
   * Suggest optimal pricing strategy
   */
  private suggestOptimalPricing(pricingGaps: number[], competitorPricing: any[]): any {
    if (pricingGaps.length === 0) {
      // No gaps, suggest competitive pricing
      const avgCompetitorPrice = competitorPricing
        .filter(p => p.averagePrice > 0)
        .reduce((sum, p, _, arr) => sum + p.averagePrice / arr.length, 0);
      
      return {
        strategy: 'competitive',
        suggestedPrice: Math.round(avgCompetitorPrice * 0.95), // 5% below average
        reasoning: 'Market saturated, compete on price with slight discount'
      };
    }
    
    // Find optimal gap
    const optimalGap = pricingGaps.find(gap => gap >= 60 && gap <= 100) || pricingGaps[0];
    
    return {
      strategy: 'gap-filling',
      suggestedPrice: optimalGap,
      reasoning: `Pricing gap identified at ₹${optimalGap} - opportunity for market entry`,
      alternatives: pricingGaps.filter(gap => gap !== optimalGap)
    };
  }

  /**
   * 🔍 DUPLICATE DETECTION: Enhanced duplicate detection with fuzzy matching
   */
  private checkForDuplicates(business: any, processedBusinesses: any[]): boolean {
    if (!processedBusinesses || processedBusinesses.length === 0) {
      return false;
    }

    const businessName = business.name?.toLowerCase().trim() || '';
    const businessLocation = business.geometry?.location;
    
    if (!businessName || !businessLocation) {
      return false;
    }

    return processedBusinesses.some(processed => {
      const processedName = processed.name?.toLowerCase().trim() || '';
      const processedLocation = processed.geometry?.location;
      
      if (!processedName || !processedLocation) {
        return false;
      }
      
      // Name similarity check (fuzzy matching)
      const nameSimilarity = this.calculateStringSimilarity(businessName, processedName);
      
      // Location proximity check (within 50 meters)
      const distance = this.calculateHaversineDistance(
        businessLocation.lat, businessLocation.lng,
        processedLocation.lat, processedLocation.lng
      );
      
      // Consider duplicate if names are very similar and locations are close
      const isDuplicateName = nameSimilarity > 0.8;
      const isDuplicateLocation = distance < 50; // 50 meters threshold
      
      if (isDuplicateName && isDuplicateLocation) {
        console.log(`🔄 Duplicate detected: "${businessName}" similar to "${processedName}" (${distance.toFixed(0)}m apart, ${(nameSimilarity * 100).toFixed(0)}% similar)`);
        return true;
      }
      
      return false;
    });
  }

  /**
   * Calculate string similarity using Jaccard index
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    
    // Convert to sets of words
    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));
    
    // Calculate Jaccard similarity
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Get validation issues for reporting
   */
  private getValidationIssues(
    business: any, 
    nameTypeConsistency: boolean, 
    ratingConsistency: boolean, 
    locationPlausibility: boolean, 
    isDuplicate: boolean
  ): string[] {
    const issues: string[] = [];
    
    if (!nameTypeConsistency) {
      issues.push(`Name-type inconsistency: "${business.name}" may not match business category`);
    }
    
    if (!ratingConsistency) {
      issues.push(`Suspicious rating pattern: ${business.rating} stars with ${business.user_ratings_total} reviews`);
    }
    
    if (!locationPlausibility) {
      issues.push('Location coordinates appear implausible');
    }
    
    if (isDuplicate) {
      issues.push('Potential duplicate entry detected');
    }
    
    return issues;
  }

  /**
   * 🎯 ENHANCED COMPETITION ANALYSIS: Calculate competition score with pricing intelligence
   */
  private calculateEnhancedCompetitionScore(competitors: any[], radius: number): any {
    const { direct, indirect } = this.categorizeCompetitors(competitors);
    
    // Extract pricing intelligence from reviews (if available)
    const directPricing = direct.map(comp => {
      const reviews = comp.reviews || [];
      return this.extractPricingFromReviews(reviews);
    });
    
    const indirectPricing = indirect.map(comp => {
      const reviews = comp.reviews || [];
      return this.extractPricingFromReviews(reviews);
    });
    
    // Identify pricing gaps for momo business
    const momoPricePoints = [40, 60, 80, 100, 120, 150]; // Target price points for momos
    const pricingGaps = this.identifyPricingGaps(directPricing, momoPricePoints);
    
    // Calculate market saturation by price segment
    const budgetSaturation = directPricing.filter(p => p.category === 'budget').length;
    const midRangeSaturation = directPricing.filter(p => p.category === 'mid-range').length;
    const premiumSaturation = directPricing.filter(p => p.category === 'premium').length;
    
    // Base competition score
    const baseCompetitionScore = this.calculateCompetitionScore([...direct, ...indirect], radius);
    
    // Pricing opportunity bonus
    const pricingOpportunityBonus = pricingGaps.length > 0 ? 0.5 : 0;
    
    return {
      competitionScore: Math.min(5, baseCompetitionScore + pricingOpportunityBonus),
      pricingOpportunity: pricingGaps.length > 0 ? 'High' : 'Limited',
      marketSaturation: {
        budget: budgetSaturation,
        midRange: midRangeSaturation,
        premium: premiumSaturation,
        total: directPricing.length
      },
      recommendedPricing: this.suggestOptimalPricing(pricingGaps, directPricing),
      pricingGaps: pricingGaps,
      directCompetitors: direct.length,
      indirectCompetitors: indirect.length
    };
  }
} 