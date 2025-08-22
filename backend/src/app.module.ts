import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LocationModule } from './modules/location/location.module';
import { GeminiModule } from './modules/gemini/gemini.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LocationModule,
    GeminiModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 