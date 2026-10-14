import { Board } from '../models/Board.js';
import { createAppError } from './AppError.js';

// WHEN a write is allowed: once the owner locks a decision, new votes, options
// and comments can't change the outcome, so they're refused rather than
// silently accepted. Availability and participant locations stay open — they
// remain useful after the decision.
export const assertBoardOpen = (board) => {
  if (board?.status === 'decided') {
    throw createAppError("This board's decision has already been locked.", 403);
  }
};

// Same gate for the vote/comment paths, which reach the board through an option.
export const assertOptionBoardOpen = async (option) => {
  if (!option) return;
  const board = await Board.findById(option.boardId).select('status');
  assertBoardOpen(board);
};