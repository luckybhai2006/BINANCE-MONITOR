import { useEffect, useRef, useState } from "react";

const KLINE_WS = import.meta.env.VITE_BINANCE_WS_URL;
const BINANCE_API_URL = import.meta.env.VITE_BINANCE_API_URL;

function useKlineChart(symbol = "BTCUSDT", interval = "15m") {
  const [candles, setCandles] = useState([]);
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);

  useEffect(() => {
    let stopped = false;

    const loadHistoricalCandles = async () => {
      try {
        const response = await fetch(
          `${BINANCE_API_URL}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=60`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch historical candles");
        }

        const data = await response.json();

        if (stopped) return;

        const historicalCandles = data.map((item) => ({
          time: item[0],
          open: Number(item[1]),
          high: Number(item[2]),
          low: Number(item[3]),
          close: Number(item[4]),
          volume: Number(item[5]),
        }));

        setCandles(historicalCandles);
      } catch (error) {
        if (!stopped) {
          console.error("Historical kline error:", error);
        }
      }
    };

    const connect = () => {
      if (stopped) return;

      const stream = `${symbol.toLowerCase()}@kline_${interval}`;

      const ws = new WebSocket(`${KLINE_WS}/${stream}`);

      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`Kline WebSocket connected: ${symbol} ${interval}`);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const kline = data.k;

          const candle = {
            time: kline.t,
            open: Number(kline.o),
            high: Number(kline.h),
            low: Number(kline.l),
            close: Number(kline.c),
            volume: Number(kline.v),
          };

          setCandles((prev) => {
            if (!prev.length) {
              return [candle];
            }

            const next = [...prev];

            const last = next[next.length - 1];

            if (last.time === candle.time) {
              // Current candle update
              next[next.length - 1] = candle;
            } else {
              // New candle started
              next.push(candle);
            }

            return next.slice(-60);
          });
        } catch (error) {
          console.error("Kline WebSocket error:", error);
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      ws.onclose = () => {
        if (stopped) return;

        reconnectRef.current = setTimeout(() => {
          connect();
        }, 1500);
      };
    };

    // 1. Historical data
    loadHistoricalCandles();

    // 2. Live updates
    connect();

    return () => {
      stopped = true;

      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [symbol, interval]);

  return candles;
}

export default useKlineChart;
