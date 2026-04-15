# Crypto Realtime Dashboard

Real-time Ethereum price dashboard. The backend connects to Finnhub's WebSocket feed and broadcasts live price updates and 1-hour sliding window averages to the frontend via Socket.IO.

---

## Architecture

```
monorepo/
├── apps/
│   ├── backend/   NestJS — Finnhub WebSocket → Socket.IO gateway
│   └── frontend/  React + Vite — live price cards with Chart.js
└── packages/
    └── shared/    Shared TypeScript types (PriceUpdate)
```

**Data flow:**
```
Finnhub WSS → FinnhubService → PricesService (normalize)
                             → HourlyAverageService (sliding window)
                             → RealtimeGateway (Socket.IO emit)
                                      ↓
                               React frontend
```

**Why a monorepo with npm workspaces:** `PriceUpdate` (the event contract between backend and frontend) lives in `packages/shared` and is imported by both apps as `@app/shared`. If the contract changes, TypeScript catches mismatches at compile time across both apps — single `npm install`, single `npm run dev`.

---

## Approach & architectural decisions

**Real-time data handling:** The backend keeps a persistent WebSocket connection to Finnhub. Trades are filtered (`price > 0`, `volume > 0` to exclude synthetic updates), normalized and immediately broadcast via Socket.IO. Reconnection to Finnhub uses exponential backoff (2s → 4s → 8s… capped at 30s). On the frontend, Socket.IO handles reconnection automatically and every state transition is reflected in the UI.

**Hourly average — sliding window:** Each trade is stored as `{ price, timestamp }`. On every read, entries older than 3600 seconds are evicted. The average is always computed over exactly the trades from the last 60 minutes — no hard resets at the hour boundary.

**Why NestJS + Socket.IO:** NestJS dependency injection makes each concern explicit in its own module (`finnhub`, `prices`, `aggregation`, `realtime`). Socket.IO was chosen over raw `ws` on the server because `socket.io-client` handles reconnection, event namespacing and transport fallback out of the box.

---

## Prerequisites

- Node.js 18+
- npm 9+
- A free [Finnhub](https://finnhub.io) account — sign up at [finnhub.io/register](https://finnhub.io/register), go to **Dashboard → API Keys** and copy your key

Create `apps/backend/.env`:

```env
FINNHUB_API_KEY=your_api_key_here
```

> The app subscribes to `BINANCE:ETHUSDT`, `BINANCE:ETHBTC` and `BINANCE:ETHUSDC`.

---

## Running locally

```bash
# 1. Install dependencies
npm install

# 2. Start both services
npm run dev
```

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

**Or separately:**

```bash
# Terminal 1
npm run start:dev -w apps/backend

# Terminal 2
npm run dev -w apps/frontend
```

---

## Environment variables

| App | Variable | Required | Default |
|---|---|---|---|
| Backend | `FINNHUB_API_KEY` | ✅ | — |
| Backend | `PORT` | ❌ | `3000` |
| Frontend | `VITE_BACKEND_URL` | ❌ | `http://localhost:3000` |

---

## Running tests

```bash
# Backend
npm test -w apps/backend

# Backend with coverage
npm test -w apps/backend -- --coverage

# Frontend
npm test -w apps/frontend

# Frontend in watch mode
npm run test:watch -w apps/frontend
```

---

## WebSocket contract

### `price:update`

```typescript
{
  symbol: string;        // e.g. "ETH/USDT"
  price: number;         // last trade price
  timestamp: number;     // UNIX ms timestamp from Finnhub
  hourlyAverage: number; // 1h sliding window average
}
```

### Health check

```
GET http://localhost:3000/health
→ { "status": "ok", "timestamp": "..." }
```
