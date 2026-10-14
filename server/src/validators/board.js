import { z } from 'zod';

const name = z.string().trim().min(1).max(100);
const type = z.enum(['Trip', 'Dinner', 'Event', 'Custom']);
const typeLabel = z.string().trim().min(1).max(50);

export const createBoardSchema = z
  .object({
    name,
    type: type.optional(),
    typeLabel: typeLabel.optional(),
    creatorDisplayName: name,
    creatorEmail: z.string().trim().email(),
  })
  .refine((data) => (data.typeLabel ? data.type === 'Custom' : true), {
    path: ['typeLabel'],
    message: 'typeLabel requires a type of "Custom"',
  });

export const updateBoardSchema = z
  .object({
    name: name.optional(),
    type: type.optional(),
    typeLabel: typeLabel.optional(),
    optionsOwnerOnly: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one of name, type, typeLabel, or optionsOwnerOnly must be provided',
  });