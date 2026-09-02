import { env } from '../config/env.js';

export const errorHandler = (err, _req, res, _next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, statusCode: err.statusCode },
    });
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: { message: 'Validation failed', statusCode: 400, issues: err.issues },
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: { message: `Invalid ${err.path}: ${err.value}`, statusCode: 400 },
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: { message: messages.join('. '), statusCode: 400 },
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      error: { message: `Duplicate value for ${field}`, statusCode: 409 },
    });
  }

  if (env.NODE_ENV === 'production') {
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error', statusCode: 500 },
    });
  }

  return res.status(500).json({
    success: false,
    error: { message: err.message, statusCode: 500, stack: err.stack },
  });
};
