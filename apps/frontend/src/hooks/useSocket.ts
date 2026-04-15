import { useEffect, useState } from 'react';
import { socket } from '../services/socket';
import type { PriceMap, PriceUpdate } from '../types';

const MAX_HISTORY = 60;

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export interface PricePoint {
  time: number;
  price: number;
}

export type HistoryMap = Record<string, PricePoint[]>;

export function useSocket() {
  const [prices, setPrices] = useState<PriceMap>({});
  const [history, setHistory] = useState<HistoryMap>({});
  const [status, setStatus] = useState<ConnectionStatus>(
    socket.connected ? 'connected' : 'connecting',
  );

  useEffect(() => {
    const onConnect = () => setStatus('connected');
    const onDisconnect = () => setStatus('disconnected');
    const onConnectError = () => setStatus('disconnected');
    const onPriceUpdate = (data: PriceUpdate) => {
      setPrices((prev) => ({ ...prev, [data.symbol]: data }));
      setHistory((prev) => {
        const existing = prev[data.symbol] ?? [];
        const updated = [...existing, { time: data.timestamp, price: data.price }];
        return { ...prev, [data.symbol]: updated.slice(-MAX_HISTORY) };
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('price:update', onPriceUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('price:update', onPriceUpdate);
    };
  }, []);

  return { prices, history, status };
}
