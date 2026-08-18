function Footer({ symbol }) {
  return (
    <footer>
      <span>BINANCE MARKET DATA</span>
      <span>{symbol}</span>
      <span>WebSocket · Real-time</span>
    </footer>
  );
}

export default Footer;
