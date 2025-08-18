import { Controller, Post, Body, HttpException, HttpStatus, Get } from '@nestjs/common';
import { LocationService } from './location.service';
import { GeminiService } from '../gemini/gemini.service';
import { DataMapperService } from './data-mapper.service';

interface CompleteAnalysisDto {
  lat: number;
  lng: number;
  radius?: number;
  clientName?: string;
  address?: string;
}

@Controller('analysis')
export class AnalysisController {
  constructor(
    private readonly locationService: LocationService,
    private readonly geminiService: GeminiService,
    private readonly dataMapper: DataMapperService,
  ) {}

  @Post('progressive')
  async progressiveAnalysis(@Body() body: CompleteAnalysisDto) {
    const { lat, lng, radius, clientName, address } = body;

    if (!lat || !lng) {
      throw new HttpException(
        'Latitude and longitude are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (lat < -90 || lat > 90) {
      throw new HttpException(
        'Latitude must be between -90 and 90',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (lng < -180 || lng > 180) {
      throw new HttpException(
        'Longitude must be between -180 and 180',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Get location info first
      const locationInfo = await this.locationService.getLocationInfo(lat, lng);
      const locationDetails = this.extractLocationDetails(locationInfo);

      // Use progressive loading with real-time updates
      const progressiveResults = [];
      
      const finalAnalysis = await this.locationService.analyzeLocationProgressive(
        lat, lng, radius || 1000,
        (phase: number, data: any) => {
          // Store progressive results for streaming (could be enhanced with WebSocket)
          progressiveResults.push({
            phase,
            timestamp: new Date().toISOString(),
            data: {
              ...data,
              locationInfo: locationDetails,
              coordinates: { lat, lng, radius: radius || 1000 }
            }
          });
          console.log(`📊 Progressive Analysis Phase ${phase} completed`);
        }
      );

      // 🎯 CRITICAL: Map Google API data to baseline scores using proven thresholds
      console.log('🔧 DATA MAPPER: Converting Google API data to baseline scores...');
      const baselineScores = this.dataMapper.mapAllParametersToScores(finalAnalysis);
      
      // Get AI evaluation with data-driven baseline
      const areaCharacteristics = this.extractAreaCharacteristics(finalAnalysis);
      console.log('🤖 GEMINI: Starting AI evaluation with baseline scores...');
      const aiEvaluation = await this.geminiService.evaluateWithBaseline(
        finalAnalysis,
        areaCharacteristics,
        baselineScores
      );

      // 🧮 CRITICAL: Calculate final results using EXACT manual formula
      console.log('🧮 CALCULATION: Using exact manual formula (Total/350 * 100)...');
      const finalResults = this.calculateFinalResults(aiEvaluation.parameterScores || baselineScores);

      // Merge baseline and AI results
      const enhancedEvaluation = {
        ...aiEvaluation,
        ...finalResults,
        baselineScores,
        calculationMethod: 'exact_manual_formula'
      };

      // Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(
        finalAnalysis,
        enhancedEvaluation,
        !!locationInfo.results?.length
      );

      return {
        success: true,
        data: {
          coordinates: { lat, lng, radius: radius || 1000 },
          locationInfo: locationDetails,
          locationAnalysis: finalAnalysis,
          areaCharacteristics,
          aiEvaluation: enhancedEvaluation,
          confidenceScore,
          progressiveResults, // Include all phase results
          clientInfo: {
            name: clientName || 'Unknown Client',
            providedAddress: address || 'Not provided',
          },
          timestamp: new Date().toISOString(),
          analysisType: 'progressive'
        },
        message: 'Progressive location analysis completed successfully',
      };
    } catch (error) {
      console.error('Progressive analysis failed:', error);
      throw new HttpException(
        `Progressive analysis failed: ${error.message}`,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('complete')
  async completeAnalysis(@Body() body: CompleteAnalysisDto) {
    const { lat, lng, radius, clientName, address } = body;

    if (!lat || !lng) {
      throw new HttpException(
        'Latitude and longitude are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (lat < -90 || lat > 90) {
      throw new HttpException(
        'Latitude must be between -90 and 90',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (lng < -180 || lng > 180) {
      throw new HttpException(
        'Longitude must be between -180 and 180',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Step 1: Get reverse geocoding information
      const locationInfo = await this.locationService.getLocationInfo(lat, lng);
      
      // Extract location details from reverse geocoding
      const locationDetails = this.extractLocationDetails(locationInfo);

      // Step 2: Analyze location with Google Maps
      const locationAnalysis = await this.locationService.analyzeLocation({
        lat,
        lng,
        radius: radius || 1000,
      });

      // Step 3: Extract area characteristics
      const areaCharacteristics = this.extractAreaCharacteristics(locationAnalysis);

      // Step 4: Map Google API data to baseline scores using proven thresholds
      console.log('🔧 DATA MAPPER: Converting Google API data to baseline scores...');
      const baselineScores = this.dataMapper.mapAllParametersToScores(locationAnalysis);

      // Step 5: Get AI evaluation with data-driven baseline
      console.log('🤖 GEMINI: Starting AI evaluation with baseline scores...');
      const aiEvaluation = await this.geminiService.evaluateWithBaseline(
        locationAnalysis,
        areaCharacteristics,
        baselineScores
      );

      // Step 6: Calculate final results using EXACT manual formula
      console.log('🧮 CALCULATION: Using exact manual formula (Total/350 * 100)...');
      const finalResults = this.calculateFinalResults(aiEvaluation.parameterScores || baselineScores);

      // Merge baseline and AI results
      const enhancedEvaluation = {
        ...aiEvaluation,
        ...finalResults,
        baselineScores,
        calculationMethod: 'exact_manual_formula'
      };

      // Step 7: Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(
        locationAnalysis, 
        enhancedEvaluation,
        !!locationInfo.results?.length
      );

      return {
        success: true,
        data: {
          coordinates: { lat, lng, radius: radius || 1000 },
          locationInfo: locationDetails,
          locationAnalysis,
          areaCharacteristics,
          aiEvaluation: enhancedEvaluation,
          confidenceScore,
          clientInfo: {
            name: clientName || 'Unknown Client',
            providedAddress: address || 'Not provided',
          },
          timestamp: new Date().toISOString(),
        },
        message: 'Complete location analysis finished successfully',
      };
    } catch (error) {
      console.error('Complete analysis failed:', error);
      throw new HttpException(
        `Analysis failed: ${error.message}`,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private extractLocationDetails(geocodeResponse: any) {
    if (!geocodeResponse || !geocodeResponse.results || geocodeResponse.results.length === 0) {
      return {
        formattedAddress: 'Unknown Location',
        city: 'Unknown',
        state: 'Unknown',
        country: 'Unknown',
        postalCode: 'Unknown',
        neighborhood: 'Unknown',
        addressComponents: []
      };
    }

    const result = geocodeResponse.results[0];
    const components = result.address_components || [];
    
    let city = 'Unknown';
    let state = 'Unknown';
    let country = 'Unknown';
    let postalCode = 'Unknown';
    let neighborhood = 'Unknown';

    // Extract specific address components
    components.forEach((component: any) => {
      const types = component.types || [];
      
      if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      } else if (types.includes('postal_code')) {
        postalCode = component.long_name;
      } else if (types.includes('neighborhood') || types.includes('sublocality')) {
        neighborhood = component.long_name;
      }
    });

    return {
      formattedAddress: result.formatted_address || 'Unknown Location',
      city,
      state,
      country,
      postalCode,
      neighborhood,
      addressComponents: components,
      placeId: result.place_id,
      geometry: result.geometry
    };
  }

  private extractAreaCharacteristics(locationAnalysis: any) {
    const { businesses = {}, summary = {} } = locationAnalysis;

    return {
      food_competition: {
        total_restaurants: (businesses.restaurants?.length || 0) + (businesses.food?.length || 0),
        average_rating: summary.restaurants?.averageRating || 0,
        high_rated_restaurants: summary.restaurants?.highRatedCount || 0,
        popular_restaurants: summary.restaurants?.popularPlaces || 0,
      },
      commercial_activity: {
        total_businesses: summary.overall?.totalBusinesses || 0,
        shopping_options: businesses.shopping_malls?.length || 0,
        clothing_stores: 0, // This would need to be calculated from brand data
      },
      demographics: {
        educational_institutions: (businesses.schools?.length || 0) + (businesses.universities?.length || 0),
        healthcare_facilities: businesses.hospitals?.length || 0,
        fitness_facilities: businesses.gyms?.length || 0,
        entertainment_options: 0, // This would need additional search types
      },
      infrastructure: {
        petrol_stations: businesses.gas_stations?.length || 0,
        accessibility_score: Math.min(10, Math.floor((summary.overall?.totalBusinesses || 0) / 10)),
      },
    };
  }

  /**
   * 🎯 ENHANCED: Calculate confidence score based on data quality factors
   */
  private calculateConfidenceScore(locationAnalysis: any, aiEvaluation: any, hasLocationInfo: boolean): any {
    const config = this.locationService.getEvaluationConfig();
    const confidenceFactors = config.confidenceFactors || {};
    
    // API Response Quality (0.0 - 1.0)
    let apiQuality = 1.0;
    const businesses = locationAnalysis.businesses || {};
    const brands = locationAnalysis.brands || {};
    
    const businessTypes = Object.keys(businesses);
    const failedBusinessSearches = businessTypes.filter(type => !businesses[type] || businesses[type].length === 0);
    
    if (failedBusinessSearches.length > businessTypes.length * 0.5) {
      apiQuality = confidenceFactors.apiResponseQuality?.majorAPIsFailed || 0.6;
    } else if (failedBusinessSearches.length > 0) {
      apiQuality = confidenceFactors.apiResponseQuality?.someAPIsFailed || 0.8;
    } else {
      apiQuality = confidenceFactors.apiResponseQuality?.allAPIsSuccessful || 1.0;
    }
    
    // Data Completeness (0.0 - 1.0)
    let dataCompleteness = 1.0;
    const totalBusinessCount = Object.values(businesses).reduce((sum: number, places: any) => sum + (Array.isArray(places) ? places.length : 0), 0) as number;
    const brandCount = Object.values(brands).reduce((sum: number, brandData: any) => {
      const places = Array.isArray(brandData) ? brandData : (brandData?.places || []);
      return sum + places.length;
    }, 0) as number;
    
    if (totalBusinessCount === 0 && brandCount === 0) {
      dataCompleteness = confidenceFactors.dataCompleteness?.limitedData || 0.6;
    } else if (totalBusinessCount < 10 && brandCount < 3) {
      dataCompleteness = confidenceFactors.dataCompleteness?.partialData || 0.8;
    } else {
      dataCompleteness = confidenceFactors.dataCompleteness?.completeBusinessData || 1.0;
    }
    
    // Radius Compliance (0.0 - 1.0)
    let radiusCompliance = 1.0;
    const rawData = locationAnalysis.rawData || {};
    const complianceRates = Object.values(rawData).map((data: any) => {
      if (data.filteredCount !== undefined && data.originalCount !== undefined) {
        return data.originalCount > 0 ? data.filteredCount / data.originalCount : 1.0;
      }
      return 1.0;
    });
    
    const avgCompliance = complianceRates.length > 0 ? 
      complianceRates.reduce((sum, rate) => sum + rate, 0) / complianceRates.length : 1.0;
    
    if (avgCompliance >= 1.0) {
      radiusCompliance = confidenceFactors.radiusCompliance?.perfect || 1.0;
    } else if (avgCompliance >= 0.95) {
      radiusCompliance = confidenceFactors.radiusCompliance?.good || 0.9;
    } else {
      radiusCompliance = confidenceFactors.radiusCompliance?.moderate || 0.7;
    }
    
    // Brand Detection Accuracy (0.0 - 1.0)
    let brandAccuracy = 1.0;
    const foundBrands = Object.values(brands).filter((brandData: any) => {
      return Array.isArray(brandData) ? brandData.length > 0 : (brandData?.found || false);
    }).length;
    
    const totalBrands = Object.keys(brands).length;
    const brandFoundRate = totalBrands > 0 ? foundBrands / totalBrands : 0;
    
    if (brandFoundRate >= 0.3) {
      brandAccuracy = confidenceFactors.brandDetectionAccuracy?.verified || 1.0;
    } else if (brandFoundRate >= 0.1) {
      brandAccuracy = confidenceFactors.brandDetectionAccuracy?.likely || 0.8;
    } else {
      brandAccuracy = confidenceFactors.brandDetectionAccuracy?.uncertain || 0.6;
    }
    
    // Calculate final confidence score
    const confidence = (apiQuality * dataCompleteness * radiusCompliance * brandAccuracy) * 100;
    
    // Determine confidence level
    let level = 'Very Low';
    let color = 'red';
    
    if (confidence >= 95) {
      level = 'Very High';
      color = 'green';
    } else if (confidence >= 85) {
      level = 'High';
      color = 'lightgreen';
    } else if (confidence >= 75) {
      level = 'Moderate';
      color = 'yellow';
    } else if (confidence >= 65) {
      level = 'Low';
      color = 'orange';
    }
    
    // Generate recommendations based on confidence
    const recommendations = [];
    if (confidence < 75) {
      recommendations.push('Consider re-running analysis during peak hours for more data');
      recommendations.push('Validate findings with local market research');
    }
    if (apiQuality < 0.8) {
      recommendations.push('Some API searches failed - results may be incomplete');
    }
    if (dataCompleteness < 0.8) {
      recommendations.push('Limited business data available - consider larger radius');
    }
    if (brandAccuracy < 0.8) {
      recommendations.push('Brand detection accuracy is low - manual verification recommended');
    }
    
    return {
      score: Math.round(confidence * 100) / 100,
      level,
      color,
      factors: {
        apiResponseQuality: Math.round(apiQuality * 100),
        dataCompleteness: Math.round(dataCompleteness * 100),
        radiusCompliance: Math.round(radiusCompliance * 100),
        brandDetectionAccuracy: Math.round(brandAccuracy * 100)
      },
      recommendations,
      hasLocationInfo,
      metadata: {
        totalBusinesses: totalBusinessCount,
        brandsFound: foundBrands,
        totalBrandsSearched: totalBrands,
        averageRadiusCompliance: Math.round(avgCompliance * 100)
      }
    };
  }

  /**
   * 🧮 CRITICAL: Calculate final results using EXACT manual formula
   * Total Score = Sum of all (Score × Weight)
   * Max Possible Score = 350 (FIXED from manual evaluation)
   * Percentage = (Total Score ÷ 350) × 100
   */
  private calculateFinalResults(parameterScores: any): any {
    const MANUAL_PARAMETERS = [
      { id: "food_brand_presence", weight: 4 },
      { id: "clothing_brand_presence", weight: 2 },
      { id: "footwear_brand_presence", weight: 2 },
      { id: "nearby_schools_colleges", weight: 3 },
      { id: "petrol_pump_nearby", weight: 2 },
      { id: "footfall", weight: 5 },
      { id: "target_audience_fit", weight: 5 },
      { id: "competition_pricing_momo", weight: 3 },
      { id: "spending_capacity", weight: 4 },
      { id: "nearby_businesses_offices", weight: 4 },
      { id: "vehicle_mix_mobility", weight: 2 },
      { id: "residential_society_presence", weight: 4 },
      { id: "shopping_preferences_nearby", weight: 3 },
      { id: "fitness_gym_walking_culture", weight: 3 },
      { id: "zomato_swiggy_delivery_density", weight: 4 },
      { id: "student_vs_office_crowd_mix", weight: 3 },
      { id: "nightlife_cafe_presence", weight: 3 },
      { id: "local_events_weekly_bazaars", weight: 2 },
      { id: "hospitals_clinics_nearby", weight: 2 },
      { id: "police_security_presence", weight: 2 },
      { id: "outdoor_branding_scope", weight: 5 },
      { id: "footpath_road_width", weight: 3 }
    ];

    let totalScore = 0;
    const maxPossibleScore = 350; // FIXED from manual evaluation
    const parameterBreakdown = {};
    
    console.log('🧮 MANUAL CALCULATION: Processing 22 parameters...');
    
    MANUAL_PARAMETERS.forEach(param => {
      const scoreData = parameterScores[param.id];
      const score = scoreData?.score || 0;
      const weightedScore = score * param.weight;
      totalScore += weightedScore;
      
      parameterBreakdown[param.id] = {
        score,
        weight: param.weight,
        weightedScore,
        maxPossible: param.weight * 5
      };
      
      console.log(`  ${param.id}: ${score}/5 × ${param.weight} = ${weightedScore}/${param.weight * 5}`);
    });

    const percentage = Math.round((totalScore / maxPossibleScore) * 100 * 10) / 10;
    const grade = this.getGrade(percentage);
    
    console.log(`🧮 FINAL CALCULATION:`);
    console.log(`  Total Score: ${totalScore}/${maxPossibleScore}`);
    console.log(`  Percentage: ${percentage}%`);
    console.log(`  Grade: ${grade}`);
    
    return {
      totalScore,
      maxPossibleScore,
      percentage,
      grade,
      parameterBreakdown,
      viabilityStatus: this.getViabilityStatus(percentage)
    };
  }

  /**
   * Grade classification matching manual evaluation
   */
  private getGrade(percentage: number): string {
    if (percentage >= 85) return "A - Excellent";
    if (percentage >= 70) return "B - Good";
    if (percentage >= 55) return "C - Average";
    if (percentage >= 40) return "D - Below Average";
    return "F - Poor";
  }

  /**
   * Viability status based on percentage
   */
  private getViabilityStatus(percentage: number): string {
    if (percentage >= 80) return "HIGHLY_RECOMMENDED";
    if (percentage >= 70) return "RECOMMENDED";
    if (percentage >= 60) return "CONDITIONAL";
    if (percentage >= 40) return "NOT_RECOMMENDED";
    return "STRONGLY_NOT_RECOMMENDED";
  }

  @Get('health')
  async healthCheck() {
    return {
      success: true,
      message: 'Analysis service is healthy',
      services: {
        location: 'Available',
        gemini: 'Available',
      },
      timestamp: new Date().toISOString(),
    };
  }
} 