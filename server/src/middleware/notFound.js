import { createAppError } from '../utils/AppError.js';

export const notFound = (req, _res, next) => {
  next(createAppError(`Not found: ${req.originalUrl}`, 404));
};
