export type { PriceUpdate } from '@app/shared';

export interface FinnhubTrade {
  s: string;
  p: number;
  t: number;
  v: number;
  c?: string[];
}

export interface FinnhubMessage {
  type: 'trade' | 'ping';
  data?: FinnhubTrade[];
}

export interface NormalizedTrade {
  symbol: string;
  price: number;
  timestamp: number;
}
