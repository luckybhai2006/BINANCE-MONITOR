import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const WS_URL = import.meta.env.VITE_BINANCE_WS_URL;

const useTradeFeed = (symbol = "BTCUSDT") => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const wsRef = useRef(null);
  const reconnectRef = useRef(null);

  useEffect(() => {
    let stopped = false;

    const loadTrades = async () => {
      try {
        setLoading(true);
        setError("");

        // 1. Get initial recent trades from REST API
        const response = await axios.get(`${API_URL}/binance/trades`, {
          params: {
            symbol,
            limit: 50,
          },
        });

        if (stopped) return;

        const initialTrades = response.data.data.map((trade) => ({
          id: trade.id,
          price: Number(trade.price),
          quantity: Number(trade.qty),
          time: trade.time,
          isBuyerMaker: trade.isBuyerMaker,
        }));

        // Newest first
        initialTrades.sort((a, b) => b.time - a.time);

        setTrades(initialTrades.slice(0, 50));
        setLoading(false);
      } catch (err) {
        if (stopped) return;

        console.error("Trade REST error:", err);
        setError("Failed to load trade feed");
        setLoading(false);
      }
    };

    const connectWebSocket = () => {
      if (stopped) return;

      const ws = new WebSocket(`${WS_URL}/${symbol.toLowerCase()}@trade`);

      wsRef.current = ws;

      ws.onopen = () => {
        if (!stopped) {
          console.log("Trade Feed WebSocket connected");
        }
      };

      ws.onmessage = (event) => {
        if (stopped) return;

        try {
          const data = JSON.parse(event.data);

          const trade = {
            id: data.t,
            price: Number(data.p),
            quantity: Number(data.q),
            time: data.T,
            isBuyerMaker: data.m,
          };

          setTrades((prev) => {
            // Avoid duplicate trade
            if (prev.some((item) => item.id === trade.id)) {
              return prev;
            }

            return [trade, ...prev].slice(0, 50);
          });
        } catch (err) {
          console.error("Trade WebSocket error:", err);
        }
      };

      ws.onerror = () => {
        if (!stopped) {
          console.warn("Trade Feed WebSocket error");
        }
      };

      ws.onclose = () => {
        if (stopped) return;

        console.warn("Trade Feed WebSocket disconnected");

        // Reconnect after 1.5 seconds
        reconnectRef.current = setTimeout(() => {
          connectWebSocket();
        }, 1500);
      };
    };

    // Initial REST data
    loadTrades();

    // Live WebSocket data
    connectWebSocket();

    return () => {
      stopped = true;

      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }

      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;

        if (
          wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING
        ) {
          wsRef.current.close();
        }

        wsRef.current = null;
      }
    };
  }, [symbol]);

  return {
    trades,
    loading,
    error,
  };
};

export default useTradeFeed;
