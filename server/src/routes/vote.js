import { Router } from 'express';

import { validateObjectId } from '../middleware/validateObjectId.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOptionBoardMembership } from '../middleware/requireOptionBoardMembership.js';
import * as voteController from '../controllers/voteController.js';

const router = Router();
const optionId = validateObjectId('id', 'option id');

router.post(
  '/options/:id/vote',
  requireAuth,
  optionId,
  requireOptionBoardMembership,
  voteController.castVote,
);
router.delete(
  '/options/:id/vote',
  requireAuth,
  optionId,
  requireOptionBoardMembership,
  voteController.removeVote,
);

export default router;