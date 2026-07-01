const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const portfolioService = require('../services/portfolioService');

const create = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.create(req.user._id, req.body);
  success(res, 201, 'Portfolio created', { portfolio });
});

const list = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await portfolioService.listForUser(req.user._id, { page: Number(page), limit: Number(limit) });
  success(res, 200, 'Portfolios fetched', { items: result.items }, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    pages: result.pages,
  });
});

const getOne = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.getOwned(req.params.id, req.user._id);
  success(res, 200, 'Portfolio fetched', { portfolio });
});

const update = asyncHandler(async (req, res) => {
  const portfolio = await portfolioService.update(req.params.id, req.user._id, req.body);
  success(res, 200, 'Portfolio updated', { portfolio });
});

const remove = asyncHandler(async (req, res) => {
  await portfolioService.remove(req.params.id, req.user._id);
  success(res, 200, 'Portfolio deleted');
});

const summary = asyncHandler(async (req, res) => {
  const data = await portfolioService.summary(req.params.id, req.user._id);
  success(res, 200, 'Portfolio summary', data);
});

const topAsset = asyncHandler(async (req, res) => {
  const data = await portfolioService.topAsset(req.params.id, req.user._id);
  success(res, 200, 'Top asset fetched', { topAsset: data });
});

const distribution = asyncHandler(async (req, res) => {
  const data = await portfolioService.distribution(req.params.id, req.user._id);
  success(res, 200, 'Asset distribution fetched', { distribution: data });
});

module.exports = { create, list, getOne, update, remove, summary, topAsset, distribution };
