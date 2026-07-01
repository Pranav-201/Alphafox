const User = require('../models/User');

const create = (data) => User.create(data);
const findByEmail = (email, withPassword = false) =>
  withPassword ? User.findOne({ email }).select('+password') : User.findOne({ email });
const findById = (id) => User.findById(id);
const findAll = (filter = {}, { skip = 0, limit = 10 } = {}) =>
  User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
const countAll = (filter = {}) => User.countDocuments(filter);
const deleteById = (id) => User.findByIdAndDelete(id);
const setRefreshToken = (id, refreshToken) => User.findByIdAndUpdate(id, { refreshToken });
const findByRefreshToken = (refreshToken) => User.findOne({ refreshToken }).select('+refreshToken');

module.exports = {
  create,
  findByEmail,
  findById,
  findAll,
  countAll,
  deleteById,
  setRefreshToken,
  findByRefreshToken,
};
