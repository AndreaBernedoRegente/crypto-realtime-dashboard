import { Module } from '@nestjs/common';
import { HourlyAverageService } from './hourly-average.service';

@Module({
  providers: [HourlyAverageService],
  exports: [HourlyAverageService],
})
export class AggregationModule {}
