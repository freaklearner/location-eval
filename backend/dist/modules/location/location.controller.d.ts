import { LocationService, EvaluationResult } from './location.service';
interface AnalyzeLocationDto {
    lat: number;
    lng: number;
    radius?: number;
    format?: 'cart' | 'cloud_kitchen' | 'cafe_premium';
}
export declare class LocationController {
    private readonly locationService;
    constructor(locationService: LocationService);
    analyzeLocation(body: AnalyzeLocationDto): Promise<{
        success: boolean;
        location: {
            lat: number;
            lng: number;
            radius: number;
            format: "cart" | "cloud_kitchen" | "cafe_premium";
        };
        evaluation: EvaluationResult;
        timestamp: string;
    }>;
    getConfiguration(): Promise<{
        success: boolean;
        configuration: {
            framework: any;
            parameters: any;
            formats: string[];
            version: any;
        };
    }>;
    validateInput(body: {
        lat: number;
        lng: number;
        radius?: number;
        format?: string;
    }): Promise<{
        valid: boolean;
        errors: string[];
        timestamp: string;
    }>;
    healthCheck(): Promise<{
        status: string;
        service: string;
        framework: string;
        timestamp: string;
    }>;
}
export {};
