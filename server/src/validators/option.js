import { z } from 'zod';

const locationSchema = z
  .object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    placeName: z.string().trim().min(1).max(200).optional(),
    placeSource: z.enum(['manual', 'search']),
  })
  .strict();

export const createOptionSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    notes: z.string().trim().max(2000).optional(),
    link: z.string().trim().url().max(500).optional(),
    location: locationSchema.optional(),
  })
  .strict();

export const updateOptionSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    notes: z.string().trim().max(2000).nullable().optional(),
    link: z.string().trim().url().max(500).nullable().optional(),
    location: locationSchema.nullable().optional(),
  })
  .strict()
  .refine((data) => data.title !== undefined || data.notes !== undefined || data.link !== undefined || data.location !== undefined, {
    message: 'At least one of title, notes, link, or location must be provided',
  });
