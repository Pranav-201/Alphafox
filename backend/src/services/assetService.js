const assetRepo = require('../repositories/assetRepository');
const portfolioService = require('./portfolioService');
const { ApiError } = require('../utils/apiResponse');

const create = async (userId, data) => {
  await portfolioService.getOwned(data.portfolioId, userId);
  return assetRepo.create({ ...data, owner: userId });
};

const list = async (userId, query) => {
  const { page = 1, limit = 10, search, sort, symbol, portfolioId } = query;
  const filter = { owner: userId };
  if (portfolioId) filter.portfolioId = portfolioId;
  if (symbol) filter.symbol = symbol.toUpperCase();
  if (search) filter.$text = { $search: search };

  let sortOption = '-createdAt';
  if (sort) {
    const allowed = ['profit', '-profit', 'currentValue', '-currentValue', 'quantity', '-quantity', 'createdAt', '-createdAt'];
    if (allowed.includes(sort)) sortOption = sort;
  }

  const skip = (page - 1) * limit;
  let items = await assetRepo.findWithQuery(filter, { skip: 0, limit: 10000, sort: '-createdAt' });

  // compute derived metrics for in-memory sort on virtual fields (profit/currentValue)
  items = items.map((a) => a.toObject());
  if (sortOption === 'profit' || sortOption === '-profit') {
    items.sort((a, b) => (sortOption === 'profit' ? a.profit - b.profit : b.profit - a.profit));
  } else if (sortOption === 'currentValue' || sortOption === '-currentValue') {
    items.sort((a, b) =>
      sortOption === 'currentValue' ? a.currentValue - b.currentValue : b.currentValue - a.currentValue
    );
  } else if (sortOption === 'quantity' || sortOption === '-quantity') {
    items.sort((a, b) => (sortOption === 'quantity' ? a.quantity - b.quantity : b.quantity - a.quantity));
  }

  const total = items.length;
  const paged = items.slice(skip, skip + Number(limit));

  return { items: paged, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) };
};

const getOwned = async (id, userId) => {
  const asset = await assetRepo.findById(id);
  if (!asset) throw new ApiError(404, 'Asset not found');
  if (String(asset.owner) !== String(userId)) throw new ApiError(403, 'Not your asset');
  return asset;
};

const update = async (id, userId, data) => {
  await getOwned(id, userId);
  return assetRepo.updateById(id, data);
};

const remove = async (id, userId) => {
  await getOwned(id, userId);
  await assetRepo.deleteById(id);
};

module.exports = { create, list, getOwned, update, remove };
