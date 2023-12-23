/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-namespace */
import dotenv from 'dotenv';
import { z } from 'zod';

import logger from '../config/logger';

dotenv.config();

export const environmentVariablesSchema = z.object({
  NODE_ENV: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof environmentVariablesSchema> {}
  }
}

export const validateEnvironmentVariables = () => {
  try {
    environmentVariablesSchema.parse(process.env);
  } catch (error) {
    logger.error(error);
    throw new Error('Environment variables not found');
  }
};
