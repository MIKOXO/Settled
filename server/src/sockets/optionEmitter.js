import { getIo } from './io.js';
import { getSignedPhotoUrl } from '../utils/b2.js';

/**
 * Option payload broadcast to the board room.
 *
 * Broadcasts carry the exact same shape as an entry from the list endpoint, so
 * a card rendered from a socket event is indistinguishable from one rendered
 * from a fetch — a drifted serializer here would mean options silently losing
 * their photo, place chip, or link depending on which produced them.
 *
 * `vote` is always null on the wire. It's the only per-participant field on an
 * option, and broadcasting the sender's reaction would stamp it onto every
 * other client. Clients keep their own reaction; the server re-issues it on
 * `vote:updated`.
 */
const optionPayload = async (option, leadingIds) => {
  const populated = option.locationId?.lat === undefined
    ? await option.populate('locationId')
    : option;

  return {
    id: populated._id,
    boardId: populated.boardId,
    createdBy: populated.createdBy,
    title: populated.title,
    notes: populated.notes ?? null,
    link: populated.link ?? null,
    photoKey: populated.photoKey ?? null,
    locationId: populated.locationId?._id ?? populated.locationId ?? null,
    likesCount: populated.likesCount,
    dislikesCount: populated.dislikesCount,
    commentCount: populated.commentCount,
    score: populated.likesCount - populated.dislikesCount,
    isLeading: leadingIds.includes(populated._id.toString()),
    vote: null,
    createdAt: populated.createdAt,
    updatedAt: populated.updatedAt,
    photoUrl: populated.photoKey ? await getSignedPhotoUrl(populated.photoKey) : null,
    location: populated.locationId ?? null,
  };
};

export const emitOptionCreated = async (option, leadingIds) => {
  const io = getIo();
  if (!io) return;
  io.to(`board:${option.boardId}`).emit('option:created', await optionPayload(option, leadingIds));
};

export const emitOptionUpdated = async (option, leadingIds) => {
  const io = getIo();
  if (!io) return;
  io.to(`board:${option.boardId}`).emit('option:updated', await optionPayload(option, leadingIds));
};

export const emitOptionDeleted = (option) => {
  const io = getIo();
  if (!io) return;
  io.to(`board:${option.boardId}`).emit('option:deleted', { optionId: option._id });
};