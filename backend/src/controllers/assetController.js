const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const assetService = require('../services/assetService');

const create = asyncHandler(async (req, res) => {
  const asset = await assetService.create(req.user._id, req.body);
  success(res, 201, 'Asset created', { asset });
});

const list = asyncHandler(async (req, res) => {
  const result = await assetService.list(req.user._id, req.query);
  success(res, 200, 'Assets fetched', { items: result.items }, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    pages: result.pages,
  });
});

const getOne = asyncHandler(async (req, res) => {
  const asset = await assetService.getOwned(req.params.id, req.user._id);
  success(res, 200, 'Asset fetched', { asset });
});

const update = asyncHandler(async (req, res) => {
  const asset = await assetService.update(req.params.id, req.user._id, req.body);
  success(res, 200, 'Asset updated', { asset });
});

const remove = asyncHandler(async (req, res) => {
  await assetService.remove(req.params.id, req.user._id);
  success(res, 200, 'Asset deleted');
});

module.exports = { create, list, getOne, update, remove };
