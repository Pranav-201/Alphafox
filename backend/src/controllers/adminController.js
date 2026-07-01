const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const userRepo = require('../repositories/userRepository');
const Portfolio = require('../models/Portfolio');
const Asset = require('../models/Asset');

const listUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    userRepo.findAll({}, { skip: Number(skip), limit: Number(limit) }),
    userRepo.countAll({}),
  ]);
  success(
    res,
    200,
    'Users fetched',
    { items: items.map((u) => u.toSafeObject()) },
    { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
  );
});

const deleteUser = asyncHandler(async (req, res) => {
  await userRepo.deleteById(req.params.id);
  success(res, 200, 'User deleted');
});

const stats = asyncHandler(async (req, res) => {
  const [userCount, portfolioCount, assetCount] = await Promise.all([
    userRepo.countAll({}),
    Portfolio.countDocuments(),
    Asset.countDocuments(),
  ]);
  success(res, 200, 'Platform statistics', { userCount, portfolioCount, assetCount });
});

module.exports = { listUsers, deleteUser, stats };
