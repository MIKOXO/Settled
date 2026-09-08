import { Board } from '../models/Board.js';
import { Participant } from '../models/Participant.js';
import { createAppError } from '../utils/AppError.js';
import { verifyToken, signSessionToken, signRecoveryToken } from '../utils/tokens.js';
import { sendMagicLinkEmail } from '../utils/email.js';

const INACTIVITY_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

export const getMe = async (participantId) => {
  const participant = await Participant.findById(participantId)
    .select('displayName email role boardId lastActiveAt createdAt')
    .lean();

  if (!participant) {
    throw createAppError('Participant not found', 404);
  }

  let board = null;
  if (participant.boardId) {
    board = await Board.findById(participant.boardId)
      .select('name type status')
      .lean();
  }

  return { participant, board };
};

export const joinBoard = async (inviteToken, input, existingParticipantId = null) => {
  const board = await Board.findOne({ inviteToken });
  if (!board) {
    throw createAppError('Invalid invite link', 404);
  }

  let participant = null;
  if (existingParticipantId) {
    participant = await Participant.findOne({
      _id: existingParticipantId,
      boardId: board._id,
    });
  }

  if (participant) {
    const token = signSessionToken(participant._id, board._id, participant.role);
    return { participant, board, token, existing: true };
  }

  participant = await Participant.create({
    boardId: board._id,
    displayName: input.displayName,
    email: input.email.toLowerCase(),
    role: 'member',
    lastActiveAt: new Date(),
  });

  const token = signSessionToken(participant._id, board._id, 'member');

  return { participant, board, token, existing: false };
};

export const recoverRequest = async (email) => {
  const participant = await Participant.findOne({ email: email.toLowerCase() });
  if (participant) {
    const recoveryToken = signRecoveryToken(participant._id);
    sendMagicLinkEmail(email, recoveryToken).catch(() => {});
  }
};

export const recover = async (token) => {
  const payload = verifyToken(token);
  if (payload.type !== 'recovery') {
    throw createAppError('Invalid recovery token', 401);
  }

  const participant = await Participant.findById(payload.sub);
  if (!participant) {
    throw createAppError('Participant not found', 404);
  }

  const board = await Board.findById(participant.boardId);
  if (!board) {
    throw createAppError('Board not found', 404);
  }

  const sessionToken = signSessionToken(participant._id, board._id, participant.role);

  participant.lastActiveAt = new Date();
  await participant.save();

  return { participant, board, token: sessionToken };
};

export const claimOwnership = async (participantId, boardId) => {
  const board = await Board.findById(boardId);
  if (!board) {
    throw createAppError('Board not found', 404);
  }

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

  const now = new Date();
  const lastActive = currentOwner.lastActiveAt ?? currentOwner.createdAt;
  if (now - lastActive < INACTIVITY_THRESHOLD_MS) {
    throw createAppError(
      'Current owner is still active — ownership cannot be claimed yet',
      403,
    );
  }

  const newOwner = await Participant.findById(participantId);
  if (!newOwner || newOwner.boardId.toString() !== boardId) {
    throw createAppError('Participant not found on this board', 404);
  }

  currentOwner.role = 'member';
  await currentOwner.save();

  newOwner.role = 'owner';
  await newOwner.save();

  board.ownerId = participantId;
  await board.save();

  return { board, newOwner, previousOwner: currentOwner };
};
