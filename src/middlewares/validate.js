const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: err.errors[0]?.message || 'Invalid input data',
      details: err.errors
    });
  }
};

module.exports = validate;
