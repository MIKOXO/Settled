import { Schema, model } from 'mongoose';

import { objectId, timestamps } from './schemaHelpers.js';

const availabilitySlotSchema = new Schema(
  {
    boardId: objectId('Board', { required: true, index: true }),
    participantId: objectId('Participant', { required: true }),
    date: { type: Date, required: true },
    status: { type: String, enum: ['free', 'busy'], required: true },
  },
  timestamps(false),
);

availabilitySlotSchema.index(
  { boardId: 1, participantId: 1, date: 1 },
  { unique: true },
);

export const AvailabilitySlot = model(
  'AvailabilitySlot',
  availabilitySlotSchema,
);
