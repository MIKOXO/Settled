import mongoose from 'mongoose';
import { Board } from '../models/Board.js';
import { Participant } from '../models/Participant.js';
import { env } from '../config/env.js';

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
    const error = new Error('Board not found');
    error.status = 404;
    throw error;
  }
  return board;
};

export const updateBoard = async (boardId, patch) => {
  const updates = {};
  if (patch.name !== undefined) updates.name = patch.name;
  if (patch.type !== undefined) updates.type = patch.type;

  const board = await Board.findByIdAndUpdate(boardId, updates, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!board) {
    const error = new Error('Board not found');
    error.status = 404;
    throw error;
  }
  return board;
};
