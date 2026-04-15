import { Module } from '@nestjs/common';
import { FinnhubService } from './finnhub.service';
import { PricesModule } from '../prices/prices.module';
import { AggregationModule } from '../aggregation/aggregation.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [PricesModule, AggregationModule, RealtimeModule],
  providers: [FinnhubService],
})
export class FinnhubModule {}
