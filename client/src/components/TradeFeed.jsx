function TradeFeed({ trades, tradeLoading, tradeError }) {
  return (
    <section className="panel trade-panel">
      <div className="panel-header">
        <div>
          <h3>Trade Feed</h3>
          <span>RECENT MARKET TRADES</span>
        </div>

        <div className="trade-count">{trades.length} EVENTS</div>
      </div>

      <div className="trade-head">
        <span>TIME</span>
        <span>PRICE</span>
        <span>QUANTITY</span>
        <span>SIDE</span>
      </div>

      <div className="trade-list">
        {tradeLoading ? (
          <div className="trade-loading">
            <span className="live-dot"></span>
            Loading trades...
          </div>
        ) : tradeError ? (
          <div className="error">{tradeError}</div>
        ) : (
          trades.map((trade) => (
            <div className="trade-row" key={trade.id}>
              <span className="trade-time">
                {new Date(trade.time).toLocaleTimeString()}
              </span>

              <span className={trade.isBuyerMaker ? "sell" : "buy"}>
                {trade.price.toFixed(2)}
              </span>

              <span>{trade.quantity.toFixed(5)}</span>

              <span className={trade.isBuyerMaker ? "sell side" : "buy side"}>
                {trade.isBuyerMaker ? "SELL" : "BUY"}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default TradeFeed;
