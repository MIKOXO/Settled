import { catchAsync } from '../utils/catchAsync.js';
import { ok } from '../utils/respond.js';
import { verifySessionToken } from '../utils/tokens.js';
import { readSessionToken, setSessionCookie } from '../utils/session.js';
import { serializeParticipant, serializeRosterEntry } from '../utils/serialize.js';
import {
  joinBoardSchema,
  recoverRequestSchema,
  recoverSchema,
} from '../validators/participant.js';
import * as participantService from '../services/participantService.js';

const boardSummary = (board) => ({
  id: board._id,
  name: board.name,
  type: board.type ?? null,
  typeLabel: board.typeLabel ?? null,
  status: board.status,
  decisionDeadline: board.decisionDeadline ?? null,
});

export const getMe = catchAsync(async (req, res) => {
  const { participant, board } = await participantService.getMe(req.participant.id);

  return ok(res, {
    participant: {
      id: participant._id,
      displayName: participant.displayName,
      role: participant.role,
    },
    board: board
      ? { id: board._id, name: board.name, type: board.type ?? null, status: board.status }
      : null,
  });
});

export const joinBoard = catchAsync(async (req, res) => {
  const input = joinBoardSchema.parse(req.body);

  // An existing session on this device means a re-join, not a new participant.
  // An unreadable cookie is indistinguishable from having no session at all.
  let existingParticipantId = null;
  try {
    existingParticipantId = verifySessionToken(readSessionToken(req)).sub;
  } catch {
    existingParticipantId = null;
  }

  const result = await participantService.joinBoard(
    req.params.inviteToken,
    input,
    existingParticipantId,
  );
  setSessionCookie(res, result.token);

  return ok(
    res,
    {
      participant: serializeParticipant(result.participant),
      board: boardSummary(result.board),
      token: result.token,
      existing: result.existing,
    },
    result.existing ? 200 : 201,
  );
});

export const recoverRequest = catchAsync(async (req, res) => {
  const { email } = recoverRequestSchema.parse(req.body);
  await participantService.recoverRequest(email);
  // Deliberately identical whether or not the address matches a board (NFR7).
  return ok(res);
});

export const recover = catchAsync(async (req, res) => {
  const { token } = recoverSchema.parse(req.body);
  const result = await participantService.recover(token);
  setSessionCookie(res, result.token);

  return ok(res, {
    participant: serializeParticipant(result.participant),
    board: boardSummary(result.board),
    token: result.token,
  });
});

export const listBoardParticipants = catchAsync(async (req, res) => {
  const { participants } = await participantService.listBoardParticipants(req.params.boardId);
  return ok(res, { participants: participants.map(serializeRosterEntry) });
});

export const claimOwnership = catchAsync(async (req, res) => {
  const result = await participantService.claimOwnership(req.participant.id, req.params.id);

  return ok(res, {
    board: boardSummary(result.board),
    newOwner: serializeParticipant(result.newOwner),
  });
});