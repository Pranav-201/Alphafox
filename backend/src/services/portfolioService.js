const portfolioRepo = require('../repositories/portfolioRepository');
const assetRepo = require('../repositories/assetRepository');
const { ApiError } = require('../utils/apiResponse');

const create = (userId, data) => portfolioRepo.create({ ...data, owner: userId });

const listForUser = async (userId, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    portfolioRepo.findByOwner(userId, { skip, limit }),
    portfolioRepo.countByOwner(userId),
  ]);
  return { items, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) };
};

const getOwned = async (id, userId) => {
  const portfolio = await portfolioRepo.findById(id);
  if (!portfolio) throw new ApiError(404, 'Portfolio not found');
  if (String(portfolio.owner) !== String(userId)) throw new ApiError(403, 'Not your portfolio');
  return portfolio;
};

const update = async (id, userId, data) => {
  await getOwned(id, userId);
  return portfolioRepo.updateById(id, data);
};

const remove = async (id, userId) => {
  await getOwned(id, userId);
  await portfolioRepo.deleteById(id);
};

const computeAssetMetrics = (asset) => {
  const investment = asset.quantity * asset.buyPrice;
  const currentValue = asset.quantity * asset.currentPrice;
  const profit = currentValue - investment;
  const profitPercentage = investment === 0 ? 0 : (profit / investment) * 100;
  return { investment, currentValue, profit, profitPercentage };
};

const summary = async (id, userId) => {
  await getOwned(id, userId);
  const assets = await assetRepo.findAllByPortfolio(id);
  let totalInvestment = 0;
  let currentValue = 0;
  assets.forEach((a) => {
    const m = computeAssetMetrics(a);
    totalInvestment += m.investment;
    currentValue += m.currentValue;
  });
  const profit = currentValue - totalInvestment;
  const profitPercentage = totalInvestment === 0 ? 0 : (profit / totalInvestment) * 100;
  return {
    totalInvestment,
    currentValue,
    profit,
    profitPercentage: Math.round(profitPercentage * 100) / 100,
    assetCount: assets.length,
  };
};

const topAsset = async (id, userId) => {
  await getOwned(id, userId);
  const assets = await assetRepo.findAllByPortfolio(id);
  if (assets.length === 0) return null;
  let best = null;
  let bestProfit = -Infinity;
  assets.forEach((a) => {
    const m = computeAssetMetrics(a);
    if (m.profit > bestProfit) {
      bestProfit = m.profit;
      best = { asset: a, ...m };
    }
  });
  return best;
};

const distribution = async (id, userId) => {
  await getOwned(id, userId);
  const assets = await assetRepo.findAllByPortfolio(id);
  const total = assets.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);
  if (total === 0) return [];
  return assets.map((a) => ({
    coin: a.symbol,
    value: a.quantity * a.currentPrice,
    percentage: Math.round(((a.quantity * a.currentPrice) / total) * 10000) / 100,
  }));
};

module.exports = { create, listForUser, getOwned, update, remove, summary, topAsset, distribution };
