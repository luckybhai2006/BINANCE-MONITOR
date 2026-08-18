const { getTicker, getDepth } = require("../services/binance.service");
const axios = require("axios");

const getTickerData = async (req, res) => {
  try {
    const symbol = req.query.symbol || "BTCUSDT";

    const data = await getTicker(symbol);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Binance ticker error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch ticker",
    });
  }
};

const getDepthData = async (req, res) => {
  try {
    const symbol = req.query.symbol || "BTCUSDT";

    const data = await getDepth(symbol);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Binance depth error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order book",
    });
  }
};

const getTradesData = async (req, res) => {
  try {
    const { symbol = "BTCUSDT", limit = 50 } = req.query;

    const response = await axios.get("https://api.binance.com/api/v3/trades", {
      params: {
        symbol,
        limit,
      },
    });

    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Binance trades error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch trades",
    });
  }
};

module.exports = {
  getTickerData,
  getDepthData,
  getTradesData,
};
