import { Router } from 'express';
import mongoose from 'mongoose';
import { createAppError } from '../utils/AppError.js';
import * as participantController from '../controllers/participantController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const validateObjectId = (paramName) => (req, _res, next) => {
  if (!mongoose.isValidObjectId(req.params[paramName])) {
    return next(createAppError(`Invalid ${paramName}`, 400));
  }
  return next();
};

router.get('/participants/me', requireAuth, participantController.getMe);
router.post('/boards/:inviteToken/join', participantController.joinBoard);
router.post('/participants/recover-request', participantController.recoverRequest);
router.post('/participants/recover', participantController.recover);
router.post('/boards/:id/claim-ownership', requireAuth, validateObjectId('id'), participantController.claimOwnership);
router.get('/boards/:boardId/participants', requireAuth, validateObjectId('boardId'), participantController.listBoardParticipants);

export default router;
