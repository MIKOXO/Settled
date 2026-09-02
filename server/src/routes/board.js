import { Router } from 'express';
import mongoose from 'mongoose';
import * as boardController from '../controllers/boardController.js';

const router = Router();

const validateBoardId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      data: null,
      error: 'Invalid board id',
    });
  }
  return next();
};

router.post('/boards', boardController.createBoard);
router.get('/boards/:id', validateBoardId, boardController.getBoardById);
router.patch('/boards/:id', validateBoardId, boardController.updateBoard);

export default router;
