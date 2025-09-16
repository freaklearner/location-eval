"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let HealthController = class HealthController {
    constructor(configService) {
        this.configService = configService;
    }
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
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "checkHealth", null);
__decorate([
    (0, common_1.Get)('ready'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "checkReadiness", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HealthController);
//# sourceMappingURL=health.controller.js.map