# Real-Time Market Data Terminal

A real-time cryptocurrency market data terminal built using React, Node.js, Express.js and Binance public market data APIs.

The application provides a live trading-style interface for monitoring cryptocurrency market activity, including live price information, order book depth, recent trades and real-time candlestick data.

## Features

- Real-time cryptocurrency price data
- Live market ticker
- Live Order Book with bids and asks
- Dynamic order book depth bars
- Real-time Trade Feed
- Live candlestick price chart
- Multiple chart intervals
- Cryptocurrency symbol switching
- Binance REST API integration
- Binance WebSocket integration
- Automatic WebSocket reconnection
- Loading and error states
- Responsive trading-terminal style UI
- Frontend and backend separation

## Tech Stack

### Frontend

- React
- JavaScript
- Vite
- Axios
- CSS
- React Hooks

### Backend

- Node.js
- Express.js
- Axios
- CORS

### Data Source

- Binance Public REST API
- Binance WebSocket Streams

## Project Structure

project/
├── client/
│ ├── public/
│ └── src/
│ ├── components/
│ │ ├── OrderBook.jsx
│ │ ├── TradeFeed.jsx
│ │ ├── PriceChart.jsx
│ │ └── ...
│ ├── hooks/
│ │ ├── useOrderBook.js
│ │ ├── useTradeFeed.js
│ │ ├── useKlineChart.js
│ │ └── ...
│ ├── App.jsx
│ ├── main.jsx
│ └── ...
│
├── server/
│ ├── controllers/
│ │ └── binance.controller.js
│ ├── routes/
│ │ └── binance.routes.js
│ ├── index.js
│ └── ...
│
└── README.md

## Application Architecture

The project is divided into two main parts:

React Client → Node/Express Server → Binance REST API

Real-time market data is received directly through Binance WebSocket streams and handled by custom React hooks.

Binance WebSocket
↓
React Custom Hooks
↓
React Components
↓
Live Trading UI

## Real-Time Market Data

The application uses Binance public market data.

REST APIs are used for initial data loading while WebSockets are used for continuously updating live market information.

This avoids repeatedly polling the REST API for every real-time update.

## Order Book

The Order Book displays live:

- Bids
- Asks
- Price
- Quantity
- Spread
- Dynamic market-depth bars

The order book receives depth updates through Binance WebSocket streams.

Bid and ask levels are maintained locally and updated as new depth events arrive.

When an order quantity becomes zero, that price level is removed from the local order book.

The displayed depth bars change according to the relative quantity of each order-book level.

## Trade Feed

The Trade Feed displays recently executed trades in real time.

Each trade can contain:

- Time
- Price
- Quantity
- Trade side

New trades are received through the Binance WebSocket stream and added to the live feed.

The number of displayed trades is limited so that the browser does not continuously accumulate an unlimited amount of data.

## Price Chart

The application includes a real-time candlestick price chart.

Historical candle data is initially loaded from the Binance Kline REST API.

After the historical candles are loaded, a Binance Kline WebSocket stream continuously updates the current candle.

When a new candle interval starts, a new candle is added.

The chart supports:

- 15m
- 1H
- 4H
- 1D
- 1W

The chart displays:

- Open
- High
- Low
- Close
- Candlestick body
- Candlestick wick
- Current price line
- Price labels
- Grid lines

## WebSocket Handling

The application uses WebSockets for real-time market updates.

The main streams used include:

- Ticker stream
- Trade stream
- Depth stream
- Kline stream

WebSocket lifecycle management is handled inside custom React hooks.

The hooks handle:

- Creating connections
- Receiving messages
- Updating state
- Handling errors
- Closing connections
- Reconnecting when required
- Cleaning up connections
- Reconnecting when the selected symbol changes

## Custom React Hooks

### useOrderBook

Responsible for:

- Loading the initial order book
- Connecting to the Binance depth WebSocket
- Maintaining bids
- Maintaining asks
- Processing depth updates
- Managing reconnection
- Managing loading state
- Managing error state

### useTradeFeed

Responsible for:

- Loading trade data
- Connecting to the Binance trade WebSocket
- Receiving new trades
- Updating the trade feed
- Managing the WebSocket lifecycle

### useKlineChart

Responsible for:

- Loading historical candle data
- Connecting to the Binance Kline WebSocket
- Updating the current candle
- Creating new candles
- Handling WebSocket reconnection

## Environment Variables

Create a .env file inside the client directory.

Example:

VITE_API_URL=http://localhost:5000/api
VITE_BINANCE_WS_URL=wss://stream.binance.com:9443/ws

Do not commit private secrets or sensitive credentials to GitHub.

The application uses Binance public market data and does not require private Binance API credentials.

## Backend API

The Express backend provides REST endpoints for Binance market data.

Example routes:

GET /api/binance/ticker
GET /api/binance/depth

The backend controllers communicate with Binance's public REST API and return the required data to the React frontend.

## Installation

Clone the repository:

git clone <your-repository-url>

Move into the project:

cd <project-folder>

Install frontend dependencies:

cd client
npm install

Install backend dependencies:

cd server
npm install

## Running the Application

Start the backend:

npm run dev

or, depending on the configured npm script:

npm start

Then start the frontend:

cd client
npm run dev

The Vite development server will normally be available at:

http://localhost:5173

## Data Flow

### Ticker

Binance REST API
↓
Express Backend
↓
React
↓
Ticker UI

Binance WebSocket
↓
React
↓
Live ticker updates

### Order Book

Binance REST Depth Snapshot
↓
Initial Bids / Asks
↓
Binance Depth WebSocket
↓
Depth Updates
↓
useOrderBook
↓
OrderBook Component

### Trade Feed

Binance Trade WebSocket
↓
useTradeFeed
↓
TradeFeed Component
↓
Live Trades

### Candlestick Chart

Binance Kline REST API
↓
Historical Candles
↓
useKlineChart
↓
Kline WebSocket
↓
Current Candle Updates
↓
PriceChart

## Symbol Switching

The application supports changing the selected cryptocurrency trading pair.

For example:

- BTCUSDT
- ETHUSDT
- BNBUSDT

When the selected symbol changes, the existing WebSocket connections are cleaned up and new connections are created for the selected symbol.

This prevents old symbol data from continuing to update the interface.

## Error Handling

The application includes loading and error states for market-data requests.

Examples include:

- Loading market data
- Syncing order book
- Failed to load order book
- WebSocket connection errors
- WebSocket reconnection

WebSocket connections are also cleaned up when components unmount.

## Performance Considerations

Real-time market data can generate a large number of updates.

The application limits the amount of data rendered on screen.

For example:

- Only a limited number of order-book levels are displayed.
- The trade feed retains a limited number of trades.
- The chart displays a limited number of candles.
- WebSocket connections are cleaned up when they are no longer required.

This helps keep the interface responsive during continuous market activity.

## Design

The interface follows a dark trading-terminal style.

The UI uses:

- Dark background
- Monospace market data
- Green bid/buy indicators
- Red ask/sell indicators
- Live status indicators
- Compact market-data panels
- Responsive layout

The design is focused on displaying real-time market information clearly.

## Project Highlights

### Real-Time WebSockets

The application maintains WebSocket connections instead of repeatedly polling for live market updates.

### Custom Hooks

Real-time data logic is separated from UI components using reusable React custom hooks.

### Order Book Management

Bid and ask levels are maintained locally and updated according to Binance depth events.

### Live Candles

The current candlestick is updated in real time using Binance Kline WebSocket data.

### Component Separation

The application separates major UI sections such as OrderBook, TradeFeed and PriceChart from their data-fetching logic.

## Known Limitations

- The application uses Binance public market data.
- No cryptocurrency trading or order-placement functionality is implemented.
- No user authentication is implemented.
- The application does not execute real cryptocurrency trades.
- Market data availability depends on Binance public API and WebSocket services.
- The application focuses on the selected trading symbol.

## Future Improvements

Possible future improvements include:

- Unit tests for order-book synchronization
- More advanced chart interactions
- Multi-symbol watchlist
- Virtualized large order-book and trade lists
- Advanced depth-chart visualization
- Improved reconnection and backoff handling
- Additional market statistics
- Production-level monitoring and logging

## Assignment Requirements Covered

The project covers the main requirements of the Real-Time Market Data Terminal assignment:

- Live price/ticker data
- Real-time order book
- Bid/ask depth visualization
- Live trade feed
- WebSocket-based updates
- Symbol switching
- Loading and error states
- WebSocket lifecycle handling
- Real-time candlestick chart as an additional feature

The candlestick chart was implemented as an additional feature beyond the core market-data requirements.

## Author

Lalit Mohan Pandey

Built as a frontend engineering take-home assignment using React, Node.js, Express.js and Binance public market data.
