"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.enableCors({
        origin: [
            configService.get('FRONTEND_URL', 'http://localhost:3000'),
            'http://localhost:3000',
            'http://127.0.0.1:3000',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
    });
    app.setGlobalPrefix('api');
    const port = configService.get('PORT', 3001);
    console.log(`🚀 Server starting on port ${port}`);
    console.log(`📍 Google Maps API: ${configService.get('GOOGLE_MAPS_API_KEY') ? 'Configured' : 'Missing'}`);
    console.log(`🤖 Gemini AI API: ${configService.get('GEMINI_API_KEY') ? 'Configured' : 'Missing'}`);
    await app.listen(port);
    console.log(`✅ Server running at http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map