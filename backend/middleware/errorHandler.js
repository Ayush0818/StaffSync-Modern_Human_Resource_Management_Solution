// ============================================================
// middleware/errorHandler.js - Global Error Handling Middleware
// ============================================================
// Catches and standardizes API error responses across the application.
// Handles Mongoose casting, duplication, validation, and JWT errors.
// ============================================================

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for development debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Stack:', err);
  }

  // 1. Mongoose Bad ObjectId / CastError
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = { statusCode: 404, message };
  }

  // 2. Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    const message = `Duplicate value '${value}' entered for ${field} field. Value must be unique.`;
    error = { statusCode: 400, message };
  }

  // 3. Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    error = { statusCode: 400, message };
  }

  // 4. JWT Errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Authorization denied.';
    error = { statusCode: 401, message };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token has expired. Please log in again.';
    error = { statusCode: 401, message };
  }

  // Final Response
  const statusCode = error.statusCode || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
