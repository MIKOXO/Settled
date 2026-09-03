import { AvailabilitySlot } from '../models/AvailabilitySlot.js';
import { Board } from '../models/Board.js';
import { Participant } from '../models/Participant.js';
import { createAppError } from '../utils/AppError.js';
import { emitAvailabilityUpdated } from '../sockets/availabilityEmitter.js';

const normalizeToMidnightUtc = (dateStr) => {
  const d = new Date(dateStr);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

export const upsertAvailability = async (participantId, boardId, { date, status }) => {
  const board = await Board.findById(boardId);
  if (!board) {
    throw createAppError('Board not found', 404);
  }

  const participant = await Participant.findOne({ _id: participantId, boardId });
  if (!participant) {
    throw createAppError('Participant not found on this board', 403);
  }

  const normalizedDate = normalizeToMidnightUtc(date);

  const slot = await AvailabilitySlot.findOneAndUpdate(
    { boardId, participantId, date: normalizedDate },
    { status },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );

  emitAvailabilityUpdated(boardId, {
    participantId: slot.participantId,
    date: slot.date,
    status: slot.status,
  });

  return { slot };
};

export const listAvailability = async (boardId, participantId) => {
  const board = await Board.findById(boardId);
  if (!board) {
    throw createAppError('Board not found', 404);
  }

  const participant = await Participant.findOne({ _id: participantId, boardId });
  if (!participant) {
    throw createAppError('Participant not found on this board', 403);
  }

  const slots = await AvailabilitySlot.find({ boardId })
    .select('participantId date status')
    .lean();

  return { slots };
};
