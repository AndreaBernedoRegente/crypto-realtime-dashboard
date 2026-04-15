import { HourlyAverageService } from './hourly-average.service';

const HOUR = 3_600_000;

describe('HourlyAverageService', () => {
  let service: HourlyAverageService;

  beforeEach(() => {
    service = new HourlyAverageService();
  });

  it('returns 0 when no trades have been added', () => {
    expect(service.get('ETH/USDT')).toBe(0);
  });

  it('returns the price when only one trade exists', () => {
    service.add('ETH/USDT', 100, Date.now());
    expect(service.get('ETH/USDT')).toBe(100);
  });

  it('returns the average of all trades within the window', () => {
    const now = Date.now();
    service.add('ETH/USDT', 100, now - 1000);
    service.add('ETH/USDT', 200, now - 500);
    service.add('ETH/USDT', 300, now);
    expect(service.get('ETH/USDT')).toBe(200);
  });

  it('evicts trades older than 1 hour when calling add', () => {
    const now = Date.now();
    service.add('ETH/USDT', 999, now - HOUR - 1);
    service.add('ETH/USDT', 200, now);
    expect(service.get('ETH/USDT')).toBe(200);
  });

  it('evicts stale trades when calling get', () => {
    const past = Date.now() - HOUR - 1;
    service.add('ETH/USDT', 999, past);

    const avg = service.get('ETH/USDT');
    expect(avg).toBe(0);
  });

  it('does not mix data between different symbols', () => {
    const now = Date.now();
    service.add('ETH/USDT', 100, now);
    service.add('ETH/BTC', 50, now);

    expect(service.get('ETH/USDT')).toBe(100);
    expect(service.get('ETH/BTC')).toBe(50);
  });

  it('recalculates correctly as old trades expire', () => {
    const now = Date.now();
    service.add('ETH/USDT', 100, now - HOUR - 1);
    service.add('ETH/USDT', 300, now - 500);
    service.add('ETH/USDT', 500, now);

    expect(service.get('ETH/USDT')).toBe(400);
  });
});
