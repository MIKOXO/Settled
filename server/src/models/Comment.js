import { Schema, model } from 'mongoose';

import { objectId, timestamps } from './schemaHelpers.js';

const commentSchema = new Schema(
  {
    optionId: objectId('Option', { required: true, index: true }),
    participantId: objectId('Participant', { required: true }),
    body: { type: String, required: true, trim: true },
  },
  timestamps(false),
);

export const Comment = model('Comment', commentSchema);