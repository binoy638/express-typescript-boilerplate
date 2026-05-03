import { z } from 'zod';

export const getMessageSchema = {
  params: z.object({ id: z.string() }),
};
