import { z } from 'zod';

export const createBoardSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    type: z.enum(['Trip', 'Dinner', 'Event', 'Custom']).optional(),
    typeLabel: z.string().trim().min(1).max(50).optional(),
    creatorDisplayName: z.string().trim().min(1).max(100),
    creatorEmail: z.string().trim().email(),
  })
  .refine((data) => (data.typeLabel ? data.type === 'Custom' : true), {
    path: ['typeLabel'],
    message: 'typeLabel requires a type of "Custom"',
  });

export const updateBoardSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    type: z.enum(['Trip', 'Dinner', 'Event', 'Custom']).optional(),
    typeLabel: z.string().trim().min(1).max(50).optional(),
    optionsOwnerOnly: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.type !== undefined ||
      data.typeLabel !== undefined ||
      data.optionsOwnerOnly !== undefined,
    {
      message: 'At least one of name, type, typeLabel, or optionsOwnerOnly must be provided',
    },
  );
