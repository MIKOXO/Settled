import { getSignedPhotoUrl } from './b2.js';

export const serializeBoard = (board) => ({
  id: board._id,
  name: board.name,
  type: board.type ?? null,
  typeLabel: board.typeLabel ?? null,
  status: board.status,
  inviteToken: board.inviteToken,
  decisionDeadline: board.decisionDeadline ?? null,
  optionsOwnerOnly: board.optionsOwnerOnly ?? false,
  decidedOptionId: board.decidedOptionId?.toString() ?? null,
  createdAt: board.createdAt,
});

/** The requesting participant only — the roster shape never carries an email. */
export const serializeParticipant = (participant) => ({
  id: participant._id,
  displayName: participant.displayName,
  email: participant.email,
  role: participant.role,
  lastActiveAt: participant.lastActiveAt ?? null,
  createdAt: participant.createdAt,
});

export const serializeRosterEntry = (participant) => ({
  id: participant._id,
  displayName: participant.displayName,
  role: participant.role,
});

/** Shorter option shape for the single-option endpoints; no signed URL. */
export const serializeOptionSummary = (option) => ({
  id: option._id,
  boardId: option.boardId,
  createdBy: option.createdBy,
  title: option.title,
  notes: option.notes ?? null,
  link: option.link ?? null,
  photoKey: option.photoKey ?? null,
  locationId: option.locationId ?? null,
  likesCount: option.likesCount,
  dislikesCount: option.dislikesCount,
  commentCount: option.commentCount,
  createdAt: option.createdAt,
  updatedAt: option.updatedAt,
});

/**
 * Canonical option wire shape, shared by `GET /options` and the
 * `option:*` broadcasts so a card is identical whichever produced it.
 * `locationId` may arrive unpopulated (socket path) or populated (list path).
 */
export const serializeOption = async (option, { leadingIds = [], vote = null } = {}) => {
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
    isLeading: leadingIds.some((id) => id.toString() === populated._id.toString()),
    vote,
    createdAt: populated.createdAt,
    updatedAt: populated.updatedAt,
    photoUrl: populated.photoKey ? await getSignedPhotoUrl(populated.photoKey) : null,
    location: populated.locationId ?? null,
  };
};