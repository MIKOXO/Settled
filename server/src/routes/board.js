import { Router } from 'express';
import mongoose from 'mongoose';
import { createAppError } from '../utils/AppError.js';
import * as boardController from '../controllers/boardController.js';
import { requireAuth, requireOwner } from '../middleware/auth.js';

const router = Router();

const validateBoardId = (req, _res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(createAppError('Invalid board id', 400));
  }
  return next();
};

router.post('/boards', boardController.createBoard);
router.get('/boards/:id', requireAuth, validateBoardId, boardController.getBoardById);
router.patch('/boards/:id', requireAuth, requireOwner, validateBoardId, boardController.updateBoard);

export default router;
