import { catchAsync } from '../utils/catchAsync.js';
import { ok } from '../utils/respond.js';
import {
  removeAvailabilitySchema,
  upsertAvailabilitySchema,
} from '../validators/availability.js';
import * as availabilityService from '../services/availabilityService.js';

export const upsertAvailability = catchAsync(async (req, res) => {
  const input = upsertAvailabilitySchema.parse(req.body);
  const { slot } = await availabilityService.upsertAvailability(
    req.participant.id,
    req.params.boardId,
    input,
  );

  return ok(res, {
    slot: {
      id: slot._id,
      boardId: slot.boardId,
      participantId: slot.participantId,
      date: slot.date,
      status: slot.status,
    },
  });
});

export const removeAvailability = catchAsync(async (req, res) => {
  const input = removeAvailabilitySchema.parse({ date: req.params.date });
  await availabilityService.removeAvailability(
    req.participant.id,
    req.params.boardId,
    input,
  );
  return ok(res, { removed: true });
});

export const listAvailability = catchAsync(async (req, res) => {
  const { slots } = await availabilityService.listAvailability(
    req.params.boardId,
    req.participant.id,
  );

  return ok(res, {
    slots: slots.map((slot) => ({
      id: slot._id,
      participantId: slot.participantId,
      date: slot.date,
      status: slot.status,
    })),
  });
});