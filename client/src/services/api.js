import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const getTicker = async (symbol = "BTCUSDT") => {
  const response = await API.get("/binance/ticker", {
    params: {
      symbol,
    },
  });

  return response.data;
};
