import { Schema, model } from 'mongoose';

import { objectId, timestamps } from './schemaHelpers.js';

const participantLocationSchema = new Schema(
  {
    participantId: objectId('Participant', { required: true, unique: true }),
    boardId: objectId('Board', { required: true, index: true }),
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    label: { type: String, trim: true },
  },
  timestamps(false),
);

export const ParticipantLocation = model('ParticipantLocation', participantLocationSchema);