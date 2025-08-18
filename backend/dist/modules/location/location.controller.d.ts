import { LocationService } from './location.service';
interface AnalyzeLocationDto {
    lat: number;
    lng: number;
    radius?: number;
}
interface NearbyBusinessesDto {
    lat: number;
    lng: number;
    type: string;
    radius?: number;
}
interface TextSearchDto {
    lat: number;
    lng: number;
    query: string;
    radius?: number;
}
export declare class LocationController {
    private readonly locationService;
    constructor(locationService: LocationService);
    analyzeLocation(body: AnalyzeLocationDto): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    findNearbyBusinesses(body: NearbyBusinessesDto): Promise<{
        success: boolean;
        data: import("./location.service").BusinessSearchResult;
        message: string;
    }>;
    searchByText(body: TextSearchDto): Promise<{
        success: boolean;
        data: import("./location.service").BusinessSearchResult;
        message: string;
    }>;
    getLocationInfo(lat: string, lng: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    healthCheck(): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
}
export {};
