import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: [
      configService.get('FRONTEND_URL', 'http://localhost:3000'),
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      // Add your production frontend URL here
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  const port = configService.get('PORT', 3001);
  
  console.log(`🚀 Server starting on port ${port}`);
  console.log(`📍 Google Maps API: ${configService.get('GOOGLE_MAPS_API_KEY') ? 'Configured' : 'Missing'}`);
  console.log(`🤖 Gemini AI API: ${configService.get('GEMINI_API_KEY') ? 'Configured' : 'Missing'}`);
  
  await app.listen(port);
  
  console.log(`✅ Server running at http://localhost:${port}/api`);
}

bootstrap(); 