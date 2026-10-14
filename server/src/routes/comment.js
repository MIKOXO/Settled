import { Router } from 'express';

import { validateObjectId } from '../middleware/validateObjectId.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOptionBoardMembership } from '../middleware/requireOptionBoardMembership.js';
import * as commentController from '../controllers/commentController.js';

const router = Router();
const optionId = validateObjectId('id', 'option id');

router.post(
  '/options/:id/comments',
  requireAuth,
  optionId,
  requireOptionBoardMembership,
  commentController.createComment,
);
router.get(
  '/options/:id/comments',
  requireAuth,
  optionId,
  requireOptionBoardMembership,
  commentController.listComments,
);

export default router;