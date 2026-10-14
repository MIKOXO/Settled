import { env } from '../config/env.js';
import { fail } from '../utils/respond.js';

const describe = (err) => {
  if (err.isOperational) return [err.statusCode, err.message, null];
  if (err.name === 'ZodError') return [400, 'Validation failed', { issues: err.issues }];
  if (err.name === 'CastError') return [400, `Invalid ${err.path}: ${err.value}`, null];
  if (err.name === 'ValidationError') {
    return [400, Object.values(err.errors).map((e) => e.message).join('. '), null];
  }
  if (err.code === 11000) return [409, `Duplicate value for ${Object.keys(err.keyValue)[0]}`, null];
  if (env.NODE_ENV === 'production') return [500, 'Internal server error', null];
  return [500, err.message, { stack: err.stack }];
};

export const errorHandler = (err, _req, res, _next) => {
  const [statusCode, message, extra] = describe(err);
  return fail(res, statusCode, message, extra);
};