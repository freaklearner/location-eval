import { Controller, Post, Body, HttpException, HttpStatus, Get } from '@nestjs/common';
import { LocationService, LocationData } from './location.service';

interface CompleteAnalysisDto {
  lat: number;
  lng: number;
  radius?: number;
  format?: 'cart' | 'cloud_kitchen' | 'cafe_premium';
  clientName?: string;
  address?: string;
}

@Controller('analysis')
export class AnalysisController {
  constructor(
    private readonly locationService: LocationService,
  ) {}

  @Post('complete')
  async completeAnalysis(@Body() body: CompleteAnalysisDto) {
    const { lat, lng, radius = 800, format, clientName, address } = body;

    // Validate input
    const locationData: LocationData = { lat, lng, radius, format };
    const validation = this.locationService.validateLocationData(locationData);
    if (!validation.valid) {
      throw new HttpException(
        `Invalid location data: ${validation.errors.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      console.log(`🎯 Starting complete analysis for ${lat}, ${lng} (radius: ${radius}m, format: ${format || 'default'})`);

      // Perform location evaluation using new 7-step framework
      const evaluationResult = await this.locationService.evaluateLocation(locationData);

      // Format response
      const response = {
        success: true,
        timestamp: new Date().toISOString(),
        location: {
          coordinates: { lat, lng },
          radius,
          format: format || 'default',
          clientName: clientName || null,
          address: address || evaluationResult.locationDetails?.formattedAddress || null,
          city: evaluationResult.locationDetails?.city || 'Unknown',
          state: evaluationResult.locationDetails?.state || 'Unknown',
          country: evaluationResult.locationDetails?.country || 'Unknown',
          postalCode: evaluationResult.locationDetails?.postalCode || null
        },
        evaluation: {
          overall: {
            percentage: evaluationResult.percentage,
            grade: evaluationResult.grade,
            confidence: evaluationResult.confidence,
            totalScore: evaluationResult.totalScore
          },
          parameters: evaluationResult.parameters.map(param => ({
            id: param.id,
            name: param.name,
            slab: param.slab,
            score: param.score,
            weight: param.weight,
            confidence: param.confidence,
            reason: param.reason,
            indicators: param.indicators,
            rawData: param.rawData
          })),
          formatAdjustments: evaluationResult.formatAdjustments,
          recommendations: evaluationResult.recommendations
        },
        methodology: {
          framework: '7-Step Slab-Based Evaluation',
          version: '2.0',
          totalParameters: evaluationResult.parameters.length,
          slabSystem: 'Budget(1) → Entry(2) → Mid(3) → Premium(4) → Luxury(5)'
        }
      };

      console.log(`✅ Analysis completed: ${evaluationResult.percentage}% (Grade ${evaluationResult.grade})`);
      return response;

    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      throw new HttpException(
        `Analysis failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('config')
  async getEvaluationConfig() {
    try {
      const config = this.locationService.getEvaluationConfig();
      return {
        success: true,
        config: {
          framework: config.evaluationFramework,
          parameters: config.evaluationParameters.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            weight: p.weight,
            category: p.category
          })),
          formatOptions: Object.keys(config.formatBasedWeights || {}),
          slabSystem: config.evaluationFramework.slabSystem
        }
      };
    } catch (error) {
      throw new HttpException(
        'Failed to load configuration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('validate')
  async validateLocation(@Body() body: { lat: number; lng: number; radius?: number; format?: string }) {
    const locationData: LocationData = { lat: body.lat, lng: body.lng, radius: body.radius, format: body.format as any };
    const validation = this.locationService.validateLocationData(locationData);
    return {
      valid: validation.valid,
      errors: validation.errors
    };
  }

  @Get('health')
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'Location Evaluation Tool v2.0',
      framework: '7-Step Slab-Based Evaluation',
      timestamp: new Date().toISOString()
    };
  }
}