import { catchAsync } from '../utils/catchAsync.js';
import { upsertAvailabilitySchema } from '../validators/availability.js';
import * as availabilityService from '../services/availabilityService.js';

export const upsertAvailability = catchAsync(async (req, res) => {
  const input = upsertAvailabilitySchema.parse(req.body);
  const { slot } = await availabilityService.upsertAvailability(
    req.participant.id,
    req.params.boardId,
    input,
  );
  res.status(200).json({
    success: true,
    data: {
      slot: {
        id: slot._id,
        boardId: slot.boardId,
        participantId: slot.participantId,
        date: slot.date,
        status: slot.status,
      },
    },
    error: null,
  });
});

export const listAvailability = catchAsync(async (req, res) => {
  const { slots } = await availabilityService.listAvailability(
    req.params.boardId,
    req.participant.id,
  );
  res.status(200).json({
    success: true,
    data: {
      slots: slots.map((s) => ({
        id: s._id,
        participantId: s.participantId,
        date: s.date,
        status: s.status,
      })),
    },
    error: null,
  });
});
