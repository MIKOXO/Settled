import { Board } from '../models/Board.js';
import { Participant } from '../models/Participant.js';
import { createAppError } from '../utils/AppError.js';

export const requireCanCreateOption = async (req, _res, next) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      return next(createAppError('Board not found', 404));
    }

    const participant = await Participant.findOne({ _id: req.participant.id, boardId: board._id });
    if (!participant) {
      return next(createAppError('Participant not found on this board', 403));
    }

    if (board.optionsOwnerOnly && req.participant.role !== 'owner') {
      return next(createAppError('Owner-only board', 403));
    }

    req.board = board;
    return next();
  } catch (err) {
    return next(err);
  }
};