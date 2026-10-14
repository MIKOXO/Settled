import { catchAsync } from '../utils/catchAsync.js';
import { ok } from '../utils/respond.js';
import { signSessionToken, signBoardWelcomeToken } from '../utils/tokens.js';
import { setSessionCookie } from '../utils/session.js';
import { sendEmail } from '../utils/email.js';
import { buildBoardCreatedEmail } from '../utils/emailTemplates.js';
import { serializeBoard } from '../utils/serialize.js';
import { env } from '../config/env.js';
import { createBoardSchema, updateBoardSchema } from '../validators/board.js';
import * as boardService from '../services/boardService.js';

export const createBoard = catchAsync(async (req, res) => {
  const input = createBoardSchema.parse(req.body);
  const { board, ownerId, inviteUrl } = await boardService.createBoard(input);

  setSessionCookie(res, signSessionToken(ownerId, board._id, 'owner'));

  // Receipt, not authentication — it is fire-and-forget and never blocks the
  // response or fails the request.
  const welcomeUrl = `${env.CLIENT_URL}/recover/confirm?token=${signBoardWelcomeToken(ownerId)}`;
  const { subject, html, text } = buildBoardCreatedEmail({
    boardName: board.name,
    board: { type: board.type ?? null, typeLabel: board.typeLabel ?? null },
    inviteUrl,
    welcomeUrl,
  });
  sendEmail(input.creatorEmail, subject, html, text).catch(() => {});

  return ok(res, { board: { ...serializeBoard(board), inviteUrl }, ownerId }, 201);
});

export const getBoardById = catchAsync(async (req, res) =>
  ok(res, serializeBoard(await boardService.getBoardById(req.params.id))));

export const updateBoard = catchAsync(async (req, res) => {
  const patch = updateBoardSchema.parse(req.body);
  return ok(res, serializeBoard(await boardService.updateBoard(req.params.id, patch)));
});

export const lockDecision = catchAsync(async (req, res) => {
  const { optionId } = req.body ?? {};
  const board = await boardService.lockDecision(req.params.id, optionId ?? null);

  return ok(res, {
    id: board._id,
    status: board.status,
    decidedOptionId: board.decidedOptionId?.toString() ?? null,
  });
});

export const removeParticipant = catchAsync(async (req, res) => {
  const participant = await boardService.removeParticipant(
    req.params.id,
    req.params.participantId,
    req.participant.id,
  );

  return ok(res, { participantId: participant._id.toString() });
});