import { catchAsync } from '../utils/catchAsync.js';
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

const optionCommentsData = (option) => ({
  id: option._id,
  commentCount: option.commentCount,
});

export const createComment = catchAsync(async (req, res) => {
  const input = createCommentSchema.parse(req.body);
  const { comment, option, participantName } = await commentService.createComment(
    req.participant.id,
    req.params.id,
    input,
  );
  res.status(201).json({
    success: true,
    data: {
      comment: commentData(comment, participantName),
      option: optionCommentsData(option),
    },
    error: null,
  });
});

export const listComments = catchAsync(async (req, res) => {
  const query = listCommentsQuerySchema.parse(req.query);
  const { comments, nextCursor, nameMap } = await commentService.listCommentsByOption(
    req.params.id,
    query,
  );
  res.status(200).json({
    success: true,
    data: {
      comments: comments.map((c) => commentData(c, nameMap.get(c.participantId.toString()) ?? null)),
      nextCursor,
    },
    error: null,
  });
});