import { Router } from 'express';
import mongoose from 'mongoose';

import { createAppError } from '../utils/AppError.js';
import { requireAuth } from '../middleware/auth.js';
import * as availabilityController from '../controllers/availabilityController.js';

const router = Router();

const validateBoardId = (req, _res, next) => {
  if (!mongoose.isValidObjectId(req.params.boardId)) {
    return next(createAppError('Invalid board id', 400));
  }
  return next();
};

router.put(
  '/boards/:boardId/availability',
  requireAuth,
  validateBoardId,
  availabilityController.upsertAvailability,
);

router.get(
  '/boards/:boardId/availability',
  requireAuth,
  validateBoardId,
  availabilityController.listAvailability,
);

export default router;
