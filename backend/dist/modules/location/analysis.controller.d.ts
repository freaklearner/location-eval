import { LocationService } from './location.service';
interface CompleteAnalysisDto {
    lat: number;
    lng: number;
    radius?: number;
    format?: 'cart' | 'cloud_kitchen' | 'cafe_premium';
    clientName?: string;
    address?: string;
}
export declare class AnalysisController {
    private readonly locationService;
    constructor(locationService: LocationService);
    completeAnalysis(body: CompleteAnalysisDto): Promise<{
        success: boolean;
        timestamp: string;
        location: {
            coordinates: {
                lat: number;
                lng: number;
            };
            radius: number;
            format: string;
            clientName: string;
            address: any;
            city: any;
            state: any;
            country: any;
            postalCode: any;
        };
        evaluation: {
            overall: {
                percentage: number;
                grade: string;
                confidence: number;
                totalScore: number;
            };
            parameters: {
                id: string;
                name: string;
                slab: number;
                score: number;
                weight: number;
                confidence: number;
                reason: string;
                indicators: string[];
                rawData: any;
            }[];
            formatAdjustments: any;
            recommendations: string[];
        };
        methodology: {
            framework: string;
            version: string;
            totalParameters: number;
            slabSystem: string;
        };
    }>;
    getEvaluationConfig(): Promise<{
        success: boolean;
        config: {
            framework: any;
            parameters: any;
            formatOptions: string[];
            slabSystem: any;
        };
    }>;
    validateLocation(body: {
        lat: number;
        lng: number;
        radius?: number;
        format?: string;
    }): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    healthCheck(): Promise<{
        status: string;
        service: string;
        framework: string;
        timestamp: string;
    }>;
}
export {};
