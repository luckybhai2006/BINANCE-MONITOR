function OrderBook({
  symbol,
  bids = [],
  asks = [],
  bookLoading = false,
  bookError = "",
}) {

  const visibleAsks = asks
    .slice()
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .slice(0, 15);

  const visibleBids = bids
    .slice()
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .slice(0, 15);

  const maxAskQty = Math.max(...visibleAsks.map(([, qty]) => Number(qty)), 1);

  const maxBidQty = Math.max(...visibleBids.map(([, qty]) => Number(qty)), 1);

  const getDepthWidth = (quantity, maxQuantity) => {
    const qty = Number(quantity);
    const max = Number(maxQuantity);

    if (!qty || !max) return 5;

    const ratio = qty / max;

    // Make smaller quantity changes more visible
    const amplified = Math.pow(ratio, 0.65);

    return Math.max(5, Math.min(amplified * 100, 100));
  };
  return (
    <section className="panel order-panel">
      <div className="panel-header">
        <div>
          <h3>Order Book</h3>
          <span>LIVE MARKET DEPTH</span>
        </div>

        <div className="book-status">
          <span className="live-dot"></span>
          {bookLoading ? "SYNCING" : "SYNCED"}
        </div>
      </div>

      <div className="book-grid">
        {/* ASKS */}
        <div className="book-side">
          <div className="book-title ask-title">
            <span>ASKS</span>
            <span>PRICE</span>
          </div>

          <div className="columns">
            <span>PRICE</span>
            <span>QTY</span>
          </div>

          <div className="rows">
            {visibleAsks.map(([price, quantity]) => {
              const qty = Number(quantity);
              const width = getDepthWidth(qty, maxAskQty);

              return (
                <div className="book-row ask-row" key={`${price}-${quantity}`}>
                  <div
                    className="depth-bar ask-depth"
                    style={{
                      width: `${width}%`,
                    }}
                  />

                  <span>{Number(price).toFixed(2)}</span>

                  <span>{qty.toFixed(6)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SPREAD */}
        <div className="spread">
          <span>SPREAD</span>

          {bids.length > 0 && asks.length > 0 ? (
            <>
              <strong>
                {(Number(asks[0][0]) - Number(bids[0][0])).toFixed(2)}
              </strong>

              <small>{symbol}</small>
            </>
          ) : (
            <strong>—</strong>
          )}
        </div>

        {/* BIDS */}
        <div className="book-side">
          <div className="book-title bid-title">
            <span>BIDS</span>
            <span>PRICE</span>
          </div>

          <div className="columns">
            <span>PRICE</span>
            <span>QTY</span>
          </div>

          <div className="rows">
            {visibleBids.map(([price, quantity]) => {
              const qty = Number(quantity);
              const width = getDepthWidth(qty, maxBidQty);

              return (
                <div className="book-row bid-row" key={`${price}-${quantity}`}>
                  <div
                    className="depth-bar bid-depth"
                    style={{
                      width: `${width}%`,
                    }}
                  />

                  <span>{Number(price).toFixed(2)}</span>

                  <span>{qty.toFixed(6)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {bookError && <div className="error">{bookError}</div>}
    </section>
  );
}

export default OrderBook;
