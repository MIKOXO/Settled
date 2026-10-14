import { Schema, model } from 'mongoose';

import { objectId, timestamps } from './schemaHelpers.js';

const voteSchema = new Schema(
  {
    optionId: objectId('Option', { required: true, index: true }),
    participantId: objectId('Participant', { required: true }),
    value: { type: String, enum: ['like', 'dislike'], required: true },
  },
  timestamps(true),
);

voteSchema.index({ optionId: 1, participantId: 1 }, { unique: true });

export const Vote = model('Vote', voteSchema);