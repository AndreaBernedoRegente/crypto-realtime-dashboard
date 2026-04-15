import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { PricePoint } from "../hooks/useSocket";
import { useMemo } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

interface Props {
  history: PricePoint[];
  symbol: string;
}

export function PriceChart({ history, symbol }: Props) {
  const isSmall = symbol.includes("BTC");

  const labels = useMemo(
    () =>
      history.map((p) =>
        new Date(p.time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      ),
    [history],
  );

  const prices = useMemo(() => history.map((p) => p.price), [history]);
  const trending = useMemo(() => {
    const recent = prices.slice(-10);
    if (recent.length < 2) return true;
    return recent[recent.length - 1] >= recent[0];
  }, [prices]);
  const color = trending ? "#22c55e" : "#ef4444";

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          data: prices,
          borderColor: color,
          backgroundColor: trending
            ? "rgba(34, 197, 94, 0.08)"
            : "rgba(239, 68, 68, 0.08)",
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.3,
          fill: true,
        },
      ],
    }),
    [labels, prices, color, trending],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 200 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<'line'>) =>
              isSmall ? ctx.parsed.y.toFixed(6) : ctx.parsed.y.toFixed(2),
          },
        },
      },
      scales: {
        x: {
          display: false,
        },
        y: {
          display: true,
          position: "right" as const,
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: {
            color: "#64748b",
            font: { size: 10 },
            maxTicksLimit: 4,
            callback: (val: string | number) =>
              isSmall ? Number(val).toFixed(5) : Number(val).toFixed(0),
          },
        },
      },
    }),
    [isSmall],
  );

  if (history.length < 2) {
    return (
      <div className="chart-placeholder">
        {history.length === 0 ? 'Waiting for data…' : 'Waiting for next tick…'}
      </div>
    );
  }

  return (
    <div className="chart-wrapper">
      <Line data={data} options={options} />
    </div>
  );
}
