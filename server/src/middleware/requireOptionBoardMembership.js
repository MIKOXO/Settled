import { Option } from '../models/Option.js';
import { Participant } from '../models/Participant.js';
import { createAppError } from '../utils/AppError.js';

export const requireOptionBoardMembership = async (req, _res, next) => {
  try {
    const option = await Option.findById(req.params.id);
    if (!option) {
      return next(createAppError('Option not found', 404));
    }

    const participant = await Participant.findOne({ _id: req.participant.id, boardId: option.boardId });
    if (!participant) {
      return next(createAppError('Participant not found on this board', 403));
    }

    req.option = option;
    return next();
  } catch (err) {
    return next(err);
  }
};