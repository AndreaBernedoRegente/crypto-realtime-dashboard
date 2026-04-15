import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { FinnhubModule } from './modules/finnhub/finnhub.module';
import { PricesModule } from './modules/prices/prices.module';
import { AggregationModule } from './modules/aggregation/aggregation.module';
import { RealtimeModule } from './modules/realtime/realtime.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FinnhubModule,
    PricesModule,
    AggregationModule,
    RealtimeModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
