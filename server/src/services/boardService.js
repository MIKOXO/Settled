import mongoose from 'mongoose';
import { Board } from '../models/Board.js';
import { Participant } from '../models/Participant.js';
import { env } from '../config/env.js';
import { createAppError } from '../utils/AppError.js';
import { pickDefined } from '../utils/pickDefined.js';
import {
  emitBoardDecided,
  emitParticipantRemoved,
  emitBoardUpdated,
} from '../sockets/boardEmitter.js';

const getBoardOr404 = async (boardId) => {
  const board = await Board.findById(boardId);
  if (!board) {
    throw createAppError('Board not found', 404);
  }
  return board;
};

export const createBoard = async (input) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // The owner is created first so the board can point at them; their boardId is
    // backfilled once the board exists, which is why this runs as a transaction.
    const [owner] = await Participant.create(
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

    const [board] = await Board.create(
      [
        pickDefined({
          name: input.name,
          type: input.type,
          typeLabel: input.typeLabel,
          decisionDeadline: input.decisionDeadline,
          ownerId: owner._id,
          inviteToken: Board.generateInviteToken(),
        }),
      ],
      { session },
    );

    owner.boardId = board._id;
    await owner.save({ session });

    await session.commitTransaction();

    return {
      board,
      ownerId: owner._id,
      inviteUrl: `${env.CLIENT_URL}/join/${board.inviteToken}`,
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const getBoardById = (boardId) => getBoardOr404(boardId);

export const updateBoard = async (boardId, patch) => {
  const updates = pickDefined(patch);
  const board = await Board.findByIdAndUpdate(boardId, updates, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!board) {
    throw createAppError('Board not found', 404);
  }

  // Broadcast only after the write lands, and only for the keys that were
  // actually persisted (invariant 5). Clients merge the partial, so nothing
  // unrelated can be clobbered by the broadcast.
  const confirmed = Object.fromEntries(
    Object.keys(updates).map((key) => [key, board[key] ?? null]),
  );
  emitBoardUpdated(boardId, confirmed);

  return board;
};

export const lockDecision = async (boardId, optionId = null) => {
  // Re-locking without an option keeps whatever was already decided rather than
  // clearing it, so `decidedOptionId` is only touched when one was supplied.
  const updates = { status: 'decided' };
  if (optionId) updates.decidedOptionId = optionId;

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

  const participant = await Participant.findOneAndDelete({ _id: participantId, boardId });
  if (!participant) {
    throw createAppError('Participant not found', 404);
  }

  // Votes and comments stay as historical record — only the person is removed.
  emitParticipantRemoved(boardId, { participantId });

  return participant;
};