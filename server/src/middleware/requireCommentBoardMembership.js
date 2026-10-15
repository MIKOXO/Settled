import { Comment } from '../models/Comment.js';
import { Option } from '../models/Option.js';
import { assertParticipantOnBoard } from '../utils/membership.js';
import { createAppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Guards the replies route, which addresses a comment rather than an option.
 *
 * Resolves the comment to the option it belongs to and checks the caller is on
 * that board, then hands the service the ROOT comment: replies are one level
 * deep, so a request naming a reply is served that reply's root rather than
 * failing on a shape the client simply never produces.
 */
export const requireCommentBoardMembership =
  catchAsync(async function requireCommentBoardMembership(req, _res, next) {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      throw createAppError('Comment not found', 404);
    }

    const option = await Option.findById(comment.optionId);
    if (!option) {
      throw createAppError('Option not found', 404);
    }

    await assertParticipantOnBoard(req.participant.id, option.boardId);

    const root = comment.parentId ? await Comment.findById(comment.parentId) : comment;
    if (!root) {
      throw createAppError('Comment not found', 404);
    }

    req.comment = root;
    req.option = option;
    next();
  });
