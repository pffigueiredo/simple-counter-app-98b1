
import { z } from 'zod';

// Counter schema
export const counterSchema = z.object({
  id: z.number(),
  value: z.number().int(),
  updated_at: z.coerce.date()
});

export type Counter = z.infer<typeof counterSchema>;

// Input schema for updating counter value
export const updateCounterInputSchema = z.object({
  value: z.number().int()
});

export type UpdateCounterInput = z.infer<typeof updateCounterInputSchema>;
