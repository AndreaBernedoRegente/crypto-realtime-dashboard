import { useEffect, useRef, useState } from 'react';
import type { PriceUpdate } from '../types';
import type { PricePoint } from '../hooks/useSocket';
import { PriceChart } from './PriceChart';

interface Props {
  symbol: string;
  data?: PriceUpdate;
  history: PricePoint[];
}

function formatPrice(price: number, symbol: string): string {
  const isSmall = symbol.includes('BTC');
  return price.toLocaleString('en-US', {
    minimumFractionDigits: isSmall ? 6 : 2,
    maximumFractionDigits: isSmall ? 6 : 2,
  });
}

export function PriceCard({ symbol, data, history }: Props) {
  const prevPrice = useRef<number | undefined>(undefined);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (!data) return;
    if (prevPrice.current !== undefined && data.price !== prevPrice.current) {
      setFlash(data.price > prevPrice.current ? 'up' : 'down');
      const t = setTimeout(() => setFlash(null), 600);
      prevPrice.current = data.price;
      return () => clearTimeout(t);
    }
    prevPrice.current = data.price;
  }, [data?.price]);

  const diff =
    data && data.hourlyAverage > 0
      ? ((data.price - data.hourlyAverage) / data.hourlyAverage) * 100
      : null;

  return (
    <div className={`price-card ${flash ?? ''}`}>
      <div className="card-header">
        <span className="symbol">{symbol}</span>
        {diff !== null && (
          <span className={`badge ${diff >= 0 ? 'badge-up' : 'badge-down'}`}>
            {diff >= 0 ? '▲' : '▼'} {Math.abs(diff).toFixed(2)}%
          </span>
        )}
      </div>

      <div className="price">
        {data ? formatPrice(data.price, symbol) : '—'}
      </div>

      <PriceChart history={history} symbol={symbol} />

      <div className="meta">
        <div className="meta-row">
          <span className="label">1h avg</span>
          <span className="value">
            {data && data.hourlyAverage > 0
              ? formatPrice(data.hourlyAverage, symbol)
              : '—'}
          </span>
        </div>
        <div className="meta-row">
          <span className="label">Updated</span>
          <span className="value">
            {data
              ? new Date(data.timestamp).toLocaleTimeString()
              : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
