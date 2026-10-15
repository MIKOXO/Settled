import { catchAsync } from '../utils/catchAsync.js';
import { ok } from '../utils/respond.js';
import {
  createCommentSchema,
  listCommentsQuerySchema,
  listRepliesQuerySchema,
} from '../validators/comment.js';
import * as commentService from '../services/commentService.js';

const commentData = (comment, participantName) => ({
  id: comment._id,
  optionId: comment.optionId,
  parentId: comment.parentId ?? null,
  participantId: comment.participantId,
  participantName: participantName ?? null,
  body: comment.body,
  createdAt: comment.createdAt,
  // Only meaningful on a root — a reply carries the count of the root it hangs
  // off, which the client already holds on that root.
  replyCount: comment.replyCount ?? 0,
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
      // The root's count AFTER this post: 0 for a new root, N when a reply
      // landed on one. The posted comment carries its own `replyCount` (always
      // 0 — nothing replies to a reply), so the parent row's number has to
      // arrive separately. Mirrors the socket payload's field of the same name.
      replyCount: result.replyCount,
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

export const listReplies = catchAsync(async (req, res) => {
  const query = listRepliesQuerySchema.parse(req.query);
  const { replies, nextCursor, nameMap } = await commentService.listRepliesByComment(
    req.comment._id,
    query,
  );

  return ok(res, {
    replies: replies.map((r) => commentData(r, nameMap.get(r.participantId.toString()))),
    nextCursor,
  });
});
