import { Router } from 'express';

import { validateObjectId } from '../middleware/validateObjectId.js';
import * as boardController from '../controllers/boardController.js';
import { requireAuth, requireOwner } from '../middleware/auth.js';

const router = Router();
const boardId = validateObjectId('id', 'board id');

router.post('/boards', boardController.createBoard);
router.get('/boards/:id', requireAuth, boardId, boardController.getBoardById);
router.patch('/boards/:id', requireAuth, requireOwner, boardId, boardController.updateBoard);
router.patch('/boards/:id/lock', requireAuth, requireOwner, boardId, boardController.lockDecision);
router.delete(
  '/boards/:id/participants/:participantId',
  requireAuth,
  requireOwner,
  boardId,
  validateObjectId('participantId', 'participant id'),
  boardController.removeParticipant,
);

export default router;