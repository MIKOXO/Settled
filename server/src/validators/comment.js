import { z } from 'zod';

export const createCommentSchema = z
  .object({
    body: z.string().trim().min(1).max(2000),
  })
  .strict();

export const listCommentsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    cursor: z.string().optional(),
  })
  .strict();