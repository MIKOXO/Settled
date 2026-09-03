import { z } from 'zod';

export const voteSchema = z
  .object({
    value: z.enum(['like', 'dislike']),
  })
  .strict();
