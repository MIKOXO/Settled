import { Router } from 'express';
import mongoose from 'mongoose';

import { createAppError } from '../utils/AppError.js';
import { requireAuth } from '../middleware/auth.js';
import * as locationController from '../controllers/locationController.js';

const router = Router();

const validateBoardId = (req, _res, next) => {
  if (!mongoose.isValidObjectId(req.params.boardId)) {
    return next(createAppError('Invalid board id', 400));
  }
  return next();
};

router.put(
  '/boards/:boardId/location',
  requireAuth,
  validateBoardId,
  locationController.upsertLocation,
);

router.delete(
  '/boards/:boardId/location',
  requireAuth,
  validateBoardId,
  locationController.removeLocation,
);

router.get(
  '/boards/:boardId/locations',
  requireAuth,
  validateBoardId,
  locationController.listLocations,
);

export default router;
