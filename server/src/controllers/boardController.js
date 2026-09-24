import { catchAsync } from '../utils/catchAsync.js';
import { signSessionToken, signRecoveryToken } from '../utils/tokens.js';
import { sendEmail } from '../utils/email.js';
import { buildBoardCreatedEmail } from '../utils/emailTemplates.js';
import { env } from '../config/env.js';
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
  const recoveryUrl = `${env.CLIENT_URL}/recover?token=${recoveryToken}`;
  const { subject, html, text } = buildBoardCreatedEmail({
    boardName: board.name,
    board: { type: board.type ?? null, typeLabel: board.typeLabel ?? null },
    inviteUrl,
    recoveryUrl,
  });
  sendEmail(input.creatorEmail, subject, html, text).catch(() => {});

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
        decidedOptionId: board.decidedOptionId?.toString() ?? null,
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
      decidedOptionId: board.decidedOptionId?.toString() ?? null,
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
      decidedOptionId: board.decidedOptionId?.toString() ?? null,
      createdAt: board.createdAt,
    },
    error: null,
  });
});

export const lockDecision = catchAsync(async (req, res) => {
  const { optionId } = req.body ?? {};
  const board = await boardService.lockDecision(req.params.id, optionId ?? null);
  res.status(200).json({
    success: true,
    data: {
      id: board._id,
      status: board.status,
      decidedOptionId: board.decidedOptionId?.toString() ?? null,
    },
    error: null,
  });
});

export const removeParticipant = catchAsync(async (req, res) => {
  const participant = await boardService.removeParticipant(
    req.params.id,
    req.params.participantId,
    req.participant.id,
  );
  res.status(200).json({
    success: true,
    data: { participantId: participant._id.toString() },
    error: null,
  });
});
