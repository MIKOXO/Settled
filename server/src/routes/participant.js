import { Router } from 'express';
import mongoose from 'mongoose';
import { createAppError } from '../utils/AppError.js';
import * as participantController from '../controllers/participantController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const validateBoardId = (req, _res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(createAppError('Invalid board id', 400));
  }
  return next();
};

router.post('/boards/:inviteToken/join', participantController.joinBoard);
router.post('/participants/recover-request', participantController.recoverRequest);
router.post('/participants/recover', participantController.recover);
router.post('/boards/:id/claim-ownership', requireAuth, validateBoardId, participantController.claimOwnership);

export default router;
