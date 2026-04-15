import { useSocket } from './hooks/useSocket';
import { PriceCard } from './components/PriceCard';
import './App.css';

const SYMBOLS = ['ETH/USDT', 'ETH/BTC', 'ETH/USDC'];

const STATUS_LABELS: Record<string, string> = {
  connecting: 'Connecting…',
  connected: 'Live',
  disconnected: 'Disconnected',
};

function App() {
  const { prices, history, status } = useSocket();

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1 className="title">Crypto Dashboard</h1>
          <span className="subtitle">Ethereum pairs · Real-time</span>
        </div>
        <div className={`status-indicator status-${status}`}>
          <span className="status-dot" />
          {STATUS_LABELS[status]}
        </div>
      </header>

      <main className="grid">
        {SYMBOLS.map((symbol) => (
          <PriceCard
            key={symbol}
            symbol={symbol}
            data={prices[symbol]}
            history={history[symbol] ?? []}
          />
        ))}
      </main>

      <footer className="footer">
        Data sourced from Finnhub · 1h sliding window average · last 60 ticks shown
      </footer>
    </div>
  );
}

export default App;
