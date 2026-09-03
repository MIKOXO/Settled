import { Schema, model } from 'mongoose';

const optionSchema = new Schema(
  {
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Participant',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
    photoKey: {
      type: String,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
    },
    likesCount: {
      type: Number,
      default: 0,
      required: true,
    },
    dislikesCount: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);

export const Option = model('Option', optionSchema);
