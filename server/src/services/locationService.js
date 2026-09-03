import { Board } from '../models/Board.js';
import { Participant } from '../models/Participant.js';
import { ParticipantLocation } from '../models/ParticipantLocation.js';
import { Location } from '../models/Location.js';
import { Option } from '../models/Option.js';
import { createAppError } from '../utils/AppError.js';
import { emitLocationUpdated, emitLocationRemoved } from '../sockets/locationEmitter.js';

const requireBoardMembership = async (participantId, boardId) => {
  const board = await Board.findById(boardId);
  if (!board) throw createAppError('Board not found', 404);

  const participant = await Participant.findOne({ _id: participantId, boardId });
  if (!participant) throw createAppError('Participant not found on this board', 403);

  return { board, participant };
};

export const upsertLocation = async (participantId, boardId, { lat, lng, label }) => {
  await requireBoardMembership(participantId, boardId);

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
  await requireBoardMembership(participantId, boardId);

  const location = await ParticipantLocation.findOneAndDelete({ participantId, boardId });

  if (location) {
    emitLocationRemoved(boardId, {
      participantId: location.participantId,
    });
  }

  return { removed: !!location };
};

export const listLocations = async (boardId, participantId) => {
  await requireBoardMembership(participantId, boardId);

  const [participantLocations, optionsWithLocation] = await Promise.all([
    ParticipantLocation.find({ boardId })
      .select('participantId lat lng label')
      .lean(),
    Option.find({ boardId, locationId: { $ne: null } })
      .select('locationId')
      .populate({
        path: 'locationId',
        select: 'lat lng placeName',
      })
      .lean(),
  ]);

  const optionLocations = optionsWithLocation
    .filter((o) => o.locationId)
    .map((o) => ({
      lat: o.locationId.lat,
      lng: o.locationId.lng,
      placeName: o.locationId.placeName ?? null,
    }));

  return { participantLocations, optionLocations };
};
