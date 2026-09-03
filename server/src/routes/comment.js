import { Router } from 'express';
import mongoose from 'mongoose';

import { createAppError } from '../utils/AppError.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOptionBoardMembership } from '../middleware/requireOptionBoardMembership.js';
import * as commentController from '../controllers/commentController.js';

const router = Router();

const validateOptionId = (req, _res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(createAppError('Invalid option id', 400));
  }
  return next();
};

router.post('/options/:id/comments', requireAuth, validateOptionId, requireOptionBoardMembership, commentController.createComment);
router.get('/options/:id/comments', requireAuth, validateOptionId, requireOptionBoardMembership, commentController.listComments);

export default router;