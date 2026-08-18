import { useEffect, useMemo, useState, useRef } from "react";
import useKlineChart from "../hooks/useKlineChart";

function PriceChart({ symbol }) {
  const [interval, setInterval] = useState("15m");
  const [hoveredCandle, setHoveredCandle] = useState(null);
  const [mousePosition, setMousePosition] = useState(null);

  const [visibleCount, setVisibleCount] = useState(40);
  const [panOffset, setPanOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef(null);

  const candles = useKlineChart(symbol, interval);

  /*
   * Reset chart position whenever symbol
   * or interval changes.
   */
  useEffect(() => {
    setVisibleCount(40);
    setPanOffset(0);
    setHoveredCandle(null);
    setMousePosition(null);
  }, [symbol, interval]);

  const chartData = useMemo(() => {
    if (!candles.length) return null;

    const total = candles.length;

    const count = Math.min(Math.max(visibleCount, 10), total);

    let end = total - panOffset;

    if (end > total) end = total;
    if (end < count) end = count;

    let start = end - count;

    if (start < 0) {
      start = 0;
      end = count;
    }

    const visible = candles.slice(start, end);

    const prices = visible.flatMap((candle) => [candle.high, candle.low]);

    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    return {
      candles: visible,
      maxPrice,
      minPrice,
      startIndex: start,
      endIndex: end,
    };
  }, [candles, visibleCount, panOffset]);

  const width = 900;
  const height = 390;

  const padding = {
    top: 25,
    right: 65,
    bottom: 35,
    left: 15,
  };

  const chartWidth = width - padding.left - padding.right;

  const chartHeight = height - padding.top - padding.bottom;

  const getY = (price) => {
    if (!chartData) return height / 2;

    const range = chartData.maxPrice - chartData.minPrice || 1;

    return padding.top + ((chartData.maxPrice - price) / range) * chartHeight;
  };

  const getX = (index) => {
    if (!chartData) return 0;

    const count = chartData.candles.length;

    if (count <= 1) {
      return padding.left + chartWidth / 2;
    }

    return padding.left + (index / (count - 1)) * chartWidth;
  };

  const lastCandle = chartData?.candles[chartData.candles.length - 1];

  /*
   * Mouse move
   */
  const handleMouseMove = (event) => {
    if (!chartData || isDragging) return;

    const rect = event.currentTarget.getBoundingClientRect();

    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;

    const y = (event.clientY - rect.top) * scaleY;

    const chartX = Math.max(padding.left, Math.min(width - padding.right, x));

    const chartY = Math.max(padding.top, Math.min(height - padding.bottom, y));

    const count = chartData.candles.length;

    let index = Math.round(
      ((chartX - padding.left) / chartWidth) * (count - 1)
    );

    index = Math.max(0, Math.min(count - 1, index));

    const candle = chartData.candles[index];

    setMousePosition({
      x: chartX,
      y: chartY,
    });

    setHoveredCandle({
      candle,
      index,
    });
  };

  /*
   * Mouse leave
   */
  const handleMouseLeave = () => {
    if (!isDragging) {
      setMousePosition(null);
      setHoveredCandle(null);
    }
  };

  /*
   * Zoom
   */
  const handleWheel = (event) => {
    event.preventDefault();

    if (!candles.length) return;

    setVisibleCount((current) => {
      if (event.deltaY < 0) {
        return Math.max(12, current - 4);
      }

      return Math.min(candles.length, current + 4);
    });
  };

  /*
   * Start dragging
   */
  const handlePointerDown = (event) => {
    if (!chartData) return;

    setIsDragging(true);

    dragStartRef.current = {
      x: event.clientX,
      pan: panOffset,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  /*
   * Drag chart
   */
  const handlePointerMove = (event) => {
    if (!isDragging || !dragStartRef.current || !chartData) {
      return;
    }

    const delta = event.clientX - dragStartRef.current.x;

    const rect = event.currentTarget.getBoundingClientRect();

    const candlesPerPixel = chartData.candles.length / rect.width;

    const candleDelta = Math.round(delta * candlesPerPixel);

    let newPan = dragStartRef.current.pan - candleDelta;

    const maxPan = Math.max(0, candles.length - visibleCount);

    newPan = Math.max(0, Math.min(maxPan, newPan));

    setPanOffset(newPan);
  };

  /*
   * Stop dragging
   */
  const handlePointerUp = (event) => {
    setIsDragging(false);
    dragStartRef.current = null;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {}
  };

  return (
    <section className="panel chart-panel">
      {/* CHART HEADER */}
      <div className="chart-header">
        <div>
          <h3>Price Chart</h3>

          <span>{symbol} · LIVE CANDLES</span>
        </div>

        <div className="chart-tools">
          {["15m", "1H", "4H", "1D", "1W"].map((item) => (
            <button
              key={item}
              className={interval === item ? "active" : ""}
              onClick={() => {
                setInterval(item);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* OHLC */}
      <div className="ohlc">
        {lastCandle ? (
          <>
            <span>
              O <strong>{lastCandle.open.toFixed(2)}</strong>
            </span>

            <span>
              H <strong>{lastCandle.high.toFixed(2)}</strong>
            </span>

            <span>
              L <strong>{lastCandle.low.toFixed(2)}</strong>
            </span>

            <span>
              C{" "}
              <strong
                className={
                  lastCandle.close >= lastCandle.open
                    ? "chart-buy"
                    : "chart-sell"
                }
              >
                {lastCandle.close.toFixed(2)}
              </strong>
            </span>
          </>
        ) : (
          <span>Loading market data...</span>
        )}
      </div>

      {/* CHART */}
      <div className="chart-wrapper" onWheel={handleWheel}>
        {chartData ? (
          <svg
            className="price-chart"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
              cursor: isDragging ? "grabbing" : "crosshair",
              touchAction: "none",
            }}
          >
            {/* GRID */}
            {[0, 1, 2, 3, 4].map((line) => {
              const y = padding.top + (line / 4) * chartHeight;

              return (
                <line
                  key={`h-${line}`}
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  className="chart-grid-line"
                />
              );
            })}

            {[0, 1, 2, 3, 4, 5].map((line) => {
              const x = padding.left + (line / 5) * chartWidth;

              return (
                <line
                  key={`v-${line}`}
                  x1={x}
                  x2={x}
                  y1={padding.top}
                  y2={height - padding.bottom}
                  className="chart-grid-line"
                />
              );
            })}

            {/* CANDLES */}
            {chartData.candles.map((candle, index) => {
              const x = getX(index);

              const candleWidth = Math.max(
                4,
                chartWidth / chartData.candles.length / 1.8
              );

              const openY = getY(candle.open);

              const closeY = getY(candle.close);

              const highY = getY(candle.high);

              const lowY = getY(candle.low);

              const isUp = candle.close >= candle.open;

              const bodyTop = Math.min(openY, closeY);

              const bodyHeight = Math.max(2, Math.abs(closeY - openY));

              return (
                <g key={candle.time}>
                  {/* WICK */}
                  <line
                    x1={x}
                    x2={x}
                    y1={highY}
                    y2={lowY}
                    className={isUp ? "candle-wick-up" : "candle-wick-down"}
                  />

                  {/* BODY */}
                  <rect
                    x={x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    className={isUp ? "candle-up" : "candle-down"}
                  />
                </g>
              );
            })}

            {/* CURRENT PRICE */}
            {lastCandle && (
              <>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={getY(lastCandle.close)}
                  y2={getY(lastCandle.close)}
                  className="current-price-line"
                />

                <text
                  x={width - padding.right + 8}
                  y={getY(lastCandle.close) + 4}
                  className="current-price-label"
                >
                  {lastCandle.close.toFixed(2)}
                </text>
              </>
            )}

            {/* PRICE LABELS */}
            {[0, 1, 2, 3, 4].map((line) => {
              const price =
                chartData.maxPrice -
                ((chartData.maxPrice - chartData.minPrice) * line) / 4;

              const y = padding.top + (line / 4) * chartHeight;

              return (
                <text
                  key={`price-${line}`}
                  x={width - padding.right + 8}
                  y={y + 4}
                  className="chart-price-label"
                >
                  {price.toFixed(2)}
                </text>
              );
            })}

            {/* CROSSHAIR */}
            {mousePosition && (
              <>
                <line
                  x1={mousePosition.x}
                  x2={mousePosition.x}
                  y1={padding.top}
                  y2={height - padding.bottom}
                  className="chart-crosshair"
                />

                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={mousePosition.y}
                  y2={mousePosition.y}
                  className="chart-crosshair"
                />

                {/* CROSSHAIR PRICE */}
                <rect
                  x={width - padding.right}
                  y={mousePosition.y - 10}
                  width="65"
                  height="20"
                  className="crosshair-price-box"
                />

                <text
                  x={width - padding.right + 32}
                  y={mousePosition.y + 4}
                  textAnchor="middle"
                  className="crosshair-price"
                >
                  {(
                    chartData.maxPrice -
                    ((mousePosition.y - padding.top) / chartHeight) *
                      (chartData.maxPrice - chartData.minPrice)
                  ).toFixed(2)}
                </text>
              </>
            )}
          </svg>
        ) : (
          <div className="chart-loading">
            <span className="live-dot"></span>
            Loading chart...
          </div>
        )}

        {/* HOVER TOOLTIP */}
        {hoveredCandle && mousePosition && (
          <div
            className="chart-tooltip"
            style={{
              left: `${Math.min(
                Math.max((mousePosition.x / width) * 100, 5),
                75
              )}%`,
              top: "12px",
            }}
          >
            <div>
              <span>O</span>
              <strong>{hoveredCandle.candle.open.toFixed(2)}</strong>
            </div>

            <div>
              <span>H</span>
              <strong>{hoveredCandle.candle.high.toFixed(2)}</strong>
            </div>

            <div>
              <span>L</span>
              <strong>{hoveredCandle.candle.low.toFixed(2)}</strong>
            </div>

            <div>
              <span>C</span>
              <strong
                className={
                  hoveredCandle.candle.close >= hoveredCandle.candle.open
                    ? "chart-buy"
                    : "chart-sell"
                }
              >
                {hoveredCandle.candle.close.toFixed(2)}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* CHART FOOTER */}
      <div className="chart-footer">
        <span>{interval} CANDLES</span>

        <span>BINANCE · WEBSOCKET</span>

        <span className="chart-live">
          <span className="live-dot"></span>
          LIVE
        </span>
      </div>
    </section>
  );
}

export default PriceChart;
