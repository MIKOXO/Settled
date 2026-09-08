import { catchAsync } from '../utils/catchAsync.js';
import { signSessionToken, signRecoveryToken } from '../utils/tokens.js';
import { sendMagicLinkEmail } from '../utils/email.js';
import { createBoardSchema, updateBoardSchema } from '../validators/board.js';
import * as boardService from '../services/boardService.js';

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

export const createBoard = catchAsync(async (req, res) => {
  const input = createBoardSchema.parse(req.body);
  const { board, ownerId, inviteUrl } = await boardService.createBoard(input);

  const sessionToken = signSessionToken(ownerId, board._id, 'owner');
  setSessionCookie(res, sessionToken);

  const recoveryToken = signRecoveryToken(ownerId);
  sendMagicLinkEmail(input.creatorEmail, recoveryToken).catch(() => {});

  res.status(201).json({
    success: true,
    data: {
      board: {
        id: board._id,
        name: board.name,
        type: board.type ?? null,
        typeLabel: board.typeLabel ?? null,
        status: board.status,
        inviteToken: board.inviteToken,
        inviteUrl,
        decisionDeadline: board.decisionDeadline ?? null,
        optionsOwnerOnly: board.optionsOwnerOnly ?? false,
        createdAt: board.createdAt,
      },
      ownerId,
    },
    error: null,
  });
});

export const getBoardById = catchAsync(async (req, res) => {
  const board = await boardService.getBoardById(req.params.id);
  res.status(200).json({
    success: true,
    data: {
      id: board._id,
      name: board.name,
      type: board.type ?? null,
      typeLabel: board.typeLabel ?? null,
      status: board.status,
      inviteToken: board.inviteToken,
      decisionDeadline: board.decisionDeadline ?? null,
      optionsOwnerOnly: board.optionsOwnerOnly ?? false,
      createdAt: board.createdAt,
    },
    error: null,
  });
});

export const updateBoard = catchAsync(async (req, res) => {
  const patch = updateBoardSchema.parse(req.body);
  const board = await boardService.updateBoard(req.params.id, patch);
  res.status(200).json({
    success: true,
    data: {
      id: board._id,
      name: board.name,
      type: board.type ?? null,
      typeLabel: board.typeLabel ?? null,
      status: board.status,
      inviteToken: board.inviteToken,
      decisionDeadline: board.decisionDeadline ?? null,
      optionsOwnerOnly: board.optionsOwnerOnly ?? false,
      createdAt: board.createdAt,
    },
    error: null,
  });
});
