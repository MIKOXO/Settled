import { z } from 'zod';

export const upsertAvailabilitySchema = z
  .object({
    date: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
      message: 'Invalid date',
    }),
    status: z.enum(['free', 'busy']),
  })
  .strict();
