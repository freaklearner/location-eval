import { ConfigService } from '@nestjs/config';
export interface LocationData {
    lat: number;
    lng: number;
    radius?: number;
    format?: 'cart' | 'cloud_kitchen' | 'cafe_premium';
}
interface ParameterResult {
    id: string;
    name: string;
    slab: number;
    score: number;
    confidence: number;
    weight: number;
    reason: string;
    indicators: string[];
    rawData?: any;
}
export interface EvaluationResult {
    totalScore: number;
    percentage: number;
    grade: string;
    confidence: number;
    parameters: ParameterResult[];
    formatAdjustments?: any;
    recommendations: string[];
    locationDetails: any;
}
export declare class LocationService {
    private configService;
    private readonly googleMapsApiKey;
    private evaluationConfig;
    constructor(configService: ConfigService);
    private loadEvaluationConfig;
    evaluateLocation(locationData: LocationData): Promise<EvaluationResult>;
    private evaluateParameter;
    private fetchParameterData;
    private fetchNearbyPlaces;
    private fetchTextSearch;
    private reverseGeocode;
    private extractAddressComponent;
    private calculateDistance;
    private toRadians;
    private filterPlacesByDistance;
    private extractSignals;
    private analyzeProxies;
    private calculateBrandTierMix;
    private calculateQualityScore;
    private calculatePriceScore;
    private calculateParameterIndex;
    private assignSlab;
    private calculateConfidence;
    private calculateFinalScore;
    private applyFormatAdjustments;
    private calculateGrade;
    private generateRecommendations;
    private flattenKeywords;
    private removeDuplicatePlaces;
    getEvaluationConfig(): any;
    validateLocationData(locationData: LocationData): {
        valid: boolean;
        errors: string[];
    };
}
export {};
