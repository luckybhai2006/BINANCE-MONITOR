function MarketHeader({
  symbol,
  setSymbol,
  ticker,
  tickerLoading,
  priceDirection,
}) {
  return (
    <section className="market-header">
      <div className="symbol-block">
        <div className="symbol-line">
          <div className="symbol-dropdown">
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="symbol-select"
            >
              <option value="BTCUSDT">BTCUSDT</option>
              <option value="ETHUSDT">ETHUSDT</option>
              <option value="BNBUSDT">BNBUSDT</option>
            </select>

            <span className="dropdown-arrow">⌄</span>
          </div>

          <span className="spot-badge">SPOT</span>
        </div>

        <span className="exchange">BINANCE</span>

        {ticker && (
          <div
            className={`live-price ${
              priceDirection === "up"
                ? "price-up"
                : priceDirection === "down"
                ? "price-down"
                : ""
            }`}
          >
            $
            {Number(ticker.lastPrice).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        )}
      </div>

      <div className="market-stat">
        <span>24H CHANGE</span>

        <strong
          className={
            ticker && Number(ticker.priceChangePercent) >= 0
              ? "positive"
              : "negative"
          }
        >
          {tickerLoading
            ? "—"
            : `${Number(ticker?.priceChangePercent || 0).toFixed(2)}%`}
        </strong>
      </div>

      <div className="market-stat">
        <span>24H HIGH</span>

        <strong>
          {ticker
            ? `$${Number(ticker.highPrice).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "—"}
        </strong>
      </div>

      <div className="market-stat">
        <span>24H LOW</span>

        <strong>
          {ticker
            ? `$${Number(ticker.lowPrice).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "—"}
        </strong>
      </div>

      <div className="market-stat">
        <span>24H VOLUME</span>

        <strong>
          {ticker
            ? Number(ticker.volume).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : "—"}
        </strong>
      </div>
    </section>
  );
}

export default MarketHeader;
