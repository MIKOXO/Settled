import { Schema, model } from 'mongoose';

const voteSchema = new Schema(
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
    value: {
      type: String,
      enum: ['like', 'dislike'],
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);

voteSchema.index({ optionId: 1, participantId: 1 }, { unique: true });

export const Vote = model('Vote', voteSchema);
