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
const gemini_service_1 = require("../gemini/gemini.service");
let AnalysisController = class AnalysisController {
    constructor(locationService, geminiService) {
        this.locationService = locationService;
        this.geminiService = geminiService;
    }
    async completeAnalysis(body) {
        const { lat, lng, radius, clientName, address } = body;
        if (!lat || !lng) {
            throw new common_1.HttpException('Latitude and longitude are required', common_1.HttpStatus.BAD_REQUEST);
        }
        if (lat < -90 || lat > 90) {
            throw new common_1.HttpException('Latitude must be between -90 and 90', common_1.HttpStatus.BAD_REQUEST);
        }
        if (lng < -180 || lng > 180) {
            throw new common_1.HttpException('Longitude must be between -180 and 180', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const locationInfo = await this.locationService.getLocationInfo(lat, lng);
            const locationDetails = this.extractLocationDetails(locationInfo);
            const locationAnalysis = await this.locationService.analyzeLocation({
                lat,
                lng,
                radius: radius || 1000,
            });
            const areaCharacteristics = this.extractAreaCharacteristics(locationAnalysis);
            const aiEvaluation = await this.geminiService.evaluateLocation({
                locationData: locationAnalysis,
                areaCharacteristics,
            });
            return {
                success: true,
                data: {
                    coordinates: { lat, lng, radius: radius || 1000 },
                    locationInfo: locationDetails,
                    locationAnalysis,
                    areaCharacteristics,
                    aiEvaluation,
                    clientInfo: {
                        name: clientName || 'Unknown Client',
                        providedAddress: address || 'Not provided',
                    },
                    timestamp: new Date().toISOString(),
                },
                message: 'Complete location analysis finished successfully',
            };
        }
        catch (error) {
            console.error('Complete analysis failed:', error);
            throw new common_1.HttpException(`Analysis failed: ${error.message}`, error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    extractLocationDetails(geocodeResponse) {
        if (!geocodeResponse || !geocodeResponse.results || geocodeResponse.results.length === 0) {
            return {
                formattedAddress: 'Unknown Location',
                city: 'Unknown',
                state: 'Unknown',
                country: 'Unknown',
                postalCode: 'Unknown',
                neighborhood: 'Unknown',
                addressComponents: []
            };
        }
        const result = geocodeResponse.results[0];
        const components = result.address_components || [];
        let city = 'Unknown';
        let state = 'Unknown';
        let country = 'Unknown';
        let postalCode = 'Unknown';
        let neighborhood = 'Unknown';
        components.forEach((component) => {
            const types = component.types || [];
            if (types.includes('locality')) {
                city = component.long_name;
            }
            else if (types.includes('administrative_area_level_1')) {
                state = component.long_name;
            }
            else if (types.includes('country')) {
                country = component.long_name;
            }
            else if (types.includes('postal_code')) {
                postalCode = component.long_name;
            }
            else if (types.includes('neighborhood') || types.includes('sublocality')) {
                neighborhood = component.long_name;
            }
        });
        return {
            formattedAddress: result.formatted_address || 'Unknown Location',
            city,
            state,
            country,
            postalCode,
            neighborhood,
            addressComponents: components,
            placeId: result.place_id,
            geometry: result.geometry
        };
    }
    extractAreaCharacteristics(locationAnalysis) {
        const { businesses = {}, summary = {} } = locationAnalysis;
        return {
            food_competition: {
                total_restaurants: (businesses.restaurants?.length || 0) + (businesses.food?.length || 0),
                average_rating: summary.restaurants?.averageRating || 0,
                high_rated_restaurants: summary.restaurants?.highRatedCount || 0,
                popular_restaurants: summary.restaurants?.popularPlaces || 0,
            },
            commercial_activity: {
                total_businesses: summary.overall?.totalBusinesses || 0,
                shopping_options: businesses.shopping_malls?.length || 0,
                clothing_stores: 0,
            },
            demographics: {
                educational_institutions: (businesses.schools?.length || 0) + (businesses.universities?.length || 0),
                healthcare_facilities: businesses.hospitals?.length || 0,
                fitness_facilities: businesses.gyms?.length || 0,
                entertainment_options: 0,
            },
            infrastructure: {
                petrol_stations: businesses.gas_stations?.length || 0,
                accessibility_score: Math.min(10, Math.floor((summary.overall?.totalBusinesses || 0) / 10)),
            },
        };
    }
    async healthCheck() {
        return {
            success: true,
            message: 'Analysis service is healthy',
            services: {
                location: 'Available',
                gemini: 'Available',
            },
            timestamp: new Date().toISOString(),
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
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalysisController.prototype, "healthCheck", null);
exports.AnalysisController = AnalysisController = __decorate([
    (0, common_1.Controller)('analysis'),
    __metadata("design:paramtypes", [location_service_1.LocationService,
        gemini_service_1.GeminiService])
], AnalysisController);
//# sourceMappingURL=analysis.controller.js.map