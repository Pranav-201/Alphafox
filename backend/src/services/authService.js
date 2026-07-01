const userRepo = require('../repositories/userRepository');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { ApiError } = require('../utils/apiResponse');

const generateTokens = (user) => {
  const payload = { id: user._id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  return { accessToken, refreshToken };
};

const register = async ({ name, email, password }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw new ApiError(409, 'Email already registered');
  const user = await userRepo.create({ name, email, password });
  const tokens = generateTokens(user);
  await userRepo.setRefreshToken(user._id, tokens.refreshToken);
  return { user: user.toSafeObject(), ...tokens };
};

const login = async ({ email, password }) => {
  const user = await userRepo.findByEmail(email, true);
  if (!user) throw new ApiError(401, 'Invalid email or password');
  const match = await user.comparePassword(password);
  if (!match) throw new ApiError(401, 'Invalid email or password');
  const tokens = generateTokens(user);
  await userRepo.setRefreshToken(user._id, tokens.refreshToken);
  return { user: user.toSafeObject(), ...tokens };
};

const refresh = async (refreshToken) => {
  if (!refreshToken) throw new ApiError(401, 'Refresh token missing');
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
  const user = await userRepo.findByRefreshToken(refreshToken);
  if (!user || String(user._id) !== String(decoded.id)) {
    throw new ApiError(401, 'Refresh token not recognized');
  }
  const tokens = generateTokens(user);
  await userRepo.setRefreshToken(user._id, tokens.refreshToken);
  return { user: user.toSafeObject(), ...tokens };
};

const logout = async (userId) => {
  await userRepo.setRefreshToken(userId, null);
};

module.exports = { register, login, refresh, logout };
