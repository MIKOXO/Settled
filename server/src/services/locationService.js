import { ParticipantLocation } from '../models/ParticipantLocation.js';
import { Option } from '../models/Option.js';
import { findBoardForParticipant } from '../utils/membership.js';
import { emitLocationUpdated, emitLocationRemoved } from '../sockets/locationEmitter.js';

export const upsertLocation = async (participantId, boardId, { lat, lng, label }) => {
  await findBoardForParticipant(participantId, boardId);

  // Opt-in only: the document existing is the consent. Nothing here records a
  // per-tier visibility, and a location is never returned to anyone but the board.
  const location = await ParticipantLocation.findOneAndUpdate(
    { participantId, boardId },
    { lat, lng, label: label ?? undefined },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );

  emitLocationUpdated(boardId, {
    participantId: location.participantId,
    lat: location.lat,
    lng: location.lng,
    label: location.label ?? null,
  });

  return { location };
};

export const removeLocation = async (participantId, boardId) => {
  await findBoardForParticipant(participantId, boardId);

  const location = await ParticipantLocation.findOneAndDelete({ participantId, boardId });

  if (location) {
    emitLocationRemoved(boardId, { participantId: location.participantId });
  }

  return { removed: Boolean(location) };
};

export const listLocations = async (boardId, participantId) => {
  await findBoardForParticipant(participantId, boardId);

  const [participantLocations, optionLocations] = await Promise.all([
    ParticipantLocation.find({ boardId })
      .select('participantId lat lng label')
      .lean(),
    Option.find({ boardId, locationId: { $ne: null } })
      .select('locationId')
      .populate({ path: 'locationId', select: 'lat lng placeName' })
      .lean(),
  ]);

  return {
    participantLocations,
    optionLocations: optionLocations
      .filter((option) => option.locationId)
      .map((option) => ({
        optionId: option._id.toString(),
        lat: option.locationId.lat,
        lng: option.locationId.lng,
        placeName: option.locationId.placeName ?? null,
      })),
  };
};