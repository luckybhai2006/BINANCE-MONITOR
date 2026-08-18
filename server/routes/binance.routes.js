const express = require("express");

const router = express.Router();

const {
  getTickerData,
  getDepthData,
  getTradesData,
} = require("../controllers/binance.controller");

router.get("/ticker", getTickerData);
router.get("/depth", getDepthData);
router.get("/trades", getTradesData);

module.exports = router;
