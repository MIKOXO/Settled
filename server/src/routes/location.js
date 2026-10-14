import { Router } from 'express';

import { validateObjectId } from '../middleware/validateObjectId.js';
import { requireAuth } from '../middleware/auth.js';
import * as locationController from '../controllers/locationController.js';

const router = Router();
const boardId = validateObjectId('boardId', 'board id');

router.put(
  '/boards/:boardId/location',
  requireAuth,
  boardId,
  locationController.upsertLocation,
);
router.delete(
  '/boards/:boardId/location',
  requireAuth,
  boardId,
  locationController.removeLocation,
);
router.get(
  '/boards/:boardId/locations',
  requireAuth,
  boardId,
  locationController.listLocations,
);

export default router;