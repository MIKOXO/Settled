import { z } from 'zod';

export const upsertLocationSchema = z
  .object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    label: z.string().trim().max(200).optional(),
  })
  .strict();
