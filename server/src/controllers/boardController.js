import { asyncHandler } from '../utils/asyncHandler.js';
import { createBoardSchema, updateBoardSchema } from '../validators/board.js';
import * as boardService from '../services/boardService.js';

export const createBoard = asyncHandler(async (req, res) => {
  const input = createBoardSchema.parse(req.body);
  const { board, ownerId, inviteUrl } = await boardService.createBoard(input);
  res.status(201).json({
    success: true,
    data: {
      board: {
        id: board._id,
        name: board.name,
        type: board.type ?? null,
        status: board.status,
        inviteToken: board.inviteToken,
        inviteUrl,
        decisionDeadline: board.decisionDeadline ?? null,
        createdAt: board.createdAt,
      },
      ownerId,
    },
    error: null,
  });
});

export const getBoardById = asyncHandler(async (req, res) => {
  const board = await boardService.getBoardById(req.params.id);
  res.status(200).json({
    success: true,
    data: {
      id: board._id,
      name: board.name,
      type: board.type ?? null,
      status: board.status,
      inviteToken: board.inviteToken,
      decisionDeadline: board.decisionDeadline ?? null,
      createdAt: board.createdAt,
    },
    error: null,
  });
});

export const updateBoard = asyncHandler(async (req, res) => {
  const patch = updateBoardSchema.parse(req.body);
  const board = await boardService.updateBoard(req.params.id, patch);
  res.status(200).json({
    success: true,
    data: {
      id: board._id,
      name: board.name,
      type: board.type ?? null,
      status: board.status,
      inviteToken: board.inviteToken,
      decisionDeadline: board.decisionDeadline ?? null,
      createdAt: board.createdAt,
    },
    error: null,
  });
});
