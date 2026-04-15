import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useSocket } from "./useSocket";

const mockSocket = vi.hoisted(() => ({
  connected: false,
  on: vi.fn(),
  off: vi.fn(),
}));

vi.mock("../services/socket", () => ({
  socket: mockSocket,
}));

function getHandler(event: string) {
  const call = mockSocket.on.mock.calls.find(([e]) => e === event);
  return call?.[1] as (...args: unknown[]) => void;
}

describe("useSocket", () => {
  beforeEach(() => {
    mockSocket.connected = false;
    vi.clearAllMocks();
  });

  it("starts as connecting when socket is not connected", () => {
    const { result } = renderHook(() => useSocket());
    expect(result.current.status).toBe("connecting");
  });

  it("starts as connected when socket is already connected", () => {
    mockSocket.connected = true;
    const { result } = renderHook(() => useSocket());
    expect(result.current.status).toBe("connected");
  });

  it("sets status to connected on connect event", () => {
    const { result } = renderHook(() => useSocket());
    act(() => getHandler("connect")());
    expect(result.current.status).toBe("connected");
  });

  it("sets status to disconnected on disconnect event", () => {
    const { result } = renderHook(() => useSocket());
    act(() => getHandler("disconnect")());
    expect(result.current.status).toBe("disconnected");
  });

  it("sets status to disconnected on connect_error", () => {
    const { result } = renderHook(() => useSocket());
    act(() => getHandler("connect_error")());
    expect(result.current.status).toBe("disconnected");
  });

  it("stores a price update in prices state", () => {
    const { result } = renderHook(() => useSocket());
    act(() =>
      getHandler("price:update")({
        symbol: "ETH/USDT",
        price: 3500,
        timestamp: 1713000000000,
        hourlyAverage: 3480,
      }),
    );
    expect(result.current.prices["ETH/USDT"].price).toBe(3500);
  });

  it("appends a point to history on price update", () => {
    const { result } = renderHook(() => useSocket());
    act(() =>
      getHandler("price:update")({
        symbol: "ETH/USDT",
        price: 3500,
        timestamp: 1713000000000,
        hourlyAverage: 3480,
      }),
    );
    expect(result.current.history["ETH/USDT"]).toHaveLength(1);
    expect(result.current.history["ETH/USDT"][0]).toEqual({
      time: 1713000000000,
      price: 3500,
    });
  });

  it("removes listeners on unmount", () => {
    const { unmount } = renderHook(() => useSocket());
    unmount();
    expect(mockSocket.off).toHaveBeenCalledWith(
      "connect",
      expect.any(Function),
    );
    expect(mockSocket.off).toHaveBeenCalledWith(
      "disconnect",
      expect.any(Function),
    );
    expect(mockSocket.off).toHaveBeenCalledWith(
      "connect_error",
      expect.any(Function),
    );
    expect(mockSocket.off).toHaveBeenCalledWith(
      "price:update",
      expect.any(Function),
    );
  });
});
