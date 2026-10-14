import { AvailabilitySlot } from '../models/AvailabilitySlot.js';
import { findBoardForParticipant } from '../utils/membership.js';
import { emitAvailabilityUpdated, emitAvailabilityRemoved } from '../sockets/availabilityEmitter.js';

const normalizeToMidnightUtc = (dateStr) => {
  const date = new Date(dateStr);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
};

export const upsertAvailability = async (participantId, boardId, { date, status }) => {
  await findBoardForParticipant(participantId, boardId);

  const slot = await AvailabilitySlot.findOneAndUpdate(
    { boardId, participantId, date: normalizeToMidnightUtc(date) },
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

export const removeAvailability = async (participantId, boardId, { date }) => {
  await findBoardForParticipant(participantId, boardId);

  const normalizedDate = normalizeToMidnightUtc(date);

  // Idempotent: a missing slot is still a success, so a double-tap can't error.
  await AvailabilitySlot.findOneAndDelete({ boardId, participantId, date: normalizedDate });

  emitAvailabilityRemoved(boardId, { participantId, date: normalizedDate });

  return { date: normalizedDate };
};

export const listAvailability = async (boardId, participantId) => {
  await findBoardForParticipant(participantId, boardId);

  const slots = await AvailabilitySlot.find({ boardId })
    .select('participantId date status')
    .lean();

  return { slots };
};