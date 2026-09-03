import { Board } from '../models/Board.js';
import { createAppError } from '../utils/AppError.js';

export const requireCanAttachPhoto = async (req, _res, next) => {
  const option = req.option;
  const board = await Board.findById(option.boardId);
  if (!board) {
    return next(createAppError('Board not found', 404));
  }

  const isCreator = option.createdBy.toString() === req.participant.id;
  const isOwner = board.ownerId.toString() === req.participant.id;

  if (!isCreator && !isOwner) {
    return next(createAppError('Only the option creator or board owner can attach a photo', 403));
  }

  req.board = board;
  return next();
};