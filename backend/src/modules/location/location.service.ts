import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface LocationData {
  lat: number;
  lng: number;
  radius?: number;
  format?: 'cart' | 'cloud_kitchen' | 'cafe_premium';
}

interface SlabResult {
  slab: number;
  score: number;
  confidence: number;
  reason: string;
  indicators: string[];
}

interface ParameterResult {
  id: string;
  name: string;
  slab: number;
  score: number;
  confidence: number;
  weight: number;
  reason: string;
  indicators: string[];
  rawData?: any;
}

export interface EvaluationResult {
  totalScore: number;
  percentage: number;
  grade: string;
  confidence: number;
  parameters: ParameterResult[];
  formatAdjustments?: any;
  recommendations: string[];
  locationDetails: any;
}

@Injectable()
export class LocationService {
  private readonly googleMapsApiKey: string;
  private evaluationConfig: any;

  constructor(private configService: ConfigService) {
    this.googleMapsApiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    this.loadEvaluationConfig();
  }

  private loadEvaluationConfig(): void {
    try {
      const configPath = path.join(process.cwd(), 'src', 'config', 'evaluation.config.json');
      const configData = fs.readFileSync(configPath, 'utf8');
      this.evaluationConfig = JSON.parse(configData);
      console.log('✅ Evaluation config loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load evaluation config:', error.message);
      throw new Error('Configuration file not found or invalid');
    }
  }

  async evaluateLocation(locationData: LocationData): Promise<EvaluationResult> {
    console.log(`🎯 Starting location evaluation for ${locationData.lat}, ${locationData.lng}`);
    
    // First, get location details via reverse geocoding
    console.log(`🌍 Fetching location details...`);
    const locationDetails = await this.reverseGeocode(locationData.lat, locationData.lng);
    console.log(`📍 Location: ${locationDetails.city}, ${locationDetails.state}, ${locationDetails.country}`);
    
    const results: ParameterResult[] = [];
    
    for (const param of this.evaluationConfig.evaluationParameters) {
      console.log(`\n📊 Processing: ${param.name}`);
      
      try {
        const paramResult = await this.evaluateParameter(param, locationData);
        results.push(paramResult);
        console.log(`✅ ${param.name}: Slab ${paramResult.slab}, Score ${paramResult.score}`);
      } catch (error) {
        console.error(`❌ Error evaluating ${param.name}:`, error.message);
        results.push({
          id: param.id,
          name: param.name,
          slab: 1,
          score: 0,
          confidence: 0,
          weight: param.weight,
          reason: `Evaluation failed: ${error.message}`,
          indicators: ['data_unavailable']
        });
      }
    }

    const finalResult = this.calculateFinalScore(results, locationData.format, locationDetails);
    
    console.log(`\n🎯 Final Score: ${finalResult.percentage}% (${finalResult.grade})`);
    return finalResult;
  }

  private async evaluateParameter(param: any, locationData: LocationData): Promise<ParameterResult> {
    // Step 1: Data Fetch
    const rawData = await this.fetchParameterData(param, locationData);
    
    // Step 2-3: Signal Extraction and Proxy Analysis
    const signals = this.extractSignals(rawData, param);
    const proxies = this.analyzeProxies(signals, param);
    
    // Step 4: Calculate Index
    const index = this.calculateParameterIndex(proxies, param);
    
    // Step 5: Slab Assignment
    const slabResult = this.assignSlab(index, param);
    
    // Step 6: Confidence Calculation
    const confidence = this.calculateConfidence(rawData, signals, param);
    
    return {
      id: param.id,
      name: param.name,
      slab: slabResult.slab,
      score: slabResult.score,
      confidence: confidence,
      weight: param.weight,
      reason: slabResult.reason,
      indicators: slabResult.indicators,
      rawData: rawData
    };
  }

  private async fetchParameterData(param: any, locationData: LocationData): Promise<any> {
    const { lat, lng } = locationData;
    const allData = {
      places: [],
      textSearchResults: [],
      radius: locationData.radius
    };

    for (const radius of param.searchRadius || [800]) {
      try {
        if (param.apiQueries?.types) {
          for (const type of param.apiQueries.types) {
            const placesData = await this.fetchNearbyPlaces(lat, lng, radius, type);
            allData.places.push(...placesData);
          }
        }

        if (param.apiQueries?.keywords) {
          const keywords = this.flattenKeywords(param.apiQueries.keywords);
          for (const keyword of keywords.slice(0, 5)) {
            const textData = await this.fetchTextSearch(lat, lng, radius, keyword);
            allData.textSearchResults.push(...textData);
          }
        }
      } catch (error) {
        console.warn(`⚠️ API fetch failed for ${param.name} at radius ${radius}m:`, error.message);
      }
    }

    allData.places = this.removeDuplicatePlaces(allData.places);
    allData.textSearchResults = this.removeDuplicatePlaces(allData.textSearchResults);

    // Filter places by actual distance from center point
    const actualRadius = locationData.radius || 800;
    console.log(`📏 Filtering places for ${param.name} within ${actualRadius}m radius`);
    
    const originalPlacesCount = allData.places.length;
    const originalTextSearchCount = allData.textSearchResults.length;
    
    allData.places = this.filterPlacesByDistance(allData.places, lat, lng, actualRadius);
    allData.textSearchResults = this.filterPlacesByDistance(allData.textSearchResults, lat, lng, actualRadius);
    
    console.log(`📊 ${param.name}: ${originalPlacesCount} → ${allData.places.length} places, ${originalTextSearchCount} → ${allData.textSearchResults.length} text results (after distance filtering)`);

    return allData;
  }

  private async fetchNearbyPlaces(lat: number, lng: number, radius: number, type: string): Promise<any[]> {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${this.googleMapsApiKey}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }
      
      return data.results || [];
    } catch (error) {
      console.error(`Places API error for type ${type}:`, error.message);
      return [];
    }
  }

  private async fetchTextSearch(lat: number, lng: number, radius: number, query: string): Promise<any[]> {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=${radius}&key=${this.googleMapsApiKey}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }
      
      return data.results || [];
    } catch (error) {
      console.error(`Text Search API error for query ${query}:`, error.message);
      return [];
    }
  }

  private async reverseGeocode(lat: number, lng: number): Promise<any> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.googleMapsApiKey}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.status !== 'OK') {
        throw new Error(`Geocoding API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const addressComponents = result.address_components || [];
        
        // Extract location details from address components
        const locationDetails = {
          formattedAddress: result.formatted_address,
          city: this.extractAddressComponent(addressComponents, ['locality', 'administrative_area_level_2']),
          state: this.extractAddressComponent(addressComponents, ['administrative_area_level_1']),
          country: this.extractAddressComponent(addressComponents, ['country']),
          postalCode: this.extractAddressComponent(addressComponents, ['postal_code']),
          placeId: result.place_id
        };
        
        return locationDetails;
      }
      
      return {
        formattedAddress: 'Address not found',
        city: 'Unknown',
        state: 'Unknown',
        country: 'Unknown',
        postalCode: null,
        placeId: null
      };
    } catch (error) {
      console.error(`Reverse geocoding error:`, error.message);
      return {
        formattedAddress: 'Address lookup failed',
        city: 'Unknown',
        state: 'Unknown',
        country: 'Unknown',
        postalCode: null,
        placeId: null
      };
    }
  }

  private extractAddressComponent(components: any[], types: string[]): string {
    for (const type of types) {
      const component = components.find(comp => comp.types.includes(type));
      if (component) {
        return component.long_name;
      }
    }
    return 'Unknown';
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    // Haversine formula to calculate distance between two points in meters
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance);
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private filterPlacesByDistance(places: any[], centerLat: number, centerLng: number, maxRadius: number): any[] {
    return places.filter(place => {
      if (!place.geometry?.location?.lat || !place.geometry?.location?.lng) {
        console.warn(`⚠️ Place "${place.name}" missing coordinates, excluding from results`);
        return false;
      }

      const distance = this.calculateDistance(
        centerLat,
        centerLng,
        place.geometry.location.lat,
        place.geometry.location.lng
      );

      const isWithinRadius = distance <= maxRadius;
      
      if (!isWithinRadius) {
        console.log(`📏 Place "${place.name}" at ${distance}m (excluded, radius: ${maxRadius}m)`);
      }

      // Add distance to place object for debugging/analysis
      place.calculated_distance = distance;
      
      return isWithinRadius;
    });
  }

  private extractSignals(rawData: any, param: any): any {
    const signals = {
      totalCount: rawData.places.length + rawData.textSearchResults.length,
      brandCounts: {},
      qualityMetrics: {
        avgRating: 0,
        avgReviewCount: 0,
        highQualityCount: 0
      },
      priceDistribution: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
      typeDistribution: {},
      keywordMatches: {}
    };

    const allPlaces = [...rawData.places, ...rawData.textSearchResults];

    if (allPlaces.length === 0) {
      return signals;
    }

    // Extract brand presence
    if (param.apiQueries?.keywords && typeof param.apiQueries.keywords === 'object') {
      for (const [category, brands] of Object.entries(param.apiQueries.keywords)) {
        signals.brandCounts[category] = 0;
        for (const brand of brands as string[]) {
          const count = allPlaces.filter(place => 
            place.name?.toLowerCase().includes(brand.toLowerCase())
          ).length;
          signals.brandCounts[category] += count;
        }
      }
    }

    // Calculate quality metrics
    const ratingsSum = allPlaces.reduce((sum, place) => sum + (place.rating || 0), 0);
    const reviewsSum = allPlaces.reduce((sum, place) => sum + (place.user_ratings_total || 0), 0);
    
    signals.qualityMetrics.avgRating = ratingsSum / allPlaces.length;
    signals.qualityMetrics.avgReviewCount = reviewsSum / allPlaces.length;
    signals.qualityMetrics.highQualityCount = allPlaces.filter(place => 
      place.rating >= 4.0 && place.user_ratings_total >= 100
    ).length;

    // Price level distribution
    allPlaces.forEach(place => {
      const priceLevel = place.price_level || 0;
      signals.priceDistribution[priceLevel]++;
    });

    return signals;
  }

  private analyzeProxies(signals: any, param: any): any {
    const proxies = {
      density: signals.totalCount,
      brandTierMix: this.calculateBrandTierMix(signals.brandCounts, param),
      qualityScore: this.calculateQualityScore(signals.qualityMetrics),
      priceScore: this.calculatePriceScore(signals.priceDistribution),
      diversityScore: Object.keys(signals.typeDistribution).length
    };

    return proxies;
  }

  private calculateBrandTierMix(brandCounts: any, param: any): number {
    if (!param.slabCriteria) return 50;

    let maxScore = 0;
    let bestSlab = 3;

    for (let slab = 1; slab <= 5; slab++) {
      const criteria = param.slabCriteria[slab.toString()];
      if (criteria?.weightage) {
        let score = 0;
        for (const [category, expectedWeight] of Object.entries(criteria.weightage)) {
          const actualCount = brandCounts[category] || 0;
          const totalBrands = Object.values(brandCounts).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0);
          const actualWeight = (totalBrands as number) > 0 ? (actualCount / (totalBrands as number)) * 100 : 0;
          score += Math.min(actualWeight / (expectedWeight as number), 1) * 20;
        }
        if (score > maxScore) {
          maxScore = score;
          bestSlab = slab;
        }
      }
    }

    return bestSlab * 20;
  }

  private calculateQualityScore(qualityMetrics: any): number {
    const ratingScore = (qualityMetrics.avgRating / 5) * 40;
    const reviewScore = Math.min(qualityMetrics.avgReviewCount / 500, 1) * 30;
    const highQualityScore = Math.min(qualityMetrics.highQualityCount / 10, 1) * 30;
    
    return ratingScore + reviewScore + highQualityScore;
  }

  private calculatePriceScore(priceDistribution: any): number {
    const totalPlaces = Object.values(priceDistribution).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0);
    if (totalPlaces === 0) return 50;

    const weightedSum = Object.entries(priceDistribution).reduce((sum, [level, count]) => {
      return sum + (parseInt(level) * (count as number));
    }, 0);

    return Math.min((weightedSum / (totalPlaces as number)) * 25, 100);
  }

  private calculateParameterIndex(proxies: any, param: any): number {
    const weights = {
      density: 0.3,
      brandTierMix: 0.3,
      qualityScore: 0.2,
      priceScore: 0.1,
      diversityScore: 0.1
    };

    const index = (
      (proxies.density / 50 * 100 * weights.density) +
      (proxies.brandTierMix * weights.brandTierMix) +
      (proxies.qualityScore * weights.qualityScore) +
      (proxies.priceScore * weights.priceScore) +
      (proxies.diversityScore / 10 * 100 * weights.diversityScore)
    );

    return Math.min(Math.max(index, 0), 100);
  }

  private assignSlab(index: number, param: any): SlabResult {
    if (!param.slabCriteria) {
      const slab = Math.ceil(index / 20);
      return {
        slab: Math.min(Math.max(slab, 1), 5),
        score: index,
        confidence: 70,
        reason: `Index-based assignment: ${index.toFixed(1)}`,
        indicators: [`index_${index.toFixed(0)}`]
      };
    }

    let bestSlab = 3;
    let bestScore = index;
    let reason = '';
    let indicators: string[] = [];

    for (let slab = 1; slab <= 5; slab++) {
      const criteria = param.slabCriteria[slab.toString()];
      if (criteria) {
        const slabRange = this.evaluationConfig.evaluationFramework.slabSystem[slab].range;
        if (index >= slabRange[0] && index <= slabRange[1]) {
          bestSlab = slab;
          reason = criteria.description;
          indicators = criteria.indicators || [`slab_${slab}`];
          break;
        }
      }
    }

    return {
      slab: bestSlab,
      score: bestScore,
      confidence: 80,
      reason: reason || `Slab ${bestSlab} based on index ${index.toFixed(1)}`,
      indicators: indicators
    };
  }

  private calculateConfidence(rawData: any, signals: any, param: any): number {
    const totalPlaces = rawData.places.length + rawData.textSearchResults.length;
    const coverageScore = Math.min(totalPlaces / 20, 1) * 100;
    
    const avgReviews = signals.qualityMetrics.avgReviewCount;
    const reviewScore = Math.min(avgReviews / 100, 1) * 100;
    
    const brandScore = param.apiQueries?.keywords ? 
      Math.min((Object.values(signals.brandCounts).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0) as number) / 5, 1) * 100 : 80;
    
    const confidence = (coverageScore * 0.4) + (reviewScore * 0.2) + (brandScore * 0.1) + (75 * 0.3);

    return Math.min(Math.max(confidence, 0), 100);
  }

  private calculateFinalScore(results: ParameterResult[], format?: string, locationDetails?: any): EvaluationResult {
    let totalWeightedScore = 0;
    let totalWeight = 0;
    let totalConfidence = 0;

    const adjustedResults = this.applyFormatAdjustments(results, format);

    adjustedResults.forEach(result => {
      const weightedScore = (result.score / 100) * result.weight;
      totalWeightedScore += weightedScore;
      totalWeight += result.weight;
      totalConfidence += result.confidence;
    });

    const averageConfidence = totalConfidence / adjustedResults.length;
    const percentage = (totalWeightedScore / totalWeight) * 100;
    const grade = this.calculateGrade(percentage);

    const recommendations = this.generateRecommendations(adjustedResults, percentage);

    return {
      totalScore: totalWeightedScore,
      percentage: Math.round(percentage * 100) / 100,
      grade: grade,
      confidence: Math.round(averageConfidence * 100) / 100,
      parameters: adjustedResults,
      formatAdjustments: format ? this.evaluationConfig.formatBasedWeights[format] : null,
      recommendations: recommendations,
      locationDetails: locationDetails
    };
  }

  private applyFormatAdjustments(results: ParameterResult[], format?: string): ParameterResult[] {
    if (!format || !this.evaluationConfig.formatBasedWeights[format]) {
      return results;
    }

    const adjustments = this.evaluationConfig.formatBasedWeights[format].adjustments;
    
    return results.map(result => {
      if (adjustments[result.id]) {
        return {
          ...result,
          weight: adjustments[result.id]
        };
      }
      return result;
    });
  }

  private calculateGrade(percentage: number): string {
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    return 'D';
  }

  private generateRecommendations(results: ParameterResult[], percentage: number): string[] {
    const recommendations: string[] = [];

    if (percentage >= 80) {
      recommendations.push('🎯 Highly Recommended: Excellent location with strong potential across multiple parameters.');
    } else if (percentage >= 70) {
      recommendations.push('✅ Recommended: Good location with solid fundamentals and growth potential.');
    } else if (percentage >= 60) {
      recommendations.push('⚠️ Conditional: Moderate potential, consider specific improvements before proceeding.');
    } else {
      recommendations.push('❌ Not Recommended: Significant challenges across multiple parameters.');
    }

    const topStrengths = results
      .filter(r => r.slab >= 4)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (topStrengths.length > 0) {
      recommendations.push(`💪 Key Strengths: ${topStrengths.map(s => s.name).join(', ')}`);
    }

    const improvements = results
      .filter(r => r.slab <= 2 && r.weight >= 5)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);

    if (improvements.length > 0) {
      recommendations.push(`🔧 Priority Improvements: ${improvements.map(i => i.name).join(', ')}`);
    }

    return recommendations;
  }

  private flattenKeywords(keywords: any): string[] {
    if (Array.isArray(keywords)) {
      return keywords;
    }
    
    if (typeof keywords === 'object') {
      return Object.values(keywords).flat() as string[];
    }
    
    return [];
  }

  private removeDuplicatePlaces(places: any[]): any[] {
    const seen = new Set();
    return places.filter(place => {
      const key = `${place.place_id || place.name}_${place.geometry?.location?.lat}_${place.geometry?.location?.lng}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  getEvaluationConfig(): any {
    return this.evaluationConfig;
  }

  validateLocationData(locationData: LocationData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!locationData.lat || !locationData.lng) {
      errors.push('Latitude and longitude are required');
    }

    if (locationData.lat < -90 || locationData.lat > 90) {
      errors.push('Latitude must be between -90 and 90');
    }

    if (locationData.lng < -180 || locationData.lng > 180) {
      errors.push('Longitude must be between -180 and 180');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
