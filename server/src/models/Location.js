import { Schema, model } from 'mongoose';

const locationSchema = new Schema(
  {
    optionId: {
      type: Schema.Types.ObjectId,
      ref: 'Option',
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
    placeName: {
      type: String,
      trim: true,
    },
    placeSource: {
      type: String,
      enum: ['manual', 'search'],
      required: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Participant',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const Location = model('Location', locationSchema);
