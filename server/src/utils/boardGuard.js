import { Board } from '../models/Board.js';
import { createAppError } from './AppError.js';

// Shared gate for every mutation that feeds the decision itself (votes, new
// options, new comments). Once the owner locks a decision, new signal can't
// change the outcome, so these writes are refused rather than silently
// accepted-and-ignored.
//
// Deliberately NOT applied to availability or participant location — those are
// personal logistics that stay useful after the decision — nor to option
// edit/delete, re-locking, or board settings.
//
// A missing board is left to the caller (only createOption's route resolves a
// board at all; the others reach it via an option), so this stays a pure
// status check rather than a second 404 path.
export const assertBoardOpen = (board) => {
  if (board?.status === 'decided') {
    throw createAppError("This board's decision has already been locked.", 403);
  }
};

// Same gate for the vote/comment paths, which arrive holding an option and
// have to reach the board through it. Keeps the status check itself in one
// place rather than duplicating it per service.
export const assertOptionBoardOpen = async (option) => {
  if (!option) return;
  const board = await Board.findById(option.boardId).select('status');
  assertBoardOpen(board);
};