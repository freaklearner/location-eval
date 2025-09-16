import { Controller, Post, Get, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { LocationService, LocationData, EvaluationResult } from './location.service';

interface AnalyzeLocationDto {
  lat: number;
  lng: number;
  radius?: number;
  format?: 'cart' | 'cloud_kitchen' | 'cafe_premium';
}

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post('analyze')
  async analyzeLocation(@Body() body: AnalyzeLocationDto) {
    const { lat, lng, radius = 800, format } = body;

    // Validate input using the service's validation method
    const locationData: LocationData = { lat, lng, radius, format };
    const validation = this.locationService.validateLocationData(locationData);
    if (!validation.valid) {
      throw new HttpException(
        `Invalid input: ${validation.errors.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      console.log(`🎯 Analyzing location: ${lat}, ${lng} (radius: ${radius}m, format: ${format || 'default'})`);

      // Use the new evaluation system
      const result = await this.locationService.evaluateLocation(locationData);

      return {
        success: true,
        location: { lat, lng, radius, format },
        evaluation: result,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Location analysis failed:', error.message);
      throw new HttpException(
        `Location analysis failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('config')
  async getConfiguration() {
    try {
      const config = this.locationService.getEvaluationConfig();
      return {
        success: true,
        configuration: {
          framework: config.evaluationFramework,
          parameters: config.evaluationParameters.length,
          formats: Object.keys(config.formatBasedWeights || {}),
          version: config.evaluationFramework.version
        }
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve configuration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('validate')
  async validateInput(@Body() body: { lat: number; lng: number; radius?: number; format?: string }) {
    const locationData: LocationData = { lat: body.lat, lng: body.lng, radius: body.radius, format: body.format as any };
    const validation = this.locationService.validateLocationData(locationData);
    return {
      valid: validation.valid,
      errors: validation.errors,
      timestamp: new Date().toISOString()
    };
  }

  @Get('health')
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'Location Service v2.0',
      framework: '7-Step Slab-Based Evaluation',
      timestamp: new Date().toISOString()
    };
  }
}