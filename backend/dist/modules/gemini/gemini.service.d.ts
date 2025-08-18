import { ConfigService } from '@nestjs/config';
interface EvaluationRequest {
    locationData: any;
    areaCharacteristics?: any;
}
export declare class GeminiService {
    private configService;
    private genAI;
    private model;
    constructor(configService: ConfigService);
    evaluateLocation(request: EvaluationRequest): Promise<any>;
    private createEvaluationPrompt;
    private parseEvaluationResponse;
    private createFallbackResponse;
}
export {};
