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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let LocationService = class LocationService {
    constructor(configService) {
        this.configService = configService;
        this.googleMapsApiKey = this.configService.get('GOOGLE_MAPS_API_KEY');
        this.loadEvaluationConfig();
    }
    loadEvaluationConfig() {
        try {
            const configPath = path.join(process.cwd(), 'src', 'config', 'evaluation.config.json');
            const configData = fs.readFileSync(configPath, 'utf8');
            this.evaluationConfig = JSON.parse(configData);
            console.log('✅ Evaluation config loaded successfully');
        }
        catch (error) {
            console.error('❌ Failed to load evaluation config:', error.message);
            throw new Error('Configuration file not found or invalid');
        }
    }
    async evaluateLocation(locationData) {
        console.log(`🎯 Starting location evaluation for ${locationData.lat}, ${locationData.lng}`);
        console.log(`🌍 Fetching location details...`);
        const locationDetails = await this.reverseGeocode(locationData.lat, locationData.lng);
        console.log(`📍 Location: ${locationDetails.city}, ${locationDetails.state}, ${locationDetails.country}`);
        const results = [];
        for (const param of this.evaluationConfig.evaluationParameters) {
            console.log(`\n📊 Processing: ${param.name}`);
            try {
                const paramResult = await this.evaluateParameter(param, locationData);
                results.push(paramResult);
                console.log(`✅ ${param.name}: Slab ${paramResult.slab}, Score ${paramResult.score}`);
            }
            catch (error) {
                console.error(`❌ Error evaluating ${param.name}:`, error.message);
                results.push({
                    id: param.id,
                    name: param.name,
                    slab: 1,
                    score: 0,
                    confidence: 0,
                    weight: param.weight,
                    reason: `Evaluation failed: ${error.message}`,
                    indicators: ['data_unavailable']
                });
            }
        }
        const finalResult = this.calculateFinalScore(results, locationData.format, locationDetails);
        console.log(`\n🎯 Final Score: ${finalResult.percentage}% (${finalResult.grade})`);
        return finalResult;
    }
    async evaluateParameter(param, locationData) {
        const rawData = await this.fetchParameterData(param, locationData);
        const signals = this.extractSignals(rawData, param);
        const proxies = this.analyzeProxies(signals, param);
        const index = this.calculateParameterIndex(proxies, param);
        const slabResult = this.assignSlab(index, param);
        const confidence = this.calculateConfidence(rawData, signals, param);
        return {
            id: param.id,
            name: param.name,
            slab: slabResult.slab,
            score: slabResult.score,
            confidence: confidence,
            weight: param.weight,
            reason: slabResult.reason,
            indicators: slabResult.indicators,
            rawData: rawData
        };
    }
    async fetchParameterData(param, locationData) {
        const { lat, lng } = locationData;
        const allData = {
            places: [],
            textSearchResults: [],
            radius: locationData.radius
        };
        for (const radius of param.searchRadius || [800]) {
            try {
                if (param.apiQueries?.types) {
                    for (const type of param.apiQueries.types) {
                        const placesData = await this.fetchNearbyPlaces(lat, lng, radius, type);
                        allData.places.push(...placesData);
                    }
                }
                if (param.apiQueries?.keywords) {
                    const keywords = this.flattenKeywords(param.apiQueries.keywords);
                    for (const keyword of keywords.slice(0, 5)) {
                        const textData = await this.fetchTextSearch(lat, lng, radius, keyword);
                        allData.textSearchResults.push(...textData);
                    }
                }
            }
            catch (error) {
                console.warn(`⚠️ API fetch failed for ${param.name} at radius ${radius}m:`, error.message);
            }
        }
        allData.places = this.removeDuplicatePlaces(allData.places);
        allData.textSearchResults = this.removeDuplicatePlaces(allData.textSearchResults);
        return allData;
    }
    async fetchNearbyPlaces(lat, lng, radius, type) {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${this.googleMapsApiKey}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
                throw new Error(`API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
            }
            return data.results || [];
        }
        catch (error) {
            console.error(`Places API error for type ${type}:`, error.message);
            return [];
        }
    }
    async fetchTextSearch(lat, lng, radius, query) {
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=${radius}&key=${this.googleMapsApiKey}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
                throw new Error(`API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
            }
            return data.results || [];
        }
        catch (error) {
            console.error(`Text Search API error for query ${query}:`, error.message);
            return [];
        }
    }
    async reverseGeocode(lat, lng) {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.googleMapsApiKey}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.status !== 'OK') {
                throw new Error(`Geocoding API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
            }
            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                const addressComponents = result.address_components || [];
                const locationDetails = {
                    formattedAddress: result.formatted_address,
                    city: this.extractAddressComponent(addressComponents, ['locality', 'administrative_area_level_2']),
                    state: this.extractAddressComponent(addressComponents, ['administrative_area_level_1']),
                    country: this.extractAddressComponent(addressComponents, ['country']),
                    postalCode: this.extractAddressComponent(addressComponents, ['postal_code']),
                    placeId: result.place_id
                };
                return locationDetails;
            }
            return {
                formattedAddress: 'Address not found',
                city: 'Unknown',
                state: 'Unknown',
                country: 'Unknown',
                postalCode: null,
                placeId: null
            };
        }
        catch (error) {
            console.error(`Reverse geocoding error:`, error.message);
            return {
                formattedAddress: 'Address lookup failed',
                city: 'Unknown',
                state: 'Unknown',
                country: 'Unknown',
                postalCode: null,
                placeId: null
            };
        }
    }
    extractAddressComponent(components, types) {
        for (const type of types) {
            const component = components.find(comp => comp.types.includes(type));
            if (component) {
                return component.long_name;
            }
        }
        return 'Unknown';
    }
    extractSignals(rawData, param) {
        const signals = {
            totalCount: rawData.places.length + rawData.textSearchResults.length,
            brandCounts: {},
            qualityMetrics: {
                avgRating: 0,
                avgReviewCount: 0,
                highQualityCount: 0
            },
            priceDistribution: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
            typeDistribution: {},
            keywordMatches: {}
        };
        const allPlaces = [...rawData.places, ...rawData.textSearchResults];
        if (allPlaces.length === 0) {
            return signals;
        }
        if (param.apiQueries?.keywords && typeof param.apiQueries.keywords === 'object') {
            for (const [category, brands] of Object.entries(param.apiQueries.keywords)) {
                signals.brandCounts[category] = 0;
                for (const brand of brands) {
                    const count = allPlaces.filter(place => place.name?.toLowerCase().includes(brand.toLowerCase())).length;
                    signals.brandCounts[category] += count;
                }
            }
        }
        const ratingsSum = allPlaces.reduce((sum, place) => sum + (place.rating || 0), 0);
        const reviewsSum = allPlaces.reduce((sum, place) => sum + (place.user_ratings_total || 0), 0);
        signals.qualityMetrics.avgRating = ratingsSum / allPlaces.length;
        signals.qualityMetrics.avgReviewCount = reviewsSum / allPlaces.length;
        signals.qualityMetrics.highQualityCount = allPlaces.filter(place => place.rating >= 4.0 && place.user_ratings_total >= 100).length;
        allPlaces.forEach(place => {
            const priceLevel = place.price_level || 0;
            signals.priceDistribution[priceLevel]++;
        });
        return signals;
    }
    analyzeProxies(signals, param) {
        const proxies = {
            density: signals.totalCount,
            brandTierMix: this.calculateBrandTierMix(signals.brandCounts, param),
            qualityScore: this.calculateQualityScore(signals.qualityMetrics),
            priceScore: this.calculatePriceScore(signals.priceDistribution),
            diversityScore: Object.keys(signals.typeDistribution).length
        };
        return proxies;
    }
    calculateBrandTierMix(brandCounts, param) {
        if (!param.slabCriteria)
            return 50;
        let maxScore = 0;
        let bestSlab = 3;
        for (let slab = 1; slab <= 5; slab++) {
            const criteria = param.slabCriteria[slab.toString()];
            if (criteria?.weightage) {
                let score = 0;
                for (const [category, expectedWeight] of Object.entries(criteria.weightage)) {
                    const actualCount = brandCounts[category] || 0;
                    const totalBrands = Object.values(brandCounts).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
                    const actualWeight = totalBrands > 0 ? (actualCount / totalBrands) * 100 : 0;
                    score += Math.min(actualWeight / expectedWeight, 1) * 20;
                }
                if (score > maxScore) {
                    maxScore = score;
                    bestSlab = slab;
                }
            }
        }
        return bestSlab * 20;
    }
    calculateQualityScore(qualityMetrics) {
        const ratingScore = (qualityMetrics.avgRating / 5) * 40;
        const reviewScore = Math.min(qualityMetrics.avgReviewCount / 500, 1) * 30;
        const highQualityScore = Math.min(qualityMetrics.highQualityCount / 10, 1) * 30;
        return ratingScore + reviewScore + highQualityScore;
    }
    calculatePriceScore(priceDistribution) {
        const totalPlaces = Object.values(priceDistribution).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
        if (totalPlaces === 0)
            return 50;
        const weightedSum = Object.entries(priceDistribution).reduce((sum, [level, count]) => {
            return sum + (parseInt(level) * count);
        }, 0);
        return Math.min((weightedSum / totalPlaces) * 25, 100);
    }
    calculateParameterIndex(proxies, param) {
        const weights = {
            density: 0.3,
            brandTierMix: 0.3,
            qualityScore: 0.2,
            priceScore: 0.1,
            diversityScore: 0.1
        };
        const index = ((proxies.density / 50 * 100 * weights.density) +
            (proxies.brandTierMix * weights.brandTierMix) +
            (proxies.qualityScore * weights.qualityScore) +
            (proxies.priceScore * weights.priceScore) +
            (proxies.diversityScore / 10 * 100 * weights.diversityScore));
        return Math.min(Math.max(index, 0), 100);
    }
    assignSlab(index, param) {
        if (!param.slabCriteria) {
            const slab = Math.ceil(index / 20);
            return {
                slab: Math.min(Math.max(slab, 1), 5),
                score: index,
                confidence: 70,
                reason: `Index-based assignment: ${index.toFixed(1)}`,
                indicators: [`index_${index.toFixed(0)}`]
            };
        }
        let bestSlab = 3;
        let bestScore = index;
        let reason = '';
        let indicators = [];
        for (let slab = 1; slab <= 5; slab++) {
            const criteria = param.slabCriteria[slab.toString()];
            if (criteria) {
                const slabRange = this.evaluationConfig.evaluationFramework.slabSystem[slab].range;
                if (index >= slabRange[0] && index <= slabRange[1]) {
                    bestSlab = slab;
                    reason = criteria.description;
                    indicators = criteria.indicators || [`slab_${slab}`];
                    break;
                }
            }
        }
        return {
            slab: bestSlab,
            score: bestScore,
            confidence: 80,
            reason: reason || `Slab ${bestSlab} based on index ${index.toFixed(1)}`,
            indicators: indicators
        };
    }
    calculateConfidence(rawData, signals, param) {
        const totalPlaces = rawData.places.length + rawData.textSearchResults.length;
        const coverageScore = Math.min(totalPlaces / 20, 1) * 100;
        const avgReviews = signals.qualityMetrics.avgReviewCount;
        const reviewScore = Math.min(avgReviews / 100, 1) * 100;
        const brandScore = param.apiQueries?.keywords ?
            Math.min(Object.values(signals.brandCounts).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) / 5, 1) * 100 : 80;
        const confidence = (coverageScore * 0.4) + (reviewScore * 0.2) + (brandScore * 0.1) + (75 * 0.3);
        return Math.min(Math.max(confidence, 0), 100);
    }
    calculateFinalScore(results, format, locationDetails) {
        let totalWeightedScore = 0;
        let totalWeight = 0;
        let totalConfidence = 0;
        const adjustedResults = this.applyFormatAdjustments(results, format);
        adjustedResults.forEach(result => {
            const weightedScore = (result.score / 100) * result.weight;
            totalWeightedScore += weightedScore;
            totalWeight += result.weight;
            totalConfidence += result.confidence;
        });
        const averageConfidence = totalConfidence / adjustedResults.length;
        const percentage = (totalWeightedScore / totalWeight) * 100;
        const grade = this.calculateGrade(percentage);
        const recommendations = this.generateRecommendations(adjustedResults, percentage);
        return {
            totalScore: totalWeightedScore,
            percentage: Math.round(percentage * 100) / 100,
            grade: grade,
            confidence: Math.round(averageConfidence * 100) / 100,
            parameters: adjustedResults,
            formatAdjustments: format ? this.evaluationConfig.formatBasedWeights[format] : null,
            recommendations: recommendations,
            locationDetails: locationDetails
        };
    }
    applyFormatAdjustments(results, format) {
        if (!format || !this.evaluationConfig.formatBasedWeights[format]) {
            return results;
        }
        const adjustments = this.evaluationConfig.formatBasedWeights[format].adjustments;
        return results.map(result => {
            if (adjustments[result.id]) {
                return {
                    ...result,
                    weight: adjustments[result.id]
                };
            }
            return result;
        });
    }
    calculateGrade(percentage) {
        if (percentage >= 80)
            return 'A';
        if (percentage >= 70)
            return 'B';
        if (percentage >= 60)
            return 'C';
        return 'D';
    }
    generateRecommendations(results, percentage) {
        const recommendations = [];
        if (percentage >= 80) {
            recommendations.push('🎯 Highly Recommended: Excellent location with strong potential across multiple parameters.');
        }
        else if (percentage >= 70) {
            recommendations.push('✅ Recommended: Good location with solid fundamentals and growth potential.');
        }
        else if (percentage >= 60) {
            recommendations.push('⚠️ Conditional: Moderate potential, consider specific improvements before proceeding.');
        }
        else {
            recommendations.push('❌ Not Recommended: Significant challenges across multiple parameters.');
        }
        const topStrengths = results
            .filter(r => r.slab >= 4)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
        if (topStrengths.length > 0) {
            recommendations.push(`💪 Key Strengths: ${topStrengths.map(s => s.name).join(', ')}`);
        }
        const improvements = results
            .filter(r => r.slab <= 2 && r.weight >= 5)
            .sort((a, b) => b.weight - a.weight)
            .slice(0, 3);
        if (improvements.length > 0) {
            recommendations.push(`🔧 Priority Improvements: ${improvements.map(i => i.name).join(', ')}`);
        }
        return recommendations;
    }
    flattenKeywords(keywords) {
        if (Array.isArray(keywords)) {
            return keywords;
        }
        if (typeof keywords === 'object') {
            return Object.values(keywords).flat();
        }
        return [];
    }
    removeDuplicatePlaces(places) {
        const seen = new Set();
        return places.filter(place => {
            const key = `${place.place_id || place.name}_${place.geometry?.location?.lat}_${place.geometry?.location?.lng}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
    getEvaluationConfig() {
        return this.evaluationConfig;
    }
    validateLocationData(locationData) {
        const errors = [];
        if (!locationData.lat || !locationData.lng) {
            errors.push('Latitude and longitude are required');
        }
        if (locationData.lat < -90 || locationData.lat > 90) {
            errors.push('Latitude must be between -90 and 90');
        }
        if (locationData.lng < -180 || locationData.lng > 180) {
            errors.push('Longitude must be between -180 and 180');
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
};
exports.LocationService = LocationService;
exports.LocationService = LocationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LocationService);
//# sourceMappingURL=location.service.js.map