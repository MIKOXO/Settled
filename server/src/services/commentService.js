import { Comment } from '../models/Comment.js';
import { Option } from '../models/Option.js';
import { Participant } from '../models/Participant.js';
import { createAppError } from '../utils/AppError.js';
import { assertOptionBoardOpen } from '../utils/boardGuard.js';
import { emitCommentAdded } from '../sockets/commentEmitter.js';

const decodeCursor = (cursor) => {
  try {
    const { createdAt, id } = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    if (!createdAt || !id) return null;
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return null;
    return { createdAt: date, id };
  } catch {
    return null;
  }
};

const encodeCursor = (comment) =>
  Buffer.from(
    JSON.stringify({ createdAt: comment.createdAt.toISOString(), id: comment._id.toString() }),
    'utf8',
  ).toString('base64url');

/**
 * Cursor paging for a `(createdAt, _id)` sort. `direction` is the sort's own
 * direction: 'older' walks a newest-first list backwards, 'newer' walks a
 * oldest-first list forwards. Both need the id tiebreak so comments sharing a
 * millisecond can't be skipped or repeated.
 */
const cursorConditions = (cursorData, direction) => {
  const op = direction === 'newer' ? '$gt' : '$lt';
  return [
    { createdAt: { [op]: cursorData.createdAt } },
    { createdAt: cursorData.createdAt, _id: { [op]: cursorData.id } },
  ];
};

const resolvePage = (cursor) => {
  if (!cursor) return null;
  const cursorData = decodeCursor(cursor);
  if (!cursorData) throw createAppError('Invalid cursor', 400);
  return cursorData;
};

const attachNames = async (comments) => {
  // One lookup for the whole page, not one per comment.
  const participantIds = [...new Set(comments.map((c) => c.participantId.toString()))];
  if (participantIds.length === 0) return new Map();

  const participants = await Participant.find({ _id: { $in: participantIds } }).select(
    '_id displayName',
  );
  return new Map(participants.map((p) => [p._id.toString(), p.displayName]));
};

/**
 * The comment a reply attaches to, or null for a root comment.
 *
 * Replies are one level deep: replying to a reply targets that reply's own
 * root, so `parentId` always points at a top-level comment. A `parentId`
 * belonging to another option's thread is a client bug rather than a permission
 * question, and reads as "not found" either way.
 */
const resolveReplyTarget = async (optionId, parentId) => {
  if (!parentId) return null;

  const parent = await Comment.findById(parentId);
  if (!parent || parent.optionId.toString() !== optionId.toString()) {
    throw createAppError('Comment to reply to not found', 404);
  }

  if (!parent.parentId) return parent;

  // A reply whose root has since been deleted can't exist — the option cascade
  // takes both together — so a miss here is treated as no parent and the post
  // lands as a root rather than dangling.
  return Comment.findById(parent.parentId);
};

export const createComment = async (participantId, optionId, input) => {
  const option = await Option.findById(optionId);
  if (!option) {
    throw createAppError('Option not found', 404);
  }

  await assertOptionBoardOpen(option);

  const replyTarget = await resolveReplyTarget(optionId, input.parentId);

  const comment = await Comment.create({
    optionId,
    participantId,
    body: input.body,
    ...(replyTarget ? { parentId: replyTarget._id } : {}),
  });

  // Every message counts toward the card's badge, roots and replies alike — the
  // number is meant to read as "how big is this discussion".
  const updatedOption = await Option.findByIdAndUpdate(
    optionId,
    { $inc: { commentCount: 1 } },
    { returnDocument: 'after', runValidators: true },
  );

  const updatedRoot = replyTarget
    ? await Comment.findByIdAndUpdate(
        replyTarget._id,
        { $inc: { replyCount: 1 } },
        { returnDocument: 'after' },
      )
    : null;

  const participant = await Participant.findById(participantId).select('displayName');
  const participantName = participant?.displayName ?? null;
  const replyCount = updatedRoot?.replyCount ?? 0;

  // The one comment event covers both depths — `parentId` on the comment says
  // where it lands, so the client routes it without a second socket contract.
  emitCommentAdded(option.boardId, {
    comment: {
      id: comment._id,
      optionId: comment.optionId,
      parentId: comment.parentId ?? null,
      participantId: comment.participantId,
      participantName,
      body: comment.body,
      createdAt: comment.createdAt,
    },
    optionId: updatedOption._id,
    commentCount: updatedOption.commentCount,
    replyCount,
  });

  return { comment, option: updatedOption, participantName, replyCount };
};

export const listCommentsByOption = async (optionId, { limit, cursor }) => {
  // Roots only — replies are read through their own parent. `parentId: null`
  // also matches comments written before the field existed.
  const filter = { optionId, parentId: null };
  const cursorData = resolvePage(cursor);

  if (cursorData) {
    filter.$or = cursorConditions(cursorData, 'older');
  }

  const comments = await Comment.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit);

  const nameMap = await attachNames(comments);
  const nextCursor = comments.length === limit ? encodeCursor(comments.at(-1)) : null;

  return { comments, nextCursor, nameMap };
};

export const listRepliesByComment = async (commentId, { limit, cursor }) => {
  const filter = { parentId: commentId };
  const cursorData = resolvePage(cursor);

  if (cursorData) {
    filter.$or = cursorConditions(cursorData, 'newer');
  }

  // Oldest first: a reply list reads as a conversation unfolding, and a live
  // reply arriving over the socket appends rather than inserting.
  const replies = await Comment.find(filter)
    .sort({ createdAt: 1, _id: 1 })
    .limit(limit);

  const nameMap = await attachNames(replies);
  const nextCursor = replies.length === limit ? encodeCursor(replies.at(-1)) : null;

  return { replies, nextCursor, nameMap };
};
