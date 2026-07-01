const asyncHandler = require('../utils/asyncHandler');
const { success, ApiError } = require('../utils/apiResponse');
const priceService = require('../services/priceService');

const getPrices = asyncHandler(async (req, res) => {
  const { symbols, vs = 'inr' } = req.query;
  if (!symbols) throw new ApiError(400, 'symbols query param is required, e.g. ?symbols=BTC,ETH');
  const symbolList = symbols
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const prices = await priceService.getLivePrices(symbolList, vs);
  success(res, 200, 'Live prices fetched', { prices, vsCurrency: vs });
});

module.exports = { getPrices };
