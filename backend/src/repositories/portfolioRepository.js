const Portfolio = require('../models/Portfolio');

const create = (data) => Portfolio.create(data);
const findById = (id) => Portfolio.findById(id);
const findByOwner = (owner, { skip = 0, limit = 10 } = {}) =>
  Portfolio.find({ owner }).skip(skip).limit(limit).sort({ createdAt: -1 });
const countByOwner = (owner) => Portfolio.countDocuments({ owner });
const updateById = (id, data) => Portfolio.findByIdAndUpdate(id, data, { new: true, runValidators: true });
const deleteById = (id) => Portfolio.findByIdAndDelete(id);

module.exports = { create, findById, findByOwner, countByOwner, updateById, deleteById };
