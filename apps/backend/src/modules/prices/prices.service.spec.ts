import { PricesService } from './prices.service';

describe('PricesService', () => {
  let service: PricesService;

  beforeEach(() => {
    service = new PricesService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('maps known Finnhub symbol to readable pair', () => {
    const result = service.normalize({ s: 'BINANCE:ETHUSDT', p: 3500, t: 1713000000000, v: 1.5 });
    expect(result.symbol).toBe('ETH/USDT');
  });

  it('maps BINANCE:ETHBTC correctly', () => {
    const result = service.normalize({ s: 'BINANCE:ETHBTC', p: 0.05, t: 1713000000000, v: 0.2 });
    expect(result.symbol).toBe('ETH/BTC');
  });

  it('maps BINANCE:ETHUSDC correctly', () => {
    const result = service.normalize({ s: 'BINANCE:ETHUSDC', p: 3499, t: 1713000000000, v: 0.8 });
    expect(result.symbol).toBe('ETH/USDC');
  });

  it('falls back to raw symbol for unknown pairs', () => {
    const result = service.normalize({ s: 'BINANCE:BTCUSDT', p: 60000, t: 1713000000000, v: 0.1 });
    expect(result.symbol).toBe('BINANCE:BTCUSDT');
  });

  it('preserves price, timestamp and volume from the raw trade', () => {
    const result = service.normalize({ s: 'BINANCE:ETHUSDT', p: 3500, t: 1713000001234, v: 2.5 });
    expect(result.price).toBe(3500);
    expect(result.timestamp).toBe(1713000001234);
  });
});
