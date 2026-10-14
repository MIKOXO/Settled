import { z } from 'zod';

const locationSchema = z
  .object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    placeName: z.string().trim().min(1).max(200).optional(),
    placeSource: z.enum(['manual', 'search']),
  })
  .strict();

const title = z.string().trim().min(1).max(200);
const notes = z.string().trim().max(2000);
const link = z.string().trim().url().max(500);

export const createOptionSchema = z
  .object({
    title,
    notes: notes.optional(),
    link: link.optional(),
    location: locationSchema.optional(),
  })
  .strict();

export const updateOptionSchema = z
  .object({
    title: title.optional(),
    notes: notes.nullable().optional(),
    link: link.nullable().optional(),
    location: locationSchema.nullable().optional(),
  })
  .strict()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one of title, notes, link, or location must be provided',
  });