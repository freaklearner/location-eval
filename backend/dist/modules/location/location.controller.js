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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationController = void 0;
const common_1 = require("@nestjs/common");
const location_service_1 = require("./location.service");
let LocationController = class LocationController {
    constructor(locationService) {
        this.locationService = locationService;
    }
    async analyzeLocation(body) {
        const { lat, lng, radius = 800, format } = body;
        const locationData = { lat, lng, radius, format };
        const validation = this.locationService.validateLocationData(locationData);
        if (!validation.valid) {
            throw new common_1.HttpException(`Invalid input: ${validation.errors.join(', ')}`, common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            console.log(`🎯 Analyzing location: ${lat}, ${lng} (radius: ${radius}m, format: ${format || 'default'})`);
            const result = await this.locationService.evaluateLocation(locationData);
            return {
                success: true,
                location: { lat, lng, radius, format },
                evaluation: result,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            console.error('❌ Location analysis failed:', error.message);
            throw new common_1.HttpException(`Location analysis failed: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
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
        }
        catch (error) {
            throw new common_1.HttpException('Failed to retrieve configuration', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async validateInput(body) {
        const locationData = { lat: body.lat, lng: body.lng, radius: body.radius, format: body.format };
        const validation = this.locationService.validateLocationData(locationData);
        return {
            valid: validation.valid,
            errors: validation.errors,
            timestamp: new Date().toISOString()
        };
    }
    async healthCheck() {
        return {
            status: 'healthy',
            service: 'Location Service v2.0',
            framework: '7-Step Slab-Based Evaluation',
            timestamp: new Date().toISOString()
        };
    }
};
exports.LocationController = LocationController;
__decorate([
    (0, common_1.Post)('analyze'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "analyzeLocation", null);
__decorate([
    (0, common_1.Get)('config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "getConfiguration", null);
__decorate([
    (0, common_1.Post)('validate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "validateInput", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "healthCheck", null);
exports.LocationController = LocationController = __decorate([
    (0, common_1.Controller)('location'),
    __metadata("design:paramtypes", [location_service_1.LocationService])
], LocationController);
//# sourceMappingURL=location.controller.js.map