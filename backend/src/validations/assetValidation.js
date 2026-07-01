const Joi = require('joi');

const createAssetSchema = Joi.object({
  coinName: Joi.string().trim().min(1).max(60).required(),
  symbol: Joi.string().trim().min(1).max(15).required(),
  quantity: Joi.number().positive().required(),
  buyPrice: Joi.number().min(0).required(),
  currentPrice: Joi.number().min(0).required(),
  portfolioId: Joi.string().hex().length(24).required(),
});

const updateAssetSchema = Joi.object({
  coinName: Joi.string().trim().min(1).max(60).optional(),
  symbol: Joi.string().trim().min(1).max(15).optional(),
  quantity: Joi.number().positive().optional(),
  buyPrice: Joi.number().min(0).optional(),
  currentPrice: Joi.number().min(0).optional(),
}).min(1);

module.exports = { createAssetSchema, updateAssetSchema };
