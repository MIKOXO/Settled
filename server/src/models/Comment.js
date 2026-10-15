import { Schema, model } from 'mongoose';

import { objectId, timestamps } from './schemaHelpers.js';

const commentSchema = new Schema(
  {
    optionId: objectId('Option', { required: true, index: true }),
    participantId: objectId('Participant', { required: true }),
    body: { type: String, required: true, trim: true },
    // Replies are one level deep: this points at the root comment, never at
    // another reply (the service normalizes a reply-to-a-reply to the root).
    // Null on a root comment, which is what `parentId: null` filters on — so
    // the option's thread listing picks up every comment written before this
    // field existed, where the key is simply absent.
    parentId: objectId('Comment', { index: true }),
    // Maintained with an atomic `$inc` on reply create, so a root's reply
    // count is readable without loading the replies themselves.
    replyCount: { type: Number, default: 0, required: true },
  },
  timestamps(false),
);

export const Comment = model('Comment', commentSchema);