import { useEffect, useRef, useState } from "react";
import { getTicker } from "../services/api";

const WS_BASE_URL = "wss://stream.binance.com:9443/ws";

const useTicker = (symbol = "BTCUSDT") => {
  const [ticker, setTicker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [priceDirection, setPriceDirection] = useState(null);

  const previousPrice = useRef(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);

  // Initial REST snapshot
  useEffect(() => {
    let cancelled = false;

    const loadTicker = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getTicker(symbol);

        if (cancelled) return;

        const data = response.data;

        previousPrice.current = Number(data.lastPrice);
        setTicker(data);
      } catch (err) {
        console.error("Ticker REST error:", err);

        if (!cancelled) {
          setError("Failed to load market data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadTicker();

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  // WebSocket
  useEffect(() => {
    if (!ticker) return;

    let isUnmounted = false;

    const connectWebSocket = () => {
      if (isUnmounted) return;

      const stream = `${symbol.toLowerCase()}@ticker`;
      const ws = new WebSocket(`${WS_BASE_URL}/${stream}`);

      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Ticker WebSocket connected");

        reconnectAttempts.current = 0;
        setError("");
      };

      ws.onmessage = (event) => {
        //   const data = JSON.parse(event.data);

        //   console.log("LIVE PRICE:", data.c);
        try {
          const data = JSON.parse(event.data);

          const newPrice = Number(data.c);
          const oldPrice = previousPrice.current;

          if (oldPrice !== null) {
            if (newPrice > oldPrice) {
              setPriceDirection("up");
            } else if (newPrice < oldPrice) {
              setPriceDirection("down");
            }
          }

          previousPrice.current = newPrice;

          setTicker((prev) => ({
            ...prev,
            lastPrice: data.c,
            priceChangePercent: data.P,
            highPrice: data.h,
            lowPrice: data.l,
            volume: data.v,
          }));

          setTimeout(() => {
            setPriceDirection(null);
          }, 450);
        } catch (err) {
          console.error("Ticker message error:", err);
        }
      };

      ws.onerror = () => {
        console.error("Ticker WebSocket error");
        setError("WebSocket connection error");
      };

      ws.onclose = () => {
        console.log("Ticker WebSocket disconnected");

        if (isUnmounted) return;

        const attempt = reconnectAttempts.current;

        // Exponential backoff: 1s, 2s, 4s, 8s... max 30s
        const delay = Math.min(1000 * 2 ** attempt, 30000);

        reconnectAttempts.current += 1;

        console.log(`Reconnecting in ${delay / 1000}s...`);

        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, delay);
      };
    };

    connectWebSocket();

    return () => {
      isUnmounted = true;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [symbol, ticker !== null]);

  return {
    ticker,
    loading,
    error,
    priceDirection,
  };
};

export default useTicker;
