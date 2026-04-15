import { Injectable } from '@nestjs/common';
import { FinnhubTrade, NormalizedTrade } from '../finnhub/finnhub.types';

const SYMBOL_MAP: Record<string, string> = {
  'BINANCE:ETHUSDT': 'ETH/USDT',
  'BINANCE:ETHBTC': 'ETH/BTC',
  'BINANCE:ETHUSDC': 'ETH/USDC',
};

@Injectable()
export class PricesService {
  normalize(trade: FinnhubTrade): NormalizedTrade {
    return {
      symbol: SYMBOL_MAP[trade.s] ?? trade.s,
      price: trade.p,
      timestamp: trade.t,
    };
  }
}
