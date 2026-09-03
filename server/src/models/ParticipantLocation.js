import { Schema, model } from 'mongoose';

const participantLocationSchema = new Schema(
  {
    participantId: {
      type: Schema.Types.ObjectId,
      ref: 'Participant',
      required: true,
      unique: true,
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    label: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const ParticipantLocation = model('ParticipantLocation', participantLocationSchema);
