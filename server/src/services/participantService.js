import { Board } from '../models/Board.js';
import { Participant } from '../models/Participant.js';
import { createAppError } from '../utils/AppError.js';
import { verifyToken, signSessionToken, signRecoveryToken } from '../utils/tokens.js';
import { sendEmail } from '../utils/email.js';
import { buildRecoveryEmail } from '../utils/emailTemplates.js';
import { serializeRosterEntry } from '../utils/serialize.js';
import { emitParticipantAdded } from '../sockets/boardEmitter.js';
import { env } from '../config/env.js';

const INACTIVITY_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

const getBoardOr404 = async (boardId) => {
  const board = await Board.findById(boardId);
  if (!board) {
    throw createAppError('Board not found', 404);
  }
  return board;
};

/** Fire-and-forget presence ping; a failed write must never fail the request. */
export const touchLastActive = (participantId) => {
  Participant.findByIdAndUpdate(participantId, { lastActiveAt: new Date() })
    .exec()
    .catch(() => {});
};

export const getMe = async (participantId) => {
  const participant = await Participant.findById(participantId)
    .select('displayName email role boardId lastActiveAt createdAt')
    .lean();

  if (!participant) {
    throw createAppError('Participant not found', 404);
  }

  const board = participant.boardId
    ? await Board.findById(participant.boardId).select('name type status').lean()
    : null;

  return { participant, board };
};

export const joinBoard = async (inviteToken, input, existingParticipantId = null) => {
  const board = await Board.findOne({ inviteToken });
  if (!board) {
    throw createAppError('Invalid invite link', 404);
  }

  // Re-joining from the same session returns the existing participant rather than
  // creating a duplicate (accepted MVP tradeoff: no invite is single-use).
  const existing = existingParticipantId
    ? await Participant.findOne({ _id: existingParticipantId, boardId: board._id })
    : null;

  if (existing) {
    return {
      participant: existing,
      board,
      token: signSessionToken(existing._id, board._id, existing.role),
      existing: true,
    };
  }

  const participant = await Participant.create({
    boardId: board._id,
    displayName: input.displayName,
    email: input.email.toLowerCase(),
    role: 'member',
    lastActiveAt: new Date(),
  });

  // Announced only after the write lands, so the socket reports confirmed state
  // rather than intent (invariant 5). A re-join returns above without emitting —
  // nothing changed for anyone else to see. The joiner isn't in the board room
  // yet (their socket connects once the board page hydrates), so this never
  // echoes back to the person who just joined.
  emitParticipantAdded(board._id, serializeRosterEntry(participant));

  return {
    participant,
    board,
    token: signSessionToken(participant._id, board._id, 'member'),
    existing: false,
  };
};

export const recoverRequest = async (email) => {
  const participants = await Participant.find({ email: email.toLowerCase() })
    .populate('boardId', 'name type typeLabel')
    .lean();

  // One email goes out per board the address is attached to — an arbitrary
  // single board would lock the user out of the rest.
  const boards = participants
    .filter((participant) => participant.boardId)
    .map((participant) => ({
      name: participant.boardId.name,
      type: participant.boardId.type ?? null,
      typeLabel: participant.boardId.typeLabel ?? null,
      url: `${env.CLIENT_URL}/recover/confirm?token=${signRecoveryToken(participant._id)}`,
    }));

  if (boards.length === 0) return;

  const { subject, html, text } = buildRecoveryEmail({ boards });
  sendEmail(email, subject, html, text).catch(() => {});
};

export const recover = async (token) => {
  const payload = verifyToken(token);
  if (payload.type !== 'recovery' && payload.type !== 'welcome') {
    throw createAppError('Invalid recovery token', 401);
  }

  const participant = await Participant.findById(payload.sub);
  if (!participant) {
    throw createAppError('Participant not found', 404);
  }

  const board = await getBoardOr404(participant.boardId);

  participant.lastActiveAt = new Date();
  await participant.save();

  return {
    participant,
    board,
    token: signSessionToken(participant._id, board._id, participant.role),
  };
};

export const listBoardParticipants = async (boardId) => {
  await getBoardOr404(boardId);
  const participants = await Participant.find({ boardId })
    .select('displayName role')
    .lean();

  return { participants };
};

/**
 * Transfers ownership rather than creating a second owner, so the exactly-one-
 * owner invariant holds. Only reachable once the incumbent has been inactive
 * past the threshold and the board is still undecided.
 */
export const claimOwnership = async (participantId, boardId) => {
  const board = await getBoardOr404(boardId);

  if (board.status !== 'open') {
    throw createAppError('Board is no longer open', 403);
  }

  if (board.ownerId.toString() === participantId) {
    throw createAppError('You are already the owner', 403);
  }

  const currentOwner = await Participant.findById(board.ownerId);
  if (!currentOwner) {
    throw createAppError('Current owner not found', 404);
  }

  const lastActive = currentOwner.lastActiveAt ?? currentOwner.createdAt;
  if (Date.now() - lastActive < INACTIVITY_THRESHOLD_MS) {
    throw createAppError(
      'Current owner is still active — ownership cannot be claimed yet',
      403,
    );
  }

  const newOwner = await Participant.findById(participantId);
  if (!newOwner || newOwner.boardId?.toString() !== boardId) {
    throw createAppError('Participant not found on this board', 404);
  }

  currentOwner.role = 'member';
  await currentOwner.save();

  newOwner.role = 'owner';
  await newOwner.save();

  board.ownerId = newOwner._id;
  await board.save();

  return { board, newOwner, previousOwner: currentOwner };
};