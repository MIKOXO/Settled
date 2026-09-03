import { Schema, model } from 'mongoose';

const commentSchema = new Schema(
  {
    optionId: {
      type: Schema.Types.ObjectId,
      ref: 'Option',
      required: true,
      index: true,
    },
    participantId: {
      type: Schema.Types.ObjectId,
      ref: 'Participant',
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const Comment = model('Comment', commentSchema);