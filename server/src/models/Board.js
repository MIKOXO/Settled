import crypto from 'node:crypto';
import { Schema, model } from 'mongoose';

const boardSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Trip', 'Dinner', 'Event', 'Custom'],
    },
    typeLabel: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    status: {
      type: String,
      enum: ['open', 'decided'],
      default: 'open',
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'Participant',
      required: true,
    },
    inviteToken: {
      type: String,
      required: true,
      unique: true,
    },
    decisionDeadline: {
      type: Date,
    },
    optionsOwnerOnly: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

boardSchema.statics.generateInviteToken = function generateInviteToken() {
  return crypto.randomBytes(16).toString('hex');
};

export const Board = model('Board', boardSchema);
