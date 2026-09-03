import { z } from 'zod';

export const createBoardSchema = z.object({
  name: z.string().trim().min(1).max(100),
  type: z.enum(['Trip', 'Dinner', 'Event', 'Custom']).optional(),
  creatorDisplayName: z.string().trim().min(1).max(100),
  creatorEmail: z.string().trim().email(),
});

export const updateBoardSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    type: z.enum(['Trip', 'Dinner', 'Event', 'Custom']).optional(),
    optionsOwnerOnly: z.boolean().optional(),
  })
  .refine(
    (data) => data.name !== undefined || data.type !== undefined || data.optionsOwnerOnly !== undefined,
    {
      message: 'At least one of name, type, or optionsOwnerOnly must be provided',
    },
  );
