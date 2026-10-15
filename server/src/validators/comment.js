import { z } from 'zod';

const OBJECT_ID = /^[a-f\d]{24}$/i;

// A root comment is the default; `parentId` turns the post into a reply to
// that root. The service resolves the actual root, so replying to a reply is
// legal input — it just lands one level up.
export const createCommentSchema = z
  .object({
    body: z.string().trim().min(1).max(2000),
    parentId: z.string().regex(OBJECT_ID, 'Invalid parent comment id').optional(),
  })
  .strict();

export const listCommentsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    cursor: z.string().optional(),
  })
  .strict();

// Replies page through the same shape as the thread they belong to.
export const listRepliesQuerySchema = listCommentsQuerySchema;
