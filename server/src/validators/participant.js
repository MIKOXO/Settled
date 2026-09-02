import { z } from 'zod';

export const joinBoardSchema = z.object({
  displayName: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
});

export const recoverRequestSchema = z.object({
  email: z.string().trim().email(),
});

export const recoverSchema = z.object({
  token: z.string().trim().min(1),
});
