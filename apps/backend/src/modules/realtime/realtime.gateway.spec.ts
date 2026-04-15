import { RealtimeGateway } from './realtime.gateway';
import { Server, Socket } from 'socket.io';
import { PriceUpdate } from '../finnhub/finnhub.types';

const createServer = (): Partial<Server> => ({
  emit: jest.fn(),
  sockets: { sockets: { size: 1 } } as any,
});

const createClient = (id = 'socket-1'): Partial<Socket> => ({ id });

describe('RealtimeGateway', () => {
  let gateway: RealtimeGateway;
  let server: Partial<Server>;

  beforeEach(() => {
    gateway = new RealtimeGateway();
    server = createServer();
    gateway.server = server as Server;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('afterInit logs initialization without throwing', () => {
    expect(() => gateway.afterInit()).not.toThrow();
  });

  it('handleConnection logs the connected client id without throwing', () => {
    const client = createClient('abc-123');
    expect(() => gateway.handleConnection(client as Socket)).not.toThrow();
  });

  it('handleDisconnect logs the disconnected client id without throwing', () => {
    const client = createClient('abc-123');
    expect(() => gateway.handleDisconnect(client as Socket)).not.toThrow();
  });

  it('emitPrice broadcasts price:update event to all clients', () => {
    const payload: PriceUpdate = {
      symbol: 'ETH/USDT',
      price: 3500,
      timestamp: 1713000000000,
      hourlyAverage: 3480,
    };

    gateway.emitPrice(payload);

    expect(server.emit).toHaveBeenCalledWith('price:update', payload);
  });

  it('emitPrice passes the exact payload without mutation', () => {
    const payload: PriceUpdate = {
      symbol: 'ETH/BTC',
      price: 0.05,
      timestamp: 1713000001000,
      hourlyAverage: 0.049,
    };

    gateway.emitPrice(payload);

    expect(server.emit).toHaveBeenCalledWith('price:update', payload);
    expect((server.emit as jest.Mock).mock.calls[0][1]).toEqual(payload);
  });
});
