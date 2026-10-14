import { catchAsync } from '../utils/catchAsync.js';
import { ok } from '../utils/respond.js';
import { createCommentSchema, listCommentsQuerySchema } from '../validators/comment.js';
import * as commentService from '../services/commentService.js';

const commentData = (comment, participantName) => ({
  id: comment._id,
  optionId: comment.optionId,
  participantId: comment.participantId,
  participantName: participantName ?? null,
  body: comment.body,
  createdAt: comment.createdAt,
});

const optionCountData = (option) => ({ id: option._id, commentCount: option.commentCount });

export const createComment = catchAsync(async (req, res) => {
  const input = createCommentSchema.parse(req.body);
  const result = await commentService.createComment(req.participant.id, req.params.id, input);

  return ok(
    res,
    {
      comment: commentData(result.comment, result.participantName),
      option: optionCountData(result.option),
    },
    201,
  );
});

export const listComments = catchAsync(async (req, res) => {
  const query = listCommentsQuerySchema.parse(req.query);
  const { comments, nextCursor, nameMap } = await commentService.listCommentsByOption(
    req.params.id,
    query,
  );

  return ok(res, {
    comments: comments.map((c) => commentData(c, nameMap.get(c.participantId.toString()))),
    nextCursor,
  });
});