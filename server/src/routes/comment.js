import { Router } from 'express';

import { validateObjectId } from '../middleware/validateObjectId.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOptionBoardMembership } from '../middleware/requireOptionBoardMembership.js';
import { requireCommentBoardMembership } from '../middleware/requireCommentBoardMembership.js';
import * as commentController from '../controllers/commentController.js';

const router = Router();
const optionId = validateObjectId('id', 'option id');
const commentId = validateObjectId('commentId', 'comment id');

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
// Replies live under the comment they answer, not under the option — the option
// route lists roots only.
router.get(
  '/comments/:commentId/replies',
  requireAuth,
  commentId,
  requireCommentBoardMembership,
  commentController.listReplies,
);

export default router;
