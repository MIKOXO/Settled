import { z } from 'zod';

const date = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: 'Invalid date',
});

export const upsertAvailabilitySchema = z
  .object({
    date,
    status: z.enum(['free', 'busy']),
  })
  .strict();

export const removeAvailabilitySchema = z.object({ date }).strict();