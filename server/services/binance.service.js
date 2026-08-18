const axios = require("axios");
require("dotenv").config();

const BINANCE_API = process.env.BINANCE_API;

const getTicker = async (symbol = "BTCUSDT") => {
  const response = await axios.get(`${BINANCE_API}/api/v3/ticker/24hr`, {
    params: {
      symbol,
    },
  });

  return response.data;
};

const getDepth = async (symbol = "BTCUSDT") => {
  const response = await axios.get(`${BINANCE_API}/api/v3/depth`, {
    params: {
      symbol,
      limit: 1000,
    },
  });

  return response.data;
};
module.exports = {
  getTicker,
  getDepth,
};
