const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const authService = require('../services/authService');
const env = require('../config/env');

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  res.cookie('refreshToken', refreshToken, cookieOptions);
  success(res, 201, 'Registered successfully', { user, accessToken });
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  res.cookie('refreshToken', refreshToken, cookieOptions);
  success(res, 200, 'Logged in successfully', { user, accessToken });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  const { user, accessToken, refreshToken } = await authService.refresh(token);
  res.cookie('refreshToken', refreshToken, cookieOptions);
  success(res, 200, 'Token refreshed', { user, accessToken });
});

const logout = asyncHandler(async (req, res) => {
  if (req.user) await authService.logout(req.user._id);
  res.clearCookie('refreshToken', cookieOptions);
  success(res, 200, 'Logged out successfully');
});

const me = asyncHandler(async (req, res) => {
  success(res, 200, 'Current user', { user: req.user.toSafeObject() });
});

module.exports = { register, login, refresh, logout, me };
