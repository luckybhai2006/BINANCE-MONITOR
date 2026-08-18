import { useState } from "react";

import Header from "./components/Header";
import MarketHeader from "./components/MarketHeader";
import OrderBook from "./components/OrderBook";
import PriceChart from "./components/PriceChart";
import TradeFeed from "./components/TradeFeed";
import Footer from "./components/Footer";

import useOrderBook from "./hooks/useOrderBook";
import useTradeFeed from "./hooks/useTradeFeed";
import useTicker from "./hooks/useTicker";

import "./App.css";

function App() {
  const [symbol, setSymbol] = useState("BTCUSDT");

  const { ticker, loading: tickerLoading, priceDirection } = useTicker(symbol);

  const {
    bids,
    asks,
    loading: bookLoading,
    error: bookError,
  } = useOrderBook(symbol);

  const {
    trades,
    loading: tradeLoading,
    error: tradeError,
  } = useTradeFeed(symbol);

  return (
    <div className="terminal">
      <Header />

      <MarketHeader
        symbol={symbol}
        setSymbol={setSymbol}
        ticker={ticker}
        tickerLoading={tickerLoading}
        priceDirection={priceDirection}
      />

      <main className="dashboard">
        <OrderBook
          symbol={symbol}
          bids={bids}
          asks={asks}
          bookLoading={bookLoading}
          bookError={bookError}
        />

        <PriceChart symbol={symbol} />

        <TradeFeed
          trades={trades}
          tradeLoading={tradeLoading}
          tradeError={tradeError}
        />
      </main>

      <Footer symbol={symbol} />
    </div>
  );
}

export default App;
