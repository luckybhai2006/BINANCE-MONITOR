const express = require("express");
const cors = require("cors");

const binanceRoutes = require("./routes/binance.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Binance Terminal API is running",
  });
});

app.use("/api/binance", binanceRoutes);

module.exports = app;
