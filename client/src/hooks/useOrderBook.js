import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const WS_URL = import.meta.env.VITE_BINANCE_WS_URL;

const useOrderBook = (symbol = "BTCUSDT") => {
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const wsRef = useRef(null);
  const reconnectRef = useRef(null);

  const lastUpdateIdRef = useRef(null);
  const bufferRef = useRef([]);

  useEffect(() => {
    let stopped = false;
    let ws = null;

    // -----------------------------
    // APPLY DEPTH UPDATES
    // -----------------------------

    const updateLevels = (currentLevels, updates) => {
      const map = new Map(currentLevels);

      updates.forEach(([price, quantity]) => {
        const qty = Number(quantity);

        if (qty === 0) {
          map.delete(price);
        } else {
          map.set(price, quantity);
        }
      });

      return Array.from(map.entries());
    };

    // -----------------------------
    // APPLY ONE WEBSOCKET EVENT
    // -----------------------------

    const applyUpdate = (update) => {
      if (stopped) return;

      const lastId = lastUpdateIdRef.current;

      if (lastId === null) return;

      // Old event
      if (update.u <= lastId) {
        return;
      }

      // Valid continuous update
      if (update.U <= lastId + 1 && update.u >= lastId + 1) {
        lastUpdateIdRef.current = update.u;

        setBids((prev) => updateLevels(prev, update.b));

        setAsks((prev) => updateLevels(prev, update.a));

        return true;
      }

      return false;
    };

    // -----------------------------
    // CONNECT WEBSOCKET FIRST
    // -----------------------------

    const connectWebSocket = () => {
      if (stopped) return;

      // This stream delivers the complete top 20 levels on every update,
      // so the visible depth bars stay in sync even if an update is missed.
      const stream = `${symbol.toLowerCase()}@depth20@100ms`;

      ws = new WebSocket(`${WS_URL}/${stream}`);

      wsRef.current = ws;

      ws.onopen = () => {
        if (!stopped) {
          console.log(`Order Book WebSocket connected: ${symbol}`);
        }
      };

      ws.onmessage = (event) => {
        if (stopped) return;

        try {
          const update = JSON.parse(event.data);
          /*
           * Partial-depth messages are self-contained snapshots. Rendering
           * each one directly avoids the sequence-gap freeze that can occur
           * with incremental depth updates.
           */
          if (Array.isArray(update.bids) && Array.isArray(update.asks)) {
            setBids(update.bids);
            setAsks(update.asks);
            setLoading(false);
            return;
          }

          // console.log(
          //   "ORDER BOOK UPDATE",
          //   "bids:",
          //   update.b?.length,
          //   "asks:",
          //   update.a?.length,
          //   "first bid:",
          //   update.b?.[0],
          //   "first ask:",
          //   update.a?.[0]
          // );
          /*
           * Until REST snapshot arrives,
           * keep every WebSocket event.
           */
          if (lastUpdateIdRef.current === null) {
            bufferRef.current.push(update);

            // Prevent unlimited buffer
            if (bufferRef.current.length > 1000) {
              bufferRef.current.shift();
            }

            return;
          }

          applyUpdate(update);
        } catch (err) {
          console.error("Order book WebSocket parse error:", err);
        }
      };

      ws.onerror = () => {
        if (!stopped) {
          console.warn(`Order Book WebSocket error: ${symbol}`);
        }
      };

      ws.onclose = () => {
        if (stopped) return;

        console.warn(`Order Book WebSocket disconnected: ${symbol}`);

        reconnectRef.current = setTimeout(() => {
          if (!stopped) {
            start();
          }
        }, 1500);
      };
    };

    // -----------------------------
    // LOAD REST SNAPSHOT
    // -----------------------------

    const loadSnapshot = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/binance/depth`, {
          params: {
            symbol,
            limit: 1000,
          },
        });

        if (stopped) return;

        const snapshot = response.data.data;

        /*
         * Put REST snapshot into UI.
         */
        setBids(snapshot.bids);
        setAsks(snapshot.asks);

        /*
         * Binance snapshot update ID.
         */
        lastUpdateIdRef.current = snapshot.lastUpdateId;

        /*
         * Process buffered WebSocket events.
         */
        const bufferedEvents = bufferRef.current;

        bufferRef.current = [];

        for (const update of bufferedEvents) {
          if (stopped) return;

          /*
           * Ignore events completely before snapshot.
           */
          if (update.u <= lastUpdateIdRef.current) {
            continue;
          }

          /*
           * First valid event must bridge
           * snapshot -> WebSocket stream.
           */
          if (
            update.U <= lastUpdateIdRef.current + 1 &&
            update.u >= lastUpdateIdRef.current + 1
          ) {
            applyUpdate(update);
          }
        }

        setLoading(false);

        console.log(`Order Book synced: ${symbol}`);
      } catch (err) {
        if (stopped) return;

        console.error("Order book snapshot error:", err);

        setError("Failed to load order book");

        setLoading(false);
      }
    };

    // -----------------------------
    // START
    // -----------------------------

    const start = () => {
      if (stopped) return;

      /*
       * Reset state for new symbol.
       */
      setBids([]);
      setAsks([]);

      setLoading(true);
      setError("");

      lastUpdateIdRef.current = null;
      bufferRef.current = [];

      /*
       * IMPORTANT:
       * WebSocket starts BEFORE snapshot.
       */
      connectWebSocket();

      /*
       * Then get REST snapshot.
       */
      loadSnapshot();
    };

    start();

    // -----------------------------
    // CLEANUP
    // -----------------------------

    return () => {
      stopped = true;

      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }

      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;

        if (
          ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING
        ) {
          ws.close();
        }
      }

      wsRef.current = null;

      lastUpdateIdRef.current = null;
      bufferRef.current = [];
    };
  }, [symbol]);

  return {
    bids,
    asks,
    loading,
    error,
  };
};

export default useOrderBook;
