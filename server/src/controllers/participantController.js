import { catchAsync } from '../utils/catchAsync.js';
import { verifyToken } from '../utils/tokens.js';
import { joinBoardSchema, recoverRequestSchema, recoverSchema } from '../validators/participant.js';
import * as participantService from '../services/participantService.js';

const SESSION_COOKIE = 'session';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const setSessionCookie = (res, token) => {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: THIRTY_DAYS_MS,
  });
};

export const getMe = catchAsync(async (req, res) => {
  const { participant, board } = await participantService.getMe(req.participant.id);
  res.status(200).json({
    success: true,
    data: {
      participant: {
        id: participant._id,
        displayName: participant.displayName,
        role: participant.role,
      },
      board: board
        ? { id: board._id, name: board.name, type: board.type ?? null, status: board.status }
        : null,
    },
    error: null,
  });
});

const participantData = (participant) => ({
  id: participant._id,
  displayName: participant.displayName,
  email: participant.email,
  role: participant.role,
  lastActiveAt: participant.lastActiveAt ?? null,
  createdAt: participant.createdAt,
});

const boardData = (board) => ({
  id: board._id,
  name: board.name,
  type: board.type ?? null,
  status: board.status,
  decisionDeadline: board.decisionDeadline ?? null,
});

export const joinBoard = catchAsync(async (req, res) => {
  const input = joinBoardSchema.parse(req.body);

  const token = req.cookies?.[SESSION_COOKIE];
  let payload = null;
  try {
    const candidate = token ? verifyToken(token) : null;
    if (candidate?.type === 'session') payload = candidate;
  } catch {
    payload = null;
  }

  const existingParticipantId = payload?.sub ?? null;

  const result = await participantService.joinBoard(req.params.inviteToken, input, existingParticipantId);
  setSessionCookie(res, result.token);
  res.status(result.existing ? 200 : 201).json({
    success: true,
    data: {
      participant: participantData(result.participant),
      board: boardData(result.board),
      token: result.token,
      existing: result.existing,
    },
    error: null,
  });
});

export const recoverRequest = catchAsync(async (req, res) => {
  const { email } = recoverRequestSchema.parse(req.body);
  await participantService.recoverRequest(email);
  res.status(200).json({
    success: true,
    data: null,
    error: null,
  });
});

export const recover = catchAsync(async (req, res) => {
  const { token } = recoverSchema.parse(req.body);
  const result = await participantService.recover(token);
  setSessionCookie(res, result.token);
  res.status(200).json({
    success: true,
    data: {
      participant: participantData(result.participant),
      board: boardData(result.board),
      token: result.token,
    },
    error: null,
  });
});

export const claimOwnership = catchAsync(async (req, res) => {
  const result = await participantService.claimOwnership(req.participant.id, req.params.id);
  res.status(200).json({
    success: true,
    data: {
      board: boardData(result.board),
      newOwner: participantData(result.newOwner),
    },
    error: null,
  });
});
