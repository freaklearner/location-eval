"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let LocationService = class LocationService {
    constructor(configService) {
        this.configService = configService;
        this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
        this.RADIUS_TOLERANCE_PERCENT = 0.05;
        this.googleMapsApiKey = this.configService.get('GOOGLE_MAPS_API_KEY');
        if (!this.googleMapsApiKey) {
            throw new Error('Google Maps API key not configured');
        }
        this.loadEvaluationConfig();
    }
    loadEvaluationConfig() {
        try {
            const configPath = path.join(__dirname, '../../config/evaluation.config.json');
            const configData = fs.readFileSync(configPath, 'utf8');
            this.evaluationConfig = JSON.parse(configData);
            console.log('✅ Evaluation configuration loaded successfully');
        }
        catch (error) {
            console.error('❌ Failed to load evaluation configuration:', error);
            this.evaluationConfig = this.getDefaultConfig();
        }
    }
    getDefaultConfig() {
        return {
            evaluationParameters: [],
            businessSearchTypes: [
                { key: 'restaurants', type: 'restaurant', description: 'All restaurants and eateries' },
                { key: 'food', type: 'meal_takeaway', description: 'Food takeaway establishments' },
                { key: 'cafes', type: 'cafe', description: 'Coffee shops and cafes' },
                { key: 'universities', type: 'university', description: 'Higher education institutions' },
                { key: 'hospitals', type: 'hospital', description: 'Healthcare facilities' },
                { key: 'gas_stations', type: 'gas_station', description: 'Fuel stations' },
                { key: 'shopping_malls', type: 'shopping_mall', description: 'Shopping centers and malls' },
                { key: 'gyms', type: 'gym', description: 'Fitness centers and gyms' },
                { key: 'banks', type: 'bank', description: 'Banking facilities' },
                { key: 'atms', type: 'atm', description: 'ATM locations' }
            ],
            brandCategories: {},
            scoringRules: {},
            viabilityThresholds: {}
        };
    }
    getEvaluationConfig() {
        return this.evaluationConfig;
    }
    calculateHaversineDistance(lat1, lng1, lat2, lng2) {
        const R = 6371000;
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    validateRadiusCompliance(results, centerLat, centerLng, userRadius) {
        const maxAllowedDistance = userRadius + (userRadius * this.RADIUS_TOLERANCE_PERCENT);
        return results.map(place => {
            const distance = this.calculateHaversineDistance(centerLat, centerLng, place.geometry.location.lat, place.geometry.location.lng);
            const isValid = distance <= maxAllowedDistance;
            if (!isValid) {
                console.log(`🚫 RADIUS VIOLATION: ${place.name} at ${distance.toFixed(0)}m exceeds max allowed ${maxAllowedDistance.toFixed(0)}m`);
            }
            return {
                place,
                distance,
                isValid
            };
        }).filter(result => result.isValid);
    }
    filterByBusinessType(results, allowedTypes, excludedTypes = []) {
        return results.filter(place => {
            const placeTypes = place.types || [];
            const hasExcludedType = excludedTypes.some(excludedType => placeTypes.includes(excludedType));
            if (hasExcludedType) {
                console.log(`🚫 TYPE FILTER: Excluding ${place.name} - contains excluded type: ${placeTypes.join(', ')}`);
                return false;
            }
            const hasAllowedType = allowedTypes.some(allowedType => placeTypes.includes(allowedType));
            return hasAllowedType;
        });
    }
    isValidBrandMatch(brandName, foundPlace) {
        const placeName = foundPlace.name?.toLowerCase() || '';
        const brandLower = brandName.toLowerCase();
        const strictBrands = {
            'h&m': ['h&m', 'h & m'],
            'zara': ['zara'],
            'uniqlo': ['uniqlo'],
            'marks & spencer': ['marks & spencer', 'marks and spencer', 'm&s'],
            'forever 21': ['forever 21', 'forever21'],
            'mcdonald\'s': ['mcdonald\'s', 'mcdonalds', 'mcd'],
            'kfc': ['kfc', 'kentucky fried chicken'],
            'pizza hut': ['pizza hut', 'pizzahut'],
            'burger king': ['burger king', 'burgerking'],
            'domino\'s': ['domino\'s', 'dominos'],
            'starbucks': ['starbucks'],
            'costa coffee': ['costa coffee', 'costa'],
            'cafe coffee day': ['cafe coffee day', 'ccd'],
            'shoppers stop': ['shoppers stop', 'shoppersstop'],
            'wow! momo': ['wow! momo', 'wow momo', 'wowmomo']
        };
        if (strictBrands[brandLower]) {
            const isMatch = strictBrands[brandLower].some(validName => placeName.includes(validName) || placeName === validName);
            if (!isMatch) {
                console.log(`🚫 BRAND MISMATCH: "${placeName}" doesn't match "${brandName}"`);
            }
            return isMatch;
        }
        const isMatch = placeName.includes(brandLower) &&
            !placeName.includes('fashion hub') &&
            !placeName.includes('garment') &&
            !placeName.includes('tailor') &&
            !placeName.includes('boutique');
        if (!isMatch) {
            console.log(`🚫 BRAND MISMATCH: "${placeName}" doesn't match "${brandName}" or contains false positive terms`);
        }
        return isMatch;
    }
    async findNearbyBusinesses(lat, lng, type, userRadius) {
        try {
            console.log(`🔍 NEARBY SEARCH: ${type} within ${userRadius}m radius`);
            const url = `${this.baseUrl}/nearbysearch/json`;
            const params = {
                location: `${lat},${lng}`,
                radius: userRadius.toString(),
                type,
                key: this.googleMapsApiKey,
            };
            const response = await axios_1.default.get(url, { params });
            if (response.data.status === 'OVER_QUERY_LIMIT') {
                throw new common_1.HttpException('API quota exceeded', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            if (response.data.status === 'REQUEST_DENIED') {
                throw new common_1.HttpException('API request denied', common_1.HttpStatus.FORBIDDEN);
            }
            return response.data;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Failed to fetch nearby businesses: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async searchByText(lat, lng, query, userRadius) {
        try {
            console.log(`🔍 TEXT SEARCH: "${query}" within ${userRadius}m radius`);
            const url = `${this.baseUrl}/textsearch/json`;
            const params = {
                query: encodeURIComponent(query),
                location: `${lat},${lng}`,
                radius: userRadius.toString(),
                key: this.googleMapsApiKey,
            };
            const response = await axios_1.default.get(url, { params });
            if (response.data.status === 'OVER_QUERY_LIMIT') {
                throw new common_1.HttpException('API quota exceeded', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            if (response.data.status === 'REQUEST_DENIED') {
                throw new common_1.HttpException('API request denied', common_1.HttpStatus.FORBIDDEN);
            }
            return response.data;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Failed to search by text: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getLocationInfo(lat, lng) {
        try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json`;
            const params = {
                latlng: `${lat},${lng}`,
                key: this.googleMapsApiKey,
            };
            const response = await axios_1.default.get(url, { params });
            if (response.data.status === 'OVER_QUERY_LIMIT') {
                throw new common_1.HttpException('API quota exceeded', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            if (response.data.status === 'REQUEST_DENIED') {
                throw new common_1.HttpException('API request denied', common_1.HttpStatus.FORBIDDEN);
            }
            return response.data;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Failed to get location info: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async analyzeLocation(request) {
        const { lat, lng, radius = 1000 } = request;
        console.log(`🎯 LOCATION ANALYSIS: lat=${lat}, lng=${lng}, radius=${radius}m (STRICT COMPLIANCE MODE)`);
        try {
            const analysis = {
                coordinates: { lat, lng, radius },
                businesses: {},
                brands: {},
                summary: {},
                rawData: {},
                config: this.evaluationConfig
            };
            const searchTypes = this.evaluationConfig.businessSearchTypes;
            for (const { key, type } of searchTypes) {
                try {
                    console.log(`🔍 Searching for ${type} within ${radius}m...`);
                    const result = await this.findNearbyBusinesses(lat, lng, type, radius);
                    let filteredResults = result.results || [];
                    const validatedResults = this.validateRadiusCompliance(filteredResults, lat, lng, radius);
                    filteredResults = validatedResults.map(r => r.place);
                    if (key === 'restaurants' || key === 'food' || key === 'cafes') {
                        const excludedTypes = ['bank', 'atm', 'finance', 'insurance_agency', 'real_estate_agency'];
                        const allowedTypes = ['restaurant', 'food', 'meal_takeaway', 'cafe', 'bakery'];
                        filteredResults = this.filterByBusinessType(filteredResults, allowedTypes, excludedTypes);
                    }
                    analysis.businesses[key] = filteredResults;
                    analysis.rawData[key] = {
                        ...result,
                        filteredCount: filteredResults.length,
                        originalCount: result.results?.length || 0,
                        radiusCompliant: true
                    };
                    console.log(`✅ ${type}: Found ${filteredResults.length} valid businesses (filtered from ${result.results?.length || 0} total)`);
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                catch (error) {
                    console.warn(`Failed to search for ${type}:`, error.message);
                    analysis.businesses[key] = [];
                }
            }
            const allBrands = this.getAllBrandsFromConfig();
            console.log(`🏷️ Searching for ${allBrands.length} brands with EXACT user radius: ${radius}m`);
            for (const brand of allBrands) {
                try {
                    let result = await this.searchByText(lat, lng, brand, radius);
                    let validPlaces = [];
                    if (result.results && result.results.length > 0) {
                        const radiusValidatedResults = this.validateRadiusCompliance(result.results, lat, lng, radius);
                        validPlaces = radiusValidatedResults
                            .map(r => r.place)
                            .filter(place => this.isValidBrandMatch(brand, place));
                    }
                    if (validPlaces.length === 0) {
                        const alternativeQueries = this.getAlternativeBrandQueries(brand);
                        for (const altQuery of alternativeQueries) {
                            const altResult = await this.searchByText(lat, lng, altQuery, radius);
                            if (altResult.results && altResult.results.length > 0) {
                                const altRadiusValidated = this.validateRadiusCompliance(altResult.results, lat, lng, radius);
                                const validAltPlaces = altRadiusValidated
                                    .map(r => r.place)
                                    .filter(place => this.isValidBrandMatch(brand, place));
                                if (validAltPlaces.length > 0) {
                                    validPlaces = validAltPlaces;
                                    console.log(`✅ Found ${brand} using alternative query: "${altQuery}" (${validPlaces.length} valid locations within ${radius}m)`);
                                    break;
                                }
                            }
                            await new Promise(resolve => setTimeout(resolve, 50));
                        }
                    }
                    analysis.brands[brand] = {
                        found: validPlaces.length > 0,
                        places: validPlaces,
                        searchRadius: radius,
                        radiusCompliant: true
                    };
                    if (validPlaces.length > 0) {
                        console.log(`✅ Found ${brand}: ${validPlaces.length} valid locations within ${radius}m radius`);
                    }
                    else {
                        console.log(`❌ Not found: ${brand} (searched within ${radius}m radius, ${result.results?.length || 0} results but none valid)`);
                    }
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                catch (error) {
                    console.warn(`Failed to search for ${brand}:`, error.message);
                    analysis.brands[brand] = {
                        found: false,
                        places: [],
                        searchRadius: radius,
                        radiusCompliant: true,
                        error: error.message
                    };
                }
            }
            analysis.summary = this.generateSummary(analysis.businesses, analysis.brands);
            console.log(`🎯 ANALYSIS COMPLETE: All results within ${radius}m radius (±${(radius * this.RADIUS_TOLERANCE_PERCENT).toFixed(0)}m tolerance)`);
            return analysis;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to analyze location: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    getAllBrandsFromConfig() {
        const brands = new Set();
        this.evaluationConfig.evaluationParameters.forEach(param => {
            if (param.brands) {
                param.brands.forEach(brand => brands.add(brand));
            }
        });
        Object.values(this.evaluationConfig.brandCategories).forEach((category) => {
            Object.values(category).forEach((brandList) => {
                if (Array.isArray(brandList)) {
                    brandList.forEach(brand => brands.add(brand));
                }
            });
        });
        return Array.from(brands);
    }
    getAlternativeBrandQueries(brand) {
        const brandVariations = {
            'McDonald\'s': ['McDonalds'],
            'Domino\'s': ['Dominos'],
            'Cafe Coffee Day': ['CCD'],
            'Forever 21': ['Forever21'],
            'Shoppers Stop': ['ShoppersStop'],
            'Marks & Spencer': ['Marks and Spencer'],
            'Wow! Momo': ['Wow Momo']
        };
        return brandVariations[brand] || [];
    }
    generateSummary(businesses, brands) {
        const summary = {};
        Object.entries(businesses).forEach(([key, places]) => {
            summary[key] = {
                count: places.length,
                averageRating: this.calculateAverageRating(places),
                highRatedCount: places.filter(p => p.rating >= 4.0).length,
                popularPlaces: places.filter(p => (p.user_ratings_total || 0) > 100).length
            };
        });
        summary['brandPresence'] = {};
        Object.entries(brands).forEach(([brand, brandData]) => {
            const places = Array.isArray(brandData) ? brandData : (brandData?.places || []);
            const found = Array.isArray(brandData) ? brandData.length > 0 : (brandData?.found || false);
            summary['brandPresence'][brand] = {
                present: found,
                count: places.length,
                searchRadius: brandData?.searchRadius,
                locations: places.map(p => ({
                    name: p.name,
                    rating: p.rating,
                    vicinity: p.vicinity
                }))
            };
        });
        summary['overall'] = {
            totalBusinesses: Object.values(businesses).reduce((sum, places) => sum + places.length, 0),
            premiumBrandCount: Object.values(brands).reduce((sum, brandData) => {
                const places = Array.isArray(brandData) ? brandData : (brandData?.places || []);
                return sum + places.length;
            }, 0),
            averageBusinessRating: this.calculateOverallAverageRating(businesses),
            businessDensity: this.calculateBusinessDensity(businesses),
            competitionLevel: this.calculateCompetitionLevel(businesses['restaurants'], businesses['food'])
        };
        return summary;
    }
    calculateAverageRating(places) {
        const ratedPlaces = places.filter(p => p.rating);
        if (ratedPlaces.length === 0)
            return 0;
        const total = ratedPlaces.reduce((sum, place) => sum + place.rating, 0);
        return Math.round((total / ratedPlaces.length) * 10) / 10;
    }
    calculateOverallAverageRating(businesses) {
        const allPlaces = Object.values(businesses).flat();
        return this.calculateAverageRating(allPlaces);
    }
    calculateBusinessDensity(businesses) {
        const totalBusinesses = Object.values(businesses).reduce((sum, places) => sum + places.length, 0);
        if (totalBusinesses > 100)
            return 'High';
        if (totalBusinesses > 50)
            return 'Medium';
        if (totalBusinesses > 20)
            return 'Low';
        return 'Very Low';
    }
    calculateCompetitionLevel(restaurants = [], food = []) {
        const totalFoodPlaces = restaurants.length + food.length;
        if (totalFoodPlaces > 20)
            return 'High';
        if (totalFoodPlaces > 10)
            return 'Medium';
        if (totalFoodPlaces > 5)
            return 'Low';
        return 'Very Low';
    }
};
exports.LocationService = LocationService;
exports.LocationService = LocationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LocationService);
//# sourceMappingURL=location.service.js.map