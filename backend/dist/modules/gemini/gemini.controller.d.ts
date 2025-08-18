import { GeminiService } from './gemini.service';
interface EvaluateLocationDto {
    locationData: any;
    areaCharacteristics?: any;
}
export declare class GeminiController {
    private readonly geminiService;
    constructor(geminiService: GeminiService);
    evaluateLocation(body: EvaluateLocationDto): Promise<{
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
