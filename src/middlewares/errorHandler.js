const errorHandler = (err, req, res, next) => {
  console.error('[Error]:', err.message || err);

  const statusCode = err.statusCode || 500;
  const errorResponse = {
    error: err.error || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred.',
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
