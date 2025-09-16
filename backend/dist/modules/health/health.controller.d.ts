import { ConfigService } from '@nestjs/config';
export declare class HealthController {
    private readonly configService;
    constructor(configService: ConfigService);
    checkHealth(): {
        status: string;
        timestamp: string;
        services: {
            googleMaps: string;
            gemini: string;
        };
        environment: any;
        port: any;
    };
    checkReadiness(): {
        status: string;
        message: string;
        services: {
            googleMaps: string;
            gemini: string;
        };
        timestamp?: undefined;
    } | {
        status: string;
        timestamp: string;
        message: string;
        services?: undefined;
    };
}
