import { Router } from 'express';

import { requireAuth } from '../middleware/auth.js';
import * as placesController from '../controllers/placesController.js';

const router = Router();

router.get('/places/search', requireAuth, placesController.searchPlaces);

export default router;
