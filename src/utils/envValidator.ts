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
  const result = environmentVariablesSchema.safeParse(process.env);
  if (result.success) {
    const envs = Object.keys(result.data);
    logger.info(`environment variables [${envs}] loaded successfully`);
  } else {
    throw new Error(`missing environment variables [ ${result.error.errors[0].path} ]`);
  }
};
