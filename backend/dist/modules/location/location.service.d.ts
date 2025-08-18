import { ConfigService } from '@nestjs/config';
interface LocationAnalysisRequest {
    lat: number;
    lng: number;
    radius?: number;
}
export interface BusinessSearchResult {
    results: any[];
    status: string;
}
interface EvaluationConfig {
    evaluationParameters: any[];
    businessSearchTypes: any[];
    brandCategories: any;
    scoringRules: any;
    viabilityThresholds: any;
}
export declare class LocationService {
    private configService;
    private readonly googleMapsApiKey;
    private readonly baseUrl;
    private evaluationConfig;
    private readonly RADIUS_TOLERANCE_PERCENT;
    constructor(configService: ConfigService);
    private loadEvaluationConfig;
    private getDefaultConfig;
    getEvaluationConfig(): EvaluationConfig;
    private calculateHaversineDistance;
    private toRadians;
    private validateRadiusCompliance;
    private filterByBusinessType;
    private isValidBrandMatch;
    findNearbyBusinesses(lat: number, lng: number, type: string, userRadius: number): Promise<BusinessSearchResult>;
    searchByText(lat: number, lng: number, query: string, userRadius: number): Promise<BusinessSearchResult>;
    getLocationInfo(lat: number, lng: number): Promise<any>;
    analyzeLocation(request: LocationAnalysisRequest): Promise<any>;
    private getAllBrandsFromConfig;
    private getAlternativeBrandQueries;
    private generateSummary;
    private calculateAverageRating;
    private calculateOverallAverageRating;
    private calculateBusinessDensity;
    private calculateCompetitionLevel;
}
export {};
