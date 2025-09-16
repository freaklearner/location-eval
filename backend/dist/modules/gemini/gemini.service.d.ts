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
    evaluateWithBaseline(locationData: any, areaCharacteristics: any, baselineScores: any): Promise<any>;
    private createEvaluationPrompt;
    private parseEvaluationResponse;
    private createFallbackResponse;
    private getCityTier;
    private getRegionFromCity;
    private addRegionalContext;
    private generateDetailedBusinessAnalysis;
    private generateBrandPresenceAnalysis;
    private getTierSpecificBusinessInsights;
    private generateContextualScoringGuidelines;
    private getCityTierScoringGuideline;
    private getFoodBrandScoringGuideline;
    private getCompetitionScoringGuideline;
    private getUniversityProximityGuideline;
    private calculateAverageDistance;
    private getTargetAudienceScoringGuideline;
    private generateBaselineScoresSection;
    private validateAIScores;
    private getParameterWeight;
}
export {};
