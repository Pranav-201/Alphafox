const { ApiError } = require('../utils/apiResponse');

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = error.details.map((d) => d.message);
    return next(new ApiError(400, 'Validation failed', details));
  }
  req.body = value;
  next();
};

module.exports = validate;
