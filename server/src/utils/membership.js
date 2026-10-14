import { Board } from '../models/Board.js';
import { Participant } from '../models/Participant.js';
import { createAppError } from './AppError.js';

export const assertParticipantOnBoard = async (participantId, boardId) => {
  const member = await Participant.exists({ _id: participantId, boardId });
  if (!member) {
    throw createAppError('Participant not found on this board', 403);
  }
};

export const findBoardForParticipant = async (participantId, boardId) => {
  const board = await Board.findById(boardId);
  if (!board) {
    throw createAppError('Board not found', 404);
  }

  await assertParticipantOnBoard(participantId, board._id);

  return board;
};