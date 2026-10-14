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

export const createComment = async (participantId, optionId, input) => {
  const option = await Option.findById(optionId);
  if (!option) {
    throw createAppError('Option not found', 404);
  }

  await assertOptionBoardOpen(option);

  const comment = await Comment.create({ optionId, participantId, body: input.body });

  const updatedOption = await Option.findByIdAndUpdate(
    optionId,
    { $inc: { commentCount: 1 } },
    { returnDocument: 'after', runValidators: true },
  );

  const participant = await Participant.findById(participantId).select('displayName');
  const participantName = participant?.displayName ?? null;

  emitCommentAdded(option.boardId, {
    comment: {
      id: comment._id,
      optionId: comment.optionId,
      participantId: comment.participantId,
      participantName,
      body: comment.body,
      createdAt: comment.createdAt,
    },
    optionId: updatedOption._id,
    commentCount: updatedOption.commentCount,
  });

  return { comment, option: updatedOption, participantName };
};

export const listCommentsByOption = async (optionId, { limit, cursor }) => {
  const filter = { optionId };
  const cursorData = cursor ? decodeCursor(cursor) : null;

  if (cursor && !cursorData) {
    throw createAppError('Invalid cursor', 400);
  }

  if (cursorData) {
    filter.$or = [
      { createdAt: { $lt: cursorData.createdAt } },
      { createdAt: cursorData.createdAt, _id: { $lt: cursorData.id } },
    ];
  }

  const comments = await Comment.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit);

  // One lookup for the whole page, not one per comment.
  const participantIds = [...new Set(comments.map((c) => c.participantId.toString()))];
  const participants = participantIds.length
    ? await Participant.find({ _id: { $in: participantIds } }).select('_id displayName')
    : [];
  const nameMap = new Map(participants.map((p) => [p._id.toString(), p.displayName]));

  const nextCursor =
    comments.length === limit ? encodeCursor(comments[comments.length - 1]) : null;

  return { comments, nextCursor, nameMap };
};