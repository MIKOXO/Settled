import { Schema, model } from 'mongoose';

import { objectId, timestamps } from './schemaHelpers.js';

const participantSchema = new Schema(
  {
    boardId: objectId('Board', { index: true }),
    displayName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    role: { type: String, enum: ['owner', 'member'], default: 'member', required: true },
    lastActiveAt: { type: Date },
  },
  timestamps(false),
);

export const Participant = model('Participant', participantSchema);