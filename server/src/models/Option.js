import { Schema, model } from 'mongoose';

import { objectId, timestamps } from './schemaHelpers.js';

const optionSchema = new Schema(
  {
    boardId: objectId('Board', { required: true, index: true }),
    createdBy: objectId('Participant', { required: true }),
    title: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    link: { type: String, trim: true },
    photoKey: { type: String },
    locationId: objectId('Location'),
    likesCount: { type: Number, default: 0, required: true },
    dislikesCount: { type: Number, default: 0, required: true },
    commentCount: { type: Number, default: 0, required: true },
  },
  timestamps(true),
);

export const Option = model('Option', optionSchema);