import { Controller, Post, Body, HttpException, HttpStatus, Get } from '@nestjs/common';
import { GeminiService } from './gemini.service';

interface EvaluateLocationDto {
  locationData: any;
  areaCharacteristics?: any;
}

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('evaluate')
  async evaluateLocation(@Body() body: EvaluateLocationDto) {
    if (!body.locationData) {
      throw new HttpException(
        'Location data is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.geminiService.evaluateLocation({
        locationData: body.locationData,
        areaCharacteristics: body.areaCharacteristics,
      });

      return {
        success: true,
        data: result,
        message: 'Location evaluation completed successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to evaluate location',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('health')
  async healthCheck() {
    return {
      success: true,
      message: 'Gemini AI service is healthy',
      timestamp: new Date().toISOString(),
    };
  }
} 