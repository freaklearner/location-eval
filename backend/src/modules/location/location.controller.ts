import { Controller, Post, Get, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { LocationService } from './location.service';

interface AnalyzeLocationDto {
  lat: number;
  lng: number;
  radius?: number;
}

interface NearbyBusinessesDto {
  lat: number;
  lng: number;
  type: string;
  radius?: number;
}

interface TextSearchDto {
  lat: number;
  lng: number;
  query: string;
  radius?: number;
}

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post('analyze')
  async analyzeLocation(@Body() body: AnalyzeLocationDto) {
    const { lat, lng, radius } = body;

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

    if (radius && (radius < 100 || radius > 5000)) {
      throw new HttpException(
        'Radius must be between 100 and 5000 meters',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.locationService.analyzeLocation({
        lat,
        lng,
        radius: radius || 1000,
      });

      return {
        success: true,
        data: result,
        message: 'Location analyzed successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to analyze location',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('nearby-businesses')
  async findNearbyBusinesses(@Body() body: NearbyBusinessesDto) {
    const { lat, lng, type, radius } = body;

    if (!lat || !lng || !type) {
      throw new HttpException(
        'Latitude, longitude, and type are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.locationService.findNearbyBusinesses(
        lat,
        lng,
        type,
        radius || 1000,
      );

      return {
        success: true,
        data: result,
        message: 'Nearby businesses found successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to find nearby businesses',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('text-search')
  async searchByText(@Body() body: TextSearchDto) {
    const { lat, lng, query, radius } = body;

    if (!lat || !lng || !query) {
      throw new HttpException(
        'Latitude, longitude, and query are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.locationService.searchByText(
        lat,
        lng,
        query,
        radius || 1000,
      );

      return {
        success: true,
        data: result,
        message: 'Text search completed successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to perform text search',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('info')
  async getLocationInfo(@Query('lat') lat: string, @Query('lng') lng: string) {
    if (!lat || !lng) {
      throw new HttpException(
        'Latitude and longitude are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new HttpException(
        'Invalid latitude or longitude',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.locationService.getLocationInfo(latitude, longitude);

      return {
        success: true,
        data: result,
        message: 'Location info retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get location info',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('health')
  async healthCheck() {
    return {
      success: true,
      message: 'Location service is healthy',
      timestamp: new Date().toISOString(),
    };
  }
} 