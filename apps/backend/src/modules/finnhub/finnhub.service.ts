import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import WebSocket from 'ws';
import { PricesService } from '../prices/prices.service';
import { HourlyAverageService } from '../aggregation/hourly-average.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { FinnhubMessage, FinnhubTrade } from './finnhub.types';

@Injectable()
export class FinnhubService implements OnModuleInit {
  private readonly logger = new Logger(FinnhubService.name);
  private ws: WebSocket;
  private reconnectAttempts = 0;

  constructor(
    private configService: ConfigService,
    private pricesService: PricesService,
    private aggService: HourlyAverageService,
    private gateway: RealtimeGateway,
  ) {}

  onModuleInit() {
    this.connect();
  }

  private connect() {
    const token = this.configService.getOrThrow<string>('FINNHUB_API_KEY');
    this.ws = new WebSocket(`wss://ws.finnhub.io?token=${token}`);

    this.ws.on('open', () => {
      this.logger.log('Connected to Finnhub');
      this.subscribe();
      this.reconnectAttempts = 0;
    });

    this.ws.on('message', (data) => {
      let parsed: FinnhubMessage;
      try {
        parsed = JSON.parse(data.toString());
      } catch {
        this.logger.warn('Received malformed message from Finnhub');
        return;
      }
      if (parsed.type === 'trade' && parsed.data) {
        parsed.data
          .filter((trade: FinnhubTrade) => trade.p > 0 && trade.v > 0)
          .forEach((trade: FinnhubTrade) => {
            const normalized = this.pricesService.normalize(trade);

            this.aggService.add(normalized.symbol, normalized.price, normalized.timestamp);

            const avg = this.aggService.get(normalized.symbol);

            this.gateway.emitPrice({
              ...normalized,
              hourlyAverage: avg,
            });
          });
      }
    });

    this.ws.on('close', () => {
      this.logger.warn('Finnhub disconnected');
      this.reconnect();
    });

    this.ws.on('error', (err) => {
      this.logger.error(err);
      this.ws.close();
    });
  }

  private subscribe() {
    const symbols = ['BINANCE:ETHUSDT', 'BINANCE:ETHBTC', 'BINANCE:ETHUSDC'];

    symbols.forEach((symbol) => {
      this.ws.send(JSON.stringify({ type: 'subscribe', symbol }));
    });
  }

  private reconnect() {
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
    this.reconnectAttempts++;

    setTimeout(() => this.connect(), delay);
  }
}
