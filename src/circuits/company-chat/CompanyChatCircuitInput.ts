import { z } from 'zod';

export const CompanyChatCircuitInput = z.object({
  Input: z.string().optional(),
});

export type CompanyChatCircuitInput = z.infer<
  typeof CompanyChatCircuitInput
>;
