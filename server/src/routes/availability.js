import { Router } from 'express';

import { validateObjectId } from '../middleware/validateObjectId.js';
import { requireAuth } from '../middleware/auth.js';
import * as availabilityController from '../controllers/availabilityController.js';

const router = Router();
const boardId = validateObjectId('boardId', 'board id');

router.put(
  '/boards/:boardId/availability',
  requireAuth,
  boardId,
  availabilityController.upsertAvailability,
);
router.get(
  '/boards/:boardId/availability',
  requireAuth,
  boardId,
  availabilityController.listAvailability,
);
router.delete(
  '/boards/:boardId/availability/:date',
  requireAuth,
  boardId,
  availabilityController.removeAvailability,
);

export default router;