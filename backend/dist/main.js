"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:3000');
    const allowedOrigins = [
        frontendUrl,
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3003',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3003',
    ];
    if (frontendUrl.startsWith('https://')) {
        allowedOrigins.push(frontendUrl.replace('https://', 'http://'));
    }
    app.enableCors({
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
    });
    app.setGlobalPrefix('api');
    const server = app.getHttpServer();
    server.timeout = 300000;
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
    const port = configService.get('PORT', 3002);
    console.log(`🚀 Server starting on port ${port}`);
    console.log(`📍 Google Maps API: ${configService.get('GOOGLE_MAPS_API_KEY') ? 'Configured' : 'Missing'}`);
    console.log(`🤖 Gemini AI API: ${configService.get('GEMINI_API_KEY') ? 'Configured' : 'Missing'}`);
    console.log(`⏱️ Server timeout configured: 5 minutes for long-running operations`);
    await app.listen(port);
    console.log(`✅ Server running at http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map