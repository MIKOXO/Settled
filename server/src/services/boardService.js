import mongoose from 'mongoose';
import { Board } from '../models/Board.js';
import { Participant } from '../models/Participant.js';
import { env } from '../config/env.js';
import { createAppError } from '../utils/AppError.js';
import { emitBoardDecided, emitParticipantRemoved } from '../sockets/boardEmitter.js';

export const createBoard = async (input) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const owner = await Participant.create(
      [
        {
          displayName: input.creatorDisplayName,
          email: input.creatorEmail,
          role: 'owner',
          lastActiveAt: new Date(),
        },
      ],
      { session },
    );
    const ownerDoc = owner[0];

    const board = await Board.create(
      [
        {
          name: input.name,
          ...(input.type ? { type: input.type } : {}),
          ...(input.typeLabel ? { typeLabel: input.typeLabel } : {}),
          ownerId: ownerDoc._id,
          inviteToken: Board.generateInviteToken(),
          ...(input.decisionDeadline ? { decisionDeadline: input.decisionDeadline } : {}),
        },
      ],
      { session },
    );
    const boardDoc = board[0];

    ownerDoc.boardId = boardDoc._id;
    await ownerDoc.save({ session });

    await session.commitTransaction();

    const inviteUrl = `${env.CLIENT_URL}/join/${boardDoc.inviteToken}`;

    return {
      board: boardDoc,
      ownerId: ownerDoc._id,
      inviteUrl,
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const getBoardById = async (boardId) => {
  const board = await Board.findById(boardId);
  if (!board) {
    throw createAppError('Board not found', 404);
  }
  return board;
};

export const updateBoard = async (boardId, patch) => {
  const updates = {};
  if (patch.name !== undefined) updates.name = patch.name;
  if (patch.type !== undefined) updates.type = patch.type;
  if (patch.typeLabel !== undefined) updates.typeLabel = patch.typeLabel;
  if (patch.optionsOwnerOnly !== undefined) updates.optionsOwnerOnly = patch.optionsOwnerOnly;

  const board = await Board.findByIdAndUpdate(boardId, updates, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!board) {
    throw createAppError('Board not found', 404);
  }
  return board;
};

export const lockDecision = async (boardId, optionId = null) => {
  const updates = { status: 'decided' };
  if (optionId) {
    updates.decidedOptionId = optionId;
  }

  const board = await Board.findByIdAndUpdate(boardId, updates, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!board) {
    throw createAppError('Board not found', 404);
  }

  emitBoardDecided(boardId, { decidedOptionId: board.decidedOptionId?.toString() ?? null });

  return board;
};

export const removeParticipant = async (boardId, participantId, ownerId) => {
  if (participantId === ownerId) {
    throw createAppError('Cannot remove yourself', 400);
  }

  const participant = await Participant.findOneAndDelete({
    _id: participantId,
    boardId,
  });
  if (!participant) {
    throw createAppError('Participant not found', 404);
  }

  emitParticipantRemoved(boardId, { participantId });

  return participant;
};
