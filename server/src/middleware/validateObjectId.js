import mongoose from 'mongoose';
import { createAppError } from '../utils/AppError.js';

/**
 * Guards a `:param` that feeds `findById`. `label` is the human name used in the
 * error message so each route keeps its own wording — `id` on /boards is a board
 * id, `id` on /options is an option id.
 */
export const validateObjectId = (paramName, label = paramName) =>
  function validateObjectIdParam(req, _res, next) {
    if (!mongoose.isValidObjectId(req.params[paramName])) {
      return next(createAppError(`Invalid ${label}`, 400));
    }
    return next();
  };