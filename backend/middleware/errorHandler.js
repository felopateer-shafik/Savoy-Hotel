// middleware/errorHandler.js

/**
 * Custom error class for API errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Sequelize validation errors
 */
const handleSequelizeValidationError = (err) => {
  const errors = err.errors.map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return {
    statusCode: 400,
    message: "Validation error",
    errors,
  };
};

/**
 * Handle Sequelize unique constraint errors
 */
const handleSequelizeUniqueError = (err) => {
  const field = err.errors[0]?.path || "field";
  return {
    statusCode: 409,
    message: `A record with this ${field} already exists`,
  };
};

/**
 * Handle Sequelize foreign key errors
 */
const handleSequelizeForeignKeyError = () => {
  return {
    statusCode: 400,
    message: "Referenced record does not exist",
  };
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => ({
  statusCode: 401,
  message: "Invalid token. Please log in again.",
});

const handleJWTExpiredError = () => ({
  statusCode: 401,
  message: "Your token has expired. Please log in again.",
});

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

/**
 * Global error handling middleware
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message };

    // Handle specific error types
    if (err.name === "SequelizeValidationError") {
      const formatted = handleSequelizeValidationError(err);
      error = new AppError(formatted.message, formatted.statusCode);
      error.errors = formatted.errors;
    }

    if (err.name === "SequelizeUniqueConstraintError") {
      const formatted = handleSequelizeUniqueError(err);
      error = new AppError(formatted.message, formatted.statusCode);
    }

    if (err.name === "SequelizeForeignKeyConstraintError") {
      const formatted = handleSequelizeForeignKeyError();
      error = new AppError(formatted.message, formatted.statusCode);
    }

    if (err.name === "JsonWebTokenError") {
      const formatted = handleJWTError();
      error = new AppError(formatted.message, formatted.statusCode);
    }

    if (err.name === "TokenExpiredError") {
      const formatted = handleJWTExpiredError();
      error = new AppError(formatted.message, formatted.statusCode);
    }

    sendErrorProd(error, res);
  }
};

/**
 * Handle 404 for unmatched routes
 */
const notFoundHandler = (req, res, next) => {
  const err = new AppError(
    `Cannot find ${req.originalUrl} on this server`,
    404
  );
  next(err);
};

/**
 * Async handler wrapper to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  globalErrorHandler,
  notFoundHandler,
  asyncHandler,
};
