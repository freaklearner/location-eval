import { LocationService } from './location.service';
import { GeminiService } from '../gemini/gemini.service';
interface CompleteAnalysisDto {
    lat: number;
    lng: number;
    radius?: number;
    clientName?: string;
    address?: string;
}
export declare class AnalysisController {
    private readonly locationService;
    private readonly geminiService;
    constructor(locationService: LocationService, geminiService: GeminiService);
    completeAnalysis(body: CompleteAnalysisDto): Promise<{
        success: boolean;
        data: {
            coordinates: {
                lat: number;
                lng: number;
                radius: number;
            };
            locationInfo: {
                formattedAddress: string;
                city: string;
                state: string;
                country: string;
                postalCode: string;
                neighborhood: string;
                addressComponents: any[];
                placeId?: undefined;
                geometry?: undefined;
            } | {
                formattedAddress: any;
                city: string;
                state: string;
                country: string;
                postalCode: string;
                neighborhood: string;
                addressComponents: any;
                placeId: any;
                geometry: any;
            };
            locationAnalysis: any;
            areaCharacteristics: {
                food_competition: {
                    total_restaurants: any;
                    average_rating: any;
                    high_rated_restaurants: any;
                    popular_restaurants: any;
                };
                commercial_activity: {
                    total_businesses: any;
                    shopping_options: any;
                    clothing_stores: number;
                };
                demographics: {
                    educational_institutions: any;
                    healthcare_facilities: any;
                    fitness_facilities: any;
                    entertainment_options: number;
                };
                infrastructure: {
                    petrol_stations: any;
                    accessibility_score: number;
                };
            };
            aiEvaluation: any;
            clientInfo: {
                name: string;
                providedAddress: string;
            };
            timestamp: string;
        };
        message: string;
    }>;
    private extractLocationDetails;
    private extractAreaCharacteristics;
    healthCheck(): Promise<{
        success: boolean;
        message: string;
        services: {
            location: string;
            gemini: string;
        };
        timestamp: string;
    }>;
}
export {};
