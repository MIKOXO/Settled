import { catchAsync } from '../utils/catchAsync.js';
import { upsertLocationSchema } from '../validators/location.js';
import * as locationService from '../services/locationService.js';

export const upsertLocation = catchAsync(async (req, res) => {
  const input = upsertLocationSchema.parse(req.body);
  const { location } = await locationService.upsertLocation(
    req.participant.id,
    req.params.boardId,
    input,
  );
  res.status(200).json({
    success: true,
    data: {
      participantId: location.participantId,
      lat: location.lat,
      lng: location.lng,
      label: location.label ?? null,
    },
    error: null,
  });
});

export const removeLocation = catchAsync(async (req, res) => {
  await locationService.removeLocation(req.participant.id, req.params.boardId);
  res.status(200).json({
    success: true,
    data: null,
    error: null,
  });
});

export const listLocations = catchAsync(async (req, res) => {
  const { participantLocations, optionLocations } = await locationService.listLocations(
    req.params.boardId,
    req.participant.id,
  );
  res.status(200).json({
    success: true,
    data: { participantLocations, optionLocations },
    error: null,
  });
});
