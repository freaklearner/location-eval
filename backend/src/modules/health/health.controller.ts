import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  checkHealth() {
    const googleMapsConfigured = !!this.configService.get('GOOGLE_MAPS_API_KEY');
    const geminiConfigured = !!this.configService.get('GEMINI_API_KEY');

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        googleMaps: googleMapsConfigured ? 'configured' : 'missing',
        gemini: geminiConfigured ? 'configured' : 'missing',
      },
      environment: this.configService.get('NODE_ENV', 'development'),
      port: this.configService.get('PORT', 3001),
    };
  }

  @Get('ready')
  checkReadiness() {
    const googleMapsConfigured = !!this.configService.get('GOOGLE_MAPS_API_KEY');
    const geminiConfigured = !!this.configService.get('GEMINI_API_KEY');

    if (!googleMapsConfigured || !geminiConfigured) {
      return {
        status: 'not ready',
        message: 'Required API keys are missing',
        services: {
          googleMaps: googleMapsConfigured ? 'configured' : 'missing',
          gemini: geminiConfigured ? 'configured' : 'missing',
        },
      };
    }

    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      message: 'All services are configured and ready',
    };
  }
}
