const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');
const config = require('../config/env');

function errorMiddleware(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || undefined;

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 422;
    message = 'Database validation failed';
    errors = err.errors.map(e => e.message);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
  }

  if (statusCode >= 500) {
    logger.error(`[${req.method} ${req.originalUrl}] Unhandled Error:`, err.stack || err.message);
  } else {
    logger.warn(`[${req.method} ${req.originalUrl}] Operational Error (${statusCode}):`, message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(config.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {})
  });
}

module.exports = errorMiddleware;

