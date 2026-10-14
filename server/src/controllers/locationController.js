import { catchAsync } from '../utils/catchAsync.js';
import { ok } from '../utils/respond.js';
import { upsertLocationSchema } from '../validators/location.js';
import * as locationService from '../services/locationService.js';

export const upsertLocation = catchAsync(async (req, res) => {
  const input = upsertLocationSchema.parse(req.body);
  const { location } = await locationService.upsertLocation(
    req.participant.id,
    req.params.boardId,
    input,
  );

  return ok(res, {
    participantId: location.participantId,
    lat: location.lat,
    lng: location.lng,
    label: location.label ?? null,
  });
});

export const removeLocation = catchAsync(async (req, res) => {
  await locationService.removeLocation(req.participant.id, req.params.boardId);
  return ok(res);
});

export const listLocations = catchAsync(async (req, res) => {
  const result = await locationService.listLocations(req.params.boardId, req.participant.id);
  return ok(res, result);
});