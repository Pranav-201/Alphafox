const Asset = require('../models/Asset');

const create = (data) => Asset.create(data);
const findById = (id) => Asset.findById(id);

const findWithQuery = (filter, { skip = 0, limit = 10, sort = '-createdAt' } = {}) =>
  Asset.find(filter).skip(skip).limit(limit).sort(sort);

const countWithQuery = (filter) => Asset.countDocuments(filter);

const findAllByPortfolio = (portfolioId) => Asset.find({ portfolioId });

const updateById = (id, data) => Asset.findByIdAndUpdate(id, data, { new: true, runValidators: true });
const deleteById = (id) => Asset.findByIdAndDelete(id);

module.exports = {
  create,
  findById,
  findWithQuery,
  countWithQuery,
  findAllByPortfolio,
  updateById,
  deleteById,
};
