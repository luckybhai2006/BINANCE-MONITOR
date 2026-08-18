function Header() {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-logo">₿</div>

        <div>
          <h1>Market Terminal</h1>
          <span>REAL-TIME MARKET DATA</span>
        </div>
      </div>

      <div className="connection">
        <span className="live-dot"></span>
        LIVE
      </div>
    </header>
  );
}

export default Header;
