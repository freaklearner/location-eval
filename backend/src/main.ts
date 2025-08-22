import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  const frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:3000');
  const allowedOrigins = [
    frontendUrl,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];

  // Add HTTPS version if frontend URL is HTTPS
  if (frontendUrl.startsWith('https://')) {
    allowedOrigins.push(frontendUrl.replace('https://', 'http://'));
  }

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Configure timeout for long-running operations
  const server = app.getHttpServer();
  server.timeout = 300000; // 5 minutes timeout for server operations
  server.keepAliveTimeout = 65000; // Keep-alive timeout
  server.headersTimeout = 66000; // Headers timeout

  const port = configService.get('PORT', 3000);
  
  console.log(`🚀 Server starting on port ${port}`);
  console.log(`📍 Google Maps API: ${configService.get('GOOGLE_MAPS_API_KEY') ? 'Configured' : 'Missing'}`);
  console.log(`🤖 Gemini AI API: ${configService.get('GEMINI_API_KEY') ? 'Configured' : 'Missing'}`);
  console.log(`⏱️ Server timeout configured: 5 minutes for long-running operations`);
  
  await app.listen(port);
  
  console.log(`✅ Server running at http://localhost:${port}/api`);
}

bootstrap(); 