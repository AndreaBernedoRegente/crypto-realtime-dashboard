import { Injectable } from '@nestjs/common';

const WINDOW_MS = 3_600_000;

interface TradeEntry {
  price: number;
  timestamp: number;
}

@Injectable()
export class HourlyAverageService {
  private windows = new Map<string, TradeEntry[]>();

  add(symbol: string, price: number, timestamp: number = Date.now()) {
    if (!this.windows.has(symbol)) {
      this.windows.set(symbol, []);
    }

    const entries = this.windows.get(symbol)!;
    entries.push({ price, timestamp });

    this.evict(entries, timestamp);
  }

  get(symbol: string): number {
    const entries = this.windows.get(symbol);
    if (!entries || entries.length === 0) return 0;

    this.evict(entries, Date.now());

    if (entries.length === 0) return 0;

    const sum = entries.reduce((acc, e) => acc + e.price, 0);
    return sum / entries.length;
  }

  private evict(entries: TradeEntry[], now: number) {
    const cutoff = now - WINDOW_MS;
    let i = 0;
    while (i < entries.length && entries[i].timestamp < cutoff) {
      i++;
    }
    if (i > 0) entries.splice(0, i);
  }
}
