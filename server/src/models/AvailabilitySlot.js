import { Schema, model } from 'mongoose';

const availabilitySlotSchema = new Schema(
  {
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    participantId: {
      type: Schema.Types.ObjectId,
      ref: 'Participant',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['free', 'busy'],
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

availabilitySlotSchema.index(
  { boardId: 1, participantId: 1, date: 1 },
  { unique: true },
);

export const AvailabilitySlot = model('AvailabilitySlot', availabilitySlotSchema);
