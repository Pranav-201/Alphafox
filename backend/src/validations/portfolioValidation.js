const Joi = require('joi');

const createPortfolioSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().max(500).allow('').optional(),
});

const updatePortfolioSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().trim().max(500).allow('').optional(),
}).min(1);

module.exports = { createPortfolioSchema, updatePortfolioSchema };
