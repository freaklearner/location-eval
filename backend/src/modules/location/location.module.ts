import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { AnalysisController } from './analysis.controller';
import { DataMapperService } from './data-mapper.service';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  imports: [GeminiModule],
  controllers: [LocationController, AnalysisController],
  providers: [LocationService, DataMapperService],
  exports: [LocationService, DataMapperService],
})
export class LocationModule {} 