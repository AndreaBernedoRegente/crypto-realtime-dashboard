import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PriceCard } from "./PriceCard";
import type { PriceUpdate } from "../types";

vi.mock("./PriceChart", () => ({
  PriceChart: () => <div data-testid="price-chart" />,
}));

const trade: PriceUpdate = {
  symbol: "ETH/USDT",
  price: 3500.12,
  timestamp: 1713000000000,
  hourlyAverage: 3480,
};

describe("PriceCard", () => {
  it("renders the symbol", () => {
    render(<PriceCard symbol="ETH/USDT" data={trade} history={[]} />);
    expect(screen.getByText("ETH/USDT")).toBeInTheDocument();
  });

  it("renders the price formatted with 2 decimals for USDT", () => {
    render(<PriceCard symbol="ETH/USDT" data={trade} history={[]} />);
    expect(screen.getByText("3,500.12")).toBeInTheDocument();
  });

  it("renders the hourly average", () => {
    render(<PriceCard symbol="ETH/USDT" data={trade} history={[]} />);
    expect(screen.getByText("3,480.00")).toBeInTheDocument();
  });

  it("shows — placeholders when there is no data", () => {
    render(<PriceCard symbol="ETH/USDT" history={[]} />);
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it("renders up badge when price is above hourly average", () => {
    render(<PriceCard symbol="ETH/USDT" data={trade} history={[]} />);
    expect(screen.getByText(/▲/)).toBeInTheDocument();
  });

  it("renders down badge when price is below hourly average", () => {
    const downTrade: PriceUpdate = { ...trade, price: 3400 };
    render(<PriceCard symbol="ETH/USDT" data={downTrade} history={[]} />);
    expect(screen.getByText(/▼/)).toBeInTheDocument();
  });

  it("renders the price chart", () => {
    render(<PriceCard symbol="ETH/USDT" data={trade} history={[]} />);
    expect(screen.getByTestId("price-chart")).toBeInTheDocument();
  });

  it("formats BTC pair with 6 decimal places", () => {
    const btcTrade: PriceUpdate = {
      ...trade,
      symbol: "ETH/BTC",
      price: 0.05123456,
    };
    render(<PriceCard symbol="ETH/BTC" data={btcTrade} history={[]} />);
    expect(screen.getByText("0.051235")).toBeInTheDocument();
  });
});
