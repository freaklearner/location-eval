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
exports.AnalysisController = void 0;
const common_1 = require("@nestjs/common");
const location_service_1 = require("./location.service");
let AnalysisController = class AnalysisController {
    constructor(locationService) {
        this.locationService = locationService;
    }
    async completeAnalysis(body) {
        const { lat, lng, radius = 800, format, clientName, address } = body;
        const locationData = { lat, lng, radius, format };
        const validation = this.locationService.validateLocationData(locationData);
        if (!validation.valid) {
            throw new common_1.HttpException(`Invalid location data: ${validation.errors.join(', ')}`, common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            console.log(`🎯 Starting complete analysis for ${lat}, ${lng} (radius: ${radius}m, format: ${format || 'default'})`);
            const evaluationResult = await this.locationService.evaluateLocation(locationData);
            const response = {
                success: true,
                timestamp: new Date().toISOString(),
                location: {
                    coordinates: { lat, lng },
                    radius,
                    format: format || 'default',
                    clientName: clientName || null,
                    address: address || evaluationResult.locationDetails?.formattedAddress || null,
                    city: evaluationResult.locationDetails?.city || 'Unknown',
                    state: evaluationResult.locationDetails?.state || 'Unknown',
                    country: evaluationResult.locationDetails?.country || 'Unknown',
                    postalCode: evaluationResult.locationDetails?.postalCode || null
                },
                evaluation: {
                    overall: {
                        percentage: evaluationResult.percentage,
                        grade: evaluationResult.grade,
                        confidence: evaluationResult.confidence,
                        totalScore: evaluationResult.totalScore
                    },
                    parameters: evaluationResult.parameters.map(param => ({
                        id: param.id,
                        name: param.name,
                        slab: param.slab,
                        score: param.score,
                        weight: param.weight,
                        confidence: param.confidence,
                        reason: param.reason,
                        indicators: param.indicators,
                        rawData: param.rawData
                    })),
                    formatAdjustments: evaluationResult.formatAdjustments,
                    recommendations: evaluationResult.recommendations
                },
                methodology: {
                    framework: '7-Step Slab-Based Evaluation',
                    version: '2.0',
                    totalParameters: evaluationResult.parameters.length,
                    slabSystem: 'Budget(1) → Entry(2) → Mid(3) → Premium(4) → Luxury(5)'
                }
            };
            console.log(`✅ Analysis completed: ${evaluationResult.percentage}% (Grade ${evaluationResult.grade})`);
            return response;
        }
        catch (error) {
            console.error('❌ Analysis failed:', error.message);
            throw new common_1.HttpException(`Analysis failed: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getEvaluationConfig() {
        try {
            const config = this.locationService.getEvaluationConfig();
            return {
                success: true,
                config: {
                    framework: config.evaluationFramework,
                    parameters: config.evaluationParameters.map(p => ({
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        weight: p.weight,
                        category: p.category
                    })),
                    formatOptions: Object.keys(config.formatBasedWeights || {}),
                    slabSystem: config.evaluationFramework.slabSystem
                }
            };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to load configuration', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async validateLocation(body) {
        const locationData = { lat: body.lat, lng: body.lng, radius: body.radius, format: body.format };
        const validation = this.locationService.validateLocationData(locationData);
        return {
            valid: validation.valid,
            errors: validation.errors
        };
    }
    async healthCheck() {
        return {
            status: 'healthy',
            service: 'Location Evaluation Tool v2.0',
            framework: '7-Step Slab-Based Evaluation',
            timestamp: new Date().toISOString()
        };
    }
};
exports.AnalysisController = AnalysisController;
__decorate([
    (0, common_1.Post)('complete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalysisController.prototype, "completeAnalysis", null);
__decorate([
    (0, common_1.Get)('config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalysisController.prototype, "getEvaluationConfig", null);
__decorate([
    (0, common_1.Post)('validate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalysisController.prototype, "validateLocation", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalysisController.prototype, "healthCheck", null);
exports.AnalysisController = AnalysisController = __decorate([
    (0, common_1.Controller)('analysis'),
    __metadata("design:paramtypes", [location_service_1.LocationService])
], AnalysisController);
//# sourceMappingURL=analysis.controller.js.map