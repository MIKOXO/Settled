import { Router } from 'express';
import mongoose from 'mongoose';

import { createAppError } from '../utils/AppError.js';
import { Board } from '../models/Board.js';
import { Participant } from '../models/Participant.js';
import { Option } from '../models/Option.js';
import { requireAuth } from '../middleware/auth.js';
import * as voteController from '../controllers/voteController.js';

const router = Router();

const validateOptionId = (req, _res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(createAppError('Invalid option id', 400));
  }
  return next();
};

const requireCanVote = async (req, _res, next) => {
  try {
    const option = await Option.findById(req.params.id);
    if (!option) {
      return next(createAppError('Option not found', 404));
    }

    const participant = await Participant.findOne({ _id: req.participant.id, boardId: option.boardId });
    if (!participant) {
      return next(createAppError('Participant not found on this board', 403));
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

router.post('/options/:id/vote', requireAuth, validateOptionId, requireCanVote, voteController.castVote);
router.delete('/options/:id/vote', requireAuth, validateOptionId, requireCanVote, voteController.removeVote);

export default router;
