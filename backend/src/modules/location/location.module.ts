import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { AnalysisController } from './analysis.controller';

@Module({
  controllers: [LocationController, AnalysisController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {} 