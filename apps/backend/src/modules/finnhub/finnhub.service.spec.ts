import { FinnhubService } from './finnhub.service';
import { ConfigService } from '@nestjs/config';
import { PricesService } from '../prices/prices.service';
import { HourlyAverageService } from '../aggregation/hourly-average.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

const mockWs = {
  on: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
};

jest.mock('ws', () => {
  return jest.fn().mockImplementation(() => mockWs);
});

const mockConfigService = {
  getOrThrow: jest.fn().mockReturnValue('test-token'),
};

const mockPricesService = {
  normalize: jest.fn().mockReturnValue({
    symbol: 'ETH/USDT',
    price: 3500,
    timestamp: 1713000000000,
    volume: 1.5,
  }),
};

const mockAggService = {
  add: jest.fn(),
  get: jest.fn().mockReturnValue(3480),
};

const mockGateway = {
  server: { emit: jest.fn(), sockets: { sockets: { size: 0 } } },
  emitPrice: jest.fn(),
  afterInit: jest.fn(),
  handleConnection: jest.fn(),
  handleDisconnect: jest.fn(),
};

const buildService = () =>
  new FinnhubService(
    mockConfigService as unknown as ConfigService,
    mockPricesService as unknown as PricesService,
    mockAggService as unknown as HourlyAverageService,
    mockGateway as unknown as RealtimeGateway,
  );

describe('FinnhubService', () => {
  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(buildService()).toBeDefined();
  });

  it('reads FINNHUB_API_KEY from ConfigService on connect', () => {
    const service = buildService();
    service.onModuleInit();
    expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('FINNHUB_API_KEY');
  });

  it('subscribes to the three ETH symbols on open', () => {
    const service = buildService();
    service.onModuleInit();

    const openHandler = mockWs.on.mock.calls.find(([event]) => event === 'open')?.[1];
    openHandler?.();

    const sentSymbols = mockWs.send.mock.calls.map((c) => JSON.parse(c[0]).symbol);
    expect(sentSymbols).toEqual(
      expect.arrayContaining(['BINANCE:ETHUSDT', 'BINANCE:ETHBTC', 'BINANCE:ETHUSDC']),
    );
  });
});
