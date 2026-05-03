/* eslint-disable @typescript-eslint/no-namespace */
import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8080),
  CORS_ORIGIN: z.string().default('*'),
  LOG_DIR: z.string().optional(),
  LOG_LEVEL: z.string().optional(),
  MAX_FILE_SIZE: z.string().optional(),
  MAX_FILES: z.string().optional(),
});

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}

class EnvManager {
  private env: z.infer<typeof envSchema>;

  constructor() {
    const result = envSchema.safeParse(process.env);
    if (result.success) {
      this.env = result.data;
      console.log(`environment variables [${Object.keys(result.data)}] loaded successfully`);
    } else {
      const missingVars = result.error.issues.map(err => err.path.join('.')).join(', ');
      throw new Error(`Missing environment variables: [ ${missingVars} ]`);
    }
  }

  getEnv<T extends keyof z.infer<typeof envSchema>>(key: T): z.infer<typeof envSchema>[T] {
    return this.env[key];
  }
}

export const envManager = new EnvManager();
