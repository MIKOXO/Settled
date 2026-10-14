import { Schema, model } from 'mongoose';

import { objectId, timestamps } from './schemaHelpers.js';

const locationSchema = new Schema(
  {
    optionId: objectId('Option', { required: true, index: true }),
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    placeName: { type: String, trim: true },
    placeSource: { type: String, enum: ['manual', 'search'], required: true },
    addedBy: objectId('Participant', { required: true }),
  },
  timestamps(false),
);

export const Location = model('Location', locationSchema);